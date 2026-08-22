import uuid
from datetime import datetime
from supabase import create_client, Client
from app.config import settings

class MockDB:
    def __init__(self):
        self.products = []
        self.transactions = []
        self.payment_events = []
        self.settlements = []

    def generate_id(self):
        return str(uuid.uuid4())

    def now(self):
        return datetime.utcnow().isoformat()

mock_db = MockDB()

class Database:
    def __init__(self):
        self.use_mock = not (settings.SUPABASE_URL and settings.SUPABASE_KEY)
        if not self.use_mock:
            self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        else:
            print("WARNING: Supabase credentials not found. Using in-memory mock database.")

    def create_product(self, product_data):
        if self.use_mock:
            product = {
                "id": mock_db.generate_id(),
                "created_at": mock_db.now(),
                **product_data
            }
            mock_db.products.append(product)
            return product
        else:
            res = self.client.table("products").insert(product_data).execute()
            return res.data[0] if res.data else None

    def get_products(self):
        if self.use_mock:
            return mock_db.products
        else:
            res = self.client.table("products").select("*").execute()
            return res.data

    def create_transaction(self, tx_data):
        if self.use_mock:
            tx = {
                "id": mock_db.generate_id(),
                "created_at": mock_db.now(),
                "updated_at": mock_db.now(),
                **tx_data
            }
            mock_db.transactions.append(tx)
            return tx
        else:
            res = self.client.table("transactions").insert(tx_data).execute()
            return res.data[0] if res.data else None

    def get_transaction(self, transaction_id: str):
        if self.use_mock:
            for tx in mock_db.transactions:
                if tx["transaction_id"] == transaction_id:
                    return tx
            return None
        else:
            res = self.client.table("transactions").select("*").eq("transaction_id", transaction_id).execute()
            return res.data[0] if res.data else None

    def update_transaction(self, transaction_id: str, updates: dict):
        if self.use_mock:
            for tx in mock_db.transactions:
                if tx["transaction_id"] == transaction_id:
                    tx.update(updates)
                    tx["updated_at"] = mock_db.now()
                    return tx
            return None
        else:
            res = self.client.table("transactions").update(updates).eq("transaction_id", transaction_id).execute()
            return res.data[0] if res.data else None

    def create_payment_event(self, event_data):
        if self.use_mock:
            event = {
                "id": mock_db.generate_id(),
                "timestamp": mock_db.now(),
                **event_data
            }
            mock_db.payment_events.append(event)
            return event
        else:
            res = self.client.table("payment_events").insert(event_data).execute()
            return res.data[0] if res.data else None

    def get_events_for_transaction(self, transaction_id: str):
        if self.use_mock:
            return [e for e in mock_db.payment_events if e["transaction_id"] == transaction_id]
        else:
            res = self.client.table("payment_events").select("*").eq("transaction_id", transaction_id).execute()
            return res.data

    def create_settlement(self, settlement_data):
        if self.use_mock:
            settlement = {
                "id": mock_db.generate_id(),
                "created_at": mock_db.now(),
                **settlement_data
            }
            mock_db.settlements.append(settlement)
            return settlement
        else:
            res = self.client.table("settlements").insert(settlement_data).execute()
            return res.data[0] if res.data else None

    def get_settlement_for_transaction(self, transaction_id: str):
        if self.use_mock:
            for s in mock_db.settlements:
                if s["transaction_id"] == transaction_id:
                    return s
            return None
        else:
            res = self.client.table("settlements").select("*").eq("transaction_id", transaction_id).execute()
            return res.data[0] if res.data else None

db = Database()
