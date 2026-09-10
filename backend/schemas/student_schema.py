"""Student input schema (Pydantic v2)."""

from pydantic import BaseModel, field_validator, model_validator
from typing import Annotated
from config import VALID_DEPARTMENTS, VALID_ROLES


class StudentRequest(BaseModel):
    student_id: str
    department: str
    semester: int
    cgpa: float
    tenth_pct: float
    twelfth_pct: float
    backlogs: int
    known_languages: list[str]
    certifications: list[str]
    projects_count: int
    internships_count: int
    open_source_contributions: int
    aptitude_score: float
    soft_skill_rating: float
    hackathons_attended: int
    leadership_roles: int
    target_role: str

    # ── Numeric validators ────────────────────────────────────────────────────

    @field_validator("cgpa")
    @classmethod
    def validate_cgpa(cls, v: float) -> float:
        if not (0.0 <= v <= 10.0):
            raise ValueError("cgpa must be between 0.0 and 10.0")
        return v

    @field_validator("tenth_pct")
    @classmethod
    def validate_tenth(cls, v: float) -> float:
        if not (0.0 <= v <= 100.0):
            raise ValueError("tenth_pct must be between 0.0 and 100.0")
        return v

    @field_validator("twelfth_pct")
    @classmethod
    def validate_twelfth(cls, v: float) -> float:
        if not (0.0 <= v <= 100.0):
            raise ValueError("twelfth_pct must be between 0.0 and 100.0")
        return v

    @field_validator("backlogs")
    @classmethod
    def validate_backlogs(cls, v: int) -> int:
        if v < 0:
            raise ValueError("backlogs must be >= 0")
        return v

    @field_validator("projects_count")
    @classmethod
    def validate_projects(cls, v: int) -> int:
        if v < 0:
            raise ValueError("projects_count must be >= 0")
        return v

    @field_validator("internships_count")
    @classmethod
    def validate_internships(cls, v: int) -> int:
        if v < 0:
            raise ValueError("internships_count must be >= 0")
        return v

    @field_validator("open_source_contributions")
    @classmethod
    def validate_oss(cls, v: int) -> int:
        if v < 0:
            raise ValueError("open_source_contributions must be >= 0")
        return v

    @field_validator("aptitude_score")
    @classmethod
    def validate_aptitude(cls, v: float) -> float:
        if not (0.0 <= v <= 100.0):
            raise ValueError("aptitude_score must be between 0.0 and 100.0")
        return v

    @field_validator("soft_skill_rating")
    @classmethod
    def validate_soft_skill(cls, v: float) -> float:
        if not (0.0 <= v <= 10.0):
            raise ValueError("soft_skill_rating must be between 0.0 and 10.0")
        return v

    @field_validator("hackathons_attended")
    @classmethod
    def validate_hackathons(cls, v: int) -> int:
        if v < 0:
            raise ValueError("hackathons_attended must be >= 0")
        return v

    @field_validator("leadership_roles")
    @classmethod
    def validate_leadership(cls, v: int) -> int:
        if v < 0:
            raise ValueError("leadership_roles must be >= 0")
        return v

    @field_validator("semester")
    @classmethod
    def validate_semester(cls, v: int) -> int:
        if not (1 <= v <= 8):
            raise ValueError("semester must be between 1 and 8")
        return v

    # ── Categorical validators ────────────────────────────────────────────────

    @field_validator("department")
    @classmethod
    def validate_department(cls, v: str) -> str:
        if v not in VALID_DEPARTMENTS:
            raise ValueError(
                f"department must be one of {VALID_DEPARTMENTS}. Got {v!r}."
            )
        return v

    @field_validator("target_role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(
                f"target_role must be one of {VALID_ROLES}. Got {v!r}."
            )
        return v
