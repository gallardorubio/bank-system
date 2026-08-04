# services/agentic/src/security/graph.py
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

from src.security.state import SecurityState
from src.shared.llm_config import get_llm
from src.security.tools import get_geoip_context, get_user_security_baseline, escalate_to_external_cti
from src.shared.prompt_manager import PromptManager

class SecurityDecisionOutput(BaseModel):
    decision: str = Field(description="PASS, MFA_REQUIRED o KILL_SESSION_AND_LOCK")
    threat_level: str = Field(description="LOW, MEDIUM, HIGH o CRITICAL")
    incident_report: str = Field(description="Informe técnico estructurado. Debe especificar si el veredicto provino de telemetría local o requirió escalado a CTI.")

# Registramos las nuevas herramientas orquestadas
tools = [get_geoip_context, get_user_security_baseline, escalate_to_external_cti]
llm = get_llm().bind_tools(tools)
prompt_manager = PromptManager()

def security_agent_node(state: SecurityState):
    messages = state["messages"]
    if not any(isinstance(m, SystemMessage) for m in messages):
        system_message = prompt_manager.get_system_prompt("soc_security_analyst")
        messages = [system_message] + messages

    response = llm.invoke(messages)
    return {"messages": [response]}

def security_tools_node(state: SecurityState):
    messages = state["messages"]
    last_message = messages[-1]
    
    tool_responses = []
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        
        # Enrutador de herramientas
        if tool_name == "get_geoip_context":
            result = get_geoip_context.invoke(tool_args)
        elif tool_name == "get_user_security_baseline":
            result = get_user_security_baseline.invoke(tool_args)
        elif tool_name == "escalate_to_external_cti":
             result = escalate_to_external_cti.invoke(tool_args)
        else:
            result = "Error: Herramienta no registrada en el SOC."
            
        tool_responses.append(ToolMessage(
            content=str(result),
            name=tool_name,
            tool_call_id=tool_call["id"]
        ))
        
    return {"messages": tool_responses}

def should_continue_security(state: SecurityState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

security_workflow = StateGraph(SecurityState)
security_workflow.add_node("agent", security_agent_node)
security_workflow.add_node("tools", security_tools_node)
security_workflow.set_entry_point("agent")
security_workflow.add_conditional_edges("agent", should_continue_security)
security_workflow.add_edge("tools", "agent")

security_agent_app = security_workflow.compile()