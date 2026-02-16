from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.professional import Professional as ProfessionalModel
from app.schemas.professional import Professional
from app.models.user import User

router = APIRouter()

from typing import Optional
from sqlalchemy import or_

@router.get("/", response_model=List[Professional])
def read_professionals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    especialidade: Optional[str] = None,
) -> Any:
    """
    Retrieve professionals.
    """
    query = db.query(ProfessionalModel).join(User).filter(User.active == True)
    
    if especialidade:
        search_term = f"%{especialidade}%"
        # Filter by speciality OR name for better UX
        query = query.filter(
            or_(
                ProfessionalModel.speciality.ilike(search_term),
                User.name.ilike(search_term)
            )
        )
        
    professionals = query.offset(skip).limit(limit).all()
    return professionals
