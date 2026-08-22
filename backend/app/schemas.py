from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "INR"

class ProductResponse(ProductCreate):
    id: UUID
    created_at: datetime

class TransactionCreate(BaseModel):
    amount: float
    currency: str = "INR"
    payer: str
    expected_receiver: str

class TransactionResponse(BaseModel):
    transaction_id: str
    amount: float
    currency: str
    payer_account_id: str
    expected_receiver_account_id: str
    status: str
    created_at: datetime
    updated_at: datetime

class PaymentEventResponse(BaseModel):
    transaction_id: str
    timestamp: datetime
    service: str
    event_type: str
    severity: str
    status: str
    message: Optional[str]
    metadata: Optional[Dict[str, Any]]

class SettlementResponse(BaseModel):
    transaction_id: str
    expected_account_id: str
    actual_account_id: str
    amount: float
    status: str
    created_at: datetime
