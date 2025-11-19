# app/agents/travel_system.py
from langgraph.checkpoint.memory import MemorySaver
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

from app.agents.tools.flight_tools import search_flight_availability
from app.agents.tools.planner_tools import web_search
from app.agents.tools.booking_tools import book_flight, book_hotel, search_hotels
from app.agents.response_models.requirements_agent import RequirementsAgentResponseModel
from app.agents.response_models.planner_agent import PlannerAgentResponseModel
from app.agents.response_models.booker_agent import BookerAgentResponseModel
from app.agents.prompts.travel_system import (
    REQUIREMENTS_AGENT_SYSTEM_PROMPT,
    PLANNER_AGENT_SYSTEM_PROMPT,
    BOOKER_AGENT_SYSTEM_PROMPT,
)
from app.core.llm import model


requirements_agent = create_agent(
    model=model,
    name="requirements",
    tools=[search_flight_availability],
    response_format=ToolStrategy(RequirementsAgentResponseModel),
    system_prompt=REQUIREMENTS_AGENT_SYSTEM_PROMPT,
    # checkpointer=MemorySaver(),  # Manages state in memory for the session
)

planner_agent = create_agent(
    model=model,
    name="planner",
    tools=[web_search],
    response_format=ToolStrategy(PlannerAgentResponseModel),
    system_prompt=PLANNER_AGENT_SYSTEM_PROMPT,
)

booker_agent = create_agent(
    model=model,
    name="booker",
    tools=[book_flight, book_hotel, search_hotels],
    response_format=ToolStrategy(BookerAgentResponseModel),
    system_prompt=BOOKER_AGENT_SYSTEM_PROMPT,
)


if __name__ == "__main__":
    for chunk in requirements_agent.stream(
        input={"messages": ["I want to go to Tokyo from Tokyo on October 26th, 2025."]},
        stream_mode="updates",
    ):
        print(chunk)
