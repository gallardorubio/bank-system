# services/agentic/src/shared/prompt_manager.py
import os
import yaml
import logging
from typing import Dict, Any
from langchain_core.messages import SystemMessage

logger = logging.getLogger("PromptManager")

class PromptManager:
    """
    Capa de orquestación para la inyección y versionado de Prompts.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PromptManager, cls).__new__(cls)
            cls._instance._prompts = cls._instance._load_prompts()
        return cls._instance

    def _load_prompts(self) -> Dict[str, Any]:
        config_path = os.path.join(os.path.dirname(__file__), "..", "config", "prompts.yaml")
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
                logger.info(f"Prompts cargados correctamente. Versión: {config.get('version', 'N/A')}")
                return config.get("agents", {})
        except Exception as e:
            logger.error(f"Fallo crítico al cargar prompts.yaml: {e}")
            raise

    def get_system_prompt(self, agent_name: str) -> SystemMessage:
        agent_config = self._prompts.get(agent_name)
        if not agent_config:
            raise ValueError(f"Configuración no encontrada para el agente: {agent_name}")

        prompt_parts = [
            agent_config.get("role", ""),
            agent_config.get("objective", ""),
            "\nREGLAS INQUEBRANTABLES:"
        ]
        
        for constraint in agent_config.get("constraints", []):
            prompt_parts.append(f"- {constraint}")
            
        prompt_parts.append("\nPOLÍTICA ESTRICTA DE RIESGOS:")
        
        for policy in agent_config.get("policies", []):
            prompt_parts.append(f"- {policy}")
            
        prompt_parts.append(f"\n{agent_config.get('output_instructions', '')}")
        
        full_prompt = "\n".join(prompt_parts)
        return SystemMessage(content=full_prompt)