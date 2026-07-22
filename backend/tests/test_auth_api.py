from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timezone, timedelta

import pytest
from httpx import ASGITransport, AsyncClient
from asyncpg import Connection

from app.main import app


def _mock_conn():
    conn = AsyncMock()
    conn.transaction.return_value = conn
    conn.fetchval = AsyncMock()
    return conn


@pytest.fixture
def mock_db():
    conn = _mock_conn()
    return conn


@pytest.mark.asyncio
async def test_login_success(mock_db):
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    mock_db.fetchrow.side_effect = [
        {"id": user_id, "password_hash": "$2b$12$LJ3m4ys3Lk0TSwHnbfOMeO4xWzGXqJd5Kj6LmN8BnR9Qp2rSs3vCm"},
        {"id": user_id, "email": "test@example.com", "display_name": "Test", "role": "tenant"},
    ]
    mock_db.execute = AsyncMock()

    with patch("app.api.auth.login.verify_password", return_value=True), \
         patch("app.api.auth.login.generate_session_token", return_value=("tok123", "hash123")), \
         patch("app.api.auth.login.compute_session_expires_at", return_value=datetime.now(timezone.utc) + timedelta(hours=24)), \
         patch("app.api.auth.login.compute_session_idle_expires_at", return_value=datetime.now(timezone.utc) + timedelta(minutes=30)), \
         patch("app.api.auth.login.compute_rate_limit_key", return_value="key"), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/auth/login", json={"email": "test@example.com", "password": "secret"})

    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["id"] == user_id


@pytest.mark.asyncio
async def test_login_invalid_credentials(mock_db):
    mock_db.fetchrow.return_value = None

    with patch("app.api.auth.login.compute_rate_limit_key", return_value="key"), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/auth/login", json={"email": "wrong@example.com", "password": "wrong"})

    assert resp.status_code == 401
    assert resp.json()["error"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_signup_success(mock_db):
    mock_db.fetchval.return_value = None
    user_id = "550e8400-e29b-41d4-a716-446655440001"
    mock_db.fetchval.return_value = user_id

    with patch("app.api.auth.signup.hash_password", return_value="hashed_pw"), \
         patch("app.api.auth.signup.compute_rate_limit_key", return_value="key"), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/auth/signup",
                json={"email": "new@example.com", "password": "Str0ng!Pass", "display_name": "New User", "role": "tenant"},
            )

    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["email"] == "new@example.com"
    assert data["user"]["display_name"] == "New User"


@pytest.mark.asyncio
async def test_signup_duplicate_email(mock_db):
    mock_db.fetchval.return_value = "existing-id"

    with patch("app.api.auth.signup.compute_rate_limit_key", return_value="key"), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(
                "/auth/signup",
                json={"email": "dup@example.com", "password": "Str0ng!Pass", "display_name": "Dup", "role": "tenant"},
            )

    assert resp.status_code == 409
    assert resp.json()["error"] == "Email already registered"


@pytest.mark.asyncio
async def test_logout_success(mock_db):
    mock_db.execute = AsyncMock()

    with patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            client.cookies.set("sosedi_session", "sometoken")
            resp = await client.post("/auth/logout")

    assert resp.status_code == 200
    assert resp.json()["success"] is True


@pytest.mark.asyncio
async def test_logout_no_cookie(mock_db):
    mock_db.execute = AsyncMock()

    with patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/auth/logout")

    assert resp.status_code == 200
    assert resp.json()["success"] is True


@pytest.mark.asyncio
async def test_session_valid(mock_db):
    user_id = "550e8400-e29b-41d4-a716-446655440002"
    future = datetime.now(timezone.utc) + timedelta(hours=1)
    mock_db.fetchrow.return_value = {
        "user_id": user_id,
        "expires_at": future,
        "idle_expires_at": future,
        "email": "user@example.com",
        "display_name": "User",
        "role": "tenant",
    }
    mock_db.execute = AsyncMock()

    with patch("app.api.auth.session.compute_session_idle_expires_at", return_value=future), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            client.cookies.set("sosedi_session", "validtoken")
            resp = await client.get("/auth/session")

    assert resp.status_code == 200
    assert resp.json()["user"]["email"] == "user@example.com"


@pytest.mark.asyncio
async def test_session_no_cookie(mock_db):
    with patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/auth/session")

    assert resp.status_code == 401
    assert resp.json()["error"] == "Not authenticated"


@pytest.mark.asyncio
async def test_session_expired(mock_db):
    past = datetime.now(timezone.utc) - timedelta(hours=1)
    mock_db.fetchrow.return_value = {
        "user_id": "u1", "expires_at": past, "idle_expires_at": past,
        "email": "e@e.com", "display_name": "E", "role": "tenant",
    }

    with patch("app.api.auth.session.compute_session_idle_expires_at", return_value=datetime.now(timezone.utc)), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            client.cookies.set("sosedi_session", "expiredtoken")
            resp = await client.get("/auth/session")

    assert resp.status_code == 401
    assert resp.json()["error"] == "Session expired"


@pytest.mark.asyncio
async def test_forgot_password(mock_db):
    mock_db.execute = AsyncMock()

    with patch("app.api.auth.forgot_password.generate_reset_token", return_value=("tok", "hash")), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/auth/forgot-password", json={"email": "user@example.com"})

    assert resp.status_code == 200
    assert "reset link" in resp.json()["message"]


@pytest.mark.asyncio
async def test_reset_password_success(mock_db):
    mock_db.fetchrow.return_value = {"email": "user@example.com"}
    mock_db.execute = AsyncMock()

    with patch("app.api.auth.reset_password.hash_password", return_value="newhash"), \
         patch("app.api.auth.reset_password.compute_token_hash", return_value="tokenhash123"), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/auth/reset-password", json={"token": "validtoken", "password": "NewStr0ng!"})

    assert resp.status_code == 200
    assert resp.json()["message"] == "Password has been reset"


@pytest.mark.asyncio
async def test_reset_password_invalid_token(mock_db):
    mock_db.fetchrow.return_value = None

    with patch("app.api.auth.reset_password.compute_token_hash", return_value="badhash"), \
         patch("app.core.dependencies.get_db", return_value=mock_db):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/auth/reset-password", json={"token": "badtoken", "password": "NewStr0ng!"})

    assert resp.status_code == 400
    assert "Invalid or expired token" in resp.json()["error"]
