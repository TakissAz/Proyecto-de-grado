from fastapi import FastAPI

from app.config import settings
from app.routers.decisiones import router as decisiones_router

app = FastAPI(title=settings.app_title, version=settings.app_version)
app.include_router(
    decisiones_router,
    prefix="/api/v1/decisiones",
    tags=["decisiones"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": settings.service_name, "version": settings.app_version}


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.service_name,
        "engine": settings.engine_name,
    }
