import asyncio
import logging
import traceback
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import uuid4

from app.core.logging.log_schema import (
    ActorContext,
    ErrorDetail,
    HttpContext,
    LogDocument,
)
from app.core.logging.log_context import get_trace_id, get_actor
from app.core.logging.log_repository import insert_log
from app.core.logging.log_settings import log_settings
from app.core.logging.sanitizer import sanitize

logger = logging.getLogger("fallback")

# TTL mapping (days → timedelta)
_TTL_MAP = {
    "debug": log_settings.LOG_TTL_DEBUG_DAYS,
    "info": log_settings.LOG_TTL_INFO_DAYS,
    "warn": log_settings.LOG_TTL_WARN_DAYS,
}


def _compute_expires_at(level: str) -> Optional[datetime]:
    """Compute expiration datetime based on log level. Error/audit never expire."""
    days = _TTL_MAP.get(level)
    if days is None:
        return None  # error and audit never expire
    return datetime.utcnow() + timedelta(days=days)


class LogService:
    """Centralized, non-blocking log service for the application."""

    def _build_document(
        self,
        level: str,
        action: str,
        message: str,
        category: str = "system",
        http: Optional[HttpContext] = None,
        actor: Optional[ActorContext] = None,
        error: Optional[ErrorDetail] = None,
        metadata: Optional[dict[str, Any]] = None,
        service: str = "backend",
        trace_id: Optional[str] = None,
    ) -> LogDocument:
        # Use context vars if not explicitly provided
        resolved_trace_id = trace_id or get_trace_id() or str(uuid4())
        resolved_actor = actor or get_actor()

        # Sanitize metadata
        sanitized_metadata = sanitize(metadata) if metadata else None

        return LogDocument(
            trace_id=resolved_trace_id,
            level=level,
            category=category,
            action=action,
            service=service,
            environment=log_settings.ENVIRONMENT,
            version=log_settings.APP_VERSION,
            http=http,
            actor=resolved_actor,
            error=error,
            message=message,
            metadata=sanitized_metadata,
            expires_at=_compute_expires_at(level),
        )

    def _fire_and_forget(self, doc: LogDocument) -> None:
        """Schedule the async insert without awaiting — truly non-blocking."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._safe_insert(doc))
        except RuntimeError:
            # No running loop (e.g. called from sync context)
            logger.warning(f"[{doc.level.upper()}] {doc.action}: {doc.message}")

    async def _safe_insert(self, doc: LogDocument) -> None:
        """Insert with full fallback to stdlib logging."""
        try:
            await insert_log(doc.model_dump(mode="json"))
        except Exception as e:
            logger.error(f"Fallback log — failed to persist: {e} | {doc.action}: {doc.message}")

    async def info(
        self, action: str, message: str, category: str = "system", **kwargs: Any
    ) -> None:
        doc = self._build_document("info", action, message, category, **kwargs)
        self._fire_and_forget(doc)

    async def warn(
        self, action: str, message: str, category: str = "system", **kwargs: Any
    ) -> None:
        doc = self._build_document("warn", action, message, category, **kwargs)
        self._fire_and_forget(doc)

    async def error(
        self,
        action: str,
        message: str,
        error: Optional[Exception] = None,
        category: str = "system",
        **kwargs: Any,
    ) -> None:
        error_detail = None
        if error is not None:
            include_stack = log_settings.ENVIRONMENT != "production"
            error_detail = ErrorDetail(
                name=type(error).__name__,
                message=str(error),
                stack_trace=traceback.format_exc() if include_stack else None,
            )
        doc = self._build_document(
            "error", action, message, category, error=error_detail, **kwargs
        )
        self._fire_and_forget(doc)

    async def audit(
        self, action: str, message: str, category: str = "business", **kwargs: Any
    ) -> None:
        doc = self._build_document("audit", action, message, category, **kwargs)
        self._fire_and_forget(doc)

    async def debug(
        self, action: str, message: str, category: str = "system", **kwargs: Any
    ) -> None:
        if log_settings.ENVIRONMENT == "production":
            return  # Skip debug logs in production
        doc = self._build_document("debug", action, message, category, **kwargs)
        self._fire_and_forget(doc)
