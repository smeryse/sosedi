from fastapi import APIRouter

from app.api.auth.login import router as login_router
from app.api.auth.signup import router as signup_router
from app.api.auth.session import router as session_router
from app.api.auth.logout import router as logout_router
from app.api.auth.forgot_password import router as forgot_router
from app.api.auth.reset_password import router as reset_router

router = APIRouter(prefix="/auth", tags=["auth"])
router.include_router(login_router)
router.include_router(signup_router)
router.include_router(session_router)
router.include_router(logout_router)
router.include_router(forgot_router)
router.include_router(reset_router)
