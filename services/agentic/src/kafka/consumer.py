import json
from kafka import KafkaConsumer
from src import config
from src.events import OperationPendingEvent, OperationType, TransferDetails, DepositDetails, LoanDetails

TOPIC_NAME = "operation-pending"

def process_operation_pending(event: OperationPendingEvent):
    if event.operationType == OperationType.TRANSFER:
        details = TransferDetails(**event.details)
    elif event.operationType == OperationType.DEPOSIT:
        details = DepositDetails(**event.details)
    elif event.operationType == OperationType.LOAN:
        details = LoanDetails(**event.details)

def listen_operation_pending():
    consumer = KafkaConsumer(
        TOPIC_NAME,
        bootstrap_servers=[config.BOOTSTRAP_SERVERS],
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        group_id=config.KAFKA_GROUP_ID,
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    for message in consumer:
        event = OperationPendingEvent(**message.value)
        process_operation_pending(event)