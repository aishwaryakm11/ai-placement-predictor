"""
Pytest test suite for the AI Placement Predictor backend.

Run from project root:
    pytest backend/tests/ -v

Prerequisites:
    - python backend/ml/data_gen.py   (generate dataset)
    - python backend/ml/train_model.py (train model)
"""

import sys
from pathlib import Path

# Ensure backend is importable
_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# ─── Sample valid student payload ─────────────────────────────────────────────

VALID_STUDENT = {
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
    "target_role": "Full-Stack Developer",
}


# ─── Health check ─────────────────────────────────────────────────────────────

class TestHealthCheck:
    def test_root_returns_ok(self):
        resp = client.get("/")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"


# ─── POST /api/predict ────────────────────────────────────────────────────────

class TestPredictEndpoint:
    def test_valid_student_returns_success(self):
        resp = client.post("/api/predict", json=VALID_STUDENT)
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["error"] is None
        data = body["data"]
        assert data["student_id"] == "STU_0001"
        assert 0.0 <= data["placement_probability"] <= 100.0
        assert data["readiness_status"] in ("Ready", "Near-Ready", "Needs Training")
        assert isinstance(data["target_role_scores"], dict)
        assert len(data["shap_factors"]) <= 5
        assert isinstance(data["missing_skills"], list)
        assert isinstance(data["roadmap"], list)

    def test_invalid_cgpa_returns_error(self):
        bad = {**VALID_STUDENT, "cgpa": 11.0}
        resp = client.post("/api/predict", json=bad)
        assert resp.status_code == 422
        body = resp.json()
        assert body["success"] is False
        assert body["data"] is None
        assert body["error"] is not None

    def test_negative_backlogs_returns_error(self):
        bad = {**VALID_STUDENT, "backlogs": -1}
        resp = client.post("/api/predict", json=bad)
        assert resp.status_code == 422
        body = resp.json()
        assert body["success"] is False

    def test_invalid_department_returns_error(self):
        bad = {**VALID_STUDENT, "department": "BIOLOGY"}
        resp = client.post("/api/predict", json=bad)
        assert resp.status_code == 422
        body = resp.json()
        assert body["success"] is False

    def test_invalid_target_role_returns_error(self):
        bad = {**VALID_STUDENT, "target_role": "Astronaut"}
        resp = client.post("/api/predict", json=bad)
        assert resp.status_code == 422
        body = resp.json()
        assert body["success"] is False

    def test_invalid_semester_returns_error(self):
        bad = {**VALID_STUDENT, "semester": 9}
        resp = client.post("/api/predict", json=bad)
        assert resp.status_code == 422
        body = resp.json()
        assert body["success"] is False

    def test_response_envelope_structure(self):
        resp = client.post("/api/predict", json=VALID_STUDENT)
        body = resp.json()
        assert "success" in body
        assert "data" in body
        assert "error" in body


# ─── POST /api/roadmap ────────────────────────────────────────────────────────

class TestRoadmapEndpoint:
    def test_valid_roadmap_request(self):
        payload = {
            "student_id": "STU_0001",
            "known_skills": ["Python", "JavaScript", "SQL"],
            "target_role": "Full-Stack Developer",
        }
        resp = client.post("/api/roadmap", json=payload)
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["error"] is None
        data = body["data"]
        assert data["student_id"] == "STU_0001"
        assert isinstance(data["missing_skills"], list)
        assert isinstance(data["roadmap"], list)
        # DSA should be missing since student doesn't have it
        assert "DSA" in data["missing_skills"]

    def test_all_skills_present_returns_empty_roadmap(self):
        payload = {
            "student_id": "STU_TEST",
            "known_skills": ["JavaScript", "SQL", "Full-Stack", "DSA"],
            "target_role": "Full-Stack Developer",
        }
        resp = client.post("/api/roadmap", json=payload)
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["data"]["missing_skills"] == []
        assert body["data"]["roadmap"] == []

    def test_invalid_role_returns_error(self):
        payload = {
            "student_id": "STU_0001",
            "known_skills": ["Python"],
            "target_role": "Invalid Role",
        }
        resp = client.post("/api/roadmap", json=payload)
        assert resp.status_code == 422
        body = resp.json()
        assert body["success"] is False


# ─── GET /api/tpo/analytics ───────────────────────────────────────────────────

class TestTPOAnalytics:
    def test_analytics_returns_success(self):
        resp = client.get("/api/tpo/analytics")
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["error"] is None
        data = body["data"]
        assert "overall_readiness_pct" in data
        assert "department_breakdown" in data
        assert "vulnerable_students" in data
        assert "skill_deficit_matrix" in data

    def test_analytics_department_filter(self):
        resp = client.get("/api/tpo/analytics?department=CSE")
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True

    def test_analytics_invalid_department(self):
        resp = client.get("/api/tpo/analytics?department=XYZ")
        assert resp.status_code == 422
        body = resp.json()
        assert body["success"] is False

    def test_analytics_threshold_parameter(self):
        resp = client.get("/api/tpo/analytics?threshold=70")
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True

    def test_skill_deficit_matrix_structure(self):
        resp = client.get("/api/tpo/analytics")
        body = resp.json()
        matrix_data = body["data"]["skill_deficit_matrix"]
        assert "departments" in matrix_data
        assert "skills" in matrix_data
        assert "matrix" in matrix_data
        # Dimensions should match
        assert len(matrix_data["matrix"]) == len(matrix_data["departments"])
        for row in matrix_data["matrix"]:
            assert len(row) == len(matrix_data["skills"])
