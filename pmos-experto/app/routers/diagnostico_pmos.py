from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas.diagnostico_pmos import (
    RespuestaDiagnosticoPmos,
    SolicitudDiagnosticoPmos,
)
from app.services.pmos_service import PmosService
from app.services.zen_service import ZenDecisionError


router = APIRouter()
pmos_service = PmosService()


@router.post("/pmos", response_model=RespuestaDiagnosticoPmos)
def diagnosticar_pmos(
    solicitud: SolicitudDiagnosticoPmos,
) -> RespuestaDiagnosticoPmos:
    hechos = solicitud.model_dump()
    try:
        resultado = pmos_service.evaluar(hechos)
    except ZenDecisionError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    explicacion = pmos_service.generar_explicacion(resultado)
    return RespuestaDiagnosticoPmos(
        resultado=resultado,
        explicacion=explicacion,
        trazabilidad=pmos_service.generar_trazabilidad(
            hechos=hechos,
            resultado=resultado,
            explicacion=explicacion,
        ),
        engine=settings.engine_name,
        version_modelo=pmos_service.VERSION_MODELO,
    )