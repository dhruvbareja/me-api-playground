
Me-API Playground (Backend Assessment — Track A)

This is my submission for the Backend Assessment (Track A).
It’s basically a small full-stack playground where I put my own profile, skills, projects, and work experience into a database and then exposed them via APIs. On top of that, there’s a minimal frontend to view/search the data.

I built this to practice backend development with FastAPI and also connect it with a simple frontend.
when you open the website link (hosted on render) please wait for 40-60 seconds as it would restart the server 
after visitng the website click on login username-admin
                                         password-password123
you can add projects directly from the website but you first need to log in.	

here is my resume link - https://drive.google.com/drive/folders/1JzRgkmC0UrVcCjUmUwrY2AMgdPNKIEL8?usp=sharing

⸻

Tech Stack
	•	Backend: FastAPI + SQLModel (SQLite by default)
	•	Frontend: Plain HTML + CSS + JavaScript served from fastapi
	•	Auth Simple API key check X-API-Key for write operations

## Setup virtual environment and install requirements
on macbook - python -m venv .venv && source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Set environment variables
export API_KEY=changeme
export DATABASE_URL=sqlite:///me.db

Visit:
	•	Frontend: http://127.0.0.1:8000/
	•	API Docs: http://127.0.0.1:8000/docs

#  to Run server
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


## Deployment (One Container)
- Use any Docker host (Rende)
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
