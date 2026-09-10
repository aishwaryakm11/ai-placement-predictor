"""
JWT dependency for FastAPI.

Verifies a Supabase-issued JWT from the Authorization header
and returns the decoded payload (user_id, email, role, etc.).
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)

_JWT_SECRET: str = os.environ["JWT_SECRET"]
_ALGORITHM = "HS256"


async def get_current_user(authorization: str = Header(...)) -> dict:
    """
    FastAPI dependency: extracts and verifies the Supabase JWT.

    Usage:
        @router.get("/protected")
        async def route(user = Depends(get_current_user)):
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not authorization.startswith("Bearer "):
        raise credentials_exception

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = jwt.decode(
            token,
            _JWT_SECRET,
            algorithms=[_ALGORITHM],
            options={"verify_aud": False},  # Supabase uses "authenticated" audience
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception


async def require_student(user: dict = None) -> dict:
    """Dependency: ensures the token belongs to a student role."""
    role = (user.get("user_metadata") or {}).get("role", "student")
    if role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for students only.",
        )
    return user


async def require_tpo(user: dict = None) -> dict:
    """Dependency: ensures the token belongs to a TPO role."""
    role = (user.get("user_metadata") or {}).get("role", "student")
    if role != "tpo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for TPO officers only.",
        )
    return user
