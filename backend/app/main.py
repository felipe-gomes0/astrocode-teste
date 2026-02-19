from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine, Base
# Import all models to ensure they are registered with Base
from app.models import user, professional, service, appointment, working_hours, block, review

import time
from sqlalchemy.exc import OperationalError
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Retry DB connection
max_retries = 10
retry_interval = 2

for i in range(max_retries):
    try:
        # Create tables (for development)
        Base.metadata.create_all(bind=engine)
        logger.info("Database connected and tables created.")
        break
    except OperationalError as e:
        if i == max_retries - 1:
            logger.error(f"Could not connect to database after {max_retries} attempts.")
            raise e
        logger.warning(f"Database not ready yet, retrying in {retry_interval}s... ({i+1}/{max_retries})")
        time.sleep(retry_interval)

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Default loose CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to Astrocode Teste API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
