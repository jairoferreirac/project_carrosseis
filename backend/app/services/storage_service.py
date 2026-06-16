from app.core.config import settings


class StorageService:
    def upload_url(self, key: str) -> str:
        if settings.storage_provider == "s3":
            return f"s3://{settings.s3_bucket}/{key}"
        return f"mock://storage/{key}"
