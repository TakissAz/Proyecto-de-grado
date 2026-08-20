from datetime import datetime
from typing import Any

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def solicitud_pmos_fenotipo_a(
    diferenciales: bool = True,
) -> dict[str, bool]:
    return {
        "cumple_alteracion_ovulatoria": True,
        "cumple_hiperandrogenismo_clinico": True,
        "cumple_hiperandrogenismo_bioquimico": False,
        "cumple_morfologia_ovarica": True,
        "diagnosticos_diferenciales_descartados": diferenciales,
    }


def evaluar_pmos(diferenciales: bool = True) -> dict[str, Any]:
    response = client.post(
        "/api/v1/diagnostico/pmos",
        json=solicitud_pmos_fenotipo_a(diferenciales),
    )
    assert response.status_code == 200
    return response.json()


def evaluar_ri(**hechos: Any) -> dict[str, Any]:
    response = client.post(
        "/api/v1/diagnostico/resistencia-insulina",
        json=hechos,
    )
    assert response.status_code == 200
    return response.json()


def test_pmos_fenotipo_a_devuelve_trazabilidad_completa() -> None:
    body = evaluar_pmos()
    trazabilidad = body["trazabilidad"]

    assert trazabilidad["generado_por_motor_experto"] is True
    assert trazabilidad["hechos_utilizados"] == solicitud_pmos_fenotipo_a()
    assert trazabilidad["explicacion_experta"] == body["explicacion"]
    assert trazabilidad["recomendaciones_expertas"]
    assert trazabilidad["version_motor_experto"] == "pmos-rotterdam-v1"
    assert trazabilidad["estado_validacion_experta"] == "pendiente"
    datetime.fromisoformat(trazabilidad["evaluado_por_motor_experto_en"])


def test_pmos_fenotipo_a_incluye_reglas_activadas() -> None:
    reglas = evaluar_pmos()["trazabilidad"]["reglas_activadas"]

    assert "PMOS-HIPERANDROGENISMO" in reglas
    assert "PMOS-ROTTERDAM-CONFIRMADO" in reglas
    assert "PMOS-FENOTIPO-A" in reglas


def test_pmos_fenotipo_a_confianza_095() -> None:
    confianza = evaluar_pmos()["trazabilidad"]["confianza_experta"]

    assert confianza == 0.95


def test_pmos_diferenciales_pendientes_activa_regla() -> None:
    trazabilidad = evaluar_pmos(False)["trazabilidad"]

    assert "PMOS-DIFERENCIALES-PENDIENTES" in trazabilidad["reglas_activadas"]
    assert trazabilidad["confianza_experta"] == 0.60


def test_ri_moderada_devuelve_trazabilidad_completa() -> None:
    body = evaluar_ri(glucosa_ayunas=92, insulina_ayunas=15)
    trazabilidad = body["trazabilidad"]

    assert trazabilidad["generado_por_motor_experto"] is True
    assert trazabilidad["hechos_utilizados"]["glucosa_ayunas"] == 92
    assert trazabilidad["hechos_utilizados"]["insulina_ayunas"] == 15
    assert trazabilidad["explicacion_experta"] == body["explicacion"]
    assert trazabilidad["recomendaciones_expertas"]
    assert trazabilidad["version_motor_experto"] == "ri-homa-quicki-v1"
    assert trazabilidad["estado_validacion_experta"] == "pendiente"
    datetime.fromisoformat(trazabilidad["evaluado_por_motor_experto_en"])


def test_ri_moderada_incluye_reglas_activadas() -> None:
    reglas = evaluar_ri(
        glucosa_ayunas=92,
        insulina_ayunas=15,
    )["trazabilidad"]["reglas_activadas"]

    assert "RI-HOMA-IR-CALCULADO" in reglas
    assert "RI-HOMA-IR-ALTO" in reglas
    assert "RI-GRADO-MODERADA" in reglas


def test_ri_moderada_confianza_090() -> None:
    confianza = evaluar_ri(
        glucosa_ayunas=92,
        insulina_ayunas=15,
    )["trazabilidad"]["confianza_experta"]

    assert confianza == 0.90


def test_ri_sin_datos_suficientes_confianza_baja() -> None:
    body = evaluar_ri()
    trazabilidad = body["trazabilidad"]

    assert body["resultado"]["homa_ir"] is None
    assert body["resultado"]["resistencia_confirmada"] is False
    assert "RI-SIN-CONFIRMACION" in trazabilidad["reglas_activadas"]
    assert trazabilidad["confianza_experta"] == 0.40
