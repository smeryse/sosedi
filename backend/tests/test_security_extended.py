import hashlib
import secrets
from datetime import datetime, timezone

import pytest

from app.core.security import (
    hash_password,
    verify_password,
    generate_session_token,
    compute_token_hash,
    generate_reset_token,
    compute_session_expires_at,
    compute_session_idle_expires_at,
    compute_rate_limit_key,
)
from app.core.config import settings


class TestPasswordFunctions:
    def test_hash_and_verify(self):
        pw = "MyStr0ng!P@ssw0rd"
        h = hash_password(pw)
        assert h != pw
        assert verify_password(pw, h)

    def test_wrong_password_rejected(self):
        h = hash_password("correct")
        assert not verify_password("wrong", h)

    def test_empty_password(self):
        h = hash_password("")
        assert verify_password("", h)

    def test_unicode_password(self):
        pw = "пароль123!@#"
        h = hash_password(pw)
        assert verify_password(pw, h)

    def test_very_long_password(self):
        pw = "a" * 1000
        h = hash_password(pw)
        assert verify_password(pw, h)

    def test_verify_without_pepper_mismatch(self):
        pw = "test"
        h = hash_password(pw)
        assert verify_password(pw, h)

    def test_different_hashes_for_same_password(self):
        pw = "same"
        h1 = hash_password(pw)
        h2 = hash_password(pw)
        assert h1 != h2


class TestSessionTokenFunctions:
    def test_generate_session_token_format(self):
        token, token_hash = generate_session_token()
        assert isinstance(token, str)
        assert len(token) > 32
        assert isinstance(token_hash, str)
        assert len(token_hash) == 64
        assert all(c in "0123456789abcdef" for c in token_hash)

    def test_compute_token_hash_consistency(self):
        token = secrets.token_urlsafe(48)
        h1 = compute_token_hash(token)
        h2 = compute_token_hash(token)
        assert h1 == h2

    def test_token_hash_different_for_different_tokens(self):
        t1, _ = generate_session_token()
        t2, _ = generate_session_token()
        assert compute_token_hash(t1) != compute_token_hash(t2)

    def test_token_hash_length(self):
        token = "some-random-token"
        h = compute_token_hash(token)
        assert len(h) == 64

    def test_generate_multiple_tokens_unique(self):
        tokens = set()
        hashes = set()
        for _ in range(100):
            t, h = generate_session_token()
            tokens.add(t)
            hashes.add(h)
        assert len(tokens) == 100
        assert len(hashes) == 100


class TestResetTokenFunctions:
    def test_generate_reset_token_format(self):
        token, token_hash = generate_reset_token()
        assert isinstance(token, str)
        assert len(token) > 16
        assert len(token_hash) == 64

    def test_reset_token_hash_with_compute(self):
        token, token_hash = generate_reset_token()
        assert compute_token_hash(token) == token_hash


class TestExpiryFunctions:
    def test_session_expires_at_future(self):
        expires = compute_session_expires_at()
        now = datetime.now(timezone.utc)
        assert expires > now
        diff = expires - now
        assert 23 * 3600 < diff.total_seconds() < 25 * 3600

    def test_idle_expires_at_future(self):
        idle = compute_session_idle_expires_at()
        now = datetime.now(timezone.utc)
        assert idle > now
        diff = idle - now
        assert 25 * 60 < diff.total_seconds() < 60 * 60

    def test_expiry_ordering(self):
        expires = compute_session_expires_at()
        idle = compute_session_idle_expires_at()
        assert expires > idle


class TestRateLimitKey:
    def test_rate_limit_key_format(self):
        key = compute_rate_limit_key("login", "127.0.0.1:user@example.com")
        assert isinstance(key, str)
        assert len(key) == 64

    def test_rate_limit_key_deterministic(self):
        k1 = compute_rate_limit_key("login", "same")
        k2 = compute_rate_limit_key("login", "same")
        assert k1 == k2

    def test_rate_limit_key_different_prefix(self):
        k1 = compute_rate_limit_key("login", "id")
        k2 = compute_rate_limit_key("signup", "id")
        assert k1 != k2

    def test_rate_limit_key_different_identifier(self):
        k1 = compute_rate_limit_key("login", "user1")
        k2 = compute_rate_limit_key("login", "user2")
        assert k1 != k2

    def test_rate_limit_key_secret_used(self):
        with pytest.raises(TypeError):
            compute_rate_limit_key("login", "id")

    def test_rate_limit_key_empty_strings(self):
        key = compute_rate_limit_key("", "")
        assert isinstance(key, str)
        assert len(key) == 64
