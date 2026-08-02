# prelegal backend

FastAPI service that serves the statically-exported frontend, provides the
authentication foundation for V1, and powers the document chat. Built with
[`uv`](https://docs.astral.sh/uv/).

## Layout

```
app/
  main.py            # app factory: /api sub-app + static frontend mount
  config.py          # settings (JWT, DB path, frontend dir) via env / .env
  database.py        # SQLAlchemy engine/session; init_db() recreates schema
  models.py          # SQLAlchemy models (User)
  security.py        # bcrypt hashing + JWT encode/decode
  schemas.py         # Pydantic request/response models (incl. document chat)
  doc_chat.py        # system prompt + message assembly for the document chat
  registry.py        # loads registry.json (supported doc types + fields)
  registry.json      # generated (see scripts/build-registry.mjs)
  routers/
    auth.py          # POST /api/auth/signup, /signin; GET /api/auth/me
    chat.py          # POST /api/chat  (document interviewer, LiteLLM -> Cerebras)
    health.py        # GET /api/health
tests/               # pytest (FastAPI TestClient)
```

The SQLite database is **recreated from scratch on every startup** (`init_db`
drops and recreates all tables), matching the container's ephemeral-DB model.

## Endpoints

| Method | Path                | Body                    | Result                    |
| ------ | ------------------- | ----------------------- | ------------------------- |
| GET    | `/api/health`       | –                       | `{"status": "ok"}`        |
| POST   | `/api/auth/signup`  | `{ email, password }`   | `201` + bearer token      |
| POST   | `/api/auth/signin`  | `{ email, password }`   | `200` + bearer token      |
| GET    | `/api/auth/me`      | `Authorization: Bearer` | current user              |
| POST   | `/api/chat`         | `{ messages, data }`    | `{ reply, data }`         |

> Auth is backend-only for now. Sign-in/sign-up screens land in PL-7.

`/api/chat` is stateless: the client sends the conversation so far (`messages`)
and the current document (`data`, a `DocumentData` with `docType`,
`coverFields`, `parties`), and gets back the assistant's next `reply` plus the
updated `data`. The prompt (built in `doc_chat.py` from the registry) has the
LLM pick a supported document type — routing unsupported requests to the closest
one — and collect field values; it never writes legal text. It calls an LLM via
LiteLLM → OpenRouter → Cerebras (`openrouter/openai/gpt-oss-120b`) with
structured outputs, and needs `OPENROUTER_API_KEY` in the environment. It's
unauthenticated for now.

## Development

```bash
uv sync                                   # install deps (incl. dev group)
uv run uvicorn app.main:app --reload      # dev server at http://localhost:8000
uv run pytest                             # run the test suite
```

Configuration is read from environment variables or a local `.env`
(see `.env.example`).
