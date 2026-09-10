"""
POST /api/roadmap

Given a student ID, their known skills, and a target role, return:
  - missing_skills
  - phased upskilling roadmap
"""

import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator

from config import VALID_ROLES
from services.skill_gap_service import compute_skill_gap, generate_roadmap

router = APIRouter()


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


@router.post("/roadmap")
async def get_roadmap(req: RoadmapRequest):
    """
    Return the phased upskilling roadmap for a student targeting a specific role.
    """
    try:
        missing_skills = compute_skill_gap(req.known_skills, req.target_role)
        roadmap = generate_roadmap(missing_skills, req.target_role)

        return {
            "success": True,
            "data": {
                "student_id": req.student_id,
                "missing_skills": missing_skills,
                "roadmap": roadmap,
            },
            "error": None,
        }

    except ValueError as exc:
        return JSONResponse(
            status_code=422,
            content={"success": False, "data": None, "error": str(exc)},
        )
    except FileNotFoundError as exc:
        return JSONResponse(
            status_code=503,
            content={"success": False, "data": None, "error": str(exc)},
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "data": None,
                "error": f"Internal server error: {type(exc).__name__}: {exc}",
            },
        )
