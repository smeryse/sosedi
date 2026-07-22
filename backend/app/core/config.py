from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_url: str = "http://127.0.0.1:3002"

    database_url: str = ""
    database_host: str = "/var/run/postgresql"
    database_port: int = 5432
    database_user: str = "smeryse"
    database_password: str = ""
    database_name: str = "sosedi"
    database_ssl: bool = False
    database_ssl_reject_unauthorized: bool = True
    database_pool_max: int = 10
    database_connection_timeout_ms: int = 5000
    database_idle_timeout_ms: int = 30000
    database_statement_timeout_ms: int = 15000
    database_application_name: str = "sosedi-backend"

    auth_password_pepper: str = ""
    auth_rate_limit_secret: str = ""

    email_webhook_url: str = ""
    email_webhook_secret: str = ""

    nvidia_api_key: str = ""
    nvidia_api_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_retrieval_base_url: str = "https://ai.api.nvidia.com/v1/retrieval/nvidia"
    nvidia_embed_model: str = "nvidia/nemotron-3-embed-1b"
    nvidia_rerank_model: str = "nvidia/rerank-qa-mistral-4b"
    nvidia_safety_model: str = "nvidia/nemotron-3.5-content-safety"
    nvidia_ai_enabled: bool = False

    local_ai_enabled: bool = True
    local_ai_base_url: str = "http://127.0.0.1:11434/v1"
    local_ai_api_key: str = ""
    local_ai_chat_model: str = "qwen3.5:9b"
    local_ai_guard_model: str = "llama-guard3:8b"
    local_ai_embed_model: str = "nomic-embed-text"
    local_ai_rerank_model: str = "bge-reranker-v2-m3"
    local_ai_request_timeout_ms: int = 15000
    local_ai_max_retries: int = 2
    local_ai_retry_delay_ms: int = 150
    local_ai_circuit_failure_threshold: int = 3
    local_ai_circuit_reset_ms: int = 30000

    s3_region: str = "us-east-1"
    s3_endpoint: str = "http://127.0.0.1:9000"
    s3_force_path_style: bool = True
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_bucket_avatars: str = "sosedi-avatars"
    s3_bucket_property_images: str = "sosedi-property-images"
    s3_bucket_message_attachments: str = "sosedi-message-attachments"
    s3_bucket_documents: str = "sosedi-documents"
    s3_bucket_contracts: str = "sosedi-contracts"

    session_cookie_name: str = "sosedi_session"
    session_idle_ttl_minutes: int = 30
    session_absolute_ttl_hours: int = 24
    session_cookie_domain: str = ""
    session_cookie_secure: bool = False
    session_cookie_same_site: str = "lax"

    demo_mode: bool = False

    @property
    def database_url_asyncpg(self) -> str:
        if self.database_host.startswith("/"):
            return f"postgresql+asyncpg://{self.database_user}@/{self.database_name}?host={self.database_host}"
        pw = f":{self.database_password}" if self.database_password else ""
        return f"postgresql+asyncpg://{self.database_user}{pw}@{self.database_host}:{self.database_port}/{self.database_name}"


settings = Settings()
