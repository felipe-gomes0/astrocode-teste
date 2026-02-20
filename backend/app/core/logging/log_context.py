"""Request-scoped context using contextvars for trace_id and actor propagation."""
import contextvars
from typing import Optional

from app.core.logging.log_schema import ActorContext

trace_id_ctx: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "trace_id", default=None
)

actor_ctx: contextvars.ContextVar[Optional[ActorContext]] = contextvars.ContextVar(
    "actor", default=None
)


def get_trace_id() -> Optional[str]:
    return trace_id_ctx.get()


def set_trace_id(value: str) -> None:
    trace_id_ctx.set(value)


def get_actor() -> Optional[ActorContext]:
    return actor_ctx.get()


def set_actor(actor: ActorContext) -> None:
    actor_ctx.set(actor)
