from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)
ENDPOINT = "/api/v1/diagnostico/resistencia-insulina"


def evaluar(**hechos: Any) -> dict[str, Any]:
    response = client.post(ENDPOINT, json=hechos)
    assert response.status_code == 200
    body = response.json()
    assert body["engine"] == "zen-engine"
    assert body["version_modelo"] == "ri-homa-quicki-v1"
    assert body["explicacion"]
    return body["resultado"]


def test_resistencia_moderada_calcula_homa_ir_y_quicki() -> None:
    resultado = evaluar(glucosa_ayunas=92, insulina_ayunas=15)

    assert resultado["homa_ir"] == pytest.approx(3.4074, rel=1e-4)
    assert resultado["quicki"] == pytest.approx(0.3185, rel=1e-3)
    assert resultado["resistencia_confirmada"] is True
    assert resultado["grado_resistencia"] == "moderada"
    assert resultado["conclusion"] == (
        "Compatible con resistencia a la insulina moderada"
    )


def test_resistencia_leve() -> None:
    resultado = evaluar(homa_ir=2.7)

    assert resultado["resistencia_confirmada"] is True
    assert resultado["grado_resistencia"] == "leve"
    assert resultado["conclusion"] == "Compatible con resistencia a la insulina leve"


def test_resistencia_severa() -> None:
    resultado = evaluar(homa_ir=5.3)

    assert resultado["resistencia_confirmada"] is True
    assert resultado["grado_resistencia"] == "severa"
    assert resultado["conclusion"] == (
        "Compatible con resistencia a la insulina severa"
    )


def test_sin_resistencia_a_la_insulina() -> None:
    resultado = evaluar(homa_ir=1.8)

    assert resultado["resistencia_confirmada"] is False
    assert resultado["grado_resistencia"] == "no_confirmada"
    assert resultado["conclusion"] == (
        "No compatible con resistencia a la insulina"
    )


def test_riesgo_cardiometabolico_alto() -> None:
    resultado = evaluar(trigliceridos=170, hdl=42)

    assert resultado["riesgo_cardiometabolico"] == "alto"
