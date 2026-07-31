from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas.decisiones import RespuestaDecision, SolicitudDecision
from app.services.explicador import generar_explicacion
from app.services.zen_service import ZenDecisionError, ZenDecisionService

router = APIRouter()
zen_service = ZenDecisionService()


@router.post("/evaluar", response_model=RespuestaDecision)
def evaluar_decision(solicitud: SolicitudDecision) -> RespuestaDecision:
    try:
        resultado = zen_service.evaluar(
            modelo_jdm=solicitud.modelo_jdm,
            hechos=solicitud.hechos,
        )
    except ZenDecisionError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return RespuestaDecision(
        modulo=solicitud.modulo,
        resultado=resultado,
        reglas_activadas=[],
        explicacion=generar_explicacion(
            modulo=solicitud.modulo,
            resultado=resultado,
            hechos=solicitud.hechos,
        ),
        engine=settings.engine_name,
    )
