# 4.5. Aporte de ingeniería

El aporte de ingeniería del presente proyecto consiste en el diseño e implementación de una arquitectura híbrida de apoyo a decisiones clínicas y nutricionales para pacientes con síndrome de ovario poliquístico (PMOS) y resistencia a la insulina (RI). La solución no se limita a digitalizar formularios: transforma información clínica distribuida en hechos computables, aplica conocimiento experto formalizado, genera resultados explicables y mantiene al profesional como responsable de la decisión final.

La propuesta integra cuatro capacidades que normalmente aparecen separadas: evaluación endocrinológica, inferencia mediante reglas, planificación nutricional y seguimiento longitudinal. Laravel administra el expediente, la seguridad, la persistencia y los flujos profesionales; el microservicio FastAPI encapsula la inferencia; ZEN Engine ejecuta modelos de decisión JDM expresados en JSON; y el copiloto Groq actúa únicamente como apoyo generativo sobre información ya filtrada, sin reemplazar las reglas clínicas ni modificar registros automáticamente.

La Figura 4.X presenta la arquitectura general del aporte y la Figura 4.Y resume el flujo de decisión con validación profesional.

## 4.5.1. Arquitectura híbrida para apoyo a decisiones clínicas y nutricionales

La arquitectura fue dividida en una aplicación principal y un microservicio experto para reducir el acoplamiento entre la gestión transaccional y el conocimiento clínico. Esta separación permite actualizar los modelos de decisión sin trasladar la lógica al frontend ni mezclarla con controladores de pacientes.

La aplicación principal, desarrollada con Laravel, React e Inertia, cumple las siguientes responsabilidades:

- autenticación, autorización y separación por roles;
- administración del expediente clínico y nutricional;
- construcción de hechos a partir de registros persistidos;
- comunicación HTTP con el microservicio experto;
- almacenamiento de resultados y trazabilidad;
- validación o rechazo por endocrinología y nutrición;
- generación y seguimiento de planes alimentarios;
- presentación de reportes e indicadores de evolución.

El microservicio `pmos-experto`, implementado con Python 3.13, FastAPI y ZEN Engine, se concentra en recibir hechos estructurados, validar el contrato de entrada, ejecutar el modelo JDM correspondiente y devolver una respuesta normalizada. No administra usuarios ni escribe directamente en la base de datos institucional. Esta decisión crea un límite técnico claro: Laravel conserva la autoridad sobre el expediente y el microservicio se limita a inferir.

La comunicación se realiza mediante tres operaciones principales:

- `POST /api/v1/diagnostico/pmos`;
- `POST /api/v1/diagnostico/resistencia-insulina`;
- `POST /api/v1/nutricion/recomendacion-base`.

En Laravel, los servicios `HechosSistemaExpertoService` y `HechosNutricionalesSistemaExpertoService` convierten los registros clínicos en hechos. `SistemaExpertoZenService` encapsula la comunicación HTTP. Los orquestadores coordinan construcción, evaluación y persistencia, evitando que los controladores contengan reglas de negocio duplicadas.

**Aporte específico.** La arquitectura desacoplada hace posible mantener una única fuente de verdad clínica en Laravel y una única fuente de conocimiento inferencial en los modelos JDM. Además, permite probar la aplicación y el motor de manera independiente mediante respuestas simuladas, sin exigir que FastAPI esté activo durante todas las pruebas de Laravel.

## 4.5.2. Modelado de reglas de producción SI–ENTONCES mediante JDM y ZEN Engine

El conocimiento fue formalizado mediante modelos JSON Decision Model (JDM). En lugar de codificar múltiples condiciones dispersas en controladores, las decisiones se representan como modelos declarativos que reciben hechos y producen resultados estructurados.

El paradigma empleado corresponde a un sistema experto basado en **reglas de producción**. Cada regla relaciona una condición clínica con una conclusión o acción:

\[
R_i: \quad SI\ C_i(F)\ ES\ VERDADERA \quad ENTONCES\ ejecutar\ A_i
\]

Donde:

- \(F\) representa el conjunto de hechos clínicos y nutricionales del paciente;
- \(C_i\) es la condición lógica evaluada por la regla;
- \(A_i\) es la conclusión, clasificación o recomendación producida;
- \(R_i\) identifica la regla que debe registrarse en la trazabilidad.

