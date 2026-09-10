"""
Configuration constants for the AI Placement Predictor backend.
All paths are resolved relative to this file's location (backend/).
"""

import os
from pathlib import Path

# Root of the backend package
BACKEND_DIR: Path = Path(__file__).resolve().parent

# Data paths
DATA_DIR: Path = BACKEND_DIR / "data"
SYNTHETIC_CSV: Path = DATA_DIR / "synthetic_students.csv"
ROLE_BENCHMARKS_JSON: Path = DATA_DIR / "role_benchmarks.json"

# ML artifact paths
ARTIFACTS_DIR: Path = BACKEND_DIR / "ml" / "artifacts"
MODEL_PATH: Path = ARTIFACTS_DIR / "placement_model.pkl"
FEATURE_COLUMNS_PATH: Path = ARTIFACTS_DIR / "feature_columns.json"

# Model hyper-parameters
RF_N_ESTIMATORS: int = 200
RF_MAX_DEPTH: int = 8
RF_MIN_SAMPLES_LEAF: int = 4
RF_RANDOM_STATE: int = 42

# Feature engineering
FEATURE_COLUMNS = [
    "cgpa",
    "tenth_pct",
    "twelfth_pct",
    "backlogs",
    "projects_count",
    "internships_count",
    "open_source_contributions",
    "aptitude_score",
    "soft_skill_rating",
    "hackathons_attended",
    "leadership_roles",
    "num_certifications",
    "num_languages",
]

# Readiness thresholds
READY_THRESHOLD: float = 75.0
NEAR_READY_THRESHOLD: float = 60.0

# CORS
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Valid departments and roles
VALID_DEPARTMENTS = ["CSE", "ISE", "ECE", "AIML", "MECH", "CIVIL", "EEE"]
VALID_ROLES = [
    "Full-Stack Developer",
    "Data Analyst",
    "Cloud/DevOps Engineer",
    "QA Specialist",
]

# Skill tiers (weeks to complete per tier)
PHASE_TIMELINE_WEEKS = {
    "foundational": 2,
    "intermediate": 4,
    "advanced": 6,
}
