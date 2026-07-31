import json

import zen as zen_engine


decision_model = {
    "nodes": [
        {
            "id": "input",
            "type": "inputNode",
            "name": "Entrada",
            "position": {"x": 0, "y": 0},
            "content": {"schema": ""},
        },
        {
            "id": "criterio-pmos",
            "type": "expressionNode",
            "name": "Criterio PMOS",
            "position": {"x": 200, "y": 0},
            "content": {
                "expressions": [
                    {
                        "id": "criterio",
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
            "id": "input-a-criterio",
            "sourceId": "input",
            "targetId": "criterio-pmos",
            "sourceHandle": "output",
            "targetHandle": "input",
        },
        {
            "id": "criterio-a-output",
            "sourceId": "criterio-pmos",
            "targetId": "output",
            "sourceHandle": "output",
            "targetHandle": "input",
        },
    ],
}

patient_data = {
    "cumple_hiperandrogenismo": True,
    "cumple_alteracion_ovulatoria": True,
}

engine = zen_engine.ZenEngine()
decision = engine.create_decision(json.dumps(decision_model))
response = decision.evaluate(patient_data)
result = response["result"]

if result != {"criterio_pmos": True}:
    raise AssertionError(f"Resultado inesperado: {result!r}")

print("zen-engine OK")
