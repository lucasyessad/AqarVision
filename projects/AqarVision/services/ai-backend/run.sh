#!/usr/bin/env bash
# Local development server with hot-reload
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
    echo "⚠ No .env file found. Copy .env.example → .env and fill in your keys."
    exit 1
fi

# Create venv if needed
if [ ! -d .venv ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements-dev.txt

echo "Starting AI backend on http://localhost:8000 (docs: http://localhost:8000/docs)"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
