# RECON-HACKATHON - Milestone 1

This is the backend simulation for the RECON hackathon project.
It implements a fault-injecting payment simulation to generate incidents for later investigation.

## Setup

1. `cd backend`
2. `pip install -r requirements.txt`
3. Configure environment variables in `.env` (optional for local mock mode).
   - If `SUPABASE_URL` and `SUPABASE_KEY` are provided, it connects to Supabase.
   - If not, it uses an in-memory mock database for local development.
4. Run the server: `uvicorn app.main:app --reload`

## Supabase Configuration

Execute the SQL script located in `supabase/schema.sql` in your Supabase SQL Editor to create the necessary tables.

## API Endpoints

- `GET /health`
- `POST /api/products`
- `GET /api/products`
- `POST /api/transactions`
- `GET /api/transactions/{transaction_id}`
- `POST /api/transactions/{transaction_id}/simulate-payment`
- `GET /api/transactions/{transaction_id}/events`
- `GET /api/transactions/{transaction_id}/settlement`
