"""Prediction response schemas (Pydantic v2)."""

from pydantic import BaseModel
from typing import Any


class ShapFactor(BaseModel):
    feature: str
    impact_pct: float
    direction: str
    readable_string: str


class RoadmapPhase(BaseModel):
    phase: str
    skills: list[str]
    estimated_weeks: int
    recommended_action: str


class PredictionData(BaseModel):
    student_id: str
    placement_probability: float
    readiness_status: str
    target_role_scores: dict[str, float]
    shap_factors: list[ShapFactor]
    missing_skills: list[str]
    roadmap: list[RoadmapPhase]


class APIResponse(BaseModel):
    success: bool
    data: Any
    error: str | None = None
