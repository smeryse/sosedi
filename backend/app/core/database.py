import asyncpg
from asyncpg import Pool

from app.core.config import settings

_pool: Pool | None = None


async def get_pool() -> Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
        dsn=settings.database_url_asyncpg,
        min_size=2,
        max_size=settings.database_pool_max,
        command_timeout=settings.database_statement_timeout_ms / 1000,
    )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_connection():
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn
