import json

from langchain.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import interrupt, Command
from langgraph.checkpoint.memory import InMemorySaver

from app.agents.travel_system import requirements_agent


checkpointer = InMemorySaver()


class RequirementsGraphState(MessagesState):
    requirements_complete: bool
    interruption_message: str


def requirements_agent_node(state: RequirementsGraphState) -> RequirementsGraphState:
    response = requirements_agent.invoke({"messages": state["messages"]})

    requirements_response = response["structured_response"].requirements

    if requirements_response.missing_info.question != "":
        return {
            "messages": [
                AIMessage(content=requirements_response.missing_info.question)
            ],
            "interruption_message": requirements_response.missing_info.question,
            "requirements_complete": False,
        }

    return {
        "messages": [
            AIMessage(content=json.dumps(response["structured_response"].model_dump()))
        ],
        "requirements_complete": True,
        "interruption_message": "",
    }


def should_ask_user_for_info(state: RequirementsGraphState) -> bool:
    return not state["requirements_complete"]


def ask_user_for_info(state: RequirementsGraphState) -> RequirementsGraphState:
    user_response = interrupt(state["interruption_message"])

    return {
        "messages": [HumanMessage(content=user_response)],
        "interruption_message": "",
        "requirements_complete": False,
    }


graph = StateGraph(RequirementsGraphState)
graph.add_node("requirements_agent", requirements_agent_node)
graph.add_node("ask_user_for_info", ask_user_for_info)
graph.add_edge(START, "requirements_agent")
graph.add_conditional_edges(
    "requirements_agent",
    should_ask_user_for_info,
    {True: "ask_user_for_info", False: END},
)
graph.add_edge("ask_user_for_info", "requirements_agent")

compiled_graph = graph.compile(checkpointer=checkpointer)


if __name__ == "__main__":
    initial_state = RequirementsGraphState(
        messages=[
            HumanMessage(
                content="I want to go to Seoul(ICN) from Tokyo(NRT). My dates are flexible."
            )
        ]
    )

    config = {"configurable": {"thread_id": "thread-1"}}

    result = compiled_graph.invoke(initial_state, config)

    while True:
        if "__interrupt__" in result:
            print(result["__interrupt__"])

            user_input = input("")

            current_state = Command(resume=user_input)

            result = compiled_graph.invoke(current_state, config)
        else:
            break

    print(json.dumps(json.loads(result["messages"][-1].content), indent=4))
