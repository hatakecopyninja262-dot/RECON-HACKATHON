from app.database import db

def simulate_payment_flow(transaction_id: str):
    tx = db.get_transaction(transaction_id)
    if not tx:
        raise ValueError(f"Transaction {transaction_id} not found")
        
    expected_receiver = tx["expected_receiver_account_id"]
    amount = tx["amount"]
    
    # Intentional Fault Configuration
    faulty_settlement_account = "ACC_TEMP_9931"
    
    events_to_create = [
        {
            "service": "PaymentGateway",
            "event_type": "PAYMENT_INITIATED",
            "severity": "INFO",
            "status": "SUCCESS",
            "message": "Payment initiation started",
            "metadata": {"amount": amount, "payer": tx["payer_account_id"]}
        },
        {
            "service": "PaymentGateway",
            "event_type": "PAYMENT_PROCESSING",
            "severity": "INFO",
            "status": "SUCCESS",
            "message": "Payment is processing",
            "metadata": {}
        },
        {
            "service": "PaymentGateway",
            "event_type": "PAYMENT_CAPTURED",
            "severity": "INFO",
            "status": "SUCCESS",
            "message": "Payment captured successfully",
            "metadata": {"amount": amount}
        },
        {
            "service": "SettlementService",
            "event_type": "SETTLEMENT_INITIATED",
            "severity": "INFO",
            "status": "SUCCESS",
            "message": "Settlement process initiated",
            "metadata": {"expected_receiver": expected_receiver}
        },
        {
            "service": "ReconMonitor",
            "event_type": "ACCOUNT_ROUTING_MISMATCH",
            "severity": "CRITICAL",
            "status": "FAILED",
            "message": "Settlement destination differs from expected receiver",
            "metadata": {
                "expected_account": expected_receiver,
                "actual_account": faulty_settlement_account
            }
        },
        {
            "service": "SettlementService",
            "event_type": "SETTLEMENT_COMPLETED",
            "severity": "INFO",
            "status": "SUCCESS",
            "message": "Settlement marked as completed internally",
            "metadata": {"actual_account": faulty_settlement_account}
        },
        {
            "service": "WebhookService",
            "event_type": "WEBHOOK_SENT",
            "severity": "INFO",
            "status": "SUCCESS",
            "message": "Webhook sent to expected receiver",
            "metadata": {"target": expected_receiver}
        },
        {
            "service": "WebhookService",
            "event_type": "WEBHOOK_REJECTED",
            "severity": "ERROR",
            "status": "FAILED",
            "message": "Receiver rejected webhook due to missing funds",
            "metadata": {}
        },
        {
            "service": "ReceiverPlatform",
            "event_type": "RECEIVER_NOT_CREDITED",
            "severity": "ERROR",
            "status": "FAILED",
            "message": "Receiver confirmed funds not received",
            "metadata": {"expected_account": expected_receiver}
        },
        {
            "service": "OrderManagement",
            "event_type": "ORDER_PAYMENT_PENDING",
            "severity": "WARNING",
            "status": "FAILED",
            "message": "Order stuck in pending state",
            "metadata": {}
        }
    ]
    
    # 1. Update the transaction status
    db.update_transaction(transaction_id, {"status": "PENDING"})

    # 2. Log events sequentially to ensure chronological timestamping
    import time
    for event_data in events_to_create:
        event_data["transaction_id"] = transaction_id
        db.create_payment_event(event_data)
        time.sleep(0.01)  # small sleep to ensure strictly increasing timestamps
        
    # 3. Create a settlement record reflecting the fault
    db.create_settlement({
        "transaction_id": transaction_id,
        "expected_account_id": expected_receiver,
        "actual_account_id": faulty_settlement_account,
        "amount": amount,
        "status": "COMPLETED"
    })
    
    # Note: State intentionally left broken as per requirements.
    return {"status": "SIMULATION_COMPLETED"}
