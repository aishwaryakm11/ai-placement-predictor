"""
Progressive student profile API.

The multi-step flow is:
  Step 1: PUT /api/profile/academic        — Academic Information
  Step 2: PUT /api/profile/technical       — Technical Skills
  Step 3: PUT /api/profile/experience      — Experience
  Step 4: PUT /api/profile/aptitude        — Aptitude & Soft Skills
  Step 5: PUT /api/profile/target-role     — Target Role

  GET    /api/profile/me                   — Fetch current saved profile + completion status
  POST   /api/profile/analyze              — Run full ML pipeline from saved profile (all steps must be done)

All routes require a valid Supabase JWT (Authorization: Bearer <token>).
Profile data is stored in a Supabase Postgres table: `student_profiles`.

Supabase table DDL (run once in Supabase SQL Editor):
─────────────────────────────────────────────────────────────────────────────
create table if not exists student_profiles (
    user_id         uuid primary key references auth.users(id) on delete cascade,
    full_name       text,
    student_id      text,
    department      text,
    semester        int,
    cgpa            float,
    tenth_pct       float,
    twelfth_pct     float,
    backlogs        int,
    known_languages text[],
    certifications  text[],
    projects_count  int,
    internships_count int,
    open_source_contributions int,
    hackathons_attended int,
    leadership_roles int,
    aptitude_score  float,
    soft_skill_rating float,
    target_role     text,
    completed_steps text[],
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

-- Enable Row Level Security
alter table student_profiles enable row level security;

-- Policy: students can only read/write their own row
create policy "Students own profile"
on student_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: TPO can read all profiles
create policy "TPO read all"
on student_profiles for select
using (
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()) = 'tpo'
);
─────────────────────────────────────────────────────────────────────────────
"""

import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import pandas as pd
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from dependencies import get_current_user
from supabase_client import get_supabase_admin
from schemas.profile_schema import (
    AcademicInfoStep,
    TechnicalSkillsStep,
    ExperienceStep,
    AptitudeStep,
    TargetRoleStep,
    ProfileResponse,
)
from ml.feature_engineering import engineer_features
from ml.model import predict_student
from ml.explainer import explain_student
from services.skill_gap_service import compute_skill_gap, generate_roadmap, compute_role_scores
from utils.validators import get_readiness_status

router = APIRouter()
_TABLE = "student_profiles"

STEPS = ["academic", "technical", "experience", "aptitude", "target_role"]


# ─── Helpers ───────────────────────────────────────────────────────────────────

def _get_profile(user_id: str) -> dict | None:
    """Fetch the student_profiles row for user_id, or None if not found."""
    sb = get_supabase_admin()
    result = sb.table(_TABLE).select("*").eq("user_id", user_id).maybe_single().execute()
    return result.data


def _upsert_profile(user_id: str, patch: dict) -> dict:
    """Upsert (insert or update) a partial profile row."""
    sb = get_supabase_admin()
    patch["user_id"] = user_id

    existing = _get_profile(user_id)
    if existing:
        # Merge completed_steps
        existing_steps = existing.get("completed_steps") or []
        new_steps = patch.get("completed_steps") or []
        merged_steps = list(set(existing_steps + new_steps))
        patch["completed_steps"] = merged_steps
        result = sb.table(_TABLE).update(patch).eq("user_id", user_id).execute()
    else:
        patch.setdefault("completed_steps", [])
        result = sb.table(_TABLE).insert(patch).execute()

    return result.data[0] if result.data else patch


def _row_to_profile_response(row: dict) -> ProfileResponse:
    completed = row.get("completed_steps") or []
    is_complete = all(s in completed for s in STEPS)
    return ProfileResponse(
        user_id=row["user_id"],
        full_name=row.get("full_name"),
        student_id=row.get("student_id"),
        department=row.get("department"),
        semester=row.get("semester"),
        cgpa=row.get("cgpa"),
        tenth_pct=row.get("tenth_pct"),
        twelfth_pct=row.get("twelfth_pct"),
        backlogs=row.get("backlogs"),
        known_languages=row.get("known_languages"),
        certifications=row.get("certifications"),
        projects_count=row.get("projects_count"),
        internships_count=row.get("internships_count"),
        open_source_contributions=row.get("open_source_contributions"),
        hackathons_attended=row.get("hackathons_attended"),
        leadership_roles=row.get("leadership_roles"),
        aptitude_score=row.get("aptitude_score"),
        soft_skill_rating=row.get("soft_skill_rating"),
        target_role=row.get("target_role"),
        completed_steps=completed,
        is_complete=is_complete,
    )


# ─── GET /api/profile/me ──────────────────────────────────────────────────────

@router.get("/me")
async def get_my_profile(user: dict = Depends(get_current_user)):
    """Return the current student's saved profile and completion progress."""
    try:
        user_id = user["sub"]
        row = _get_profile(user_id)
        if not row:
            # Return empty profile shell
            return {
                "success": True,
                "data": ProfileResponse(user_id=user_id).model_dump(),
                "error": None,
            }
        return {
            "success": True,
            "data": _row_to_profile_response(row).model_dump(),
            "error": None,
        }
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(exc)},
        )


# ─── Step 1: Academic Information ─────────────────────────────────────────────

@router.put("/academic")
async def save_academic(body: AcademicInfoStep, user: dict = Depends(get_current_user)):
    """Save Step 1 — Academic Information."""
    try:
        patch = body.model_dump()
        patch["completed_steps"] = ["academic"]
        row = _upsert_profile(user["sub"], patch)
        return {"success": True, "data": _row_to_profile_response(row).model_dump(), "error": None}
    except Exception as exc:
        return JSONResponse(status_code=500,
                            content={"success": False, "data": None, "error": str(exc)})


