import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_title: str = os.getenv("APP_TITLE", "PMOS Experto API")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    service_name: str = os.getenv("SERVICE_NAME", "pmos-experto")
    engine_name: str = "zen-engine"


settings = Settings()
