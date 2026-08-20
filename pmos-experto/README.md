# PMOS Experto API

Microservicio experto basado en FastAPI y modelos de decisión JDM evaluados
con ZEN Engine.

## Decisión técnica

ZEN Engine reemplaza definitivamente las pruebas anteriores con Experta y
Durable Rules. La compatibilidad de `zen-engine` 0.53.0 fue validada en Windows
con Python 3.13.6.

Esta fase expone una API genérica capaz de evaluar cualquier modelo JDM válido.
Incluye reglas clínicas iniciales para PMOS y resistencia a la insulina.
Todavía no contiene integración con Laravel ni modelos de Random Forest.

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
## Diagnóstico PMOS Rotterdam

El endpoint `POST /api/v1/diagnostico/pmos` evalúa los criterios Rotterdam con
el modelo JDM `app/jdm/pmos_rotterdam.json`.

### Hechos requeridos

- `cumple_alteracion_ovulatoria`
- `cumple_hiperandrogenismo_clinico`
- `cumple_hiperandrogenismo_bioquimico`
- `cumple_morfologia_ovarica`
- `diagnosticos_diferenciales_descartados`

### Ejemplo de request

```json
{
  "cumple_alteracion_ovulatoria": true,
  "cumple_hiperandrogenismo_clinico": true,
  "cumple_hiperandrogenismo_bioquimico": false,
  "cumple_morfologia_ovarica": true,
  "diagnosticos_diferenciales_descartados": true
}
```

### Ejemplo de response

```json
{
  "resultado": {
    "cumple_hiperandrogenismo": true,
    "total_criterios_rotterdam": 3,
    "diagnostico_confirmado": true,
    "fenotipo_pmos": "A",
    "conclusion": "Compatible con PMOS fenotipo A",
    "criterios_cumplidos": [
      "alteracion_ovulatoria",
      "hiperandrogenismo",
      "morfologia_ovarica"
    ],
    "diagnosticos_diferenciales_descartados": true
  },
  "explicacion": [
    "La paciente cumple 3 criterio(s) de Rotterdam.",
    "Los diagnósticos diferenciales fueron descartados.",
    "El diagnóstico de PMOS queda confirmado.",
    "El patrón corresponde al fenotipo PMOS A."
  ],
  "engine": "zen-engine",
  "version_modelo": "pmos-rotterdam-v1"
}
```

Ejecutar todas las pruebas con:

```powershell
python -m pytest
```
## Diagnóstico de Resistencia a la Insulina

El endpoint `POST /api/v1/diagnostico/resistencia-insulina` evalúa indicadores
metabólicos mediante `app/jdm/resistencia_insulina.json`.

### Hechos admitidos

- `glucosa_ayunas`
- `insulina_ayunas`
- `homa_ir`
- `quicki`
- `hemoglobina_glicosilada`
- `trigliceridos`
- `hdl`
- `acantosis_nigricans`
- `obesidad_abdominal`

Los indicadores numéricos son opcionales. Si HOMA-IR o QUICKI no son enviados,
se calculan cuando existen glucosa e insulina de ayuno válidas.

### Ejemplo de request

```json
{
  "glucosa_ayunas": 92,
  "insulina_ayunas": 15,
  "homa_ir": null,
  "quicki": null,
  "hemoglobina_glicosilada": null,
  "trigliceridos": 170,
  "hdl": 42,
  "acantosis_nigricans": false,
  "obesidad_abdominal": false
}
```

### Ejemplo de response

```json
{
  "resultado": {
    "homa_ir": 3.4074074074074074,
    "quicki": 0.3184836015918521,
    "resistencia_confirmada": true,
    "grado_resistencia": "moderada",
    "riesgo_diabetes": "moderado",
    "riesgo_cardiometabolico": "alto",
    "conclusion": "Compatible con resistencia a la insulina moderada",
    "acantosis_nigricans": false,
    "obesidad_abdominal": false
  },
  "explicacion": [
    "El valor HOMA-IR evaluado es 3.41.",
    "El valor QUICKI evaluado es 0.3185.",
    "La resistencia a la insulina está confirmada.",
    "El grado de resistencia es moderada.",
    "El riesgo de diabetes es moderado.",
    "El riesgo cardiometabólico es alto."
  ],
  "engine": "zen-engine",
  "version_modelo": "ri-homa-quicki-v1"
}
```

Ejecutar todas las pruebas con:

```powershell
python -m pytest
```
## Trazabilidad experta

