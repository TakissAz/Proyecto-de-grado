from typing import Any

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def modelo_jdm_simple() -> dict[str, Any]:
    return {
        "nodes": [
            {
                "id": "input",
                "type": "inputNode",
                "name": "Entrada",
                "position": {"x": 0, "y": 0},
                "content": {"schema": ""},
            },
            {
                "id": "criterio",
                "type": "expressionNode",
                "name": "Criterio",
                "position": {"x": 200, "y": 0},
                "content": {
                    "expressions": [
                        {
                            "id": "resultado",
                            "key": "criterio_pmos",
                            "value": (
                                "cumple_hiperandrogenismo and "
                                "cumple_alteracion_ovulatoria"
                            ),
                        }
                    ],
                    "passThrough": False,
                    "inputField": None,
                    "outputPath": None,
                    "executionMode": "single",
                },
            },
            {
                "id": "output",
                "type": "outputNode",
                "name": "Salida",
                "position": {"x": 400, "y": 0},
                "content": {"schema": ""},
            },
        ],
        "edges": [
            {
                "id": "entrada-criterio",
                "sourceId": "input",
                "targetId": "criterio",
                "sourceHandle": "output",
                "targetHandle": "input",
            },
            {
                "id": "criterio-salida",
                "sourceId": "criterio",
                "targetId": "output",
                "sourceHandle": "output",
                "targetHandle": "input",
            },
        ],
    }


def test_health_responde_status_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "pmos-experto",
        "engine": "zen-engine",
    }


def test_evaluar_decision_jdm_simple() -> None:
    response = client.post(
        "/api/v1/decisiones/evaluar",
        json={
            "modulo": "pmos",
            "hechos": {
                "cumple_hiperandrogenismo": True,
                "cumple_alteracion_ovulatoria": True,
            },
            "modelo_jdm": modelo_jdm_simple(),
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["engine"] == "zen-engine"
    assert body["resultado"] == {"criterio_pmos": True}
    assert body["reglas_activadas"] == []
    assert body["explicacion"] == [
        (
            "El motor ZEN Engine evaluó el modelo de decisión "
            "para el módulo pmos."
        ),
        "La decisión se generó a partir de los hechos enviados.",
    ]
