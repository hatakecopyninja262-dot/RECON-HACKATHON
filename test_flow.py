import urllib.request
import json
import time

def run_test():
    base_url = "http://127.0.0.1:8000"
    
    print("1. Creating transaction...")
    req = urllib.request.Request(
        f"{base_url}/api/transactions",
        data=json.dumps({
            "amount": 1499,
            "currency": "INR",
            "payer": "ACC_USER_001",
            "expected_receiver": "ACC_MERCHANT_001"
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as response:
        tx = json.loads(response.read().decode())
        tx_id = tx["transaction_id"]
        print(f"Created: {tx_id}")
        
    print(f"\n2. Simulating payment & automatic recon for {tx_id}...")
    req = urllib.request.Request(
        f"{base_url}/api/transactions/{tx_id}/simulate-payment",
        data=b"",
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as response:
        print(json.loads(response.read().decode()))
        
    print(f"\n3. Fetching updated transaction {tx_id}...")
    req = urllib.request.Request(f"{base_url}/api/transactions/{tx_id}")
    with urllib.request.urlopen(req) as response:
        updated_tx = json.loads(response.read().decode())
        print(json.dumps(updated_tx, indent=2))
        
    print("\n4. Fetching chronological events...")
    req = urllib.request.Request(f"{base_url}/api/transactions/{tx_id}/events")
    with urllib.request.urlopen(req) as response:
        events = json.loads(response.read().decode())
        for e in events:
            print(f"[{e['timestamp']}] {e['event_type']} - {e['message']}")

if __name__ == "__main__":
    run_test()
