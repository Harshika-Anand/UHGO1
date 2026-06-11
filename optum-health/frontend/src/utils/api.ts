const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const USE_MOCK = false; // Set to false when real backend is ready

export interface QueryResult {
  results: Record<string, unknown>[];
  count: number;
  collection: string;
  mongo_query: Record<string, unknown>;
  elapsed_ms: number;
}

export interface HealthStatus {
  status: string;
  mongo: string;
  version: string;
}

export interface SchemaInfo {
  collections: Record<string, Record<string, string>>;
}

// ── Mock Data ─────────────────────────────────────────────────
const MOCK_PATIENTS = [
  { patient_id: "P00001", name: "Arjun Kumar",    age: 34, gender: "Male",   country: "India",     diagnosis: "Diabetes",      admission_date: "2025-03-01", hospital: "Apollo",        ward: "General"    },
  { patient_id: "P00002", name: "Priya Sharma",   age: 29, gender: "Female", country: "India",     diagnosis: "Hypertension",  admission_date: "2025-02-15", hospital: "Fortis",        ward: "ICU"        },
  { patient_id: "P00003", name: "John Smith",     age: 52, gender: "Male",   country: "USA",       diagnosis: "Heart Failure", admission_date: "2025-01-20", hospital: "Memorial",      ward: "Cardiology" },
  { patient_id: "P00004", name: "Emily Johnson",  age: 44, gender: "Female", country: "USA",       diagnosis: "Asthma",        admission_date: "2025-03-10", hospital: "City Hospital", ward: "General"    },
  { patient_id: "P00005", name: "Mohammed Khan",  age: 61, gender: "Male",   country: "UAE",       diagnosis: "Diabetes",      admission_date: "2025-04-02", hospital: "Medanta",       ward: "ICU"        },
  { patient_id: "P00006", name: "Sneha Reddy",    age: 38, gender: "Female", country: "India",     diagnosis: "Tuberculosis",  admission_date: "2025-03-22", hospital: "AIIMS",         ward: "General"    },
  { patient_id: "P00007", name: "Carlos Garcia",  age: 47, gender: "Male",   country: "Brazil",    diagnosis: "Stroke",        admission_date: "2025-02-28", hospital: "St. Mary's",    ward: "Neurology"  },
  { patient_id: "P00008", name: "Sophie Martin",  age: 33, gender: "Female", country: "France",    diagnosis: "Pneumonia",     admission_date: "2025-04-10", hospital: "General Hospital", ward: "General" },
  { patient_id: "P00009", name: "Kenji Tanaka",   age: 71, gender: "Male",   country: "Japan",     diagnosis: "Kidney Disease",admission_date: "2025-01-05", hospital: "Manipal",       ward: "ICU"        },
  { patient_id: "P00010", name: "Fatima Ali",     age: 55, gender: "Female", country: "UAE",       diagnosis: "Hypertension",  admission_date: "2025-03-18", hospital: "Apollo",        ward: "Cardiology" },
  { patient_id: "P00011", name: "Vikram Singh",   age: 42, gender: "Male",   country: "India",     diagnosis: "Diabetes",      admission_date: "2025-04-01", hospital: "Max Healthcare",ward: "General"    },
  { patient_id: "P00012", name: "Anita Patel",    age: 27, gender: "Female", country: "India",     diagnosis: "Dengue",        admission_date: "2025-03-30", hospital: "Fortis",        ward: "General"    },
  { patient_id: "P00013", name: "David Brown",    age: 66, gender: "Male",   country: "UK",        diagnosis: "Heart Failure", admission_date: "2025-02-10", hospital: "City Hospital", ward: "ICU"        },
  { patient_id: "P00014", name: "Lakshmi Nair",   age: 49, gender: "Female", country: "India",     diagnosis: "Malaria",       admission_date: "2025-04-05", hospital: "AIIMS",         ward: "General"    },
  { patient_id: "P00015", name: "Pierre Dubois",  age: 58, gender: "Male",   country: "France",    diagnosis: "Liver Cirrhosis",admission_date: "2025-01-15", hospital: "Medanta",      ward: "ICU"        },
  { patient_id: "P00016", name: "Sarah Williams", age: 36, gender: "Female", country: "Australia", diagnosis: "Asthma",        admission_date: "2025-03-25", hospital: "Memorial",      ward: "General"    },
  { patient_id: "P00017", name: "Ravi Gupta",     age: 53, gender: "Male",   country: "India",     diagnosis: "Hypertension",  admission_date: "2025-04-08", hospital: "Apollo",        ward: "Cardiology" },
  { patient_id: "P00018", name: "Zara Ahmed",     age: 31, gender: "Female", country: "UAE",       diagnosis: "COVID-19",      admission_date: "2025-02-20", hospital: "St. Mary's",    ward: "ICU"        },
  { patient_id: "P00019", name: "Li Wei",         age: 45, gender: "Male",   country: "Japan",     diagnosis: "Diabetes",      admission_date: "2025-03-14", hospital: "Manipal",       ward: "General"    },
  { patient_id: "P00020", name: "Maria Silva",    age: 62, gender: "Female", country: "Brazil",    diagnosis: "Stroke",        admission_date: "2025-01-28", hospital: "Fortis",        ward: "Neurology"  },
];

function mockQuery(question: string): QueryResult {
  const q = question.toLowerCase();
  let results = [...MOCK_PATIENTS];

  if (q.includes("india"))        results = results.filter(p => p.country === "India");
  else if (q.includes("usa"))     results = results.filter(p => p.country === "USA");
  else if (q.includes("uae"))     results = results.filter(p => p.country === "UAE");
  else if (q.includes("japan"))   results = results.filter(p => p.country === "Japan");
  else if (q.includes("brazil"))  results = results.filter(p => p.country === "Brazil");

  if (q.includes("icu"))          results = results.filter(p => p.ward === "ICU");
  if (q.includes("diabetes"))     results = results.filter(p => p.diagnosis === "Diabetes");
  if (q.includes("hypertension")) results = results.filter(p => p.diagnosis === "Hypertension");
  if (q.includes("heart"))        results = results.filter(p => p.diagnosis.includes("Heart"));
  if (q.includes("asthma"))       results = results.filter(p => p.diagnosis === "Asthma");
  if (q.includes("stroke"))       results = results.filter(p => p.diagnosis === "Stroke");
  if (q.includes("female"))       results = results.filter(p => p.gender === "Female");
  else if (q.includes("male"))    results = results.filter(p => p.gender === "Male");
  if (q.includes("60") || q.includes("elderly")) results = results.filter(p => p.age >= 60);

  return {
    results,
    count: results.length,
    collection: "patients (mock)",
    mongo_query: { filter: { _mock: true, question }, limit: 100 },
    elapsed_ms: Math.round(Math.random() * 30 + 5),
  };
}

// ── API client ────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  query: (question: string): Promise<QueryResult> => {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve(mockQuery(question)), 600));
    }
    return apiFetch<QueryResult>("/query", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },

  health: (): Promise<HealthStatus> => {
    if (USE_MOCK) {
      return Promise.resolve({ status: "ok (mock)", mongo: "mock mode", version: "1.0.0" });
    }
    return apiFetch<HealthStatus>("/health");
  },

  schema: () => apiFetch<SchemaInfo>("/schema"),
};