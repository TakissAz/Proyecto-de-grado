# PMOS Experto API

Microservicio experto basado en FastAPI y modelos de decisión JDM evaluados
con ZEN Engine.

## Decisión técnica

ZEN Engine reemplaza definitivamente las pruebas anteriores con Experta y
Durable Rules. La compatibilidad de `zen-engine` 0.53.0 fue validada en Windows
con Python 3.13.6.

Esta fase expone una API genérica capaz de evaluar cualquier modelo JDM válido.
Todavía no contiene reglas clínicas definitivas, integración con Laravel ni
modelos de Random Forest.

## Preparar el entorno

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
python --version
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

## Ejecutar pruebas

```powershell
python -m pytest
```

## Levantar la API

```powershell
uvicorn app.main:app --reload --port 8001
```

Una vez iniciada, la API queda disponible en `http://127.0.0.1:8001`.

## Endpoints

- `GET /`
- `GET /health`
- `POST /api/v1/decisiones/evaluar`
- Swagger UI: `GET /docs`

El endpoint de evaluación recibe:

```json
{
  "modulo": "pmos",
  "hechos": {},
  "modelo_jdm": {}
}
```

La respuesta incluye el resultado de ZEN Engine, una explicación básica y una
lista vacía de reglas activadas hasta que exista trazabilidad real del modelo.