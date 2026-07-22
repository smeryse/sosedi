from collections.abc import AsyncGenerator

from asyncpg import Pool, Connection
from fastapi import Request, HTTPException, status

from app.core.database import get_pool


async def get_db_pool() -> Pool:
    return await get_pool()


async def get_db() -> AsyncGenerator[Connection, None]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn


async def get_current_user(request: Request):
    session_token = request.cookies.get("sosedi_session")
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return session_token
