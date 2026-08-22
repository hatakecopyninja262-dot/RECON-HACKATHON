import httpx
import time

def test_api():
    base_url = "http://127.0.0.1:8000"
    
    print("1. Testing health...")
    res = httpx.get(f"{base_url}/health")
    print(res.json())
    
    print("\n2. Creating a product...")
    res = httpx.post(f"{base_url}/api/products", json={
        "name": "Hackathon Ticket",
        "description": "Entry pass",
        "price": 1499,
        "currency": "INR"
    })
    print(res.json())
    
    print("\n3. Creating a transaction...")
    res = httpx.post(f"{base_url}/api/transactions", json={
        "amount": 1499,
        "currency": "INR",
        "payer": "ACC_USER_001",
        "expected_receiver": "ACC_MERCHANT_001"
    })
    tx = res.json()
    tx_id = tx["transaction_id"]
    print(tx)
    
    print(f"\n4. Simulating payment for {tx_id}...")
    res = httpx.post(f"{base_url}/api/transactions/{tx_id}/simulate-payment")
    print(res.json())
    
    print("\n5. Retrieving transaction...")
    res = httpx.get(f"{base_url}/api/transactions/{tx_id}")
    print(res.json())
    
    print("\n6. Retrieving events...")
    res = httpx.get(f"{base_url}/api/transactions/{tx_id}/events")
    events = res.json()
    print(f"Got {len(events)} events.")
    for e in events:
        print(f"  - {e['event_type']} ({e['status']}): {e['message']}")
        
    print("\n7. Retrieving settlement...")
    res = httpx.get(f"{base_url}/api/transactions/{tx_id}/settlement")
    settlement = res.json()
    print(settlement)
    
    if settlement["actual_account_id"] != settlement["expected_account_id"]:
        print("\nSUCCESS: Intentional mismatch verified.")
    else:
        print("\nFAILURE: Mismatch not found.")

if __name__ == "__main__":
    test_api()
