from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.cloudinary_service import upload_image, delete_image
from app.models.user import User
from app.models.professional import Professional

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a profile photo for the current professional."""
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Formato inválido. Use JPG, PNG ou WebP.")

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 5MB.")

    # Get professional profile
    professional = db.query(Professional).filter(Professional.user_id == current_user.id).first()
    if not professional:
        raise HTTPException(status_code=404, detail="Perfil profissional não encontrado.")

    # Delete old photo if exists
    if professional.photo_url and "cloudinary" in professional.photo_url:
        old_public_id = professional.photo_url.split("/upload/")[-1].rsplit(".", 1)[0]
        # Remove version prefix like v1234567890/
        if "/" in old_public_id:
            parts = old_public_id.split("/", 1)
            if parts[0].startswith("v") and parts[0][1:].isdigit():
                old_public_id = parts[1]
        await delete_image(old_public_id)

    # Upload to Cloudinary
    result = await upload_image(
        contents,
        folder="astrocode/professionals",
        public_id=f"prof_{professional.id}",
    )

    # Update professional record
    professional.photo_url = result["url"]
    db.commit()

    return {"url": result["url"], "public_id": result["public_id"]}
