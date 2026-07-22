from fastapi import APIRouter, Request, Depends
from asyncpg import Connection
from pydantic import BaseModel, EmailStr

from app.core.dependencies import get_db
from app.core.security import (
    hash_password,
    generate_session_token,
    compute_rate_limit_key,
)

router = APIRouter()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    role: str = "tenant"


class SignupResponse(BaseModel):
    user: dict
    verification_required: bool = False


@router.post("/signup")
async def signup(
    body: SignupRequest,
    request: Request,
    db: Connection = Depends(get_db),
):
    rate_key = compute_rate_limit_key("signup", body.email)

    existing = await db.fetchval("SELECT id FROM users WHERE email = $1", body.email)
    if existing:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=409,
            content={"error": "Email already registered"},
        )

    password_hash = hash_password(body.password)

    async with db.transaction():
        user_id = await db.fetchval(
            """INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id""",
            body.email,
            password_hash,
        )
        await db.execute(
            """INSERT INTO profiles (user_id, display_name, role) VALUES ($1, $2, $3)""",
            user_id,
            body.display_name,
            body.role,
        )

    return SignupResponse(
        user={
            "id": str(user_id),
            "email": body.email,
            "display_name": body.display_name,
            "role": body.role,
        }
    )
