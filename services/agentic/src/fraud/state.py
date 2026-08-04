# services/agentic/src/fraud/state.py
from typing import TypedDict, Annotated, Sequence, Optional
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class FraudState(TypedDict):
    # 'add_messages' asegura que la lista de mensajes (memoria del LLM) siempre crece, no se sobrescribe
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
    # Contexto Inyectado desde el Evento (Variables Críticas)
    transaction_id: str
    user_id: str
    destination_account: str
    amount: float
    beneficiary_name: str
    
    # Salidas Generadas por el Agente
    decision: Optional[str]        # CLEARED, MANUAL_REVIEW, FUNDS_FROZEN
    fraud_typology: Optional[str]  # MULE_ACCOUNT, SANCTIONS, SCAM, NONE
    investigation_notes: Optional[str]