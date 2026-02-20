import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.logging.log_settings import log_settings

logger = logging.getLogger("log_repository")

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def get_mongo_client() -> AsyncIOMotorClient:
    """Get or create the Motor client singleton."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(log_settings.LOG_MONGO_URI)
    return _client


def get_log_database() -> AsyncIOMotorDatabase:
    """Get or create the database reference."""
    global _db
    if _db is None:
        client = get_mongo_client()
        _db = client[log_settings.LOG_DB_NAME]
    return _db


async def insert_log(document: dict) -> None:
    """Insert a single log document into MongoDB. Never raises."""
    try:
        db = get_log_database()
        collection = db[log_settings.LOG_COLLECTION_NAME]
        await collection.insert_one(document)
    except Exception as e:
        logger.error(f"Failed to write log to MongoDB: {e}")


async def create_log_indexes() -> None:
    """Create MongoDB indexes for efficient querying and TTL rotation."""
    try:
        db = get_log_database()
        collection = db[log_settings.LOG_COLLECTION_NAME]

        await collection.create_index("trace_id")
        await collection.create_index("level")
        await collection.create_index("category")
        await collection.create_index("action")
        await collection.create_index("actor.user_id")
        await collection.create_index("timestamp")
        await collection.create_index("http.status_code")
        await collection.create_index("environment")

        # TTL index — documents with expires_at are auto-removed
        await collection.create_index(
            "expires_at",
            expireAfterSeconds=0,
            sparse=True,
        )

        logger.info("MongoDB log indexes created successfully.")
    except Exception as e:
        logger.error(f"Failed to create MongoDB indexes: {e}")


async def close_mongo_client() -> None:
    """Close the Motor client on shutdown."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
