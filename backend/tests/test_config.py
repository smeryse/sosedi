from app.core.config import settings


def test_default_config():
    assert settings.app_url == "http://127.0.0.1:3002"
    assert settings.database_url.startswith("postgresql://")
    assert settings.session_cookie_name == "sosedi_session"


def test_database_url_property():
    url = settings.database_url_asyncpg
    assert url.startswith("postgresql://")
    # should NOT be postgresql+asyncpg:// in the raw URL
    assert "asyncpg" not in url
