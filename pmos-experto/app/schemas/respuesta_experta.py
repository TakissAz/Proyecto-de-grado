from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


def fecha_evaluacion_actual() -> str:
    return datetime.now(timezone.utc).isoformat()


class TrazabilidadExperta(BaseModel):
    generado_por_motor_experto: bool = True
    hechos_utilizados: dict[str, Any]
    reglas_activadas: list[str]
    explicacion_experta: list[str]
    recomendaciones_expertas: list[str]
    confianza_experta: float
    version_motor_experto: str
    evaluado_por_motor_experto_en: str = Field(
        default_factory=fecha_evaluacion_actual
    )
    estado_validacion_experta: str = "pendiente"
