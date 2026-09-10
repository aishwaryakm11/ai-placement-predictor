"""
Model loader / inference module.

The model is loaded once at module import time (singleton pattern) so every
API request reuses the same in-memory model — no re-training on every call.
"""

import sys
import json
from pathlib import Path
from functools import lru_cache

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import joblib
import numpy as np
import pandas as pd

from config import MODEL_PATH, FEATURE_COLUMNS_PATH


# ─── Singleton loader ────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_artifacts():
    """Load and cache the model and feature column list."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model artifact not found at {MODEL_PATH}. "
            "Run  python backend/ml/train_model.py  to train the model first."
        )
    if not FEATURE_COLUMNS_PATH.exists():
        raise FileNotFoundError(
            f"Feature columns file not found at {FEATURE_COLUMNS_PATH}."
        )

    model = joblib.load(MODEL_PATH)
    with open(FEATURE_COLUMNS_PATH, "r") as f:
        feature_columns = json.load(f)

    return model, feature_columns


# ─── Public API ───────────────────────────────────────────────────────────────

def predict_student(feature_dict: dict) -> float:
    """
    Run the trained model on a single student's feature dictionary.

    Args:
        feature_dict: Mapping of feature_name -> numeric value.
                      Must contain all keys in FEATURE_COLUMNS.

    Returns:
        Placement probability as a float in [0, 100].
    """
    model, feature_columns = _load_artifacts()

    # Build single-row DataFrame with exact column order
    row = pd.DataFrame([feature_dict])[feature_columns]

    prediction = model.predict(row)[0]
    return float(np.clip(prediction, 0.0, 100.0))


def get_model():
    """Return the cached sklearn model (used by explainer)."""
    model, _ = _load_artifacts()
    return model


def get_feature_columns() -> list[str]:
    """Return the ordered list of feature columns."""
    _, feature_columns = _load_artifacts()
    return feature_columns
