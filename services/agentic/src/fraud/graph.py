# services/agentic/src/fraud/graph.py
import json
import logging
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

from src.fraud.state import FraudState
from src.shared.llm_config import get_llm
from src.fraud.tools import check_opensanctions_api, analyze_beneficiary_graph, evaluate_kyc_limits
from src.shared.prompt_manager import PromptManager

logger = logging.getLogger("FraudGraph")

# Esquema estricto para obligar al LLM a responder en formato JSON
class FraudDecisionOutput(BaseModel):
    decision: str = Field(description="CLEARED, MANUAL_REVIEW, o FUNDS_FROZEN")
    fraud_typology: str = Field(description="MULE_ACCOUNT, SANCTIONS_MATCH, SCAM, o NONE")
    investigation_notes: str = Field(description="Resumen técnico para el departamento de Compliance y reguladores.")

# Inicializar componentes
tools = [check_opensanctions_api, analyze_beneficiary_graph, evaluate_kyc_limits]
llm = get_llm().bind_tools(tools)
prompt_manager = PromptManager()

# ==========================================
# NODOS DEL GRAFO
# ==========================================

def fraud_agent_node(state: FraudState):
    """Nodo principal: El cerebro del agente."""
    messages = state["messages"]
    
    # Inyectar el System Prompt (Rol y Políticas) si no existe
    if not any(isinstance(m, SystemMessage) for m in messages):
        system_message = prompt_manager.get_system_prompt("fraud_aml_investigator")
        messages = [system_message] + list(messages)

    # Inferencia del LLM
    response = llm.invoke(messages)
    return {"messages": [response]}

def fraud_tools_node(state: FraudState):
    """Nodo de ejecución: Dispara las herramientas solicitadas por el agente."""
    messages = state["messages"]
    last_message = messages[-1]
    
    tool_responses = []
    
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        
        logger.info(f"Fraud Agent invocando herramienta: {tool_name}")
        
        try:
            if tool_name == "check_opensanctions_api":
                result = check_opensanctions_api.invoke(tool_args)
            elif tool_name == "analyze_beneficiary_graph":
                result = analyze_beneficiary_graph.invoke(tool_args)
            elif tool_name == "evaluate_kyc_limits":
                 result = evaluate_kyc_limits.invoke(tool_args)
            else:
                result = "Error: Herramienta no registrada en el SOC Fraude."
        except Exception as e:
             logger.error(f"Fallo en ejecución de herramienta {tool_name}: {e}")
             result = f"Error de ejecución: {str(e)}"
            
        tool_responses.append(ToolMessage(
            content=str(result),
            name=tool_name,
            tool_call_id=tool_call["id"]
        ))
        
    return {"messages": tool_responses}

# ==========================================
# LÓGICA DE ENRUTAMIENTO CONDICIONAL
# ==========================================

def should_continue_fraud(state: FraudState):
    """Decide si el agente debe seguir investigando o si ya tiene una decisión."""
    last_message = state["messages"][-1]
    # Si el LLM ha solicitado usar una herramienta, enrutamos al nodo de herramientas
    if last_message.tool_calls:
        return "tools"
    # Si no, ha terminado su análisis
    return END

# ==========================================
# COMPILACIÓN DEL GRAFO (WORKFLOW ENGINE)
# ==========================================

fraud_workflow = StateGraph(FraudState)

# Añadir Nodos
fraud_workflow.add_node("agent", fraud_agent_node)
fraud_workflow.add_node("tools", fraud_tools_node)

# Definir Flujo
fraud_workflow.set_entry_point("agent")
fraud_workflow.add_conditional_edges("agent", should_continue_fraud)
fraud_workflow.add_edge("tools", "agent") # Bucle: Después de la herramienta, vuelve al LLM

# Compilar la aplicación.
# En un entorno Enterprise completo, aquí añadiríamos `checkpointer=MemorySaver()` 
# para guardar el estado en disco/PostgreSQL.
fraud_agent_app = fraud_workflow.compile()