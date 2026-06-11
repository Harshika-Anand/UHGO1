from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient, ASCENDING, IndexModel
import logging
from app.config import settings

logger = logging.getLogger(__name__)

async_client: AsyncIOMotorClient = None

async def connect_db():
    global async_client
    async_client = AsyncIOMotorClient(
        settings.MONGO_URI,
        maxPoolSize=50,
        minPoolSize=5,
        maxIdleTimeMS=30000,
        serverSelectionTimeoutMS=5000,
        socketTimeoutMS=settings.QUERY_TIMEOUT_MS,
        connectTimeoutMS=5000,
    )
    await async_client.admin.command("ping")
    logger.info("MongoDB connected successfully")
    await ensure_indexes()

async def close_db():
    global async_client
    if async_client:
        async_client.close()

def get_db():
    return async_client[settings.MONGO_DB_NAME]

async def ensure_indexes():
    db = get_db()
    await db.patients.create_indexes([
        IndexModel([("country", ASCENDING)]),
        IndexModel([("age", ASCENDING)]),
        IndexModel([("gender", ASCENDING)]),
        IndexModel([("patient_id", ASCENDING)], unique=True),
    ])
    await db.hospitals.create_indexes([
        IndexModel([("patient_id", ASCENDING)]),
        IndexModel([("diagnosis", ASCENDING)]),
        IndexModel([("hospital_name", ASCENDING)]),
        IndexModel([("admission_date", ASCENDING)]),
    ])
    await db.labs.create_indexes([IndexModel([("patient_id", ASCENDING)]), IndexModel([("test_name", ASCENDING)])])
    await db.pharmacy.create_indexes([IndexModel([("patient_id", ASCENDING)]), IndexModel([("medicine", ASCENDING)])])
    await db.diagnostic.create_indexes([IndexModel([("patient_id", ASCENDING)])])
    await db.adt.create_indexes([IndexModel([("patient_id", ASCENDING)]), IndexModel([("ward", ASCENDING)])])
    logger.info("All indexes created")