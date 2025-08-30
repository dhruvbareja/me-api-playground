
FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY . .
EXPOSE 8000
ENV API_KEY=changeme
ENV DATABASE_URL=sqlite:///me.db
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
