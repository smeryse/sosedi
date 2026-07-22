import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt

from app.core.config import settings


def hash_password(password: str) -> str:
    peppered = password + settings.auth_password_pepper
    return bcrypt.hashpw(peppered.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    peppered = password + settings.auth_password_pepper
    return bcrypt.checkpw(peppered.encode("utf-8"), password_hash.encode("utf-8"))


def generate_session_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return token, token_hash


def compute_token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def compute_rate_limit_key(prefix: str, identifier: str) -> str:
    key = f"{prefix}:{identifier}"
    return hmac.new(
        settings.auth_rate_limit_secret.encode("utf-8"),
        key.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def compute_session_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        hours=settings.session_absolute_ttl_hours
    )


def compute_session_idle_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        minutes=settings.session_idle_ttl_minutes
    )


def generate_reset_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return token, token_hash
