from typing import Any

from pydantic import BaseModel

from app.schemas.respuesta_experta import TrazabilidadExperta


class SolicitudDiagnosticoPmos(BaseModel):
    cumple_alteracion_ovulatoria: bool
    cumple_hiperandrogenismo_clinico: bool
    cumple_hiperandrogenismo_bioquimico: bool
    cumple_morfologia_ovarica: bool
    diagnosticos_diferenciales_descartados: bool


class RespuestaDiagnosticoPmos(BaseModel):
    resultado: dict[str, Any]
    explicacion: list[str]
    trazabilidad: TrazabilidadExperta
    engine: str
    version_modelo: str