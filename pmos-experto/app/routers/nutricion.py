from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas.nutricion import SolicitudNutricionExperta, RespuestaNutricionExperta
from app.services.nutricion_service import NutricionService
from app.services.zen_service import ZenDecisionError


router = APIRouter()
nutricion_service = NutricionService()


@router.post("/recomendacion-base", response_model=RespuestaNutricionExperta)
def recomendar_nutricion_base(
    solicitud: SolicitudNutricionExperta,
) -> RespuestaNutricionExperta:
    try:
        resultado = nutricion_service.evaluar(solicitud.hechos)
    except ZenDecisionError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return RespuestaNutricionExperta(
        resultado=resultado,
        trazabilidad=nutricion_service.generar_trazabilidad(
            solicitud.hechos, resultado
        ).model_dump(),
        engine=settings.engine_name,
        version_modelo=nutricion_service.VERSION_MODELO,
    )
