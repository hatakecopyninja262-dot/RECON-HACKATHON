import os
from dotenv import load_dotenv, find_dotenv

print("CWD:", os.getcwd())
print("find_dotenv:", find_dotenv())

load_dotenv()
print("SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("SUPABASE_KEY:", os.getenv("SUPABASE_KEY"))
