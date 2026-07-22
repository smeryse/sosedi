import pytest
from pydantic import ValidationError

from app.core.config import Settings


class TestDatabaseUrlProperty:
    def test_asyncpg_url_with_socket(self):
        s = Settings(
            _env_file=None,
            database_host="/var/run/postgresql",
            database_user="user",
            database_password="",
            database_name="db",
            database_port=5432,
        )
        url = s.database_url_asyncpg
        assert url.startswith("postgresql+asyncpg://")
        assert "host=/var/run/postgresql" in url

    def test_asyncpg_url_with_host(self):
        s = Settings(
            _env_file=None,
            database_host="127.0.0.1",
            database_user="admin",
            database_password="secret",
            database_name="sosedi",
            database_port=5432,
        )
        url = s.database_url_asyncpg
        assert url.startswith("postgresql+asyncpg://")
        assert "admin:secret@127.0.0.1:5432/sosedi" in url

    def test_asyncpg_url_no_password(self):
        s = Settings(
            _env_file=None,
            database_host="localhost",
            database_user="nopw",
            database_password="",
            database_name="testdb",
            database_port=5432,
        )
        url = s.database_url_asyncpg
        assert "nopw@localhost" in url
        assert "nopw:@" not in url

    def test_asyncpg_url_with_port(self):
        s = Settings(
            _env_file=None,
            database_host="db.example.com",
            database_user="u",
            database_password="p",
            database_name="d",
            database_port=9999,
        )
        url = s.database_url_asyncpg
        assert ":9999/" in url


class TestSettingsDefaults:
    def test_default_app_url(self):
        s = Settings(_env_file=None)
        assert s.app_url == "http://127.0.0.1:3002"

    def test_default_session_settings(self):
        s = Settings(_env_file=None)
        assert s.session_cookie_name == "sosedi_session"
        assert s.session_idle_ttl_minutes == 30
        assert s.session_absolute_ttl_hours == 24

    def test_default_s3_settings(self):
        s = Settings(_env_file=None)
        assert s.s3_endpoint == "http://127.0.0.1:9000"
        assert s.s3_force_path_style is True

    def test_default_ai_settings(self):
        s = Settings(_env_file=None)
        assert s.local_ai_enabled is True
        assert s.nvidia_ai_enabled is False

    def test_empty_secrets_default(self):
        s = Settings(_env_file=None)
        assert s.auth_password_pepper == ""
        assert s.auth_rate_limit_secret == ""
