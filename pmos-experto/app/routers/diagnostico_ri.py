from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas.diagnostico_ri import (
    RespuestaDiagnosticoRi,
    SolicitudDiagnosticoRi,
)
from app.services.ri_service import RiService
from app.services.zen_service import ZenDecisionError


router = APIRouter()
ri_service = RiService()


@router.post("/resistencia-insulina", response_model=RespuestaDiagnosticoRi)
def diagnosticar_resistencia_insulina(
    solicitud: SolicitudDiagnosticoRi,
) -> RespuestaDiagnosticoRi:
    hechos = solicitud.model_dump()
    try:
        resultado = ri_service.evaluar(hechos)
    except ZenDecisionError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    explicacion = ri_service.generar_explicacion(resultado)
    return RespuestaDiagnosticoRi(
        resultado=resultado,
        explicacion=explicacion,
        trazabilidad=ri_service.generar_trazabilidad(
            hechos=hechos,
            resultado=resultado,
            explicacion=explicacion,
        ),
        engine=settings.engine_name,
        version_modelo=ri_service.VERSION_MODELO,
    )