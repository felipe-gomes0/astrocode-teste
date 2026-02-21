import logging
import cloudinary
import cloudinary.uploader
from app.core.config import settings

logger = logging.getLogger(__name__)


def _configure():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_image(file_bytes: bytes, folder: str = "professionals", public_id: str | None = None) -> dict:
    """Upload image to Cloudinary with automatic optimization."""
    _configure()
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            public_id=public_id,
            overwrite=True,
            resource_type="image",
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
                {"quality": "auto", "fetch_format": "auto"},
            ],
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
        }
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise


async def delete_image(public_id: str) -> bool:
    """Delete image from Cloudinary by public_id."""
    _configure()
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="image")
        return result.get("result") == "ok"
    except Exception as e:
        logger.error(f"Cloudinary delete failed: {e}")
        return False
