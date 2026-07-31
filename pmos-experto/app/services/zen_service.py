import json
from typing import Any

import zen as zen_engine


class ZenDecisionError(RuntimeError):
    """Error legible producido al cargar o evaluar una decisión JDM."""


class ZenDecisionService:
    def evaluar(
        self,
        modelo_jdm: dict[str, Any],
        hechos: dict[str, Any],
    ) -> dict[str, Any]:
        try:
            engine = zen_engine.ZenEngine()
            decision = engine.create_decision(json.dumps(modelo_jdm))
            respuesta = decision.evaluate(hechos)
            resultado = respuesta.get("result")
        except Exception as error:
            raise ZenDecisionError(
                f"No se pudo evaluar el modelo JDM con ZEN Engine: {error}"
            ) from error

        if not isinstance(resultado, dict):
            raise ZenDecisionError(
                "ZEN Engine no devolvió un objeto en el campo 'result'."
            )

        return resultado
