"""
Feature engineering for the placement prediction model.

Shared by train_model.py (offline) and predict.py (online inference).
"""

import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import pandas as pd

from config import FEATURE_COLUMNS


def _count_pipe_delimited(value) -> int:
    """Count items in a pipe-delimited string. Returns 0 for empty/null."""
    if not value or (isinstance(value, float)):
        return 0
    parts = str(value).strip()
    if parts == "" or parts == "nan":
        return 0
    return len(parts.split("|"))


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Derive engineered columns and return only FEATURE_COLUMNS in the correct order.

    Args:
        df: Raw DataFrame (may come from CSV or from a single-row dict).

    Returns:
        DataFrame containing exactly FEATURE_COLUMNS in the defined order.
    """
    df = df.copy()

    # Derive num_certifications
    if "certifications" in df.columns:
        df["num_certifications"] = df["certifications"].apply(_count_pipe_delimited)
    elif "num_certifications" not in df.columns:
        df["num_certifications"] = 0

    # Derive num_languages
    if "known_languages" in df.columns:
        df["num_languages"] = df["known_languages"].apply(_count_pipe_delimited)
    elif "num_languages" not in df.columns:
        df["num_languages"] = 0

    # Return only the model feature columns in the exact required order
    return df[FEATURE_COLUMNS].copy()
