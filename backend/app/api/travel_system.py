from fastapi import APIRouter
from app.api.models.travel_system import (
    TravelSystemChatRequest,
    TravelSystemChatResponse,
)
from app.api.services.travel_system_service import process_travel_system_chat

router = APIRouter()


@router.post("/chat", response_model=TravelSystemChatResponse)
async def travel_system_chat(request: TravelSystemChatRequest):
    """
    Chat endpoint for the full travel system pipeline.
    Handles requirements gathering, itinerary planning, and bookings.
    """
    message, is_interrupt, requirements, itinerary, bookings = process_travel_system_chat(
        request.message, request.thread_id, request.resume
    )

    return TravelSystemChatResponse(
        message=message,
        is_interrupt=is_interrupt,
        requirements=requirements,
        itinerary=itinerary,
        bookings=bookings,
    )

