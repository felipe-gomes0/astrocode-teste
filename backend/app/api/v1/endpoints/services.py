from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.service import Service as ServiceModel
from app.models.user import User
from app.schemas.service import Service, ServiceCreate, ServiceUpdate

router = APIRouter()

@router.get("/", response_model=List[Service])
def read_services(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    professional_id: int = None
) -> Any:
    """
    Retrieve services.
    """
    query = db.query(ServiceModel)
    if professional_id:
        query = query.filter(ServiceModel.professional_id == professional_id)
    services = query.offset(skip).limit(limit).all()
    return services

@router.post("/", response_model=Service)
def create_service(
    *,
    db: Session = Depends(deps.get_db),
    service_in: ServiceCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new service.
    """
    if current_user.type != "professional":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Ensure professional exists and belongs to user
    if not current_user.professional:
        raise HTTPException(status_code=404, detail="Professional profile not found")
        
    if service_in.professional_id != current_user.professional.id:
         raise HTTPException(status_code=403, detail="Cannot create service for another professional")

    service = ServiceModel(**service_in.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.put("/{id}", response_model=Service)
def update_service(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    service_in: ServiceUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a service.
    """
    service = db.query(ServiceModel).filter(ServiceModel.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    if current_user.type != "professional" or (current_user.professional and service.professional_id != current_user.professional.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)

    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{id}", response_model=Service)
def delete_service(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a service.
    """
    service = db.query(ServiceModel).filter(ServiceModel.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    if current_user.type != "professional" or (current_user.professional and service.professional_id != current_user.professional.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db.delete(service)
    db.commit()
    return service
