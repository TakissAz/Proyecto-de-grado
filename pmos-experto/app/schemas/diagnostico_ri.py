from typing import Any

from pydantic import BaseModel

from app.schemas.respuesta_experta import TrazabilidadExperta


class SolicitudDiagnosticoRi(BaseModel):
    glucosa_ayunas: float | None = None
    insulina_ayunas: float | None = None
    homa_ir: float | None = None
    quicki: float | None = None
    hemoglobina_glicosilada: float | None = None
    trigliceridos: float | None = None
    hdl: float | None = None
    acantosis_nigricans: bool = False
    obesidad_abdominal: bool = False


class RespuestaDiagnosticoRi(BaseModel):
    resultado: dict[str, Any]
    explicacion: list[str]
    trazabilidad: TrazabilidadExperta
    engine: str
    version_modelo: str