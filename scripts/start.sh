#!/usr/bin/env bash
# Build and start the prelegal container (macOS / Linux).
# The SQLite DB is created from scratch each time the container starts.
set -euo pipefail

IMAGE=prelegal
CONTAINER=prelegal
PORT="${PORT:-8000}"

cd "$(dirname "$0")/.."

docker build -t "$IMAGE" .
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" -p "${PORT}:8000" \
  ${JWT_SECRET:+-e JWT_SECRET="$JWT_SECRET"} \
  "$IMAGE"

echo "prelegal is running at http://localhost:${PORT}"
