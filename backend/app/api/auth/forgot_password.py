import httpx

from fastapi import APIRouter, Request, Depends
from asyncpg import Connection
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.core.dependencies import get_db
from app.core.security import generate_reset_token

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    request: Request,
    db: Connection = Depends(get_db),
):
    user = await db.fetchrow(
        "SELECT id FROM users WHERE email = $1", body.email
    )
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}

    token, token_hash = generate_reset_token()

    await db.execute(
        """INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
           VALUES ($1, $2, NOW() + INTERVAL '30 minutes')""",
        user["id"],
        token_hash,
    )

    if settings.email_webhook_url:
        async with httpx.AsyncClient() as client:
            await client.post(
                settings.email_webhook_url,
                json={
                    "type": "password_reset",
                    "email": body.email,
                    "token": token,
                },
            )

    return {"message": "If the email exists, a reset link has been sent"}
