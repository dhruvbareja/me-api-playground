#!/bin/bash
# Kill all uvicorn processes
echo "Stopping existing uvicorn servers..."
kill -9 $(ps aux | grep uvicorn | grep -v grep | awk '{print $2}') 2>/dev/null

# Start uvicorn again
echo "Starting uvicorn on port 8020..."
uvicorn backend.app:app --reload --port 8020

