from functools import cached_property

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://carousel:carousel@localhost:5432/carousel_saas"
    cors_origins: str = "http://localhost:5173"
    ai_provider: str = "mock"
    storage_provider: str = "mock"
    mock_user_id: str = "00000000-0000-0000-0000-000000000001"
    aws_region: str = "us-east-1"
    s3_bucket: str = ""
    openai_api_key: str = ""
    gemini_api_key: str = ""

    @cached_property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