# ─── Step 2: Technical Skills ─────────────────────────────────────────────────

@router.put("/technical")
async def save_technical(body: TechnicalSkillsStep, user: dict = Depends(get_current_user)):
    """Save Step 2 — Technical Skills."""
    try:
        patch = {
            "known_languages": body.known_languages,
            "certifications": body.certifications,
            "completed_steps": ["technical"],
        }
        row = _upsert_profile(user["sub"], patch)
        return {"success": True, "data": _row_to_profile_response(row).model_dump(), "error": None}
    except Exception as exc:
        return JSONResponse(status_code=500,
                            content={"success": False, "data": None, "error": str(exc)})


# ─── Step 3: Experience ───────────────────────────────────────────────────────

@router.put("/experience")
async def save_experience(body: ExperienceStep, user: dict = Depends(get_current_user)):
    """Save Step 3 — Experience."""
    try:
        patch = body.model_dump()
        patch["completed_steps"] = ["experience"]
        row = _upsert_profile(user["sub"], patch)
        return {"success": True, "data": _row_to_profile_response(row).model_dump(), "error": None}
    except Exception as exc:
        return JSONResponse(status_code=500,
                            content={"success": False, "data": None, "error": str(exc)})


# ─── Step 4: Aptitude & Soft Skills ──────────────────────────────────────────

@router.put("/aptitude")
async def save_aptitude(body: AptitudeStep, user: dict = Depends(get_current_user)):
    """Save Step 4 — Aptitude & Soft Skills."""
    try:
        patch = body.model_dump()
        patch["completed_steps"] = ["aptitude"]
        row = _upsert_profile(user["sub"], patch)
        return {"success": True, "data": _row_to_profile_response(row).model_dump(), "error": None}
    except Exception as exc:
        return JSONResponse(status_code=500,
                            content={"success": False, "data": None, "error": str(exc)})


# ─── Step 5: Target Role ──────────────────────────────────────────────────────

@router.put("/target-role")
async def save_target_role(body: TargetRoleStep, user: dict = Depends(get_current_user)):
    """Save Step 5 — Target Role. Profile is now complete."""
    try:
        patch = body.model_dump()
        patch["completed_steps"] = ["target_role"]
        row = _upsert_profile(user["sub"], patch)
        return {"success": True, "data": _row_to_profile_response(row).model_dump(), "error": None}
    except Exception as exc:
        return JSONResponse(status_code=500,
                            content={"success": False, "data": None, "error": str(exc)})


# ─── Analyze: Run Full ML Pipeline ────────────────────────────────────────────

@router.post("/analyze")
async def analyze_profile(user: dict = Depends(get_current_user)):
    """
    Run the full AI placement prediction pipeline from the saved profile.
    All 5 profile steps must be completed first.
    """
    try:
        user_id = user["sub"]
        row = _get_profile(user_id)

        if not row:
            return JSONResponse(
                status_code=400,
                content={"success": False, "data": None,
                         "error": "No profile found. Complete your profile first."},
            )

        completed = row.get("completed_steps") or []
        missing = [s for s in STEPS if s not in completed]
        if missing:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "data": None,
                    "error": f"Profile incomplete. Missing steps: {missing}",
                },
            )

        # Build raw feature dict from saved profile
        known_languages = row.get("known_languages") or []
        certifications = row.get("certifications") or []

        raw_dict = {
            "cgpa": row["cgpa"],
            "tenth_pct": row["tenth_pct"],
            "twelfth_pct": row["twelfth_pct"],
            "backlogs": row["backlogs"],
            "projects_count": row["projects_count"],
            "internships_count": row["internships_count"],
            "open_source_contributions": row["open_source_contributions"],
            "aptitude_score": row["aptitude_score"],
            "soft_skill_rating": row["soft_skill_rating"],
            "hackathons_attended": row["hackathons_attended"],
            "leadership_roles": row["leadership_roles"],
            "known_languages": "|".join(known_languages),
            "certifications": "|".join(certifications),
        }

        raw_df = pd.DataFrame([raw_dict])
        feature_df = engineer_features(raw_df)
        feature_dict = feature_df.iloc[0].to_dict()

        probability = round(predict_student(feature_dict), 2)
        readiness_status = get_readiness_status(probability)
        shap_factors = explain_student(feature_df, top_n=5)

        all_skills = known_languages + certifications
        target_role = row["target_role"]
        missing_skills = compute_skill_gap(all_skills, target_role)
        roadmap = generate_roadmap(missing_skills, target_role)
        target_role_scores = compute_role_scores(
            known_languages=known_languages,
            certifications=certifications,
            cgpa=row["cgpa"],
            projects_count=row["projects_count"],
            aptitude_score=row["aptitude_score"],
        )

        return {
            "success": True,
            "data": {
                "student_id": row.get("student_id", user_id),
                "full_name": row.get("full_name"),
                "placement_probability": probability,
                "readiness_status": readiness_status,
                "target_role_scores": target_role_scores,
                "shap_factors": shap_factors,
                "missing_skills": missing_skills,
                "roadmap": roadmap,
            },
            "error": None,
        }

    except FileNotFoundError as exc:
        return JSONResponse(status_code=503,
                            content={"success": False, "data": None, "error": str(exc)})
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None,
                     "error": f"Internal server error: {type(exc).__name__}: {exc}"},
        )
