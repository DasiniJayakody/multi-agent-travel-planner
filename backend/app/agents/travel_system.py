# app/agents/requirements_agent.py
from langgraph.checkpoint.memory import MemorySaver
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

from app.agents.tools.flight_tools import search_flight_availability
from app.agents.response_models.requirements_agent import RequirementsAgentResponseModel
from app.agents.prompts.travel_system import REQUIREMENTS_AGENT_SYSTEM_PROMPT
from app.core.llm import model


requirements_agent = create_agent(
    model=model,
    tools=[search_flight_availability],
    response_format=ToolStrategy(RequirementsAgentResponseModel),
    system_prompt=REQUIREMENTS_AGENT_SYSTEM_PROMPT,
    # checkpointer=MemorySaver(),  # Manages state in memory for the session
)


if __name__ == "__main__":
    for chunk in requirements_agent.stream(
        input={"messages": ["I want to go to Tokyo from Tokyo on October 26th, 2025."]},
        stream_mode="updates",
    ):
        print(chunk)
