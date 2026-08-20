from typing import Any

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)
ENDPOINT = "/api/v1/diagnostico/pmos"


def hechos_base(**cambios: bool) -> dict[str, bool]:
    hechos = {
        "cumple_alteracion_ovulatoria": False,
        "cumple_hiperandrogenismo_clinico": False,
        "cumple_hiperandrogenismo_bioquimico": False,
        "cumple_morfologia_ovarica": False,
        "diagnosticos_diferenciales_descartados": True,
    }
    hechos.update(cambios)
    return hechos


def evaluar(**hechos: bool) -> dict[str, Any]:
    response = client.post(ENDPOINT, json=hechos_base(**hechos))
    assert response.status_code == 200
    body = response.json()
    assert body["engine"] == "zen-engine"
    assert body["version_modelo"] == "pmos-rotterdam-v1"
    assert body["explicacion"]
    return body["resultado"]


def test_fenotipo_a_confirma_pmos() -> None:
    resultado = evaluar(
        cumple_alteracion_ovulatoria=True,
        cumple_hiperandrogenismo_clinico=True,
        cumple_morfologia_ovarica=True,
    )

    assert resultado == {
        "cumple_hiperandrogenismo": True,
        "total_criterios_rotterdam": 3,
        "diagnostico_confirmado": True,
        "fenotipo_pmos": "A",
        "conclusion": "Compatible con PMOS fenotipo A",
        "criterios_cumplidos": [
            "alteracion_ovulatoria",
            "hiperandrogenismo",
            "morfologia_ovarica",
        ],
        "diagnosticos_diferenciales_descartados": True,
    }


def test_fenotipo_b_confirma_pmos() -> None:
    resultado = evaluar(
        cumple_alteracion_ovulatoria=True,
        cumple_hiperandrogenismo_bioquimico=True,
    )

    assert resultado["diagnostico_confirmado"] is True
    assert resultado["fenotipo_pmos"] == "B"
    assert resultado["total_criterios_rotterdam"] == 2


def test_fenotipo_c_confirma_pmos() -> None:
    resultado = evaluar(
        cumple_hiperandrogenismo_clinico=True,
        cumple_morfologia_ovarica=True,
    )

    assert resultado["diagnostico_confirmado"] is True
    assert resultado["fenotipo_pmos"] == "C"
    assert resultado["total_criterios_rotterdam"] == 2


def test_fenotipo_d_confirma_pmos() -> None:
    resultado = evaluar(
        cumple_alteracion_ovulatoria=True,
        cumple_morfologia_ovarica=True,
    )

    assert resultado["diagnostico_confirmado"] is True
    assert resultado["fenotipo_pmos"] == "D"
    assert resultado["total_criterios_rotterdam"] == 2


def test_diferenciales_no_descartados_no_confirma_pmos() -> None:
    resultado = evaluar(
        cumple_alteracion_ovulatoria=True,
        cumple_hiperandrogenismo_clinico=True,
        cumple_morfologia_ovarica=True,
        diagnosticos_diferenciales_descartados=False,
    )

    assert resultado["total_criterios_rotterdam"] == 3
    assert resultado["diagnostico_confirmado"] is False
    assert resultado["fenotipo_pmos"] is None
    assert resultado["conclusion"] == (
        "PMOS en estudio: pendiente de descarte diferencial"
    )
