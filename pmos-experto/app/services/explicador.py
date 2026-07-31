from typing import Any


def generar_explicacion(
    modulo: str,
    resultado: dict[str, Any],
    hechos: dict[str, Any],
) -> list[str]:
    del resultado, hechos
    return [
        (
            "El motor ZEN Engine evaluó el modelo de decisión "
            f"para el módulo {modulo}."
        ),
        "La decisión se generó a partir de los hechos enviados.",
    ]
