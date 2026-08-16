from langgraph.graph import StateGraph, START, END
from src.agent.state import AgentState
from src.agent.nodes import (
    evaluate_security,
    evaluate_fraud,
    evaluate_credit,
    synthesize_decision,
    dispatch_actions,
)

workflow = StateGraph(AgentState)

workflow.add_node("evaluate_security", evaluate_security)
workflow.add_node("evaluate_fraud", evaluate_fraud)
workflow.add_node("evaluate_credit", evaluate_credit)
workflow.add_node("synthesize_decision", synthesize_decision)
workflow.add_node("dispatch_actions", dispatch_actions)

workflow.add_edge(START, "evaluate_security")
workflow.add_edge("evaluate_security", "evaluate_fraud")
workflow.add_edge("evaluate_fraud", "evaluate_credit")
workflow.add_edge("evaluate_credit", "synthesize_decision")
workflow.add_edge("synthesize_decision", "dispatch_actions")
workflow.add_edge("dispatch_actions", END)

agent_graph = workflow.compile()