En términos de arquitectura, el sistema se compone de:

| Componente | Implementación en el proyecto |
|---|---|
| Base de hechos | Datos clínicos y nutricionales construidos por los servicios Laravel. |
| Base de conocimiento | Condiciones SI–ENTONCES formalizadas dentro de modelos JDM. |
| Motor de inferencia | ZEN Engine, encargado de evaluar el modelo con los hechos recibidos. |
| Memoria de resultados | Tablas de diagnósticos, recomendaciones y planes en PostgreSQL. |
| Módulo explicativo | Reglas activadas, hechos utilizados, explicación y confianza. |
| Interfaz experta | Paneles de endocrinología y nutrición para aprobar, rechazar o complementar. |

Aunque técnicamente las condiciones se serializan en nodos funcionales dentro de los archivos JDM, su semántica corresponde a reglas de producción. Esta precisión es importante: JDM define el modelo ejecutable y ZEN Engine lo procesa, mientras que el razonamiento clínico continúa expresándose como relaciones **SI condición, ENTONCES resultado**.

### Ejemplos de reglas implementadas

| Código conceptual | Condición SI | Resultado ENTONCES |
|---|---|---|
| `PMOS-ROTTERDAM-CONFIRMADO` | Se cumplen al menos dos criterios de Rotterdam y los diagnósticos diferenciales fueron descartados. | Confirmar compatibilidad con PMOS y determinar el fenotipo correspondiente. |
| `PMOS-DIFERENCIALES-PENDIENTES` | Se cumplen al menos dos criterios, pero no se completó el descarte diferencial. | Mantener el diagnóstico como PMOS en estudio. |
| `RI-HOMA-IR-ALTO` | El valor HOMA-IR es mayor o igual a 2,5. | Marcar resistencia a la insulina como confirmada. |
| `RI-GRADO-MODERADA` | HOMA-IR es mayor o igual a 3,0 y menor que 5,0. | Clasificar la resistencia como moderada. |
| `RI-GRADO-SEVERA` | HOMA-IR es mayor o igual a 5,0. | Clasificar la resistencia como severa. |
| `NUT-RI-BAJO-IG` | Existe resistencia a la insulina confirmada. | Recomendar un enfoque de bajo índice glucémico y alto aporte de fibra. |
| `NUT-PMOS-ANTIINFLAMATORIO` | Existe diagnóstico PMOS confirmado. | Priorizar un enfoque antiinflamatorio de bajo índice glucémico. |
| `NUT-RESTRICCIONES-PACIENTE` | Existen alergias, intolerancias o alimentos restringidos. | Excluir los elementos incompatibles durante la recomendación y selección de recetas. |

Un ejemplo simplificado de la regla principal de PMOS es:

```text
SI total_criterios_rotterdam >= 2
Y diagnosticos_diferenciales_descartados = verdadero
ENTONCES diagnostico_confirmado = verdadero
Y clasificar fenotipo PMOS
```

Para resistencia a la insulina:

```text
SI HOMA_IR >= 5,0
ENTONCES resistencia_confirmada = verdadero
Y grado_resistencia = severa

SI HOMA_IR >= 3,0 Y HOMA_IR < 5,0
ENTONCES resistencia_confirmada = verdadero
Y grado_resistencia = moderada

SI HOMA_IR >= 2,5 Y HOMA_IR < 3,0
ENTONCES resistencia_confirmada = verdadero
Y grado_resistencia = leve
```

Para la orientación nutricional:

```text
SI resistencia_insulina_confirmada = verdadero
ENTONCES enfoque = bajo_indice_glucemico_alto_fibra
Y carbohidratos = 35 %
Y fibra >= 30 g/día

SI diagnostico_pmos_confirmado = verdadero
ENTONCES enfoque = antiinflamatorio_bajo_indice_glucemico

SI existe una alergia, intolerancia o alimento restringido
ENTONCES incorporar el alimento a las restricciones obligatorias
```

Las reglas pueden activarse conjuntamente. Por ejemplo, una paciente con PMOS y RI puede activar simultáneamente reglas endocrinológicas y nutricionales. El motor construye un resultado acumulativo, mientras las restricciones alimentarias conservan prioridad sobre las preferencias. En caso de información incompleta, el sistema evita confirmar una conclusión que requiera hechos ausentes y devuelve un estado pendiente o en estudio.

