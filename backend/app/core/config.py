from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pydantic import model_validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Astrocode Teste"
    
    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "app"

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # CORS — configure via env var for production (JSON array)
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:4200",
        "http://localhost:8000",
        "http://localhost:3000",
    ]

    # Email (Resend)
    RESEND_API_KEY: Optional[str] = None
    EMAILS_FROM_ADDRESS: str = "contato@fgsoftware.digital"
    EMAILS_FROM_NAME: str = "Astrocode"
    EMAILS_ENABLED: bool = False

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    DATABASE_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        case_sensitive=True,
        extra="ignore"
    )

    @model_validator(mode='after')
    def assemble_db_connection(self) -> 'Settings':
        if isinstance(self.DATABASE_URL, str):
            return self
        
        self.DATABASE_URL = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self

settings = Settings()
