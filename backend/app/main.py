import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine, Base
from app.core.logging.log_context import get_trace_id
from app.core.logging.log_middleware import LogMiddleware
from app.core.logging.log_dependency import get_log_service
from app.core.logging.log_repository import create_log_indexes, close_mongo_client
from app.core.logging.log_schema import ErrorDetail

# Import all models to ensure they are registered with Base
from app.models import user, professional, service, appointment, working_hours, block, review

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle manager."""
    # Startup
    Base.metadata.create_all(bind=engine)
    await create_log_indexes()
    
    # Run the initial database population synchronously in a thread
    try:
        from populate_db import populate
        import asyncio
        await asyncio.to_thread(populate)
        logger.info("Database populated with default data successfully.")
    except Exception as e:
        logger.error(f"Error during database population on startup: {e}")

    logger.info("Application started — MongoDB indexes ensured.")
    yield
    # Shutdown
    await close_mongo_client()
    logger.info("Application shutdown — MongoDB connection closed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# --- Middleware (order matters: last added = first executed) ---

# CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Trace-Id"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Trace-Id"],
    )

# Logging middleware
app.add_middleware(LogMiddleware)


# --- Global Exception Handlers ---

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    trace_id = get_trace_id()
    log_service = get_log_service()

    await log_service.error(
        action="HTTP_EXCEPTION",
        message=f"HTTPException {exc.status_code}: {exc.detail}",
        category="http",
        error=Exception(str(exc.detail)),
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "trace_id": trace_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    trace_id = get_trace_id()
    log_service = get_log_service()

    await log_service.warn(
        action="VALIDATION_ERROR",
        message=f"Validation error on {request.method} {request.url.path}",
        category="http",
        metadata={"errors": str(exc.errors())[:500]},
    )

    return JSONResponse(
        status_code=422,
        content={
            "error": "VALIDATION_ERROR",
            "detail": exc.errors(),
            "trace_id": trace_id,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    trace_id = get_trace_id()
    log_service = get_log_service()

    await log_service.error(
        action="UNHANDLED_EXCEPTION",
        message=f"Unhandled exception on {request.method} {request.url.path}: {type(exc).__name__}",
        error=exc,
        category="system",
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "Ocorreu um erro inesperado.",
            "trace_id": trace_id,
        },
    )


# --- Routes ---
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {"message": "Welcome to Astrocode Teste API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
