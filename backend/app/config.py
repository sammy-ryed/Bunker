import os
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL"
)

JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret-in-prod")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h default
FRONTEND_URL = os.getenv("FRONTEND_URL")
