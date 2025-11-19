from pydantic import BaseModel
from typing import Optional
from app.agents.response_models.requirements_agent import CompleteRequirements
from app.agents.response_models.planner_agent import Itinerary
from app.agents.response_models.booker_agent import Bookings


class TravelSystemChatRequest(BaseModel):
    message: str
    thread_id: str
    resume: bool = False


class TravelSystemChatResponse(BaseModel):
    message: str
    is_interrupt: bool
    requirements: Optional[CompleteRequirements] = None
    itinerary: Optional[Itinerary] = None
    bookings: Optional[Bookings] = None

