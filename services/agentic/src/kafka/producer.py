import json
from uuid import UUID
from confluent_kafka import Producer
from src import config
from src.models.events import (
    OperationResolutionEvent,
    FraudDetectedEvent,
    ClientAccountBlockEvent,
    OperationType,
)

_conf = {"bootstrap.servers": config.BOOTSTRAP_SERVERS}
producer = Producer(_conf)


def _delivery_report(err, msg):
    if err is not None:
        pass


def _send_resolution(topic: str, operation_id: UUID, operation_type: OperationType, reason: str):
    event = OperationResolutionEvent(
        operationId=operation_id,
        operationType=operation_type,
        reason=reason,
    )
    producer.produce(
        topic,
        key=str(operation_id).encode("utf-8"),
        value=json.dumps(event.model_dump(mode="json")).encode("utf-8"),
        callback=_delivery_report,
    )
    producer.flush()


def send_operation_approved(operation_id: UUID, operation_type: OperationType, reason: str):
    _send_resolution("operation-approved", operation_id, operation_type, reason)


def send_operation_denied(operation_id: UUID, operation_type: OperationType, reason: str):
    _send_resolution("operation-denied", operation_id, operation_type, reason)


def send_operation_escalated(operation_id: UUID, operation_type: OperationType, reason: str):
    _send_resolution("operation-escalated", operation_id, operation_type, reason)


def send_fraud_detected(event: FraudDetectedEvent):
    producer.produce(
        "fraud-detected",
        key=str(event.operationId).encode("utf-8"),
        value=json.dumps(event.model_dump(mode="json")).encode("utf-8"),
        callback=_delivery_report,
    )
    producer.flush()


def send_client_blocked(event: ClientAccountBlockEvent):
    producer.produce(
        "client-blocked",
        key=str(event.clientId).encode("utf-8"),
        value=json.dumps(event.model_dump(mode="json")).encode("utf-8"),
        callback=_delivery_report,
    )
    producer.flush()