"""Loads the lite document registry (see scripts/build-registry.mjs).

Holds the supported document types with their metadata and fillable fields —
enough to route the user to a document and drive the interview. The verbatim
Standard Terms live only in the frontend registry, since the LLM never writes
legal text.
"""

import json
from pathlib import Path

_REGISTRY_PATH = Path(__file__).resolve().parent / "registry.json"

DOCUMENT_TYPES: list[dict] = json.loads(_REGISTRY_PATH.read_text())

DOCUMENT_IDS: set[str] = {d["id"] for d in DOCUMENT_TYPES}


def get_document_type(doc_id: str) -> dict | None:
    return next((d for d in DOCUMENT_TYPES if d["id"] == doc_id), None)
