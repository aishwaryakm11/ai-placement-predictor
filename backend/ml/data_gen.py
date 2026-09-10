"""
Synthetic student data generator.

Usage (from project root):
    python backend/ml/data_gen.py

Generates 500 synthetic student records with a meaningful
placement_probability_label and saves them to backend/data/synthetic_students.csv.
"""

import sys
import os
from pathlib import Path

# Allow running from project root OR from within backend/
_this_dir = Path(__file__).resolve().parent          # backend/ml/
_backend_dir = _this_dir.parent                       # backend/
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import numpy as np
import pandas as pd

from config import DATA_DIR, SYNTHETIC_CSV

# ─── Reproducibility ────────────────────────────────────────────────────────
np.random.seed(42)
N = 500

# ─── Lookup tables ──────────────────────────────────────────────────────────
DEPARTMENTS = ["CSE", "ISE", "ECE", "MECH", "CIVIL"]
LANGUAGES = ["Python", "Java", "C++", "JavaScript", "SQL", "Go"]
CERTIFICATIONS = [
    "AWS", "Azure", "DBMS", "DSA",
    "Full-Stack", "Data Science", "Cybersecurity",
]
TARGET_ROLES = [
    "Full-Stack Developer",
    "Data Analyst",
    "Cloud/DevOps Engineer",
    "QA Specialist",
]


def _pipe(choices: list[str]) -> str:
    """Join a list of strings with '|'."""
    return "|".join(choices)


def generate_students() -> pd.DataFrame:
    rng = np.random.default_rng(42)

    # ── Numeric features ────────────────────────────────────────────────────
    cgpa = np.clip(rng.normal(7.2, 1.1, N), 4.0, 10.0).round(2)
    tenth_pct = np.clip(rng.normal(82, 8, N), 45, 100).round(2)
    twelfth_pct = np.clip(rng.normal(78, 9, N), 40, 100).round(2)
    backlogs = rng.poisson(0.8, N).astype(int)
    projects_count = rng.poisson(2.5, N).astype(int)
    internships_count = rng.poisson(0.7, N).astype(int)
    aptitude_score = np.clip(rng.normal(65, 15, N), 20, 100).round(2)
    soft_skill_rating = np.clip(rng.normal(6.5, 1.5, N), 1, 10).round(2)
    hackathons_attended = rng.poisson(1.0, N).astype(int)
    leadership_roles = rng.poisson(0.4, N).astype(int)
    open_source_contributions = rng.poisson(0.5, N).astype(int)
    semester = rng.integers(3, 9, N).astype(int)  # 3 to 8 inclusive

    # ── Categorical features ─────────────────────────────────────────────────
    departments = rng.choice(DEPARTMENTS, N)
    target_roles = rng.choice(TARGET_ROLES, N)

    known_languages_list = [
        _pipe(rng.choice(LANGUAGES, size=int(rng.integers(1, 4)), replace=False).tolist())
        for _ in range(N)
    ]
    certifications_list = [
        _pipe(rng.choice(CERTIFICATIONS, size=int(rng.integers(0, 4)), replace=False).tolist())
        if rng.integers(0, 4) > 0
        else ""
        for _ in range(N)
    ]

    # Count derived features (needed for label generation)
    num_certifications = np.array([
        len(c.split("|")) if c else 0 for c in certifications_list
    ])
    num_languages = np.array([
        len(l.split("|")) if l else 0 for l in known_languages_list
    ])

    # ── Ground-truth label ───────────────────────────────────────────────────
    score = (
        cgpa * 6.5
        + projects_count * 4
        + internships_count * 8
        + num_certifications * 5
        + aptitude_score * 0.25
        + soft_skill_rating * 3
        + hackathons_attended * 2
        + leadership_roles * 2
        + open_source_contributions * 3
        - backlogs * 7
    )
    noise = rng.normal(0, 6, N)
    placement_probability_label = np.clip(score + noise, 0, 100).round(2)

    # ── Student IDs ──────────────────────────────────────────────────────────
    student_ids = [f"STU_{i:04d}" for i in range(1, N + 1)]

    df = pd.DataFrame(
        {
            "student_id": student_ids,
            "department": departments,
            "semester": semester,
            "cgpa": cgpa,
            "tenth_pct": tenth_pct,
            "twelfth_pct": twelfth_pct,
            "backlogs": backlogs,
            "projects_count": projects_count,
            "internships_count": internships_count,
            "open_source_contributions": open_source_contributions,
            "aptitude_score": aptitude_score,
            "soft_skill_rating": soft_skill_rating,
            "hackathons_attended": hackathons_attended,
            "leadership_roles": leadership_roles,
            "known_languages": known_languages_list,
            "certifications": certifications_list,
            "target_role": target_roles,
            "placement_probability_label": placement_probability_label,
        }
    )
    return df


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df = generate_students()
    df.to_csv(SYNTHETIC_CSV, index=False)
    print(f"Generated {len(df)} rows -> {SYNTHETIC_CSV}")


if __name__ == "__main__":
    main()
