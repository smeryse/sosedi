from app.core.config import settings


def test_default_config():
    assert settings.app_url == "http://127.0.0.1:3002"
    assert settings.database_name == "sosedi"
    assert settings.database_user == "smeryse"
    assert settings.session_cookie_name == "sosedi_session"


def test_database_host_is_socket():
    assert settings.database_host.startswith("/")
