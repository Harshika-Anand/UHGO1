import time
import logging
from typing import Any
from app.db.database import get_db
from app.config import settings

logger = logging.getLogger(__name__)

ALLOWED_COLLECTIONS = {"patients", "hospitals", "labs", "pharmacy", "diagnostic", "adt"}
BLOCKED_OPERATORS = {"$set","$unset","$inc","$push","$pull","$addToSet","$rename","$where","$function","$eval"}

def _check_blocked(obj: Any, path: str = ""):
    if isinstance(obj, dict):
        for key, val in obj.items():
            if key in BLOCKED_OPERATORS:
                raise ValueError(f"Blocked operator '{key}' at '{path}'")
            _check_blocked(val, f"{path}.{key}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            _check_blocked(item, f"{path}[{i}]")

def validate_query(raw: dict) -> dict:
    collection = raw.get("collection", "")
    if collection not in ALLOWED_COLLECTIONS:
        raise ValueError(f"Collection '{collection}' not allowed")
    _check_blocked(raw.get("filter", {}))
    raw["limit"] = min(int(raw.get("limit", 100)), settings.MAX_QUERY_RESULTS)
    return raw

async def execute_query(payload: dict) -> dict:
    db = get_db()
    collection = db[payload["collection"]]
    projection = payload.get("projection", {"_id": 0})
    sort = payload.get("sort")
    limit = payload.get("limit", 100)

    start = time.perf_counter()
    cursor = collection.find(payload["filter"], projection).limit(limit)
    if sort:
        cursor = cursor.sort(sort)
    cursor = cursor.max_time_ms(settings.QUERY_TIMEOUT_MS)

    results = []
    async for doc in cursor:
        doc.pop("_id", None)
        results.append(doc)

    elapsed = round((time.perf_counter() - start) * 1000, 2)
    return {
        "results": results,
        "count": len(results),
        "collection": payload["collection"],
        "mongo_query": {"filter": payload["filter"], "limit": limit},
        "elapsed_ms": elapsed,
    }