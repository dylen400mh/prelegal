from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # Read both the backend `.env` and the repo-root `.env` (which holds
    # OPENROUTER_API_KEY); later files override earlier ones on conflicts.
    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR.parent / ".env", BACKEND_DIR / ".env"),
        extra="ignore",
    )

    jwt_secret: str = "dev-insecure-secret-change-me-in-production-please"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # OpenRouter key for LLM calls (LiteLLM -> OpenRouter -> Cerebras).
    openrouter_api_key: str = ""

    # Recreated from scratch on every startup (see database.init_db).
    db_path: Path = BACKEND_DIR / "prelegal.db"

    # Directory holding the statically-exported frontend (Next.js `out/`).
    frontend_dist: Path = BACKEND_DIR / "static"

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.db_path}"


settings = Settings()
