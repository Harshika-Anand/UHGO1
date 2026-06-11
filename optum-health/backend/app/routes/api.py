from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import logging
from app.llm.query_generator import generate_mongo_query
from app.services.query_service import validate_query, execute_query
from app.db.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)

@router.post("/query")
async def run_query(body: QueryRequest):
    try:
        raw = await generate_mongo_query(body.question)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")
    try:
        validated = validate_query(raw)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Validation error: {e}")
    try:
        return await execute_query(validated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")

@router.get("/health")
async def health():
    try:
        await get_db().command("ping")
        return {"status": "ok", "mongo": "connected", "version": "1.0.0"}
    except Exception:
        return {"status": "degraded", "mongo": "disconnected", "version": "1.0.0"}

@router.get("/schema")
async def schema():
    return {"collections": {
        "patients":   {"patient_id": "str", "name": "str", "age": "int", "gender": "str", "country": "str"},
        "hospitals":  {"hospital_id": "str", "patient_id": "str", "hospital_name": "str", "admission_date": "YYYY-MM-DD", "diagnosis": "str", "admission_type": "str"},
        "labs":       {"lab_id": "str", "patient_id": "str", "test_name": "str", "test_result": "float", "test_date": "YYYY-MM-DD"},
        "pharmacy":   {"pharmacy_id": "str", "patient_id": "str", "medicine": "str", "dosage": "str"},
        "diagnostic": {"diag_id": "str", "patient_id": "str", "scan_type": "str", "result": "str"},
        "adt":        {"adt_id": "str", "patient_id": "str", "admission_type": "str", "ward": "str", "date": "YYYY-MM-DD"},
    }}