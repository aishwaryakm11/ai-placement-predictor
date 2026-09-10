"""
Offline training script for the placement prediction Random Forest model.

Usage (from project root):
    python backend/ml/train_model.py

Prerequisites:
    python backend/ml/data_gen.py   # must have run first

Outputs:
    backend/ml/artifacts/placement_model.pkl
    backend/ml/artifacts/feature_columns.json
"""

import sys
import json
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

from config import (
    SYNTHETIC_CSV,
    ARTIFACTS_DIR,
    MODEL_PATH,
    FEATURE_COLUMNS_PATH,
    FEATURE_COLUMNS,
    RF_N_ESTIMATORS,
    RF_MAX_DEPTH,
    RF_MIN_SAMPLES_LEAF,
    RF_RANDOM_STATE,
)
from ml.feature_engineering import engineer_features


def train() -> None:
    # ── Load data ────────────────────────────────────────────────────────────
    if not SYNTHETIC_CSV.exists():
        raise FileNotFoundError(
            f"Dataset not found at {SYNTHETIC_CSV}. "
            "Run  python backend/ml/data_gen.py  first."
        )

    df = pd.read_csv(SYNTHETIC_CSV)
    print(f"Loaded {len(df)} rows from {SYNTHETIC_CSV}")

    # ── Feature engineering ──────────────────────────────────────────────────
    X = engineer_features(df)
    y = df["placement_probability_label"].values

    # ── Train / validation split ─────────────────────────────────────────────
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=RF_RANDOM_STATE
    )

    # ── Fit model ────────────────────────────────────────────────────────────
    model = RandomForestRegressor(
        n_estimators=RF_N_ESTIMATORS,
        max_depth=RF_MAX_DEPTH,
        min_samples_leaf=RF_MIN_SAMPLES_LEAF,
        random_state=RF_RANDOM_STATE,
    )
    model.fit(X_train, y_train)

    # ── Evaluate ─────────────────────────────────────────────────────────────
    y_pred = model.predict(X_val)
    r2 = r2_score(y_val, y_pred)
    print(f"Validation R²: {r2:.3f}")

    # ── Persist artifacts ─────────────────────────────────────────────────────
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, MODEL_PATH)
    print(f"Model saved -> {MODEL_PATH}")

    with open(FEATURE_COLUMNS_PATH, "w") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)
    print(f"Feature columns saved -> {FEATURE_COLUMNS_PATH}")


if __name__ == "__main__":
    train()
