from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.professional import Professional as ProfessionalModel
from app.schemas.professional import Professional
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Professional])
def read_professionals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve professionals.
    """
    professionals = db.query(ProfessionalModel).join(User).filter(User.active == True).offset(skip).limit(limit).all()
    return professionals
