from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.working_hours import WorkingHours
from app.models.user import User
from app.schemas.working_hours import WorkingHoursCreate, WorkingHours as WorkingHoursSchema

router = APIRouter()

@router.get("/professional/{professional_id}", response_model=List[WorkingHoursSchema])
def read_working_hours(
    professional_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Retrieve working hours for a professional.
    """
    hours = db.query(WorkingHours).filter(
        WorkingHours.professional_id == professional_id,
        WorkingHours.ativo == True
    ).all()
    return hours

@router.post("/", response_model=WorkingHoursSchema)
def create_working_hours(
    *,
    db: Session = Depends(deps.get_db),
    working_hours_in: WorkingHoursCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create or update working hours.
    """
    if not current_user.professional:
        raise HTTPException(status_code=400, detail="User is not a professional")
    
    if working_hours_in.professional_id != current_user.professional.id:
        raise HTTPException(status_code=403, detail="Cannot create working hours for another professional")

    # Check if exists for day
    existing = db.query(WorkingHours).filter(
        WorkingHours.professional_id == current_user.professional.id,
        WorkingHours.dia_semana == working_hours_in.dia_semana
    ).first()

    if existing:
        for field, value in working_hours_in.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing
    
    working_hours = WorkingHours(**working_hours_in.model_dump())
    db.add(working_hours)
    db.commit()
    db.refresh(working_hours)
    return working_hours
