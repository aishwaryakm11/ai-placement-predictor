"""
POST /api/auth/register   — Register a new student or TPO account
POST /api/auth/login      — Login, receive Supabase JWT
POST /api/auth/logout     — Logout (invalidate Supabase session)
GET  /api/auth/me         — Return current user info from JWT

Authentication is delegated entirely to Supabase Auth.
User metadata (role, full_name, student_id, department) is stored in
Supabase's `auth.users.user_metadata` at registration time.
"""

import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from schemas.auth_schema import RegisterRequest, LoginRequest, AuthResponse, TokenResponse
from supabase_client import get_supabase_client
from dependencies import get_current_user

router = APIRouter()


# ─── Register ──────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    """
    Register a new user (student or TPO).

    - Creates a Supabase Auth account
    - Stores role, full_name, student_id, department in user_metadata
    - Returns a Supabase JWT on success
    """
    try:
        sb = get_supabase_client()

        metadata = {
            "role": body.role,
            "full_name": body.full_name,
        }
        if body.student_id:
            metadata["student_id"] = body.student_id
        if body.department:
            metadata["department"] = body.department

        response = sb.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {"data": metadata},
        })

        session = response.session
        user = response.user

        if not session or not user:
            return AuthResponse(
                success=False,
                error="Registration succeeded but no session returned. "
                      "Check if email confirmation is required in your Supabase project settings.",
            )

        return AuthResponse(
            success=True,
            data=TokenResponse(
                access_token=session.access_token,
                user_id=str(user.id),
                email=user.email,
                role=body.role,
                full_name=body.full_name,
            ),
        )

    except Exception as exc:
        return JSONResponse(
            status_code=400,
            content={"success": False, "data": None, "error": str(exc)},
        )


# ─── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """
    Login with email + password.
    Returns a Supabase JWT (access_token) that must be sent
    as `Authorization: Bearer <token>` on all protected routes.
    """
    try:
        sb = get_supabase_client()
        response = sb.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })

        session = response.session
        user = response.user

        if not session:
            return JSONResponse(
                status_code=401,
                content={"success": False, "data": None, "error": "Invalid credentials."},
            )

        meta = user.user_metadata or {}

        return AuthResponse(
            success=True,
            data=TokenResponse(
                access_token=session.access_token,
                user_id=str(user.id),
                email=user.email,
                role=meta.get("role", "student"),
                full_name=meta.get("full_name", ""),
            ),
        )

    except Exception as exc:
        return JSONResponse(
            status_code=401,
            content={"success": False, "data": None, "error": str(exc)},
        )


# ─── Logout ────────────────────────────────────────────────────────────────────

@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    """Invalidate the current Supabase session."""
    try:
        sb = get_supabase_client()
        sb.auth.sign_out()
        return {"success": True, "data": {"message": "Logged out successfully."}, "error": None}
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": str(exc)},
        )


# ─── Current User ──────────────────────────────────────────────────────────────

@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    """Return decoded token payload for the currently authenticated user."""
    meta = user.get("user_metadata") or {}
    return {
        "success": True,
        "data": {
            "user_id": user.get("sub"),
            "email": user.get("email"),
            "role": meta.get("role", "student"),
            "full_name": meta.get("full_name", ""),
            "student_id": meta.get("student_id"),
            "department": meta.get("department"),
        },
        "error": None,
    }
