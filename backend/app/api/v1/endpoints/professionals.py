from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.professional import Professional as ProfessionalModel
from app.schemas.professional import Professional as ProfessionalSchema

router = APIRouter()

@router.get("/", response_model=List[ProfessionalSchema])
def read_professionals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    especialidade: Optional[str] = Query(None, description="Filter professionals by specialty")
) -> Any:
    """
    Retrieve professionals.
    """
    query = db.query(ProfessionalModel)
    
    if especialidade:
        # Case-insensitive partial match
        query = query.filter(ProfessionalModel.speciality.ilike(f"%{especialidade}%"))
    
    professionals = query.offset(skip).limit(limit).all()
    return professionals

@router.get("/{id}", response_model=ProfessionalSchema)
def read_professional(
    id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get professional by ID.
    """
    professional = db.query(ProfessionalModel).filter(ProfessionalModel.id == id).first()
    return professional
