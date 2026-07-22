from fastapi import APIRouter, Request, Response, Depends
from asyncpg import Connection
from pydantic import BaseModel, EmailStr

from app.core.dependencies import get_db
from app.core.security import (
    verify_password,
    generate_session_token,
    compute_session_expires_at,
    compute_session_idle_expires_at,
    compute_token_hash,
    compute_rate_limit_key,
)
from app.core.config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    user: dict


@router.post("/login")
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: Connection = Depends(get_db),
):
    rate_key = compute_rate_limit_key("login", f"{request.client.host}:{body.email}")
    row = await db.fetchrow(
        "SELECT id, password_hash FROM users WHERE email = $1", body.email
    )
    if not row or not verify_password(body.password, row["password_hash"]):
        response.status_code = 401
        return {"error": "Invalid email or password"}

    token, token_hash = generate_session_token()
    expires_at = compute_session_expires_at()
    idle_expires_at = compute_session_idle_expires_at()

    await db.execute(
        """INSERT INTO sessions (user_id, token_hash, expires_at, idle_expires_at, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6)""",
        row["id"],
        token_hash,
        expires_at,
        idle_expires_at,
        request.client.host,
        request.headers.get("user-agent", ""),
    )

    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_same_site,
        max_age=settings.session_absolute_ttl_hours * 3600,
        domain=settings.session_cookie_domain or None,
        path="/",
    )

    user_row = await db.fetchrow(
        """SELECT u.id, u.email, p.display_name, p.role
           FROM users u
           LEFT JOIN profiles p ON p.user_id = u.id
           WHERE u.id = $1""",
        row["id"],
    )
    return LoginResponse(
        user={
            "id": str(user_row["id"]),
            "email": user_row["email"],
            "display_name": user_row["display_name"],
            "role": user_row["role"],
        }
    )
