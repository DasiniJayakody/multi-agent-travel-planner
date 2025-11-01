from pydantic import BaseModel
from typing import Optional
from app.agents.response_models.requirements_agent import CompleteRequirements


class RequirementsChatRequest(BaseModel):
    message: str
    thread_id: str
    resume: bool = False


class RequirementsChatResponse(BaseModel):
    message: str
    is_interrupt: bool
    requirements: Optional[CompleteRequirements] = None
