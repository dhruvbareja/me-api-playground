
# Me-API Playground (Backend Assessment — Track A)

A tiny full-stack app that stores your profile, skills, projects, and work experience. 
It exposes a clean API and a simple frontend to query/filter your data.

## Tech
- **Backend:** FastAPI + SQLModel (SQLite by default)
- **Frontend:** Static HTML/CSS/JS served by FastAPI
- **Auth:** Header-based API key for write operations (`X-API-Key`)
- **DB:** SQLite (easy to swap to Postgres via `DATABASE_URL`)

## Quickstart (Local)
```bash
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
# Optional: set env (copies .env.example to .env and edit)
export API_KEY=changeme
export DATABASE_URL=sqlite:///me.db
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

## TODO / Nice-to-have
- Pagination on project list
- Rate limiting (e.g., slowapi)
- Tests with pytest + httpx
- Basic auth for `/api/*` write routes (beyond API key)

## Notes
- Seed data is created on first run and can be edited via `/api/profile` and `/api/projects`.
- Replace placeholder profile links with your real GitHub/LinkedIn/Portfolio.
