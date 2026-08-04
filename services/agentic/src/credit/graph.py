# services/agentic/src/credit/graph.py
import json
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

from src.credit.state import CreditState
from src.shared.llm_config import get_llm
from src.shared.tools import get_financial_profile, get_macroeconomic_context, get_cirbe_report
from src.shared.prompt_manager import PromptManager

class CreditDecisionOutput(BaseModel):
    decision: str = Field(description="APPROVED, DENIED o ESCALATED")
    risk_tier: str = Field(description="LOW, MEDIUM, HIGH o CRITICAL")
    proposed_interest_rate: float = Field(description="Tasa de interés propuesta (Euribor + Spread). 0.0 si es DENIED.")
    behavioral_flags: list[str] = Field(description="Lista de patrones de comportamiento detectados en las transacciones.")
    compliance_memo: str = Field(description="Informe estructurado justificando la decisión para auditoría regulatoria.")

tools = [get_financial_profile, get_macroeconomic_context, get_cirbe_report]
llm = get_llm().bind_tools(tools)
prompt_manager = PromptManager()

def agent_node(state: CreditState):
    messages = state["messages"]
    
    if not any(isinstance(m, SystemMessage) for m in messages):
        system_message = prompt_manager.get_system_prompt("credit_risk_officer")
        messages = [system_message] + messages

    response = llm.invoke(messages)
    return {"messages": [response]}

def tools_node(state: CreditState):
    messages = state["messages"]
    last_message = messages[-1]
    
    tool_responses = []
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        
        if tool_name == "get_financial_profile":
            result = get_financial_profile.invoke(tool_args)
        elif tool_name == "get_macroeconomic_metrics":
            result = get_macroeconomic_metrics.invoke(tool_args)
        elif tool_name == "get_cirbe_report":
             result = get_cirbe_report.invoke(tool_args)
        else:
            result = "Error: Herramienta no reconocida."
            
        tool_responses.append(ToolMessage(
            content=str(result),
            name=tool_name,
            tool_call_id=tool_call["id"]
        ))
        
    return {"messages": tool_responses}

def should_continue(state: CreditState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

workflow = StateGraph(CreditState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tools_node)
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

credit_agent_app = workflow.compile()