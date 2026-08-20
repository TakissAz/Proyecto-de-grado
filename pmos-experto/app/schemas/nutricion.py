from typing import Any

from pydantic import BaseModel


class SolicitudNutricionExperta(BaseModel):
    hechos: dict[str, Any]


class RespuestaNutricionExperta(BaseModel):
    resultado: dict[str, Any]
    trazabilidad: dict[str, Any]
    engine: str
    version_modelo: str
