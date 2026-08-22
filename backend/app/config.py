import os
from dotenv import load_dotenv

# Resolve the absolute path to backend/.env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file = os.path.join(BASE_DIR, ".env")

# Force load and override any existing empty variables
load_dotenv(dotenv_path=env_file, override=True)

class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

settings = Settings()
