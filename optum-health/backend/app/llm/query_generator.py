import json
import logging
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """You are a MongoDB query generator for a healthcare system.

COLLECTIONS:
1. patients      — { patient_id, name, age, gender, country }
2. hospitals     — { hospital_id, patient_id, hospital_name, admission_date (YYYY-MM-DD), discharge_date, diagnosis, admission_type }
3. labs          — { lab_id, patient_id, test_name, test_result (float), test_date }
4. pharmacy      — { pharmacy_id, patient_id, medicine, dosage, date }
5. diagnostic    — { diag_id, patient_id, scan_type, result, date }
6. adt           — { adt_id, patient_id, admission_type, ward, date }

STRICT RULES:
- Output ONLY valid JSON, no markdown, no explanation
- Only READ queries (find). Never delete/update/drop
- Always "limit": 100
- Use only fields listed above
- For dates use ISO strings and $gte/$lte operators
- For "last N days" use $gte with the correct ISO date
- Case-insensitive text search: {"$regex": "term", "$options": "i"}
- Always include "_id": 0 in projection

OUTPUT FORMAT:
{"collection": "...", "filter": {...}, "projection": {"_id": 0}, "sort": [["field", -1]], "limit": 100}

EXAMPLES:
Q: patients from India
A: {"collection":"patients","filter":{"country":"India"},"projection":{"_id":0},"sort":null,"limit":100}

Q: patients with diabetes
A: {"collection":"hospitals","filter":{"diagnosis":{"$regex":"diabetes","$options":"i"}},"projection":{"_id":0},"sort":[["admission_date",-1]],"limit":100}

Q: ICU patients
A: {"collection":"adt","filter":{"ward":{"$regex":"icu","$options":"i"}},"projection":{"_id":0},"sort":null,"limit":100}
"""

async def generate_mongo_query(question: str) -> dict:
    response = await client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        max_tokens=512,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Generate MongoDB query for: {question}"},
        ],
    )
    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if GPT wraps in ```json
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)