from fastapi import FastAPI
from app.routes import health, products, transactions

app = FastAPI(title="RECON Simulator API")

app.include_router(health.router)
app.include_router(products.router)
app.include_router(transactions.router)
