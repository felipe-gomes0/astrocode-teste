from app.core.logging.log_service import LogService

# Singleton instance
_log_service = LogService()


def get_log_service() -> LogService:
    """FastAPI Depends() compatible dependency for LogService injection."""
    return _log_service
