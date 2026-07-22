from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import close_pool
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.properties import router as properties_router
from app.api.attachments import router as attachments_router
from app.api.onboarding import router as onboarding_router
from app.api.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.settings = settings
    yield
    await close_pool()


app = FastAPI(
    title="Соседи API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(properties_router)
app.include_router(attachments_router)
app.include_router(onboarding_router)
app.include_router(admin_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
