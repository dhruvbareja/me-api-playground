import sys, os
from fastapi.testclient import TestClient

# Ensure Python can find backend/app.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import AFTER fixing sys.path
from backend.app import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_login():
    res = client.post("/api/login", json={"username": "admin", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data


def test_projects_list():
    res = client.get("/api/projects")
    assert res.status_code == 200
    assert isinstance(res.json(), list)