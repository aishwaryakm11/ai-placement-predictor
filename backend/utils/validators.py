"""Utility validators and helpers."""

from config import READY_THRESHOLD, NEAR_READY_THRESHOLD


def get_readiness_status(probability: float) -> str:
    """
    Convert a numeric placement probability to a readiness label.

    Args:
        probability: Float in range [0, 100].

    Returns:
        One of: "Ready", "Near-Ready", "Needs Training".
    """
    if probability >= READY_THRESHOLD:
        return "Ready"
    elif probability >= NEAR_READY_THRESHOLD:
        return "Near-Ready"
    else:
        return "Needs Training"
