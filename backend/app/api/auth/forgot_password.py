import hashlib
import secrets

from fastapi import APIRouter, Request, Depends
from asyncpg import Connection
from pydantic import BaseModel, EmailStr

from app.core.dependencies import get_db

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    request: Request,
    db: Connection = Depends(get_db),
):
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    await db.execute(
        """INSERT INTO password_reset_tokens (email, token_hash, expires_at)
           VALUES ($1, $2, NOW() + INTERVAL '30 minutes')
           ON CONFLICT (email) DO UPDATE SET token_hash = $2, expires_at = NOW() + INTERVAL '30 minutes'""",
        body.email,
        token_hash,
    )

    webhook_url = request.app.state.settings.email_webhook_url if hasattr(request.app.state, 'settings') else ""
    if webhook_url:
        import httpx
        async with httpx.AsyncClient() as client:
            await client.post(
                webhook_url,
                json={
                    "type": "password_reset",
                    "email": body.email,
                    "token": token,
                },
            )

    return {"message": "If the email exists, a reset link has been sent"}
