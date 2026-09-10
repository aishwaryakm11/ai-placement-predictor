"""
GET /api/tpo/analytics

TPO (Training & Placement Officer) analytics dashboard endpoint.

Query parameters:
  - department (optional): Filter results to a specific department.
  - threshold  (optional): Probability threshold for "vulnerable" students (default 60).

Returns:
  - overall_readiness_pct
  - department_breakdown
  - vulnerable_students
  - skill_deficit_matrix
"""

import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from typing import Optional
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from services.aggregation_service import compute_analytics
from config import VALID_DEPARTMENTS

router = APIRouter()


@router.get("/analytics")
async def tpo_analytics(
    department: Optional[str] = Query(
        default=None,
        description=f"Filter by department. One of: {VALID_DEPARTMENTS}",
    ),
    threshold: float = Query(
        default=60.0,
        description="Probability below which a student is considered vulnerable.",
        ge=0.0,
        le=100.0,
    ),
):
    """
    Return placement analytics across the institution (or a single department).
    """
    try:
        # Validate optional department filter
        if department and department not in VALID_DEPARTMENTS:
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "data": None,
                    "error": f"Invalid department {department!r}. Must be one of {VALID_DEPARTMENTS}.",
                },
            )

        analytics = compute_analytics(
            department_filter=department,
            threshold=threshold,
        )

        return {
            "success": True,
            "data": analytics,
            "error": None,
        }

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
