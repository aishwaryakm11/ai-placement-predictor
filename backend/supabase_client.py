"""
Supabase client singleton + JWT verification helper.

All credentials are loaded from environment variables via .env (python-dotenv).
"""

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env from the backend directory
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY: str = os.environ["SUPABASE_ANON_KEY"]
SUPABASE_SERVICE_ROLE_KEY: str = os.environ["SUPABASE_SERVICE_ROLE_KEY"]


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Return the anon-key Supabase client (used for auth flows)."""
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """Return the service-role Supabase client (used for server-side DB ops)."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
