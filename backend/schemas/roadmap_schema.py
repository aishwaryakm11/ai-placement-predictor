"""Roadmap request/response schemas (Pydantic v2)."""

from pydantic import BaseModel, field_validator
from config import VALID_ROLES


class RoadmapRequest(BaseModel):
    student_id: str
    known_skills: list[str]
    target_role: str

    @field_validator("target_role")
    @classmethod
    def validate_target_role(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(
                f"target_role must be one of {VALID_ROLES}. Got {v!r}."
            )
        return v


class RoadmapPhase(BaseModel):
    phase: str
    skills: list[str]
    estimated_weeks: int
    recommended_action: str


class RoadmapData(BaseModel):
    student_id: str
    missing_skills: list[str]
    roadmap: list[RoadmapPhase]
