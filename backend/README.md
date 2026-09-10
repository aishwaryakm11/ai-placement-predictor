# AI Placement Predictor — Backend

**Decode Employability DNA** | Institutional Career Readiness & Upskilling Engine

A FastAPI backend that:
- Predicts student placement probability using a trained **Random Forest Regressor**
- Explains predictions using **SHAP TreeExplainer** (top 5 impactful features)
- Detects skill gaps against role benchmarks
- Generates phased upskilling roadmaps
- Provides TPO analytics dashboards across departments

---

## 1. Installation

```powershell
# From the project root
cd "c:\Users\ALOK  S C\OneDrive\Desktop\ai"

# Create and activate a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r backend\requirements.txt
```

---

## 2. Dataset Generation

```powershell
python backend\ml\data_gen.py
```

Output:
```
Generated 500 rows -> backend\data\synthetic_students.csv
```

---

## 3. Model Training

```powershell
python backend\ml\train_model.py
```

Output:
```
Loaded 500 rows from backend\data\synthetic_students.csv
Validation R²: 0.XXX
Model saved -> backend\ml\artifacts\placement_model.pkl
Feature columns saved -> backend\ml\artifacts\feature_columns.json
```

---

## 4. Starting FastAPI

```powershell
uvicorn backend.main:app --reload --port 8000
```

---

## 5. Swagger UI

Open in your browser:

```
http://localhost:8000/docs
```

---

## 6. API Endpoints

| Method | Path                  | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/`                   | Health check                             |
| POST   | `/api/predict`        | Full placement prediction for a student  |
| POST   | `/api/roadmap`        | Get skill gap + roadmap for a student    |
| GET    | `/api/tpo/analytics`  | Institutional TPO analytics dashboard    |

---

## 7. Example: POST /api/predict

**Request:**
```json
{
  "student_id": "STU_0001",
  "department": "CSE",
  "semester": 6,
  "cgpa": 8.5,
  "tenth_pct": 88.0,
  "twelfth_pct": 82.0,
  "backlogs": 0,
  "known_languages": ["Python", "JavaScript", "SQL"],
  "certifications": ["Full-Stack", "DSA"],
  "projects_count": 3,
  "internships_count": 1,
  "open_source_contributions": 2,
  "aptitude_score": 75.0,
  "soft_skill_rating": 8.0,
  "hackathons_attended": 2,
  "leadership_roles": 1,
  "target_role": "Full-Stack Developer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": "STU_0001",
    "placement_probability": 78.4,
    "readiness_status": "Ready",
    "target_role_scores": {
      "Full-Stack Developer": 82.1,
      "Data Analyst": 61.3,
      "Cloud/DevOps Engineer": 55.0,
      "QA Specialist": 58.7
    },
    "shap_factors": [
      {
        "feature": "internships_count",
        "impact_pct": 18.4,
        "direction": "positive",
        "readable_string": "+18.4% due to internships"
      }
    ],
    "missing_skills": [],
    "roadmap": []
  },
  "error": null
}
```

---

## 8. Example: POST /api/roadmap

**Request:**
```json
{
  "student_id": "STU_0001",
  "known_skills": ["Python", "JavaScript", "SQL"],
  "target_role": "Full-Stack Developer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": "STU_0001",
    "missing_skills": ["DSA", "Full-Stack"],
    "roadmap": [
      {
        "phase": "Foundational",
        "skills": ["DSA"],
        "estimated_weeks": 2,
        "recommended_action": "Complete a guided project or certification covering: DSA"
      },
      {
        "phase": "Advanced",
        "skills": ["Full-Stack"],
        "estimated_weeks": 6,
        "recommended_action": "Complete a guided project or certification covering: Full-Stack"
      }
    ]
  },
  "error": null
}
```

---

## 9. Example: GET /api/tpo/analytics

```
GET http://localhost:8000/api/tpo/analytics
GET http://localhost:8000/api/tpo/analytics?department=CSE
GET http://localhost:8000/api/tpo/analytics?threshold=70
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_readiness_pct": 66.4,
    "department_breakdown": [
      { "department": "CSE", "readiness_pct": 71.0, "student_count": 100 }
    ],
    "vulnerable_students": [
      {
        "student_id": "STU_0042",
        "department": "MECH",
        "placement_probability": 43.2,
        "readiness_status": "Needs Training",
        "top_missing_skill": "SQL"
      }
    ],
    "skill_deficit_matrix": {
      "departments": ["CSE", "ISE", "ECE", "MECH", "CIVIL"],
      "skills": ["SQL", "Python", "AWS", "DSA"],
      "matrix": [[...], [...], [...], [...], [...]]
    }
  },
  "error": null
}
```

---

## 10. Expected Folder Structure

```
backend/
├── main.py
├── requirements.txt
├── config.py
│
├── routers/
│   ├── __init__.py
│   ├── predict.py
│   ├── tpo.py
│   └── roadmap.py
│
├── schemas/
│   ├── __init__.py
│   ├── student_schema.py
│   ├── prediction_schema.py
│   └── roadmap_schema.py
│
├── ml/
│   ├── __init__.py
│   ├── data_gen.py
│   ├── train_model.py
│   ├── feature_engineering.py
│   ├── model.py
│   ├── explainer.py
│   └── artifacts/
│       ├── placement_model.pkl
│       └── feature_columns.json
│
├── data/
│   ├── synthetic_students.csv
│   └── role_benchmarks.json
│
├── services/
│   ├── __init__.py
│   ├── skill_gap_service.py
│   └── aggregation_service.py
│
├── tests/
│   ├── __init__.py
│   └── test_api.py
│
└── utils/
    ├── __init__.py
    ├── validators.py
    └── constants.py
```

---

## 11. Troubleshooting

### `ModuleNotFoundError: No module named 'config'`
Run uvicorn from the project root, not from inside `backend/`:
```powershell
uvicorn backend.main:app --reload --port 8000
```

### `FileNotFoundError: Model artifact not found`
Train the model first:
```powershell
python backend\ml\train_model.py
```

### `FileNotFoundError: synthetic_students.csv not found`
Generate the dataset first:
```powershell
python backend\ml\data_gen.py
```

### CORS errors from the frontend
Ensure the frontend runs on `http://localhost:5173`.
The backend allows this origin by default.

### Running tests
```powershell
pytest backend\tests\ -v
```
