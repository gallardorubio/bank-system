import json
from uuid import UUID
from kafka import KafkaProducer
from src import config
from src.events import OperationResolutionEvent, FraudDetectedEvent, ClientAccountBlockEvent, OperationType

producer = KafkaProducer(
    bootstrap_servers=[config.BOOTSTRAP_SERVERS],
    value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8')
)

def _send_resolution(topic: str, operation_id: UUID, operation_type: OperationType, reason: str):
    event = OperationResolutionEvent(
        operationId=operation_id,
        operationType=operation_type,
        reason=reason
    )
    producer.send(topic, event.model_dump(mode='json'))
    producer.flush()

def send_operation_approved(operation_id: UUID, operation_type: OperationType, reason: str):
    _send_resolution("operation-approved", operation_id, operation_type, reason)

def send_operation_denied(operation_id: UUID, operation_type: OperationType, reason: str):
    _send_resolution("operation-denied", operation_id, operation_type, reason)

def send_operation_escalated(operation_id: UUID, operation_type: OperationType, reason: str):
    _send_resolution("operation-escalated", operation_id, operation_type, reason)

def send_fraud_detected(event: FraudDetectedEvent):
    producer.send("fraud-detected", event.model_dump(mode='json'))
    producer.flush()

def send_client_blocked(event: ClientAccountBlockEvent):
    producer.send("client-blocked", event.model_dump(mode='json'))
    producer.flush()