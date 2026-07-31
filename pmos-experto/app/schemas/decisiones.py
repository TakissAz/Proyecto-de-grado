from typing import Any

from pydantic import BaseModel


class SolicitudDecision(BaseModel):
    modulo: str
    hechos: dict[str, Any]
    modelo_jdm: dict[str, Any]


class RespuestaDecision(BaseModel):
    modulo: str
    resultado: dict[str, Any]
    reglas_activadas: list[str]
    explicacion: list[str]
    engine: str
