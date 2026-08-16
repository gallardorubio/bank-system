import json
from confluent_kafka import Consumer, KafkaError
from confluent_kafka.admin import AdminClient, NewTopic
from src import config
from src.agent.graph import agent_graph
from src.agent.state import AgentState
from src.models.events import (
    OperationPendingEvent,
    OperationType,
    TransferDetails,
    DepositDetails,
    LoanDetails,
)
from decimal import Decimal

TOPIC_NAME = "operation-pending"


def process_operation_pending(event: OperationPendingEvent):
    client_id = None
    client_bank_account_id = None
    amount = Decimal("0.0")

    if event.operationType == OperationType.TRANSFER:
        details = TransferDetails(**event.details)
        client_id = details.clientId
        client_bank_account_id = details.clientBankAccountId
        amount = details.amount
    elif event.operationType == OperationType.DEPOSIT:
        details = DepositDetails(**event.details)
        client_id = details.clientId
        client_bank_account_id = details.clientBankAccountId
        amount = details.amount
    elif event.operationType == OperationType.LOAN:
        details = LoanDetails(**event.details)
        client_id = details.clientId
        client_bank_account_id = details.clientBankAccountId
        amount = details.amount

    initial_state = AgentState(
        operation_id=event.operationId,
        operation_type=event.operationType,
        details=event.details if isinstance(event.details, dict) else details.model_dump(mode="json"),
        client_id=client_id,
        client_bank_account_id=client_bank_account_id,
        amount=amount,
    )

    agent_graph.invoke(initial_state)


def listen_operation_pending():
    admin_client = AdminClient({"bootstrap.servers": config.BOOTSTRAP_SERVERS})
    admin_client.create_topics([NewTopic(TOPIC_NAME)])

    conf = {
        "bootstrap.servers": config.BOOTSTRAP_SERVERS,
        "group.id": config.KAFKA_GROUP_ID,
        "auto.offset.reset": "earliest",
        "enable.auto.commit": True,
    }

    consumer = Consumer(conf)
    consumer.subscribe([TOPIC_NAME])

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                continue

            payload = json.loads(msg.value().decode("utf-8"))
            event = OperationPendingEvent(**payload)
            process_operation_pending(event)
    finally:
        consumer.close()