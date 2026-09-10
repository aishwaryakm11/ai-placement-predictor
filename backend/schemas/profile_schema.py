"""
Profile schemas for the progressive multi-step profile builder.

Steps:
  1. Academic Information
  2. Technical Skills
  3. Experience
  4. Aptitude & Soft Skills
  5. Target Role
"""

from pydantic import BaseModel, field_validator
from typing import Optional, List
import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from config import VALID_DEPARTMENTS, VALID_ROLES


# ── Step 1: Academic Information ──────────────────────────────────────────────

class AcademicInfoStep(BaseModel):
    full_name: str
    student_id: str
    department: str
    semester: int
    cgpa: float
    tenth_pct: float
    twelfth_pct: float
    backlogs: int

    @field_validator("department")
    @classmethod
    def validate_dept(cls, v):
        if v not in VALID_DEPARTMENTS:
            raise ValueError(f"department must be one of {VALID_DEPARTMENTS}")
        return v

    @field_validator("semester")
    @classmethod
    def validate_semester(cls, v):
        if not (1 <= v <= 8):
            raise ValueError("semester must be between 1 and 8")
        return v

    @field_validator("cgpa")
    @classmethod
    def validate_cgpa(cls, v):
        if not (0.0 <= v <= 10.0):
            raise ValueError("cgpa must be between 0 and 10")
        return v

    @field_validator("tenth_pct", "twelfth_pct")
    @classmethod
    def validate_pct(cls, v):
        if not (0.0 <= v <= 100.0):
            raise ValueError("percentage must be between 0 and 100")
        return v

    @field_validator("backlogs")
    @classmethod
    def validate_backlogs(cls, v):
        if v < 0:
            raise ValueError("backlogs must be >= 0")
        return v


# ── Step 2: Technical Skills ──────────────────────────────────────────────────

class TechnicalSkillsStep(BaseModel):
    known_languages: List[str]
    certifications: List[str]


# ── Step 3: Experience ────────────────────────────────────────────────────────

class ExperienceStep(BaseModel):
    projects_count: int
    internships_count: int
    open_source_contributions: int
    hackathons_attended: int
    leadership_roles: int

    @field_validator("projects_count", "internships_count", "open_source_contributions",
                     "hackathons_attended", "leadership_roles")
    @classmethod
    def validate_non_negative(cls, v):
        if v < 0:
            raise ValueError("Value must be >= 0")
        return v


# ── Step 4: Aptitude & Soft Skills ────────────────────────────────────────────

class AptitudeStep(BaseModel):
    aptitude_score: float
    soft_skill_rating: float

    @field_validator("aptitude_score")
    @classmethod
    def validate_aptitude(cls, v):
        if not (0.0 <= v <= 100.0):
            raise ValueError("aptitude_score must be between 0 and 100")
        return v

    @field_validator("soft_skill_rating")
    @classmethod
    def validate_soft_skill(cls, v):
        if not (0.0 <= v <= 10.0):
            raise ValueError("soft_skill_rating must be between 0 and 10")
        return v


# ── Step 5: Target Role ───────────────────────────────────────────────────────

class TargetRoleStep(BaseModel):
    target_role: str

    @field_validator("target_role")
    @classmethod
    def validate_role(cls, v):
        if v not in VALID_ROLES:
            raise ValueError(f"target_role must be one of {VALID_ROLES}")
        return v


# ── Full profile (returned from GET /api/profile/me) ─────────────────────────

class ProfileResponse(BaseModel):
    user_id: str
    full_name: Optional[str] = None
    student_id: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    cgpa: Optional[float] = None
    tenth_pct: Optional[float] = None
    twelfth_pct: Optional[float] = None
    backlogs: Optional[int] = None
    known_languages: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    projects_count: Optional[int] = None
    internships_count: Optional[int] = None
    open_source_contributions: Optional[int] = None
    hackathons_attended: Optional[int] = None
    leadership_roles: Optional[int] = None
    aptitude_score: Optional[float] = None
    soft_skill_rating: Optional[float] = None
    target_role: Optional[str] = None
    completed_steps: List[str] = []
    is_complete: bool = False
