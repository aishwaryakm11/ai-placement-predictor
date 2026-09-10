"""
FastAPI application entry point.

Start the server (from project root):
    uvicorn backend.main:app --reload --port 8000

Swagger UI: http://localhost:8000/docs
"""

import sys
from pathlib import Path

# Ensure the backend directory is on the Python path so all internal imports work
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from config import CORS_ORIGINS
from routers import predict, tpo, roadmap

# ─── App instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Placement Predictor — Decode Employability DNA",
    description=(
        "Institutional Career Readiness & Upskilling Engine. "
        "Predicts student placement probability using a trained Random Forest model, "
        "explains predictions with SHAP, and generates phased upskilling roadmaps."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# ─── Custom validation error handler ─────────────────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return Pydantic validation errors in the standard response envelope."""
    errors = exc.errors()
    # Build a human-readable error message
    messages = []
    for err in errors:
        field = " -> ".join(str(loc) for loc in err["loc"])
        messages.append(f"{field}: {err['msg']}")
    error_msg = "; ".join(messages)

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "data": None,
            "error": error_msg,
        },
    )

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(predict.router, prefix="/api", tags=["Predict"])
app.include_router(tpo.router, prefix="/api/tpo", tags=["TPO Analytics"])
app.include_router(roadmap.router, prefix="/api", tags=["Roadmap"])

# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def health_check():
    """Returns API health status."""
    return {"status": "ok"}
