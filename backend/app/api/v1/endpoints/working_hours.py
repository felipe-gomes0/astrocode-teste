from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.working_hours import WorkingHours as WorkingHoursModel
from app.models.user import User
from app.schemas.working_hours import WorkingHours, WorkingHoursCreate, WorkingHoursUpdate

router = APIRouter()

@router.get("/", response_model=List[WorkingHours])
def read_working_hours(
    db: Session = Depends(deps.get_db),
    professional_id: int = None
) -> Any:
    """
    Retrieve working hours.
    """
    query = db.query(WorkingHoursModel)
    if professional_id:
        query = query.filter(WorkingHoursModel.professional_id == professional_id)
    return query.all()

@router.post("/batch", response_model=List[WorkingHours])
def update_working_hours_batch(
    *,
    db: Session = Depends(deps.get_db),
    working_hours_in: List[WorkingHoursCreate],
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update logic for working hours (batch).
    Deletes existing for professional and re-creates.
    """
    if current_user.type != "professional" or not current_user.professional:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    professional_id = current_user.professional.id
    
    # Validation: Ensure all items belong to this professional
    for wh in working_hours_in:
        if wh.professional_id != professional_id:
            raise HTTPException(status_code=403, detail="Cannot set hours for another professional")

    # Transactional update
    # Delete existing
    db.query(WorkingHoursModel).filter(WorkingHoursModel.professional_id == professional_id).delete()
    
    new_hours = []
    for wh in working_hours_in:
        db_obj = WorkingHoursModel(**wh.model_dump())
        db.add(db_obj)
        new_hours.append(db_obj)
    
    db.commit()
    
    # Refresh to get IDs
    for nh in new_hours:
        db.refresh(nh)
        
    return new_hours
