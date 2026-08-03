# services/agentic/main.py
import os
import json
import logging
import signal
from confluent_kafka import Consumer, Producer, KafkaError
from langchain_core.messages import HumanMessage
from src.security.graph import security_agent_app

from src.credit.graph import credit_agent_app

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(levelname)s: %(message)s')
logger = logging.getLogger("AgenticOrchestrator")

running = True

def graceful_shutdown(signum, frame):
    global running
    logger.info("Iniciando apagado seguro (Graceful Shutdown)...")
    running = False

signal.signal(signal.SIGINT, graceful_shutdown)
signal.signal(signal.SIGTERM, graceful_shutdown)

def process_loan_operation(msg_value: dict, producer: Producer):
    operation_id = msg_value.get("operationId")
    account_id = msg_value.get("accountId")
    tax_id = msg_value.get("taxId")
    amount = msg_value.get("amount")
    
    logger.info(f"Evaluando Préstamo [{operation_id}] | Cuenta: {account_id} | Importe: {amount}")

    initial_state = {
        "messages": [HumanMessage(content=f"Evalúa la operación de crédito {operation_id} solicitada por un importe de {amount}. El tax_id del cliente es {tax_id} y su account_id es {account_id}.")],
        "operation_id": operation_id,
        "account_id": account_id,
        "tax_id": tax_id,
        "amount": amount
    }

    try:
        final_state = credit_agent_app.invoke(initial_state)
        last_msg = final_state["messages"][-1].content
        
        try:
            decision_data = json.loads(last_msg)
            decision = decision_data.get("decision", "ESCALATED")
            compliance_memo = decision_data.get("compliance_memo", "Fallo en parseo de justificación.")
            risk_tier = decision_data.get("risk_tier", "UNKNOWN")
            proposed_interest_rate = decision_data.get("proposed_interest_rate", 0.0)
            behavioral_flags = decision_data.get("behavioral_flags", [])
        except json.JSONDecodeError:
            decision = "ESCALATED"
            compliance_memo = f"Salida cruda no parseable: {last_msg}"
            risk_tier = "UNKNOWN"
            proposed_interest_rate = 0.0
            behavioral_flags = []
            
    except Exception as e:
        logger.error(f"Fallo en inferencia: {str(e)}")
        decision = "ESCALATED"
        compliance_memo = "Excepción técnica durante la evaluación."
        risk_tier = "UNKNOWN"
        proposed_interest_rate = 0.0
        behavioral_flags = []

    logger.info(f"[{operation_id}] Decisión: {decision} | Riesgo: {risk_tier} | Tasa: {proposed_interest_rate}%")

    resolution_event = {
        "operationId": operation_id,
        "decision": decision,
        "riskTier": risk_tier,
        "proposedInterestRate": proposed_interest_rate,
        "behavioralFlags": behavioral_flags,
        "complianceMemo": compliance_memo
    }
    
    topic_destino = f"operation-{decision.lower()}"
    producer.produce(
        topic=topic_destino,
        value=json.dumps(resolution_event).encode('utf-8')
    )
    producer.poll(0)

def process_security_event(msg_value: dict, producer: Producer):
    event_id = msg_value.get("eventId")
    user_id = msg_value.get("userId")
    ip_address = msg_value.get("ipAddress")
    
    logger.info(f"SOC Agent evaluando Alerta [{event_id}] | Usuario: {user_id} | IP: {ip_address}")

    initial_state = {
        "messages": [HumanMessage(content=f"Alerta de seguridad {event_id}. El usuario {user_id} ha iniciado sesión desde la IP {ip_address}. Investiga posible Account Takeover.")],
        "event_id": event_id,
        "user_id": user_id,
        "ip_address": ip_address
    }

    try:
        final_state = security_agent_app.invoke(initial_state)
        last_msg = final_state["messages"][-1].content
        
        # Parseo similar al de crédito
        decision_data = json.loads(last_msg)
        decision = decision_data.get("decision", "MFA_REQUIRED")
        threat_level = decision_data.get("threat_level", "UNKNOWN")
        
        logger.info(f"[{event_id}] SOC Decisión: {decision} | Amenaza: {threat_level}")
        
        # Enviar respuesta al topic de seguridad
        producer.produce(
            topic=f"security-action-{decision.lower()}",
            value=json.dumps(decision_data).encode('utf-8')
        )
        producer.poll(0)
    except Exception as e:
        logger.error(f"Fallo en SOC Agent: {e}")

def main():
    kafka_broker = os.getenv("KAFKA_BROKER", "localhost:9092")
    
    consumer_conf = {
        'bootstrap.servers': kafka_broker,
        'group.id': 'agentic-ai-group',
        'auto.offset.reset': 'earliest',
        'enable.auto.commit': False  
    }
    consumer = Consumer(consumer_conf)
    consumer.subscribe(['operation-pending'])

    producer_conf = {'bootstrap.servers': kafka_broker}
    producer = Producer(producer_conf)

    logger.info("Agentic AI Engine operando. Escuchando 'operation-pending'...")

    try:
        while running:
            msg = consumer.poll(timeout=1.0)
            if msg is None: continue
            if msg.error():
                if msg.error().code() != KafkaError._PARTITION_EOF:
                    logger.error(f"Error Kafka: {msg.error()}")
                continue

            try:
                msg_value = json.loads(msg.value().decode('utf-8'))
                if msg_value.get("operationType") == "LOAN":
                    process_loan_operation(msg_value, producer)
                if msg_value.get("eventType") == "CREDIT_APPLICATION":
                    process_loan_operation(msg_value, producer)
                elif msg_value.get("eventType") == "SECURITY_ALERT":
                    process_security_event(msg_value, producer)
                consumer.commit(asynchronous=False)
            except json.JSONDecodeError:
                logger.error("Mensaje malformado. Descartando.")
                consumer.commit(asynchronous=False)
            except Exception as e:
                logger.error(f"Error procesando evento: {e}")
                
    finally:
        consumer.close()
        producer.flush()
        logger.info("Cierre completado.")

if __name__ == "__main__":
    main()