#!/usr/bin/env bash
# Stop and remove the prelegal container (macOS / Linux).
set -euo pipefail

CONTAINER=prelegal

if docker rm -f "$CONTAINER" >/dev/null 2>&1; then
  echo "prelegal stopped"
else
  echo "prelegal is not running"
fi
