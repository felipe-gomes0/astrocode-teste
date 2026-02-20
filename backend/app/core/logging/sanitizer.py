import copy
from typing import Any

from app.core.logging.log_settings import log_settings

REDACTED = "***REDACTED***"

ALWAYS_SENSITIVE = {
    "password", "senha", "token", "access_token", "refresh_token",
    "secret", "api_key", "authorization", "cpf", "cnpj",
    "card_number", "cvv", "credit_card"
}


def _get_sensitive_fields() -> set[str]:
    """Build the complete set of sensitive field names from config + defaults."""
    configured = set(
        f.strip().lower()
        for f in log_settings.LOG_SENSITIVE_FIELDS.split(",")
        if f.strip()
    )
    return ALWAYS_SENSITIVE | configured


def sanitize(data: Any, _sensitive: set[str] | None = None) -> Any:
    """Recursively sanitize a data structure, masking sensitive fields and truncating long strings."""
    if _sensitive is None:
        _sensitive = _get_sensitive_fields()

    if isinstance(data, dict):
        sanitized = {}
        for key, value in data.items():
            if key.lower() in _sensitive:
                sanitized[key] = REDACTED
            else:
                sanitized[key] = sanitize(value, _sensitive)
        return sanitized

    if isinstance(data, list):
        return [sanitize(item, _sensitive) for item in data]

    if isinstance(data, str) and len(data) > log_settings.LOG_MAX_FIELD_LENGTH:
        return data[: log_settings.LOG_MAX_FIELD_LENGTH] + "...[TRUNCATED]"

    # Return primitives as-is
    return data
