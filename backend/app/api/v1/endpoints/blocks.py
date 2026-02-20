from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.block import Block as BlockModel
from app.models.user import User
from app.schemas.block import Block, BlockCreate, BlockUpdate

router = APIRouter()

@router.get("/", response_model=List[Block])
def read_blocks(
    db: Session = Depends(deps.get_db),
    professional_id: int = None
) -> Any:
    """
    Retrieve blocks.
    """
    query = db.query(BlockModel)
    if professional_id:
        query = query.filter(BlockModel.professional_id == professional_id)
    return query.all()

@router.post("/", response_model=Block)
def create_block(
    *,
    db: Session = Depends(deps.get_db),
    block_in: BlockCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new block.
    """
    if current_user.type != "professional" or not current_user.professional:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if block_in.professional_id != current_user.professional.id:
        raise HTTPException(status_code=403, detail="Cannot create block for another professional")
        
    block = BlockModel(**block_in.model_dump())
    db.add(block)
    db.commit()
    db.refresh(block)
    return block

@router.delete("/{id}", response_model=Block)
def delete_block(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a block.
    """
    block = db.query(BlockModel).filter(BlockModel.id == id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
        
    if current_user.type != "professional" or (current_user.professional and block.professional_id != current_user.professional.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db.delete(block)
    db.commit()
    return block
