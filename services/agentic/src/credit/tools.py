# services/agentic/src/shared/tools.py
import os
import json
import time
import logging
import requests
import redis
from langchain_core.tools import tool
from pydantic import BaseModel, Field

logger = logging.getLogger("AgenticTools")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_TTL_SECONDS = 86400  

try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
    redis_client.ping() 
except redis.exceptions.ConnectionError:
    logger.warning("No se pudo conectar a Redis. Operando sin caché macroeconómica.")
    redis_client = None

class FinancialProfileInput(BaseModel):
    account_id: str = Field(..., description="UUID de la cuenta bancaria del cliente.")

@tool("get_financial_profile", args_schema=FinancialProfileInput)
def get_financial_profile(account_id: str) -> str:
    """Extrae el balance actual y el historial de transacciones recientes."""
    core_url = os.getenv("CORE_API_URL", "http://localhost:8080")
    endpoint = f"{core_url}/v1/accounts/{account_id}/financial-profile"
    try:
        response = requests.get(endpoint, timeout=5.0)
        if response.status_code == 200:
            return response.text
        elif response.status_code == 404:
            return "Error: Cuenta no encontrada en el core bancario."
        else:
            return f"Error interno HTTP {response.status_code}"
    except requests.exceptions.RequestException as e:
        return f"Error de red con el core bancario: {str(e)}"


class CirbeInput(BaseModel):
    tax_id: str = Field(..., description="DNI/NIF del cliente para consulta de deuda externa.")

@tool("get_cirbe_report", args_schema=CirbeInput)
def get_cirbe_report(tax_id: str) -> str:
    """Consulta consolidada de deuda externa y morosidad en el Bureau de Crédito."""
    bureau_url = os.getenv("BUREAU_API_URL", "http://localhost:8081")
    endpoint = f"{bureau_url}/v1/bureau/reports/{tax_id}"
    try:
        response = requests.get(endpoint, timeout=4.0)
        if response.status_code == 200:
            return response.text
        elif response.status_code == 404:
            return json.dumps({"error": "Cliente no encontrado en el Bureau."})
        else:
            return json.dumps({"error": f"Fallo del Bureau Externo HTTP {response.status_code}"})
    except requests.exceptions.RequestException as e:
        logger.error(f"Error de red con el Bureau Externo: {e}")
        return json.dumps({"error": "Bureau Inaccesible. Activar protocolo de contingencia."})


class MacroEconomicInput(BaseModel):
    pass 

@tool("get_macroeconomic_metrics", args_schema=MacroEconomicInput)
def get_macroeconomic_metrics() -> str:
    """Extrae métricas macroeconómicas (Euribor, Inflación) del BCE y Banco Mundial."""
    cache_key = "macro_data_cache"

    if redis_client:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            logger.info("Caché HIT: Datos macroeconómicos servidos desde Redis.")
            return cached_data

    logger.info("Caché MISS: Consultando APIs institucionales...")
    new_data = {
        "euribor_12m": None,
        "cpi_inflation_spain": None,
        "status": "LIVE_DATA"
    }

    try:
        ecb_url = "https://data-api.ecb.europa.eu/service/data/FM/M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA?lastNObservations=1&format=jsondata"
        res_ecb = requests.get(ecb_url, timeout=4.0)
        if res_ecb.status_code == 200:
            data = res_ecb.json()
            series = data.get("dataSets", [{}])[0].get("series", {})
            first_key = list(series.keys())[0]
            val = series[first_key]["observations"]["0"][0]
            new_data["euribor_12m"] = float(val)
    except Exception as e:
        logger.warning(f"Error consultando BCE: {e}")

    try:
        wb_url = "https://api.worldbank.org/v2/country/ESP/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1"
        res_wb = requests.get(wb_url, timeout=4.0)
        if res_wb.status_code == 200:
            data = res_wb.json()
            if len(data) > 1 and data[1]:
                val = data[1][0].get("value")
                new_data["cpi_inflation_spain"] = round(float(val), 2) if val else None
    except Exception as e:
        logger.warning(f"Error consultando Banco Mundial: {e}")

    if new_data["euribor_12m"] is None:
        logger.critical("APIs caídas. Fallback de emergencia.")
        new_data = {"euribor_12m": 3.65, "cpi_inflation_spain": 3.2, "status": "EMERGENCY_FALLBACK"}

    json_result = json.dumps(new_data)

    if redis_client:
        redis_client.setex(cache_key, REDIS_TTL_SECONDS, json_result)

    return json_result