from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class LogSettings(BaseSettings):
    # MongoDB Connection
    LOG_MONGO_URI: str = "mongodb://log_service:changeme_log@mongodb:27017/app_logs"
    LOG_DB_NAME: str = "app_logs"
    LOG_COLLECTION_NAME: str = "logs"

    # Log Levels
    LOG_LEVEL: str = "info"

    # TTL (days)
    LOG_TTL_DEBUG_DAYS: int = 7
    LOG_TTL_INFO_DAYS: int = 30
    LOG_TTL_WARN_DAYS: int = 90

    # Sanitization
    LOG_SENSITIVE_FIELDS: str = "password,token,access_token,refresh_token,secret,api_key,cpf,cnpj,card_number,cvv,authorization,senha,credit_card"
    LOG_MAX_FIELD_LENGTH: int = 2000

    # Batch
    LOG_BATCH_SIZE: int = 50
    LOG_BATCH_FLUSH_MS: int = 3000

    # App context
    ENVIRONMENT: str = "development"
    APP_VERSION: str = "1.0.0"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        case_sensitive=True,
        extra="ignore"
    )


log_settings = LogSettings()
