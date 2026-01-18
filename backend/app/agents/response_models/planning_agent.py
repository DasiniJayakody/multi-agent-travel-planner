from pydantic import BaseModel, Field
from typing import List


class PlanningAgentResponseModel(BaseModel):
    """Response model for the query planning agent."""

    plan: str = Field(
        description="A structured search plan analyzing the query and identifying key aspects to explore"
    )
    sub_queries: List[str] = Field(
        description="Decomposed sub-queries that break down the main query into specific search aspects"
    )
