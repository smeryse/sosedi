from fastapi import APIRouter, Request, Depends
from asyncpg import Connection

from app.core.dependencies import get_db
from app.core.security import (
    compute_token_hash,
    compute_session_idle_expires_at,
)

router = APIRouter()


@router.get("/session")
async def get_session(request: Request, db: Connection = Depends(get_db)):
    token = request.cookies.get("sosedi_session")
    if not token:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=401, content={"error": "Not authenticated"})

    token_hash = compute_token_hash(token)
    row = await db.fetchrow(
        """SELECT s.user_id, s.expires_at, s.idle_expires_at,
                  u.email, p.display_name, p.role
           FROM sessions s
           JOIN users u ON u.id = s.user_id
           LEFT JOIN profiles p ON p.user_id = u.id
           WHERE s.token_hash = $1 AND s.revoked_at IS NULL""",
        token_hash,
    )
    if not row:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=401, content={"error": "Invalid session"})

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    if row["expires_at"] < now or row["idle_expires_at"] < now:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=401, content={"error": "Session expired"})

    new_idle = compute_session_idle_expires_at()
    await db.execute(
        "UPDATE sessions SET idle_expires_at = $1 WHERE token_hash = $2",
        new_idle,
        token_hash,
    )

    return {
        "user": {
            "id": str(row["user_id"]),
            "email": row["email"],
            "display_name": row["display_name"],
            "role": row["role"],
        }
    }
