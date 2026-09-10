"""
Auth schemas for login, registration and JWT token response.
"""

from pydantic import BaseModel, EmailStr
from typing import Literal, Optional


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: Literal["student", "tpo"] = "student"
    # Only required for student accounts
    student_id: Optional[str] = None
    department: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str
    full_name: str


class AuthResponse(BaseModel):
    success: bool
    data: Optional[TokenResponse] = None
    error: Optional[str] = None
