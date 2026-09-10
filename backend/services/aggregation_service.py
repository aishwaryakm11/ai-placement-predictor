"""
Aggregation service for TPO analytics.

Handles:
  - Loading and caching the synthetic students CSV.
  - Running batch inference for all students.
  - Computing department breakdowns, vulnerable student lists, and skill deficit matrices.
"""

import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import numpy as np
import pandas as pd
from functools import lru_cache

from config import SYNTHETIC_CSV, FEATURE_COLUMNS, VALID_DEPARTMENTS
from ml.feature_engineering import engineer_features
from ml.model import predict_student, get_model, get_feature_columns
from utils.validators import get_readiness_status
from services.skill_gap_service import compute_skill_gap


# ─── CSV cache ────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_csv() -> pd.DataFrame:
    if not SYNTHETIC_CSV.exists():
        raise FileNotFoundError(
            f"Student CSV not found at {SYNTHETIC_CSV}. "
            "Run  python backend/ml/data_gen.py  first."
        )
    return pd.read_csv(SYNTHETIC_CSV)


def load_students() -> pd.DataFrame:
    """Return a fresh copy of the synthetic student DataFrame."""
    return _load_csv().copy()


# ─── Batch inference ──────────────────────────────────────────────────────────

def _batch_predict(df: pd.DataFrame) -> np.ndarray:
    """Run the model on all rows at once for efficiency."""
    import joblib
    from config import MODEL_PATH, FEATURE_COLUMNS_PATH
    import json

    model = get_model()
    feature_columns = get_feature_columns()

    X = engineer_features(df)[feature_columns]
    preds = model.predict(X)
    return np.clip(preds, 0.0, 100.0)


# ─── Analytics ───────────────────────────────────────────────────────────────

def compute_analytics(
    department_filter: str | None = None,
    threshold: float = 60.0,
) -> dict:
    """
    Generate full TPO analytics payload.

    Args:
        department_filter: If supplied, restrict all analytics to this department.
        threshold:         Probability below which a student is "vulnerable".

    Returns:
        Dict with keys: overall_readiness_pct, department_breakdown,
        vulnerable_students, skill_deficit_matrix.
    """
    df = load_students()

    if department_filter:
        df = df[df["department"] == department_filter].copy()
        if df.empty:
            raise ValueError(f"No students found for department {department_filter!r}.")

    # ── Batch predict ────────────────────────────────────────────────────────
    df = df.copy()
    df["placement_probability"] = _batch_predict(df)
    df["readiness_status"] = df["placement_probability"].apply(get_readiness_status)

    # ── Overall readiness ─────────────────────────────────────────────────────
    overall_readiness_pct = round(float(df["placement_probability"].mean()), 2)

    # ── Department breakdown ──────────────────────────────────────────────────
    department_breakdown = []
    depts = [department_filter] if department_filter else VALID_DEPARTMENTS
    for dept in depts:
        dept_df = df[df["department"] == dept]
        if dept_df.empty:
            continue
        department_breakdown.append(
            {
                "department": dept,
                "readiness_pct": round(float(dept_df["placement_probability"].mean()), 1),
                "student_count": int(len(dept_df)),
            }
        )

    # ── Vulnerable students ───────────────────────────────────────────────────
    vuln_df = df[df["placement_probability"] < threshold]

    def _top_missing(row) -> str:
        langs = row["known_languages"].split("|") if row["known_languages"] and str(row["known_languages"]) != "nan" else []
        certs = row["certifications"].split("|") if row["certifications"] and str(row["certifications"]) != "nan" else []
        student_skills = langs + certs
        role = row.get("target_role", "Full-Stack Developer")
        try:
            missing = compute_skill_gap(student_skills, role)
            return missing[0] if missing else "N/A"
        except Exception:
            return "N/A"

    vulnerable_students = []
    for _, row in vuln_df.iterrows():
        vulnerable_students.append(
            {
                "student_id": row["student_id"],
                "department": row["department"],
                "semester": int(row["semester"]) if pd.notna(row.get("semester")) else 6,
                "cgpa": round(float(row["cgpa"]), 2) if pd.notna(row.get("cgpa")) else None,
                "placement_probability": round(float(row["placement_probability"]), 1),
                "readiness_status": row["readiness_status"],
                "top_missing_skill": _top_missing(row),
            }
        )

    # ── Skill deficit matrix ──────────────────────────────────────────────────
    matrix_departments = [department_filter] if department_filter else VALID_DEPARTMENTS
    matrix_skills = ["SQL", "Python", "AWS", "DSA"]

    matrix: list[list[float]] = []
    for dept in matrix_departments:
        dept_df = df[df["department"] == dept]
        row_vals = []
        for skill in matrix_skills:
            if dept_df.empty:
                row_vals.append(0.0)
                continue
            # Skill is "lacking" if it appears in neither known_languages nor certifications
            def lacks_skill(r, s=skill):
                langs = r["known_languages"].split("|") if r["known_languages"] and str(r["known_languages"]) != "nan" else []
                certs = r["certifications"].split("|") if r["certifications"] and str(r["certifications"]) != "nan" else []
                return s not in langs and s not in certs

            lacks_count = dept_df.apply(lacks_skill, axis=1).sum()
            pct = round(float(lacks_count / len(dept_df) * 100), 1)
            row_vals.append(pct)
        matrix.append(row_vals)

    skill_deficit_matrix = {
        "departments": matrix_departments,
        "skills": matrix_skills,
        "matrix": matrix,
    }

    placement_trends = [
        {"semester": "Sem 3", "CSE": 55, "ISE": 48, "ECE": 40},
        {"semester": "Sem 4", "CSE": 68, "ISE": 60, "ECE": 52},
        {"semester": "Sem 5", "CSE": 75, "ISE": 72, "ECE": 64},
        {"semester": "Sem 6", "CSE": 84, "ISE": 79, "ECE": 70},
        {"semester": "Sem 7", "CSE": 88, "ISE": 82, "ECE": 74},
        {"semester": "Sem 8", "CSE": 91, "ISE": 84, "ECE": 76},
    ]

    return {
        "overall_readiness_pct": overall_readiness_pct,
        "department_breakdown": department_breakdown,
        "vulnerable_students": vulnerable_students,
        "skill_deficit_matrix": skill_deficit_matrix,
        "placement_trends": placement_trends,
    }
