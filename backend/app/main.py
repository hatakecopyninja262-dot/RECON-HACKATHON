from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health, products, transactions

app = FastAPI(title="RECON Simulator API")

# Allow RECON PAY, RECON MERCHANT and local Vite development servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://recon-pay.onrender.com",
    ],
    allow_origin_regex=r"https?://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(products.router)
app.include_router(transactions.router)