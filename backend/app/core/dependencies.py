from collections.abc import AsyncGenerator

from asyncpg import Pool, Connection
from fastapi import Depends, Request, HTTPException, status
from datetime import datetime, timezone

from app.core.config import settings
from app.core.database import get_pool
from app.core.security import compute_token_hash


async def get_db_pool() -> Pool:
    return await get_pool()


async def get_db() -> AsyncGenerator[Connection, None]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn


async def get_current_user(request: Request, db: Connection = Depends(get_db)):
    session_token = request.cookies.get(settings.session_cookie_name)
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token_hash = compute_token_hash(session_token)
    row = await db.fetchrow(
        """SELECT user_id, expires_at, idle_expires_at FROM sessions
           WHERE token_hash = $1 AND revoked_at IS NULL""",
        token_hash,
    )
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )

    now = datetime.now(timezone.utc)
    if row["expires_at"] < now or row["idle_expires_at"] < now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    return row["user_id"]
