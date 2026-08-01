import os
import tempfile
from pathlib import Path

# Point the app at a throwaway SQLite file before it is imported, so tests never
# touch a real DB. Set at import time so it precedes `app.config` construction.
os.environ["DB_PATH"] = str(Path(tempfile.mkdtemp()) / "test.db")

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client():
    # Entering the context runs the lifespan, which recreates the schema from
    # scratch — giving each test a clean database.
    with TestClient(app) as c:
        yield c
