from fastapi import FastAPI

from app.config import settings
from app.routers.decisiones import router as decisiones_router
from app.routers.diagnostico_pmos import router as diagnostico_pmos_router
from app.routers.diagnostico_ri import router as diagnostico_ri_router
from app.routers.nutricion import router as nutricion_router

app = FastAPI(title=settings.app_title, version=settings.app_version)
app.include_router(
    decisiones_router,
    prefix="/api/v1/decisiones",
    tags=["decisiones"],
)

app.include_router(
    diagnostico_pmos_router,
    prefix="/api/v1/diagnostico",
    tags=["diagnostico-pmos"],
)
app.include_router(
    diagnostico_ri_router,
    prefix="/api/v1/diagnostico",
    tags=["diagnostico-ri"],
)
app.include_router(
    nutricion_router,
    prefix="/api/v1/nutricion",
    tags=["nutricion"],
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
