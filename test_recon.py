import urllib.request
import urllib.error
import json
import time

def test_recon():
    base_url = "http://127.0.0.1:8000"
    
    print("1. Creating a NEW transaction...")
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
    try:
        with urllib.request.urlopen(req) as response:
            tx = json.loads(response.read().decode())
            tx_id = tx["transaction_id"]
            print(f"Created {tx_id}")
    except Exception as e:
        print(f"Failed: {e}")
        return
        
    print(f"\n2. Simulating payment for {tx_id}...")
    req = urllib.request.Request(
        f"{base_url}/api/transactions/{tx_id}/simulate-payment", 
        data=b"",
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as response:
            print(json.loads(response.read().decode()))
    except Exception as e:
        print(f"Failed: {e}")
        return
        
    print(f"\n3. Running RECON Engine analysis on {tx_id}...")
    req = urllib.request.Request(f"{base_url}/api/transactions/{tx_id}/recon")
    try:
        with urllib.request.urlopen(req) as response:
            analysis = json.loads(response.read().decode())
            print("\n--- RECON CAUSAL ANALYSIS ---")
            print(f"Transaction: {analysis['transaction_id']}")
            print(f"Routing Mismatch Detected: {analysis['causal_derivation']['routing_mismatch_detected']}")
            
            anomaly = analysis['incident_analysis']['root_upstream_anomaly']
            if anomaly:
                print(f"\nUPSTREAM ANOMALY DETECTED:")
                print(f" -> {anomaly['event_type']} ({anomaly['timestamp']})")
                
            consequences = analysis['incident_analysis']['downstream_consequences']
            if consequences:
                print(f"\nDOWNSTREAM CONSEQUENCES:")
                for c in consequences:
                    print(f" -> {c['event_type']} ({c['timestamp']})")
                    
    except Exception as e:
        print(f"Failed: {e}")
        return

if __name__ == "__main__":
    test_recon()
