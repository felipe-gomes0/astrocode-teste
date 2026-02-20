from fastapi import APIRouter, Depends

from app.core.logging.log_dependency import get_log_service
from app.core.logging.log_schema import FrontendLogPayload
from app.core.logging.log_service import LogService

router = APIRouter()


@router.post("/frontend", status_code=202)
async def receive_frontend_log(
    payload: FrontendLogPayload,
    log_service: LogService = Depends(get_log_service),
) -> dict:
    """Receive structured logs from the Angular frontend."""
    method = getattr(log_service, payload.level, log_service.info)
    await method(
        action=payload.action,
        message=payload.message,
        category="frontend",
        metadata=payload.metadata,
        trace_id=payload.trace_id,
    )
    return {"status": "accepted"}
