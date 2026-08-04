# services/agentic/src/credit/state.py
from typing import TypedDict, Annotated, Sequence, Optional, List
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class CreditState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    operation_id: str
    account_id: str
    tax_id: str 
    amount: float
    decision: Optional[str]
    risk_tier: Optional[str]
    proposed_interest_rate: Optional[float]
    behavioral_flags: Optional[List[str]]
    compliance_memo: Optional[str]