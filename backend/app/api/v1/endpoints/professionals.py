from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.api import deps
from app.models.professional import Professional as ProfessionalModel
from app.schemas.professional import Professional, ProfessionalUpdate
from app.models.user import User

router = APIRouter()

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
        query = query.filter(
            or_(
                ProfessionalModel.speciality.ilike(search_term),
                User.name.ilike(search_term)
            )
        )
        
    professionals = query.offset(skip).limit(limit).all()
    return professionals

@router.get("/{professional_id}", response_model=Professional)
def read_professional(
    professional_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get professional by ID.
    """
    professional = db.query(ProfessionalModel).filter(ProfessionalModel.id == professional_id).first()
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional

@router.put("/{professional_id}", response_model=Professional)
def update_professional(
    professional_id: int,
    professional_in: ProfessionalUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a professional.
    """
    professional = db.query(ProfessionalModel).filter(ProfessionalModel.id == professional_id).first()
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
        
    if professional.user_id != current_user.id and not getattr(current_user, 'is_superuser', False):
         raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = professional_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(professional, field, value)

    db.add(professional)
    db.commit()
    db.refresh(professional)
    return professional
