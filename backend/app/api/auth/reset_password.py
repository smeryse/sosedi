from fastapi import APIRouter, Depends
from asyncpg import Connection
from pydantic import BaseModel

from app.core.dependencies import get_db
from app.core.security import hash_password, compute_token_hash

router = APIRouter()


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


@router.post("/reset-password")
async def reset_password(
    body: ResetPasswordRequest,
    db: Connection = Depends(get_db),
):
    token_hash = compute_token_hash(body.token)

    row = await db.fetchrow(
        """SELECT user_id FROM password_reset_tokens
           WHERE token_hash = $1 AND expires_at > NOW() AND used_at IS NULL""",
        token_hash,
    )
    if not row:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=400, content={"error": "Invalid or expired token"})

    password_hash = hash_password(body.password)

    async with db.transaction():
        user_id = row["user_id"]
        await db.execute(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            password_hash,
            user_id,
        )
        await db.execute(
            "UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = $1",
            token_hash,
        )
        await db.execute(
            "UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1",
            user_id,
        )

    return {"message": "Password has been reset"}
