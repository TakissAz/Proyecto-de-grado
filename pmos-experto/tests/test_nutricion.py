from typing import Any

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)
ENDPOINT = "/api/v1/nutricion/recomendacion-base"


def evaluar(**hechos: Any) -> dict[str, Any]:
    response = client.post(ENDPOINT, json={"hechos": hechos})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["engine"] == "zen-engine"
    assert body["version_modelo"] == "nutricion-base-v1"
    return body


def test_ri_confirmada_devuelve_enfoque_bajo_indice_glucemico() -> None:
    resultado = evaluar(resistencia_insulina_confirmada=True)["resultado"]

    assert resultado["enfoque_nutricional_experto"] == (
        "bajo_indice_glucemico_alto_fibra"
    )
    assert resultado["fibra_sugerida"] >= 30


def test_ri_severa_ajusta_macronutrientes() -> None:
    resultado = evaluar(
        resistencia_insulina_confirmada=True,
        grado_resistencia="severa",
    )["resultado"]

    assert resultado["carbohidratos_porcentaje"] == 30
    assert resultado["proteinas_porcentaje"] == 30
    assert resultado["grasas_porcentaje"] == 40
    assert resultado["alertas"]


def test_pmos_confirmado_agrega_enfoque_y_recomendacion_antiinflamatoria() -> None:
    resultado = evaluar(diagnostico_pmos_confirmado=True)["resultado"]

    assert resultado["enfoque_nutricional_experto"] == (
        "antiinflamatorio_bajo_indice_glucemico"
    )
    assert any("antiinflamatorios" in item for item in resultado["recomendaciones"])


def test_perdida_peso_respeta_minimo_de_1200_kcal() -> None:
    resultado = evaluar(
        objetivo_principal="perdida_peso", calorias_objetivo=1050
    )["resultado"]
    assert resultado["calorias_sugeridas"] == 1200

    resultado_con_meta = evaluar(
        objetivo_principal="perdida_peso", calorias_objetivo=1650
    )["resultado"]
    assert resultado_con_meta["calorias_sugeridas"] == 1650


def test_consumo_alto_azucar_agrega_restriccion() -> None:
    resultado = evaluar(consumo_azucar="alto")["resultado"]

    assert any("Azucares simples" in item for item in resultado["restricciones"])


def test_incorpora_todas_las_restricciones_del_paciente() -> None:
    resultado = evaluar(
        alergias=["mani"],
        intolerancias=["lactosa"],
        alimentos_restringidos=["gluten"],
        alimentos_no_tolerados=["cebolla"],
        alimentos_rechazados=["pescado"],
    )["resultado"]

    assert set(["mani", "lactosa", "gluten", "cebolla", "pescado"]).issubset(
        resultado["restricciones"]
    )


def test_respuesta_incluye_trazabilidad_y_reglas_activadas() -> None:
    body = evaluar(
        resistencia_insulina_confirmada=True,
        diagnostico_pmos_confirmado=True,
        consumo_ultraprocesados="alto",
        ansiedad_por_comida=True,
        cena_tardia=True,
        alergias=["nueces"],
    )

    trazabilidad = body["trazabilidad"]
    assert trazabilidad["generado_por_motor_experto"] is True
    assert trazabilidad["estado_validacion_experta"] == "pendiente"
    assert trazabilidad["version_motor_experto"] == "nutricion-base-v1"
    assert "NUT-RI-BAJO-IG" in trazabilidad["reglas_activadas"]
    assert "NUT-PMOS-ANTIINFLAMATORIO" in trazabilidad["reglas_activadas"]
    assert "NUT-RESTRICCIONES-PACIENTE" in trazabilidad["reglas_activadas"]
    assert trazabilidad["explicacion_experta"]


def test_cada_tipo_de_restriccion_aparece_en_resultado() -> None:
    resultado = evaluar(
        alergias=["mani"], intolerancias=["lactosa"],
        alimentos_restringidos=["azucar"], alimentos_no_tolerados=["cebolla"],
        alimentos_rechazados=["pescado"],
    )["resultado"]
    for valor in ("mani", "lactosa", "azucar", "cebolla", "pescado"):
        assert valor in resultado["restricciones"]


def test_preferencias_compatibles_aparecen_en_recomendaciones() -> None:
    resultado = evaluar(
        alimentos_preferidos=["avena", "pollo"],
        comidas_preferidas=["ensalada con pollo"],
        preparaciones_preferidas=["al horno"],
    )["resultado"]
    texto = " ".join(resultado["recomendaciones"]).lower()
    assert "avena" in texto
    assert "ensalada con pollo" in texto
    assert "al horno" in texto


def test_no_recomienda_preferencia_restringida() -> None:
    resultado = evaluar(
        alergias=["mani"],
        alimentos_preferidos=["mani", "avena"],
    )["resultado"]
    recomendaciones = " ".join(resultado["recomendaciones"]).lower()
    assert "avena" in recomendaciones
    assert "mani" not in recomendaciones


def test_habitos_alterados_generan_recomendaciones() -> None:
    resultado = evaluar(
        horarios_regulares=False, consume_desayuno=False, hambre_nocturna=True
    )["resultado"]
    texto = " ".join(resultado["recomendaciones"]).lower()
    assert "horarios regulares" in texto
    assert "desayuno" in texto
    assert "hambre nocturna" in texto
