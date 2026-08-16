import json
import boto3
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_aws import ChatBedrockConverse
from src import config
from src.agent.state import (
    AgentState,
    SecurityEvaluation,
    FraudEvaluation,
    CreditEvaluation,
    FinalDecision,
    ResolutionAction,
    EvaluationSeverity,
)
from src.models.events import (
    OperationType,
    FraudDetectedEvent,
    ClientAccountBlockEvent,
)
from src.kafka.producer import (
    send_operation_approved,
    send_operation_denied,
    send_operation_escalated,
    send_fraud_detected,
    send_client_blocked,
)

bedrock_client = boto3.client("bedrock-runtime", region_name=config.AWS_REGION)

llm = ChatBedrockConverse(
    client=bedrock_client,
    model=config.AWS_BEDROCK_MODEL_ID,
    temperature=0.0,
)


def evaluate_security(state: AgentState) -> dict:
    origin = state.details.get("origin", {})
    structured_llm = llm.with_structured_output(SecurityEvaluation)

    prompt = (
        f"Evalua la seguridad de la operacion bancaria ID: {state.operation_id}.\n"
        f"Tipo de operacion: {state.operation_type.value}\n"
        f"Metadatos de origen: {json.dumps(origin)}\n"
        "Criterios de evaluacion:\n"
        "- Analiza riesgos por origen geografico, IP anonimizada/sospechosa o agentes no estandar.\n"
        "- Si detectas usurpacion critica o riesgo extremo, requires_client_block=True y passed=False."
    )

    result = structured_llm.invoke([
        SystemMessage(content="Eres un analista de ciberseguridad bancaria estricto y riguroso."),
        HumanMessage(content=prompt),
    ])
    return {"security_eval": result}


def evaluate_fraud(state: AgentState) -> dict:
    structured_llm = llm.with_structured_output(FraudEvaluation)

    payload = {
        "operation_type": state.operation_type.value,
        "amount": state.amount,
        "details": state.details,
    }

    prompt = (
        f"Evalua el riesgo de fraude transaccional para la operacion ID: {state.operation_id}.\n"
        f"Datos transaccionales: {json.dumps(payload, default=str)}\n"
        "Criterios de evaluacion:\n"
        "- Analiza conceptos sospechosos, desviaciones cuantiosas o patrones anomalos de movimiento.\n"
        "- Si es fraude confirmado, is_fraud=True, passed=False.\n"
        "- Si amerita bloqueo inmediato de cuenta por reincidencia o severidad, requires_client_block=True."
    )

    result = structured_llm.invoke([
        SystemMessage(content="Eres un auditor de prevencion de fraude transaccional bancario."),
        HumanMessage(content=prompt),
    ])
    return {"fraud_eval": result}


def evaluate_credit(state: AgentState) -> dict:
    if state.operation_type not in (OperationType.LOAN, OperationType.INSTALLMENT):
        return {
            "credit_eval": CreditEvaluation(
                passed=True,
                severity=EvaluationSeverity.LOW,
                reason="Operacion no sujeta a scoring crediticio.",
                risk_score=0.0,
                creditworthy=True,
                recommended_action="APPROVE",
            )
        }

    structured_llm = llm.with_structured_output(CreditEvaluation)

    prompt = (
        f"Evalua el riesgo crediticio de la operacion ID: {state.operation_id}.\n"
        f"Tipo: {state.operation_type.value}\n"
        f"Monto: {state.amount}\n"
        f"Condiciones: {json.dumps(state.details, default=str)}\n"
        "Criterios de evaluacion:\n"
        "- Analiza capacidad de pago, tasa de interes y plazo.\n"
        "- Si el riesgo es admisible: creditworthy=True, passed=True, recommended_action='APPROVE'.\n"
        "- Si el riesgo es dudoso pero viable con revision manual: passed=False, recommended_action='ESCALATE'.\n"
        "- Si el riesgo es inasumible: passed=False, recommended_action='DENY'."
    )

    result = structured_llm.invoke([
        SystemMessage(content="Eres un analista de scoring y concesion crediticia bancaria."),
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
        reason_detail = fraud.reason if (fraud and not fraud.passed) else sec.reason
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
        reason = "Aprobado: Verificaciones de seguridad, antifraude y riesgo crediticio superadas."

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