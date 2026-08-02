# scripts

Start/stop the prelegal app as a single Docker container. Bringing the container
up builds the frontend, installs the backend, and recreates the database from
scratch.

Requires [Docker](https://docs.docker.com/get-docker/).

## macOS / Linux

```bash
./scripts/start.sh     # build + run, serves http://localhost:8000
./scripts/stop.sh      # stop + remove the container
```

## Windows (PowerShell)

```powershell
./scripts/start.ps1
./scripts/stop.ps1
```

## Environment overrides

- `PORT` — host port to publish (default `8000`).
- `JWT_SECRET` — signing secret; **set this in production**. Passed through to
  the container when defined.
- `OPENROUTER_API_KEY` — required for the NDA chat. Read from the repo-root
  `.env` automatically (or the environment) and passed through to the container.

```bash
PORT=3000 JWT_SECRET="$(openssl rand -hex 32)" ./scripts/start.sh
```
