from fastapi import APIRouter
from app.api.models.requirements import (
    RequirementsChatRequest,
    RequirementsChatResponse,
)
from app.api.services.requirements_service import process_requirements_chat

router = APIRouter()


@router.post("/chat", response_model=RequirementsChatResponse)
async def requirements_chat(request: RequirementsChatRequest):
    message, is_interrupt, requirements = process_requirements_chat(
        request.message, request.thread_id, request.resume
    )

    return RequirementsChatResponse(
        message=message, is_interrupt=is_interrupt, requirements=requirements
    )
