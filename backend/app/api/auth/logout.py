from fastapi import APIRouter, Request, Response, Depends
from asyncpg import Connection

from app.core.dependencies import get_db
from app.core.security import compute_token_hash
from app.core.config import settings

router = APIRouter()


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: Connection = Depends(get_db),
):
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        token_hash = compute_token_hash(token)
        await db.execute(
            "UPDATE sessions SET revoked_at = NOW() WHERE token_hash = $1",
            token_hash,
        )

    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
        domain=settings.session_cookie_domain or None,
    )
    return {"success": True}
