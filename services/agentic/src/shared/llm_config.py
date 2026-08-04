from langchain_community.chat_models import ChatOllama

def get_llm():
    """
    Instancia el modelo local de Ollama.
    Temperature 0.0 garantiza respuestas deterministas y analíticas.
    """
    return ChatOllama(
        model="llama3",
        temperature=0.0
    )