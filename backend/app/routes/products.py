from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas import ProductCreate, ProductResponse
from app.database import db

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("", response_model=ProductResponse)
def create_product(product: ProductCreate):
    data = product.dict()
    result = db.create_product(data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create product")
    return result

@router.get("", response_model=List[ProductResponse])
def get_products():
    return db.get_products()