El proceso de ingeniería de conocimiento comprende:

1. identificar variables clínicas y nutricionales relevantes;
2. normalizar nombres, tipos de datos y valores ausentes;
3. expresar condiciones y resultados en reglas JDM;
4. ejecutar el modelo mediante ZEN Engine;
5. traducir el resultado a una respuesta clínica explicable;
6. registrar versión, hechos utilizados y reglas activadas.

Los hechos se separan de las reglas. Por ejemplo, Laravel construye los valores `cumple_alteracion_ovulatoria`, `cumple_hiperandrogenismo` y `cumple_morfologia_ovarica`; el modelo JDM decide cómo se combinan. Este desacoplamiento evita que la interfaz decida diagnósticos y permite auditar qué información ingresó al motor.

Cada respuesta incorpora como mínimo:

- resultado de la decisión;
- lista de reglas activadas;
- explicación textual;
- recomendaciones asociadas;
- nivel de confianza;
- versión del modelo experto.

**Aporte específico.** Se construyó una capa de inferencia reutilizable capaz de evaluar distintos dominios con el mismo motor. PMOS, RI y nutrición comparten infraestructura, contratos y trazabilidad, pero mantienen modelos de conocimiento independientes.

## 4.5.3. Inferencia diagnóstica para PMOS y resistencia a la insulina

### Evaluación de PMOS

El modelo de PMOS utiliza los criterios de Rotterdam:

- alteración ovulatoria;
- hiperandrogenismo clínico o bioquímico;
- morfología ovárica compatible.

El sistema contabiliza los criterios, verifica el descarte de diagnósticos diferenciales y determina si el diagnóstico queda confirmado o en estudio. Cuando corresponde, clasifica el fenotipo y genera una explicación que indica cuántos criterios se cumplieron y qué condiciones influyeron en la conclusión.

La confianza no se presenta como probabilidad estadística de enfermedad. Es un indicador de completitud y consistencia de la regla: aumenta cuando existen criterios suficientes y los diagnósticos diferenciales fueron descartados; disminuye cuando la información todavía requiere revisión.

### Evaluación de resistencia a la insulina

El componente de RI integra glucosa, insulina, HOMA-IR, QUICKI y factores metabólicos. Cuando los índices no fueron proporcionados, pueden calcularse a partir de los valores disponibles:

\[
HOMA\text{-}IR = \frac{glucosa\ en\ ayunas\ (mg/dL) \times insulina\ en\ ayunas\ (\mu U/mL)}{405}
\]

\[
QUICKI = \frac{1}{\log(glucosa\ en\ ayunas) + \log(insulina\ en\ ayunas)}
\]

El resultado diferencia confirmación, grado de resistencia y riesgos asociados. La inferencia se conserva como propuesta hasta que el endocrinólogo la aprueba o rechaza.

**Aporte específico.** Ambos procesos usan la misma canalización técnica, pero preservan sus propias variables, reglas, explicaciones y versiones. Esto evita una lógica monolítica y facilita ampliar cada dominio sin afectar al otro.

## 4.5.4. Integración endocrino-nutricional y generación del plan semanal

La recomendación nutricional no se genera únicamente desde peso o calorías. El servicio de hechos nutricionales integra:

- diagnóstico y fenotipo PMOS;
- diagnóstico y grado de RI;
- HOMA-IR, QUICKI y riesgos metabólicos;
- antropometría y composición corporal;
- nivel de actividad;
- hábitos y horarios;
- preferencias alimentarias;
- alergias, intolerancias y alimentos rechazados;
- objetivos y requerimientos nutricionales.

El motor devuelve un enfoque base, prioridad, energía, macronutrientes, fibra, recomendaciones, restricciones y alertas. Las restricciones actúan como barreras obligatorias durante la selección de recetas. La nutricionista debe aprobar la recomendación antes de convertirla en un plan semanal.

El generador organiza siete días con cuatro tiempos de comida:

| Tiempo | Distribución energética | Hora sugerida |
|---|---:|---:|
| Desayuno | 25 % | 08:00 |
| Almuerzo | 40 % | 13:00 |
| Merienda | 15 % | 16:30 |
| Cena | 20 % | 19:30 |

