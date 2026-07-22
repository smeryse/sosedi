#!/usr/bin/env bash
set -euo pipefail

echo "=== Соседи — Development ===
"

case "${1:-help}" in
  backend)
    echo "[backend] Installing deps & starting FastAPI..."
    cd backend
    python3 -m venv .venv 2>/dev/null || true
    .venv/bin/pip install -e . -q
    exec .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
    ;;
  frontend)
    echo "[frontend] Installing deps & starting Next.js..."
    cd frontend
    npm install --silent
    exec npm run dev
    ;;
  db)
    echo "[db] Running Alembic migrations..."
    cd backend
    .venv/bin/alembic upgrade head
    ;;
  *)
    echo "Usage: ./run.sh <command>

Commands:
  backend   Start FastAPI dev server (port 8000)
  frontend  Start Next.js dev server (port 3000)
  db        Run database migrations

Quick start:
  Terminal 1: ./run.sh backend
  Terminal 2: ./run.sh frontend
"
    ;;
esac
