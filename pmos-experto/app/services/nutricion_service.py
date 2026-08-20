import json
from pathlib import Path
from typing import Any

from app.schemas.respuesta_experta import TrazabilidadExperta
from app.services.zen_service import ZenDecisionError, ZenDecisionService


class NutricionService:
    VERSION_MODELO = "nutricion-base-v1"
    RUTA_MODELO = Path(__file__).resolve().parents[1] / "jdm" / "nutricion_base.json"

    def __init__(self, zen_service: ZenDecisionService | None = None) -> None:
        self.zen_service = zen_service or ZenDecisionService()

    def evaluar(self, hechos: dict[str, Any]) -> dict[str, Any]:
        try:
            modelo_jdm = json.loads(self.RUTA_MODELO.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ZenDecisionError(
                f"No se pudo cargar el modelo JDM nutricional: {error}"
            ) from error

        resultado = self.zen_service.evaluar(modelo_jdm=modelo_jdm, hechos=hechos)
        return self._incorporar_contexto_paciente(resultado, hechos)

    @staticmethod
    def _lista(valor: Any) -> list[str]:
        if not isinstance(valor, list):
            return []
        return list(dict.fromkeys(str(item).strip() for item in valor if str(item).strip()))

    @classmethod
    def _incorporar_contexto_paciente(
        cls, resultado: dict[str, Any], hechos: dict[str, Any]
    ) -> dict[str, Any]:
        restricciones = cls._lista(resultado.get("restricciones"))
        for campo in (
            "alergias", "intolerancias", "alimentos_restringidos",
            "alimentos_no_tolerados", "alimentos_rechazados",
        ):
            for valor in cls._lista(hechos.get(campo)):
                if valor not in restricciones:
                    restricciones.append(valor)

        bloqueados = [valor.casefold() for valor in restricciones]

        def compatible(valor: str) -> bool:
            normalizado = valor.casefold()
            return not any(
                bloqueo in normalizado or normalizado in bloqueo
                for bloqueo in bloqueados
            )

        recomendaciones = cls._lista(resultado.get("recomendaciones"))
        preferencias = (
            ("alimentos_preferidos", "Priorizar alimentos preferidos compatibles"),
            ("comidas_preferidas", "Adaptar comidas preferidas compatibles"),
            ("preparaciones_preferidas", "Usar preparaciones preferidas"),
        )
        for campo, etiqueta in preferencias:
            valores = [v for v in cls._lista(hechos.get(campo)) if compatible(v)]
            if valores:
                recomendaciones.append(f"{etiqueta}: {', '.join(valores)}.")

        if hechos.get("hambre_nocturna") is True:
            recomendaciones.append("Reforzar la saciedad de la cena y revisar el hambre nocturna.")
        if hechos.get("consume_desayuno") is False:
            recomendaciones.append("Incorporar un desayuno equilibrado dentro de los cuatro tiempos de comida.")
        if hechos.get("horarios_regulares") is False:
            recomendaciones.append("Establecer horarios regulares para desayuno, almuerzo, merienda y cena.")

        resultado["restricciones"] = list(dict.fromkeys(restricciones))
        resultado["recomendaciones"] = list(dict.fromkeys(recomendaciones))
        return resultado

    @staticmethod
    def _es_alto(valor: Any) -> bool:
        return str(valor or "").lower() in {
            "alto", "alta", "frecuente", "muy_alto", "muy_alta"
        }

    @classmethod
    def generar_reglas_activadas(cls, hechos: dict[str, Any]) -> list[str]:
        reglas: list[str] = []
        if hechos.get("resistencia_insulina_confirmada") is True:
            reglas.append("NUT-RI-BAJO-IG")
        if str(hechos.get("grado_resistencia") or "").lower() == "severa":
            reglas.append("NUT-RI-SEVERA")
        if hechos.get("diagnostico_pmos_confirmado") is True:
            reglas.append("NUT-PMOS-ANTIINFLAMATORIO")
        if str(hechos.get("objetivo_principal") or "").lower() == "perdida_peso":
            reglas.append("NUT-PERDIDA-PESO")
        if isinstance(hechos.get("imc"), (int, float)) and hechos["imc"] >= 30:
            reglas.append("NUT-IMC-OBESIDAD")
        if cls._es_alto(hechos.get("consumo_azucar")) or cls._es_alto(
            hechos.get("consumo_bebidas_azucaradas")
        ):
            reglas.append("NUT-AZUCAR-ALTO")
        if cls._es_alto(hechos.get("consumo_ultraprocesados")):
            reglas.append("NUT-ULTRAPROCESADOS-ALTO")
        if hechos.get("ansiedad_por_comida") is True:
            reglas.append("NUT-ANSIEDAD-COMIDA")
        if hechos.get("cena_tardia") is True:
            reglas.append("NUT-CENA-TARDIA")
        if any(hechos.get(campo) for campo in (
            "alergias", "intolerancias", "alimentos_restringidos",
            "alimentos_no_tolerados", "alimentos_rechazados",
        )):
            reglas.append("NUT-RESTRICCIONES-PACIENTE")
        return reglas

    @staticmethod
    def calcular_confianza(hechos: dict[str, Any]) -> float:
        tiene_diagnostico = (
            hechos.get("diagnostico_pmos_confirmado") is True
            or hechos.get("resistencia_insulina_confirmada") is True
        )
        campos_nutricionales = (
            "imc", "nivel_actividad", "objetivo_principal", "calorias_objetivo",
            "proteinas_diarias", "carbohidratos_diarias", "grasas_diarias",
            "fibra_diaria",
        )
        completos = all(hechos.get(campo) is not None for campo in campos_nutricionales)
        cantidad = sum(hechos.get(campo) is not None for campo in campos_nutricionales)
        if tiene_diagnostico and completos:
            return 0.90
        if tiene_diagnostico:
            return 0.80
        if cantidad >= 3:
            return 0.70
        return 0.50

    @classmethod
    def generar_trazabilidad(
        cls, hechos: dict[str, Any], resultado: dict[str, Any]
    ) -> TrazabilidadExperta:
        enfoque = resultado.get("enfoque_nutricional_experto", "no determinado")
        explicacion = [
            f"ZEN Engine determinó el enfoque nutricional base: {enfoque}.",
            "La recomendación integra los antecedentes endocrinológicos y nutricionales disponibles.",
        ]
        return TrazabilidadExperta(
            hechos_utilizados=hechos,
            reglas_activadas=cls.generar_reglas_activadas(hechos),
            explicacion_experta=explicacion,
            recomendaciones_expertas=resultado.get("recomendaciones", []),
            confianza_experta=cls.calcular_confianza(hechos),
            version_motor_experto=cls.VERSION_MODELO,
        )
