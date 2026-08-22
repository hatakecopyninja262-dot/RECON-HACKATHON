from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas import TransactionCreate, TransactionResponse, PaymentEventResponse, SettlementResponse
from app.database import db
import uuid
from app.services.payment_simulator import simulate_payment_flow
from app.services.recon_engine import analyze_transaction

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.post("", response_model=TransactionResponse)
def create_transaction(tx: TransactionCreate):
    tx_id = f"TXN-{str(uuid.uuid4())[:8].upper()}"
    data = {
        "transaction_id": tx_id,
        "amount": tx.amount,
        "currency": tx.currency,
        "payer_account_id": tx.payer,
        "expected_receiver_account_id": tx.expected_receiver,
        "status": "CREATED"
    }
    result = db.create_transaction(data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create transaction")
    return result

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: str):
    tx = db.get_transaction(transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.post("/{transaction_id}/simulate-payment")
def simulate_payment(transaction_id: str):
    try:
        return simulate_payment_flow(transaction_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{transaction_id}/events", response_model=List[PaymentEventResponse])
def get_transaction_events(transaction_id: str):
    return db.get_events_for_transaction(transaction_id)

@router.get("/{transaction_id}/settlement", response_model=SettlementResponse)
def get_transaction_settlement(transaction_id: str):
    settlement = db.get_settlement_for_transaction(transaction_id)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    return settlement

@router.get("/{transaction_id}/recon")
def get_recon_analysis(transaction_id: str):
    try:
        return analyze_transaction(transaction_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

