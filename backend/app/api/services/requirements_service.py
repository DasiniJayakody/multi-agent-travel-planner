import json
from typing import Tuple, Optional
from langchain_core.messages import HumanMessage
from langgraph.types import Command

from app.agents.requirements_graph import compiled_graph
from app.agents.response_models.requirements_agent import CompleteRequirements


def process_requirements_chat(
    message: str, thread_id: str, resume: bool
) -> Tuple[str, bool, Optional[CompleteRequirements]]:
    config = {"configurable": {"thread_id": thread_id}}

    if resume:
        state = Command(resume=message)
        result = compiled_graph.invoke(state, config)
    else:
        initial_state = {"messages": [HumanMessage(content=message)]}
        result = compiled_graph.invoke(initial_state, config)

    if "__interrupt__" in result:
        interrupt_value = result["__interrupt__"]
        if isinstance(interrupt_value, list) and len(interrupt_value) > 0:
            interrupt_message = str(interrupt_value[0].value)
        else:
            interrupt_message = str(interrupt_value)
        return interrupt_message, True, None

    final_message = result["messages"][-1].content
    requirements_data = json.loads(final_message)
    requirements = CompleteRequirements(**requirements_data)

    return final_message, False, requirements
