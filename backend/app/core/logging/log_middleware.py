import time
import logging
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging.log_context import set_trace_id, set_actor
from app.core.logging.log_schema import ActorContext, HttpContext
from app.core.logging.log_service import LogService

logger = logging.getLogger("log_middleware")


class LogMiddleware(BaseHTTPMiddleware):
    """HTTP middleware that logs every request/response and propagates trace_id."""

    def __init__(self, app, log_service: LogService | None = None):
        super().__init__(app)
        self.log_service = log_service or LogService()

    async def dispatch(self, request: Request, call_next) -> Response:
        # --- Request phase ---
        trace_id = request.headers.get("X-Trace-Id") or str(uuid4())
        set_trace_id(trace_id)

        # Try to extract actor from request state (set by auth dependency)
        actor = None
        if hasattr(request.state, "user"):
            user = request.state.user
            actor = ActorContext(
                user_id=str(getattr(user, "id", None)),
                email=getattr(user, "email", None),
                role=getattr(user, "type", None),
            )
            set_actor(actor)

        start_time = time.perf_counter()

        # Skip logging for healthcheck to avoid hitting DB and blocking the LB
        if request.url.path == "/health":
            return await call_next(request)

        # --- Process request ---
        try:
            response = await call_next(request)
        except Exception as exc:
            # Unhandled exception during request processing
            duration_ms = (time.perf_counter() - start_time) * 1000
            http_ctx = HttpContext(
                method=request.method,
                path=str(request.url.path),
                status_code=500,
                duration_ms=round(duration_ms, 2),
                user_agent=request.headers.get("user-agent"),
                ip=request.client.host if request.client else None,
            )
            await self.log_service.error(
                action="HTTP_REQUEST",
                message=f"{request.method} {request.url.path} 500 {duration_ms:.0f}ms",
                error=exc,
                category="http",
                http=http_ctx,
            )
            raise

        # --- Response phase ---
        duration_ms = (time.perf_counter() - start_time) * 1000
        status_code = response.status_code

        http_ctx = HttpContext(
            method=request.method,
            path=str(request.url.path),
            status_code=status_code,
            duration_ms=round(duration_ms, 2),
            user_agent=request.headers.get("user-agent"),
            ip=request.client.host if request.client else None,
        )

        # Determine log level based on status code
        if status_code < 400:
            level = "info"
        elif status_code < 500:
            level = "warn"
        else:
            level = "error"

        msg = f"{request.method} {request.url.path} {status_code} {duration_ms:.0f}ms"

        if level == "info":
            await self.log_service.info(action="HTTP_REQUEST", message=msg, category="http", http=http_ctx)
        elif level == "warn":
            await self.log_service.warn(action="HTTP_REQUEST", message=msg, category="http", http=http_ctx)
        else:
            await self.log_service.error(action="HTTP_REQUEST", message=msg, category="http", http=http_ctx)

        # Inject trace_id into response header for frontend correlation
        response.headers["X-Trace-Id"] = trace_id

        return response
