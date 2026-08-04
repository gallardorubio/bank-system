# services/agentic/src/security/tools.py
import os
import json
import logging
import requests
import redis
from langchain_core.tools import tool
from pydantic import BaseModel, Field

logger = logging.getLogger("SecurityTools")

# Configuración Redis (Caché L1 de Threat Intel)
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
CTI_CACHE_TTL_SECONDS = 604800  # 7 días. Si una IP es maliciosa, lo será un tiempo.

try:
    # Usamos db=1 para separar la caché de seguridad de la caché macroeconómica (db=0)
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=1, decode_responses=True)
    redis_client.ping()
except redis.exceptions.ConnectionError:
    logger.warning("Redis no disponible. El SOC Agent operará sin Caché L1 de Threat Intel.")
    redis_client = None

# ==========================================
# HERRAMIENTAS DE IDENTIDAD Y TELEMETRÍA (INTERNAS)
# ==========================================
class UserIDInput(BaseModel):
    user_id: str = Field(..., description="UUID del usuario para consultar en IAM.")

@tool("get_user_security_baseline", args_schema=UserIDInput)
def get_user_security_baseline(user_id: str) -> str:
    """Obtiene la línea base de seguridad (dispositivos y ubicaciones conocidas) desde el sistema IAM."""
    iam_url = os.getenv("IAM_API_URL", "http://localhost:8082")
    endpoint = f"{iam_url}/v1/users/{user_id}/security-baseline"
    
    try:
        response = requests.get(endpoint, timeout=3.0)
        if response.status_code == 200:
            return response.text
        return json.dumps({"error": "Usuario no encontrado en IAM."})
    except requests.exceptions.RequestException as e:
        logger.error(f"Fallo de conexión con IAM: {e}")
        return json.dumps({"error": "IAM inaccesible. Asumir línea base vacía."})

# ==========================================
# HERRAMIENTAS DE TRIAGE (CAPA 1 - GRATUITAS Y RÁPIDAS)
# ==========================================
class IPContextInput(BaseModel):
    ip_address: str = Field(..., description="Dirección IP a evaluar localmente.")

@tool("get_geoip_context", args_schema=IPContextInput)
def get_geoip_context(ip_address: str) -> str:
    """
    Obtiene contexto GeoIP y detección de Datacenters/Proxies de primer nivel.
    NO consume cuota de pago. Debe ser la primera opción de evaluación.
    """
    try:
        # Endpoint OSINT gratuito sin autenticación
        url = f"http://ip-api.com/json/{ip_address}?fields=status,country,city,isp,proxy,hosting"
        res = requests.get(url, timeout=2.0)
        if res.status_code == 200:
            return res.text
        return json.dumps({"error": f"Fallo HTTP {res.status_code}"})
    except Exception as e:
        return json.dumps({"error": str(e)})

# ==========================================
# HERRAMIENTA DE ESCALADO (CAPA 2 - PAGO / ABUSEIPDB)
# ==========================================
class CTIEscalationInput(BaseModel):
    ip_address: str = Field(..., description="IP sospechosa a escalar a Inteligencia de Amenazas.")

@tool("escalate_to_external_cti", args_schema=CTIEscalationInput)
def escalate_to_external_cti(ip_address: str) -> str:
    """
    USO RESTRINGIDO. Escala la IP a la base de datos global de AbuseIPDB. 
    Consume cuota y aumenta la latencia. Usar solo si la Capa 1 indica riesgo.
    """
    cache_key = f"cti_ip:{ip_address}"

    # 1. Comprobar Caché L1 (Evitar consumir peticiones de pago por ataques repetidos)
    if redis_client:
        cached_result = redis_client.get(cache_key)
        if cached_result:
            logger.info(f"CTI Cache HIT: IP {ip_address} resuelta desde Redis.")
            return cached_result

    # 2. Petición HTTP Real a AbuseIPDB
    logger.info(f"CTI Cache MISS: Escalando IP {ip_address} a AbuseIPDB...")
    api_key = os.getenv("ABUSEIPDB_API_KEY")
    if not api_key:
        return json.dumps({"error": "Falta API Key corporativa. Escalado abortado."})

    url = "https://api.abuseipdb.com/api/v2/check"
    querystring = {'ipAddress': ip_address, 'maxAgeInDays': '90'}
    headers = {'Accept': 'application/json', 'Key': api_key}

    try:
        response = requests.get(url, headers=headers, params=querystring, timeout=4.0)
        
        if response.status_code == 200:
            data = response.json().get("data", {})
            result = json.dumps({
                "ip": ip_address,
                "abuse_confidence_score": data.get("abuseConfidenceScore"),
                "total_reports": data.get("totalReports"),
                "usage_type": data.get("usageType"),
                "isp": data.get("isp")
            })
            
            # Guardar en Redis para futuras evaluaciones
            if redis_client:
                redis_client.setex(cache_key, CTI_CACHE_TTL_SECONDS, result)
                
            return result
        else:
            return json.dumps({"error": f"AbuseIPDB HTTP {response.status_code}"})
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error de red CTI: {e}")
        return json.dumps({"error": "CTI Externo inaccesible."})