import json
from typing import Tuple, Optional
from langchain_core.messages import HumanMessage
from langgraph.types import Command

from app.agents.travel_system_graph import travel_system_graph, TravelSystemState
from app.agents.response_models.requirements_agent import CompleteRequirements
from app.agents.response_models.planner_agent import Itinerary
from app.agents.response_models.booker_agent import Bookings


def process_travel_system_chat(
    message: str, thread_id: str, resume: bool
) -> Tuple[str, bool, Optional[CompleteRequirements], Optional[Itinerary], Optional[Bookings]]:
    """
    Process a travel system chat request.
    
    Returns:
        Tuple of (message, is_interrupt, requirements, itinerary, bookings)
    """
    config = {"configurable": {"thread_id": thread_id}}

    if resume:
        # Resume execution with user input
        result = travel_system_graph.invoke(
            Command(resume=message),
            config,
        )
    else:
        # Initial invocation
        initial_state = TravelSystemState(
            messages=[HumanMessage(content=message)],
            requirements=None,
            itinerary=None,
            bookings=None,
        )
        result = travel_system_graph.invoke(initial_state, config)

    # Check if there's an interrupt
    if "__interrupt__" in result:
        # Extract interrupt message
        interrupt_value = result["__interrupt__"]
        if isinstance(interrupt_value, list) and len(interrupt_value) > 0:
            interrupt_obj = interrupt_value[0]
            if hasattr(interrupt_obj, "value"):
                interrupt_message = str(interrupt_obj.value)
            else:
                interrupt_message = str(interrupt_obj)
        else:
            interrupt_message = str(interrupt_value)
        
        return (interrupt_message, True, None, None, None)

    # No interrupt - extract results
    requirements_dict = result.get("requirements")
    itinerary_dict = result.get("itinerary")
    bookings_dict = result.get("bookings")

    # Parse into Pydantic models if available
    requirements = None
    if requirements_dict:
        try:
            requirements = CompleteRequirements(**requirements_dict)
        except Exception:
            # If parsing fails, leave as None
            pass

    itinerary = None
    if itinerary_dict:
        try:
            itinerary = Itinerary(**itinerary_dict)
        except Exception:
            pass

    bookings = None
    if bookings_dict:
        try:
            bookings = Bookings(**bookings_dict)
        except Exception:
            pass

    # Create a summary message
    summary_parts = []
    if requirements:
        summary_parts.append("Requirements gathered")
    if itinerary:
        summary_parts.append(f"Itinerary created with {len(itinerary.days)} days")
    if bookings:
        booking_parts = []
        if bookings.flights:
            booking_parts.append("flight")
        if bookings.hotels:
            booking_parts.append("hotel")
        if booking_parts:
            summary_parts.append(f"Bookings confirmed: {', '.join(booking_parts)}")
    
    final_message = ". ".join(summary_parts) if summary_parts else "Travel planning completed"

    return (final_message, False, requirements, itinerary, bookings)

