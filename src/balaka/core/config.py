from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="BALAKA_",
        extra="ignore",
    )

    app_name: str = "Balaka TTS"
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = Field(default=8000, ge=1, le=65535)
    api_prefix: str = "/api/v1"

    tts_model: str = "k2-fsa/OmniVoice"
    tts_device: str = "auto"
    tts_dtype: str = "auto"
    tts_preload_runtime: bool = True
    tts_load_asr: bool = False

    frontend_dir: Path = Field(default=BASE_DIR / "frontend")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
