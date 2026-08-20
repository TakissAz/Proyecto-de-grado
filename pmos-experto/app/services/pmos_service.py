import json
from pathlib import Path
from typing import Any

from app.schemas.respuesta_experta import TrazabilidadExperta
from app.services.zen_service import ZenDecisionError, ZenDecisionService


class PmosService:
    VERSION_MODELO = "pmos-rotterdam-v1"
    RUTA_MODELO = Path(__file__).resolve().parents[1] / "jdm" / "pmos_rotterdam.json"

    def __init__(self, zen_service: ZenDecisionService | None = None) -> None:
        self.zen_service = zen_service or ZenDecisionService()

    def evaluar(self, hechos: dict[str, bool]) -> dict[str, Any]:
        try:
            modelo_jdm = json.loads(self.RUTA_MODELO.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ZenDecisionError(
                f"No se pudo cargar el modelo JDM de PMOS: {error}"
            ) from error

        resultado = self.zen_service.evaluar(modelo_jdm=modelo_jdm, hechos=hechos)
        resultado.setdefault("fenotipo_pmos", None)
        return resultado

    @staticmethod
    def generar_explicacion(resultado: dict[str, Any]) -> list[str]:
        total = resultado["total_criterios_rotterdam"]
        diferenciales = resultado["diagnosticos_diferenciales_descartados"]
        confirmado = resultado["diagnostico_confirmado"]
        fenotipo = resultado.get("fenotipo_pmos")

        explicacion = [
            f"La paciente cumple {total} criterio(s) de Rotterdam.",
            (
                "Los diagnósticos diferenciales fueron descartados."
                if diferenciales
                else "Los diagnósticos diferenciales aún no fueron descartados."
            ),
            (
                "El diagnóstico de PMOS queda confirmado."
                if confirmado
                else "El diagnóstico de PMOS queda en estudio."
            ),
        ]
        if fenotipo:
            explicacion.append(f"El patrón corresponde al fenotipo PMOS {fenotipo}.")

        return explicacion

    @classmethod
    def generar_trazabilidad(
        cls,
        hechos: dict[str, bool],
        resultado: dict[str, Any],
        explicacion: list[str],
    ) -> TrazabilidadExperta:
        reglas = []
        if resultado["cumple_hiperandrogenismo"]:
            reglas.append("PMOS-HIPERANDROGENISMO")
        if resultado["diagnostico_confirmado"]:
            reglas.append("PMOS-ROTTERDAM-CONFIRMADO")
        if resultado.get("fenotipo_pmos"):
            reglas.append(f"PMOS-FENOTIPO-{resultado['fenotipo_pmos']}")
        if not resultado["diagnosticos_diferenciales_descartados"]:
            reglas.append("PMOS-DIFERENCIALES-PENDIENTES")

        total = resultado["total_criterios_rotterdam"]
        diferenciales = resultado["diagnosticos_diferenciales_descartados"]
        confirmado = resultado["diagnostico_confirmado"]
        if confirmado and total == 3 and diferenciales:
            confianza = 0.95
        elif confirmado and total == 2 and diferenciales:
            confianza = 0.90
        elif total >= 2 and not diferenciales:
            confianza = 0.60
        else:
            confianza = 0.40

        recomendaciones = (
            ["Validar el resultado del motor experto con el profesional tratante."]
            if confirmado
            else ["Completar la evaluación clínica antes de confirmar el diagnóstico."]
        )

        return TrazabilidadExperta(
            hechos_utilizados=hechos,
            reglas_activadas=reglas,
            explicacion_experta=explicacion,
            recomendaciones_expertas=recomendaciones,
            confianza_experta=confianza,
            version_motor_experto=cls.VERSION_MODELO,
        )