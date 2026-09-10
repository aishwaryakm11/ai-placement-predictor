"""
SHAP explainability module.

Uses shap.TreeExplainer on the cached Random Forest model to produce
per-feature SHAP values for a single student row.
"""

import sys
from pathlib import Path
from functools import lru_cache

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import numpy as np
import pandas as pd
import shap

from ml.model import get_model, get_feature_columns
from utils.constants import FEATURE_LABELS


# ─── Singleton SHAP explainer ─────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_explainer() -> shap.TreeExplainer:
    model = get_model()
    return shap.TreeExplainer(model)


# ─── Public API ───────────────────────────────────────────────────────────────

def explain_student(feature_row_df: pd.DataFrame, top_n: int = 5) -> list[dict]:
    """
    Compute SHAP values for a single-row feature DataFrame and return the
    top_n most impactful features.

    Args:
        feature_row_df: Single-row DataFrame with model feature columns.
        top_n:          Number of top features to return (default 5).

    Returns:
        List of dicts with keys: feature, impact_pct, direction, readable_string.
        Sorted by abs(impact_pct) descending.
    """
    explainer = _get_explainer()
    feature_columns = get_feature_columns()

    # Compute SHAP values — result shape differs between shap versions
    raw = explainer.shap_values(feature_row_df)

    # Handle both array shapes:
    # - shap >= 0.40 returns ndarray of shape (1, n_features)
    # - older shap may return a list (one array per output) for regressors
    if isinstance(raw, list):
        # Take the first (only) output for regression
        shap_vals = np.array(raw[0]).flatten()
    else:
        shap_vals = np.array(raw).flatten()

    # Build result list
    results = []
    for feat, val in zip(feature_columns, shap_vals):
        label = FEATURE_LABELS.get(feat, feat)
        impact_pct = round(float(val), 2)
        direction = "positive" if impact_pct >= 0 else "negative"
        abs_impact = abs(impact_pct)

        if direction == "positive":
            readable_string = f"+{abs_impact}% due to {label}"
        else:
            readable_string = f"-{abs_impact}% due to missing {label}"

        results.append(
            {
                "feature": feat,
                "impact_pct": abs_impact,
                "direction": direction,
                "readable_string": readable_string,
            }
        )

    # Sort by absolute impact descending, take top_n
    results.sort(key=lambda x: x["impact_pct"], reverse=True)
    return results[:top_n]
