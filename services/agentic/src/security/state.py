# services/agentic/src/security/state.py
from typing import TypedDict, Annotated, Sequence, Optional, List
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class SecurityState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    event_id: str
    user_id: str
    ip_address: str
    decision: Optional[str]
    threat_level: Optional[str]
    incident_report: Optional[str]