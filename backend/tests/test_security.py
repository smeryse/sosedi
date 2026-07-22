from app.core.security import (
    hash_password,
    verify_password,
    generate_session_token,
    compute_token_hash,
    generate_reset_token,
    compute_session_expires_at,
    compute_session_idle_expires_at,
)


def test_password_hashing():
    pw = "test-password-123"
    h = hash_password(pw)
    assert h != pw
    assert verify_password(pw, h)
    assert not verify_password("wrong-password", h)


def test_password_hashing_unique():
    pw = "same-password"
    h1 = hash_password(pw)
    h2 = hash_password(pw)
    assert h1 != h2


def test_session_token():
    token, token_hash = generate_session_token()
    assert len(token) > 32
    assert len(token_hash) == 64
    assert compute_token_hash(token) == token_hash


def test_reset_token():
    token, token_hash = generate_reset_token()
    assert len(token) > 16
    assert len(token_hash) == 64


def test_session_expiry():
    expires_at = compute_session_expires_at()
    idle_at = compute_session_idle_expires_at()
    assert expires_at > idle_at
