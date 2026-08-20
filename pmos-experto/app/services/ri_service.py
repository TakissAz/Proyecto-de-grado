import json
import math
from pathlib import Path
from typing import Any

from app.schemas.respuesta_experta import TrazabilidadExperta
from app.services.zen_service import ZenDecisionError, ZenDecisionService


class RiService:
    VERSION_MODELO = "ri-homa-quicki-v1"
    RUTA_MODELO = (
        Path(__file__).resolve().parents[1] / "jdm" / "resistencia_insulina.json"
    )

    def __init__(self, zen_service: ZenDecisionService | None = None) -> None:
        self.zen_service = zen_service or ZenDecisionService()

    @staticmethod
    def preparar_hechos(hechos: dict[str, Any]) -> dict[str, Any]:
        preparados = hechos.copy()
        glucosa = preparados.get("glucosa_ayunas")
        insulina = preparados.get("insulina_ayunas")
        valores_validos = (
            isinstance(glucosa, (int, float))
            and isinstance(insulina, (int, float))
            and glucosa > 0
            and insulina > 0
        )

        if preparados.get("homa_ir") is None and valores_validos:
            preparados["homa_ir"] = (glucosa * insulina) / 405

        if preparados.get("quicki") is None and valores_validos:
            denominador = math.log10(glucosa) + math.log10(insulina)
            if denominador > 0:
                preparados["quicki"] = 1 / denominador

        return preparados

    def evaluar(self, hechos: dict[str, Any]) -> dict[str, Any]:
        try:
            modelo_jdm = json.loads(self.RUTA_MODELO.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ZenDecisionError(
                f"No se pudo cargar el modelo JDM de resistencia a la insulina: {error}"
            ) from error

        preparados = self.preparar_hechos(hechos)
        resultado = self.zen_service.evaluar(
            modelo_jdm=modelo_jdm,
            hechos=preparados,
        )
        resultado.setdefault("homa_ir", None)
        resultado.setdefault("quicki", None)
        return resultado

    @staticmethod
    def generar_explicacion(resultado: dict[str, Any]) -> list[str]:
        homa_ir = resultado.get("homa_ir")
        quicki = resultado.get("quicki")
        confirmado = resultado["resistencia_confirmada"]

        explicacion = []
        if homa_ir is not None:
            explicacion.append(f"El valor HOMA-IR evaluado es {homa_ir:.2f}.")
        else:
            explicacion.append("No fue posible determinar el valor HOMA-IR.")

        if quicki is not None:
            explicacion.append(f"El valor QUICKI evaluado es {quicki:.4f}.")
        else:
            explicacion.append("No fue posible determinar el valor QUICKI.")

        explicacion.extend(
            [
                (
                    "La resistencia a la insulina está confirmada."
                    if confirmado
                    else "La resistencia a la insulina no está confirmada."
                ),
                f"El grado de resistencia es {resultado['grado_resistencia']}.",
                f"El riesgo de diabetes es {resultado['riesgo_diabetes']}.",
                (
                    "El riesgo cardiometabólico es "
                    f"{resultado['riesgo_cardiometabolico']}."
                ),
            ]
        )
        return explicacion

    @classmethod
    def generar_trazabilidad(
        cls,
        hechos: dict[str, Any],
        resultado: dict[str, Any],
        explicacion: list[str],
    ) -> TrazabilidadExperta:
        reglas = []
        homa_ir = resultado.get("homa_ir")
        homa_calculado = (
            hechos.get("homa_ir") is None
            and homa_ir is not None
            and hechos.get("glucosa_ayunas") is not None
            and hechos.get("insulina_ayunas") is not None
        )
        if homa_calculado:
            reglas.append("RI-HOMA-IR-CALCULADO")
        if homa_ir is not None and homa_ir >= 2.5:
            reglas.append("RI-HOMA-IR-ALTO")

        grado = resultado["grado_resistencia"]
        regla_grado = {
            "leve": "RI-GRADO-LEVE",
            "moderada": "RI-GRADO-MODERADA",
            "severa": "RI-GRADO-SEVERA",
        }.get(grado)
        if regla_grado:
            reglas.append(regla_grado)
        if not resultado["resistencia_confirmada"]:
            reglas.append("RI-SIN-CONFIRMACION")
        if resultado["riesgo_cardiometabolico"] == "alto":
            reglas.append("RI-RIESGO-CARDIOMETABOLICO-ALTO")

        if homa_ir is None:
            confianza = 0.40
        elif homa_ir >= 5.0:
            confianza = 0.95
        elif homa_ir >= 3.0:
            confianza = 0.90
        elif homa_ir >= 2.5:
            confianza = 0.85
        else:
            confianza = 0.55

        recomendaciones = (
            ["Validar el resultado metabólico con el profesional tratante."]
            if homa_ir is not None
            else ["Completar glucosa e insulina de ayuno para calcular HOMA-IR."]
        )

        return TrazabilidadExperta(
            hechos_utilizados=hechos,
            reglas_activadas=reglas,
            explicacion_experta=explicacion,
            recomendaciones_expertas=recomendaciones,
            confianza_experta=confianza,
            version_motor_experto=cls.VERSION_MODELO,
        )