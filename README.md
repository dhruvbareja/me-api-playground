
Me-API Playground (Backend Assessment — Track A)

This is my submission for the Backend Assessment (Track A).
It’s basically a small full-stack playground where I put my own profile, skills, projects, and work experience into a database and then exposed them via APIs. On top of that, there’s a minimal frontend to view/search the data.

I built this to practice backend development with FastAPI and also connect it with a simple frontend.

⸻

Tech Stack
	•	Backend: FastAPI + SQLModel (SQLite by default, can also run on Postgres)
	•	Frontend: Plain HTML + CSS + JavaScript (served from FastAPI)
	•	Auth: Simple API key check (X-API-Key) for write operations
	•	Database: SQLite (for local testing, easy to set up)

## Setup virtual environment and install requirements
python -m venv .venv && source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Set environment variables
export API_KEY=changeme
export DATABASE_URL=sqlite:///me.db

Visit:
	•	Frontend: http://127.0.0.1:8000/
	•	API Docs: http://127.0.0.1:8000/docs

# Run server
uvicorn backend.app:app --reload
```
Open http://127.0.0.1:8000/ to see the UI. API lives under `/api` (docs at `/docs`).

## Endpoints
- `GET /api/health` — liveness
- `GET /api/profile` — read profile
- `PUT /api/profile` — upsert (requires header `X-API-Key`)
- `GET /api/skills` — list all skills
- `GET /api/skills/top?limit=10` — skills ranked by project count
- `GET /api/projects?skill=Python` — list projects, optionally filtered by skill
- `GET /api/projects/{id}` — project by id
- `POST /api/projects` — create (auth)
- `PUT /api/projects/{id}` — update (auth)
- `DELETE /api/projects/{id}` — delete (auth)
- `GET /api/work` — list work experience
- `GET /api/search?q=ml` — search skills & projects

### Example cURL
```bash
curl http://127.0.0.1:8000/api/health

curl http://127.0.0.1:8000/api/projects

curl -X POST http://127.0.0.1:8000/api/projects       -H "Content-Type: application/json"       -H "X-API-Key: $API_KEY"       -d '{"title":"New Project","description":"demo","skills":["Python","FastAPI"]}'
```

## Switch to Postgres (Optional)
1. Set `DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/dbname`
2. Install driver: `pip install psycopg2-binary`
3. Start app (tables auto-created).

## Docker
```bash
docker build -t me-api .
docker run -p 8000:8000 --env-file .env me-api
```

## Deployment (One Container)
- Use any Docker host (Render, Railway, Fly.io, etc).
- Expose port `8000`. Ensure env vars are set.

 Features Completed
	•	CRUD APIs for profile, projects, skills, work experience
	•	Minimal frontend with search and filtering
	•	API key-based auth for write operations
	•	SQLite database auto-seeded with my real profile data
	•	Added pagination, logging, and rate limiting (extra features)
	•	Basic CI with pytest

## Notes
- Seed data is created on first run and can be edited via `/api/profile` and `/api/projects`.
- Replace placeholder profile links with your real GitHub/LinkedIn/Portfolio.
