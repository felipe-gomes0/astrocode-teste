from pydantic import BaseModel, Field
from typing import Optional, Literal, Any
from datetime import datetime
from uuid import uuid4


class HttpContext(BaseModel):
    method: str
    path: str
    status_code: Optional[int] = None
    duration_ms: Optional[float] = None
    user_agent: Optional[str] = None
    ip: Optional[str] = None
    query_params: Optional[dict] = None


class ActorContext(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    session_id: Optional[str] = None


class ErrorDetail(BaseModel):
    name: str
    message: str
    stack_trace: Optional[str] = None
    error_code: Optional[str] = None
    http_status: Optional[int] = None


class LogDocument(BaseModel):
    # Identification
    trace_id: str = Field(default_factory=lambda: str(uuid4()))
    correlation_id: Optional[str] = None

    # Classification
    level: Literal["debug", "info", "warn", "error", "audit"]
    category: Literal["http", "business", "integration", "auth", "job", "system", "frontend"]
    action: str

    # App context
    service: str
    environment: str
    version: str

    # Optional contexts
    http: Optional[HttpContext] = None
    actor: Optional[ActorContext] = None
    error: Optional[ErrorDetail] = None

    # Payload
    message: str
    metadata: Optional[dict[str, Any]] = None

    # Timestamps
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None


class FrontendLogPayload(BaseModel):
    """Schema for logs received from the Angular frontend."""
    action: str
    message: str
    level: Literal["info", "warn", "error"] = "error"
    trace_id: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    timestamp: Optional[str] = None
