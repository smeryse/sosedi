import asyncpg
from asyncpg import Pool

from app.core.config import settings

_pool: Pool | None = None


async def get_pool() -> Pool:
    global _pool
    if _pool is None:
        if settings.database_host.startswith("/"):
            conn_kwargs = dict(
                host=settings.database_host,
                user=settings.database_user,
                database=settings.database_name,
            )
        else:
            conn_kwargs = dict(
                host=settings.database_host,
                port=settings.database_port,
                user=settings.database_user,
                password=settings.database_password,
                database=settings.database_name,
            )
        _pool = await asyncpg.create_pool(
            min_size=2,
            max_size=settings.database_pool_max,
            command_timeout=settings.database_statement_timeout_ms / 1000,
            **conn_kwargs,
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
