import json
from decimal import Decimal
import boto3
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_aws import ChatBedrockConverse
from src import config
from src.agent.state import (
    AgentState,
    CreditEvaluation,
    EvaluationSeverity,
    FinalDecision,
    FraudEvaluation,
    ResolutionAction,
    SecurityEvaluation,
)
from src.client.core import core_client
from src.kafka.producer import (
    send_client_blocked,
    send_fraud_detected,
    send_operation_approved,
    send_operation_denied,
    send_operation_escalated,
)
from src.models.events import (
    ClientAccountBlockEvent,
    FraudDetectedEvent,
    OperationType,
)

bedrock_client = boto3.client("bedrock-runtime", region_name=config.AWS_REGION)

llm = ChatBedrockConverse(
    client=bedrock_client,
    model=config.AWS_BEDROCK_MODEL_ID,
    temperature=0.0,
)


def fetch_context(state: AgentState) -> dict:
    if not state.client_id:
        return {}

    client_data = core_client.get_client(state.client_id)
    account_data = (
        core_client.get_bank_account(state.client_bank_account_id)
        if state.client_bank_account_id
        else None
    )
    entries = core_client.get_client_entries(state.client_id)
    operations = core_client.get_client_operations(state.client_id)
    trusted = core_client.get_client_trusted_accounts(state.client_id)

    return {
        "client_data": client_data,
        "account_data": account_data,
        "historical_entries": entries,
        "historical_operations": operations,
        "trusted_accounts": trusted,
    }


def evaluate_security(state: AgentState) -> dict:
    origin = state.details.get("origin", {})
    client_summary = (
        state.client_data.model_dump(mode="json") if state.client_data else {}
    )

    structured_llm = llm.with_structured_output(SecurityEvaluation)

    prompt = (
        f"Evalua la seguridad del acceso de la operacion ID: {state.operation_id}.\n"
        f"Tipo de operacion: {state.operation_type.value}\n"
        f"Metadatos de red y origen: {json.dumps(origin)}\n"
        f"Datos del cliente titular: {json.dumps(client_summary, default=str)}\n"
        "Criterios de evaluacion:\n"
        "- Compara la ubicacion de la peticion con el pais/direccion del cliente.\n"
        "- Si detectas usurpacion grave, IP anonimizada hostil o incongruencia geografica critica: requires_client_block=True y passed=False."
    )

    result = structured_llm.invoke([
        SystemMessage(content="Eres un auditor de ciberseguridad bancaria estricto."),
        HumanMessage(content=prompt),
    ])
    return {"security_eval": result}


def evaluate_fraud(state: AgentState) -> dict:
    structured_llm = llm.with_structured_output(FraudEvaluation)

    entries_summary = [
        entry.model_dump(mode="json") for entry in state.historical_entries[:15]
    ]
    account_summary = (
        state.account_data.model_dump(mode="json") if state.account_data else {}
    )

    payload = {
        "operation_type": state.operation_type.value,
        "amount": str(state.amount),
        "details": state.details,
        "current_account": account_summary,
        "recent_entries": entries_summary,
    }

    prompt = (
        f"Evalua el riesgo de fraude transaccional para la operacion ID: {state.operation_id}.\n"
        f"Contexto transaccional: {json.dumps(payload, default=str)}\n"
        "Criterios de evaluacion:\n"
        "- Analiza si el importe rompe el patron de gasto historico del cliente.\n"
        "- Revisa conceptos anomalos o sospechosos.\n"
        "- Si es fraude categorico: is_fraud=True, passed=False.\n"
        "- Si la severidad amerita inhabilitar la cuenta: requires_client_block=True."
    )

    result = structured_llm.invoke([
        SystemMessage(content="Eres un analista antifraude transaccional bancario."),
        HumanMessage(content=prompt),
    ])
    return {"fraud_eval": result}


def evaluate_credit(state: AgentState) -> dict:
    if state.operation_type not in (OperationType.LOAN, OperationType.INSTALLMENT):
        return {
            "credit_eval": CreditEvaluation(
                passed=True,
                severity=EvaluationSeverity.LOW,
                reason="Operacion no sujeta a evaluacion de scoring crediticio.",
                risk_score=0.0,
                creditworthy=True,
                recommended_action="APPROVE",
            )
        }

    structured_llm = llm.with_structured_output(CreditEvaluation)

    entries_summary = [
        entry.model_dump(mode="json") for entry in state.historical_entries
    ]
    operations_summary = [
        op.model_dump(mode="json") for op in state.historical_operations
    ]

    payload = {
        "amount": str(state.amount),
        "loan_details": state.details,
        "account_balance": str(state.account_data.balance) if state.account_data else "0",
        "historical_entries": entries_summary,
        "historical_operations": operations_summary,
    }

    prompt = (
        f"Evalua el riesgo crediticio de la solicitud de prestamo ID: {state.operation_id}.\n"
        f"Informacion financiera: {json.dumps(payload, default=str)}\n"
        "Criterios de evaluacion:\n"
        "- Analiza ingresos historicos frente al importe del prestamo, tipo de interes y cuotas.\n"
        "- Si la capacidad financiera es solvente: creditworthy=True, passed=True, recommended_action='APPROVE'.\n"
        "- Si el caso es limite o requiere evaluacion manual humana: passed=False, recommended_action='ESCALATE'.\n"
        "- Si el riesgo de impago es alto o inasumible: passed=False, recommended_action='DENY'."
    )

    result = structured_llm.invoke([
        SystemMessage(content="Eres un analista de riesgos y concesion crediticia bancaria."),
        HumanMessage(content=prompt),
    ])
    return {"credit_eval": result}


def synthesize_decision(state: AgentState) -> dict:
    sec = state.security_eval
    fraud = state.fraud_eval
    credit = state.credit_eval

    block_client = bool((sec and sec.requires_client_block) or (fraud and fraud.requires_client_block))
    is_fraud = bool(fraud and fraud.is_fraud)

    if is_fraud or (sec and not sec.passed) or (fraud and not fraud.passed):
        action = ResolutionAction.DENIED
        reason_detail = fraud.reason if (fraud and not fraud.passed) else (sec.reason if sec else "Error de validacion")
        reason = f"Rechazado por seguridad/fraude: {reason_detail}"
    elif credit and not credit.passed:
        if credit.recommended_action == "ESCALATE":
            action = ResolutionAction.ESCALATED
            reason = f"Operacion escalada a revision manual: {credit.reason}"
        else:
            action = ResolutionAction.DENIED
            reason = f"Rechazado por scoring crediticio: {credit.reason}"
    else:
        action = ResolutionAction.APPROVED
        reason = "Aprobado: Verificaciones de seguridad, antifraude y solvencia crediticia superadas."

    decision = FinalDecision(
        action=action,
        reason=reason,
        is_fraud=is_fraud,
        block_client=block_client,
    )
    return {"decision": decision}


def dispatch_actions(state: AgentState) -> dict:
    dec = state.decision
    op_id = state.operation_id
    op_type = state.operation_type

    if dec.block_client and state.client_id:
        send_client_blocked(ClientAccountBlockEvent(clientId=state.client_id))

    if dec.is_fraud and state.client_id and state.client_bank_account_id:
        send_fraud_detected(
            FraudDetectedEvent(
                operationId=op_id,
                clientId=state.client_id,
                clientBankAccountId=state.client_bank_account_id,
                amount=state.amount,
                reason=dec.reason,
            )
        )

    if dec.action == ResolutionAction.APPROVED:
        send_operation_approved(op_id, op_type, dec.reason)
    elif dec.action == ResolutionAction.DENIED:
        send_operation_denied(op_id, op_type, dec.reason)
    elif dec.action == ResolutionAction.ESCALATED:
        send_operation_escalated(op_id, op_type, dec.reason)

    return {}