Las recetas se clasifican según compatibilidad, restricciones, tipo de comida, aporte nutricional y diversidad semanal. Si no existe una alternativa segura suficiente, el sistema crea un componente manual pendiente para que la nutricionista lo complete, en lugar de inventar una receta.

**Aporte específico.** Se diseñó una cadena de transformación desde evidencia endocrinológica hasta una planificación alimentaria trazable. El resultado conserva la recomendación de origen y permite justificar por qué fue seleccionada cada receta.

## 4.5.5. Explicabilidad, trazabilidad y validación profesional

El diseño aplica un enfoque *human-in-the-loop*: el motor propone y el profesional decide. Los diagnósticos y recomendaciones conservan cuatro niveles de evidencia:

1. **Hechos utilizados:** datos exactos entregados al motor.
2. **Reglas activadas:** condiciones que participaron en la decisión.
3. **Explicación experta:** justificación comprensible del resultado.
4. **Validación profesional:** estado, usuario, fecha y observación de aprobación o rechazo.

Esta separación permite distinguir el resultado automático de la decisión clínica. Un rechazo no elimina la inferencia original; registra la intervención profesional y permite complementar la información. De esta forma, el sistema proporciona auditabilidad y evita presentar la salida automática como diagnóstico definitivo.

Los estados de validación también controlan el flujo: una recomendación nutricional no aprobada no debe originar un plan, y una paciente sin PMOS ni RI confirmada queda bloqueada para la planificación nutricional asistida.

**Aporte específico.** La trazabilidad se diseñó como parte del modelo de datos y no como texto decorativo de la interfaz. Esto permite reconstruir qué versión del motor produjo una salida, con qué hechos y bajo qué revisión profesional.

## 4.5.6. Copiloto generativo con límites de seguridad

Como extensión de apoyo profesional se integró Groq mediante una API compatible con el cliente OpenAI PHP. Su función es analizar un plan ya generado, explicar selecciones, auditar diversidad, proponer alternativas previamente filtradas y redactar borradores.

El componente generativo no reemplaza a ZEN Engine. Las reglas deterministas siguen controlando elegibilidad, diagnóstico, restricciones y compatibilidad. El copiloto recibe un contexto limitado y no puede:

- modificar automáticamente el plan;
- crear diagnósticos;
- ignorar alergias o restricciones;
- inventar identificadores de recetas;
- sustituir la validación profesional.

Si Groq no está disponible o supera su cuota, el sistema mantiene el ranking determinista y conserva el plan sin cambios. Por tanto, la disponibilidad del modelo generativo no constituye un punto único de fallo para la función clínica principal.

**Aporte específico.** Se propone una arquitectura híbrida en la que las reglas garantizan restricciones duras y la IA generativa aporta interpretación sobre un contexto controlado. Esta distribución evita delegar decisiones clínicas críticas a un modelo probabilístico.

## 4.5.7. Síntesis del aporte

El aporte puede resumirse en cinco elementos:

| Elemento | Contribución de ingeniería |
|---|---|
| Formalización del conocimiento | Reglas clínicas y nutricionales representadas mediante JDM. |
| Arquitectura desacoplada | Laravel conserva el expediente; FastAPI y ZEN Engine realizan inferencia. |
| Integración multidisciplinaria | Los diagnósticos endocrinos alimentan recomendaciones y planes nutricionales. |
| Decisión explicable | Se almacenan hechos, reglas, explicación, confianza y versión. |
| Control profesional | Endocrinólogo y nutricionista aprueban, rechazan o complementan las propuestas. |

En consecuencia, la principal contribución no es un modelo predictivo entrenado con datos históricos, sino un sistema de apoyo a decisiones basado en conocimiento explícito, verificable y versionable. La incorporación de IA generativa es complementaria y permanece subordinada a las reglas y a la validación humana.

## Figuras asociadas

- `diagrama-arquitectura-aporte-ingenieril.html`: arquitectura completa del aporte.
- `diagrama-flujo-decision-experta.html`: proceso desde el registro clínico hasta la validación y seguimiento.

> Nota para edición final: sustituir “Figura 4.X” y “Figura 4.Y” por la numeración definitiva del documento, añadir las referencias bibliográficas clínicas empleadas para Rotterdam, HOMA-IR y QUICKI, y adaptar el número de sección si el capítulo final no corresponde a 4.5.
