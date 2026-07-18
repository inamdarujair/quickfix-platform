from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from database import db, mongo_client
from seed_data import seed_admin, seed_sample_data
from storage_utils import init_storage
from routers import auth, users, services, bookings, reviews, provider, admin, files

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="QuickFix API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "QuickFix API running"}


api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(services.router)
api_router.include_router(bookings.router)
api_router.include_router(reviews.router)
api_router.include_router(provider.router)
api_router.include_router(admin.router)
api_router.include_router(files.router)

app.include_router(api_router)

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
allowed_origins = list({frontend_url, "http://localhost:3000"})

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

    await db.users.create_index("email", unique=True)
    await db.services.create_index([("category", 1)])
    await db.services.create_index([("city", 1)])
    await db.services.create_index([("provider_id", 1)])
    await db.bookings.create_index([("customer_id", 1)])
    await db.bookings.create_index([("provider_id", 1)])
    await db.reviews.create_index([("service_id", 1)])
    await db.login_attempts.create_index("identifier", unique=True)

    await seed_admin()
    await seed_sample_data()
    logger.info("QuickFix backend startup complete")


@app.on_event("shutdown")
async def shutdown_db_client():
    mongo_client.close()