Los endpoints PMOS y RI mantienen `resultado`, `explicacion`, `engine` y
`version_modelo`, y agregan `trazabilidad` con campos preparados para Laravel:
`generado_por_motor_experto`, `hechos_utilizados`, `reglas_activadas`,
`explicacion_experta`, `recomendaciones_expertas`, `confianza_experta`,
`version_motor_experto`, `evaluado_por_motor_experto_en` y
`estado_validacion_experta`. La fecha usa ISO 8601 UTC y el estado inicial es
`pendiente`.

### Respuesta PMOS con trazabilidad

```json
{
  "resultado": {"diagnostico_confirmado": true, "fenotipo_pmos": "A"},
  "trazabilidad": {
    "generado_por_motor_experto": true,
    "hechos_utilizados": {"cumple_alteracion_ovulatoria": true},
    "reglas_activadas": ["PMOS-HIPERANDROGENISMO", "PMOS-ROTTERDAM-CONFIRMADO", "PMOS-FENOTIPO-A"],
    "explicacion_experta": ["La paciente cumple 3 criterio(s) de Rotterdam."],
    "recomendaciones_expertas": ["Validar el resultado del motor experto con el profesional tratante."],
    "confianza_experta": 0.95,
    "version_motor_experto": "pmos-rotterdam-v1",
    "evaluado_por_motor_experto_en": "2026-08-04T12:00:00+00:00",
    "estado_validacion_experta": "pendiente"
  },
  "engine": "zen-engine",
  "version_modelo": "pmos-rotterdam-v1"
}
```

## Recomendación nutricional base

`POST /api/v1/nutricion/recomendacion-base` evalúa con ZEN Engine los hechos
endocrinológicos y nutricionales integrados. El resultado sirve como base para
un futuro plan semanal, pero esta fase **todavía no genera menús ni una
planificación semanal**.

Ejemplo de solicitud:

```json
{
  "hechos": {
    "diagnostico_pmos_confirmado": true,
    "resistencia_insulina_confirmada": true,
    "grado_resistencia": "moderada",
    "imc": 31.2,
    "objetivo_principal": "perdida_peso",
    "calorias_objetivo": 1600,
    "consumo_azucar": "alto",
    "alergias": ["mani"],
    "intolerancias": ["lactosa"]
  }
}
```

Ejemplo resumido de respuesta:

```json
{
  "resultado": {
    "enfoque_nutricional_experto": "antiinflamatorio_bajo_indice_glucemico",
    "prioridad_nutricional": "reduccion_peso_y_riesgo_metabolico",
    "calorias_sugeridas": 1600,
    "proteinas_porcentaje": 30,
    "carbohidratos_porcentaje": 35,
    "grasas_porcentaje": 35,
    "fibra_sugerida": 30,
    "recomendaciones": [],
    "restricciones": ["Azucares simples y bebidas azucaradas.", "mani", "lactosa"],
    "alertas": [],
    "conclusion": "Recomendacion nutricional base orientada por resistencia a la insulina."
  },
  "trazabilidad": {
    "reglas_activadas": ["NUT-RI-BAJO-IG", "NUT-PMOS-ANTIINFLAMATORIO"],
    "confianza_experta": 0.8,
    "estado_validacion_experta": "pendiente"
  },
  "engine": "zen-engine",
  "version_modelo": "nutricion-base-v1"
}
```

### Respuesta RI con trazabilidad

```json
{
  "resultado": {"homa_ir": 3.4074, "resistencia_confirmada": true, "grado_resistencia": "moderada"},
  "trazabilidad": {
    "generado_por_motor_experto": true,
    "hechos_utilizados": {"glucosa_ayunas": 92, "insulina_ayunas": 15, "homa_ir": null},
    "reglas_activadas": ["RI-HOMA-IR-CALCULADO", "RI-HOMA-IR-ALTO", "RI-GRADO-MODERADA"],
    "explicacion_experta": ["El valor HOMA-IR evaluado es 3.41."],
    "recomendaciones_expertas": ["Validar el resultado metabólico con el profesional tratante."],
    "confianza_experta": 0.9,
    "version_motor_experto": "ri-homa-quicki-v1",
    "evaluado_por_motor_experto_en": "2026-08-04T12:00:00+00:00",
    "estado_validacion_experta": "pendiente"
  },
  "engine": "zen-engine",
  "version_modelo": "ri-homa-quicki-v1"
}
```
