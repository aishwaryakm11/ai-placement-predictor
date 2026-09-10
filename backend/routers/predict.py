"""
POST /api/predict

Full placement prediction pipeline:
  1. Validate student input (Pydantic)
  2. Engineer numeric features
  3. Run the Random Forest model
  4. Compute readiness status
  5. SHAP explanation (top 5 factors)
  6. Skill gap vs target role
  7. Phased upskilling roadmap
  8. Benchmark-match scores for all roles
  9. Return standard response envelope
"""

import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import pandas as pd
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from schemas.student_schema import StudentRequest
from schemas.prediction_schema import APIResponse
from ml.feature_engineering import engineer_features
from ml.model import predict_student
from ml.explainer import explain_student
from services.skill_gap_service import compute_skill_gap, generate_roadmap, compute_role_scores
from utils.validators import get_readiness_status

router = APIRouter()


def _build_feature_dict(req: StudentRequest) -> dict:
    """Build a raw feature dict from the validated student request."""
    known_lang_str = "|".join(req.known_languages) if req.known_languages else ""
    cert_str = "|".join(req.certifications) if req.certifications else ""

    return {
        "cgpa": req.cgpa,
        "tenth_pct": req.tenth_pct,
        "twelfth_pct": req.twelfth_pct,
        "backlogs": req.backlogs,
        "projects_count": req.projects_count,
        "internships_count": req.internships_count,
        "open_source_contributions": req.open_source_contributions,
        "aptitude_score": req.aptitude_score,
        "soft_skill_rating": req.soft_skill_rating,
        "hackathons_attended": req.hackathons_attended,
        "leadership_roles": req.leadership_roles,
        "known_languages": known_lang_str,
        "certifications": cert_str,
    }


@router.post("/predict", response_model=APIResponse)
async def predict(request: Request, student: StudentRequest):
    """
    Run the full AI placement prediction pipeline for a single student.
    """
    try:
        # ── Feature engineering ───────────────────────────────────────────────
        raw_dict = _build_feature_dict(student)
        raw_df = pd.DataFrame([raw_dict])
        feature_df = engineer_features(raw_df)

        # feature_dict for predict_student (uses engineered features)
        feature_dict = feature_df.iloc[0].to_dict()

        # ── Model inference ───────────────────────────────────────────────────
        probability = predict_student(feature_dict)
        probability = round(probability, 2)
        readiness_status = get_readiness_status(probability)

        # ── SHAP explanation ──────────────────────────────────────────────────
        shap_factors = explain_student(feature_df, top_n=5)

        # ── Skill gap ─────────────────────────────────────────────────────────
        all_skills = list(student.known_languages) + list(student.certifications)
        missing_skills = compute_skill_gap(all_skills, student.target_role)
        roadmap = generate_roadmap(missing_skills, student.target_role)

        # ── Role scores ───────────────────────────────────────────────────────
        target_role_scores = compute_role_scores(
            known_languages=list(student.known_languages),
            certifications=list(student.certifications),
            cgpa=student.cgpa,
            projects_count=student.projects_count,
            aptitude_score=student.aptitude_score,
        )

        return APIResponse(
            success=True,
            data={
                "student_id": student.student_id,
                "placement_probability": probability,
                "readiness_status": readiness_status,
                "target_role_scores": target_role_scores,
                "shap_factors": shap_factors,
                "missing_skills": missing_skills,
                "roadmap": roadmap,
            },
            error=None,
        )

    except FileNotFoundError as exc:
        return JSONResponse(
            status_code=503,
            content={"success": False, "data": None, "error": str(exc)},
        )
    except ValueError as exc:
        return JSONResponse(
            status_code=422,
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
