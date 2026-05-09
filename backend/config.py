import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://shwmohsrckknfwuhzdxb.supabase.co")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY", "")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Supabase REST API base URL
SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"

# Simple API password used to protect all endpoints when set (empty = disabled)
API_PASSWORD = os.getenv("API_PASSWORD", "")
