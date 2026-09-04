# Aplicación de la metodología Buchanan al sistema experto

## 5.3.1.8.4.1. Base de conocimiento

La base de conocimiento constituye el componente en el que se representa de forma estructurada el conocimiento especializado que utiliza el sistema para producir conclusiones. En el presente proyecto, este conocimiento comprende criterios endocrinológicos para la evaluación del síndrome de ovario poliquístico (PMOS), indicadores asociados con resistencia a la insulina (RI) y reglas para generar una orientación nutricional inicial según la condición clínica y nutricional de la paciente.

Siguiendo la metodología Buchanan, la construcción de la base de conocimiento parte de la identificación del problema, la conceptualización de las variables relevantes y la formalización de las reglas de decisión. El conocimiento clínico no se almacena únicamente como texto descriptivo, sino que se transforma en hechos, condiciones, reglas y resultados que pueden ser procesados computacionalmente.

### Adquisición y conceptualización del conocimiento

Para estructurar la base se identificaron tres dominios principales:

1. **Diagnóstico de PMOS:** considera alteración ovulatoria, hiperandrogenismo clínico o bioquímico, morfología ovárica y descarte de diagnósticos diferenciales.
2. **Evaluación de resistencia a la insulina:** considera glucosa e insulina en ayunas, HOMA-IR, QUICKI, hemoglobina glicosilada, triglicéridos, HDL y signos clínicos complementarios.
3. **Orientación nutricional:** integra diagnósticos endocrinológicos, antropometría, hábitos alimentarios, preferencias, alergias, intolerancias, restricciones, objetivos y requerimientos nutricionales.

Los datos obtenidos del expediente constituyen los **hechos de entrada**. Algunos ejemplos son:

- `cumple_alteracion_ovulatoria`;
- `cumple_hiperandrogenismo_clinico`;
- `cumple_hiperandrogenismo_bioquimico`;
- `cumple_morfologia_ovarica`;
- `diagnosticos_diferenciales_descartados`;
- `glucosa_ayunas`;
- `insulina_ayunas`;
- `homa_ir`;
- `quicki`;
- `diagnostico_pmos_confirmado`;
- `resistencia_insulina_confirmada`;
- `grado_resistencia`;
- `imc`, hábitos, preferencias y restricciones alimentarias.

La aplicación Laravel recupera estos datos de los registros clínicos y nutricionales mediante servicios constructores de hechos. Antes de enviarlos al motor, los normaliza en una estructura JSON. De esta manera, la base de conocimiento se mantiene separada de las tablas y de la interfaz de usuario.

### Representación del conocimiento

El conocimiento se representa mediante modelos de decisión **JDM (JSON Decision Model)**, ejecutados por ZEN Engine. Cada modelo contiene:

- un nodo de entrada con los hechos disponibles;
- uno o más nodos de decisión o función;
- condiciones lógicas y cálculos;
- un nodo de salida con la conclusión obtenida;
- conexiones que determinan el flujo de evaluación.

Los modelos implementados se encuentran en el microservicio `pmos-experto/app/jdm/`:

| Modelo de conocimiento | Archivo | Finalidad |
|---|---|---|
| PMOS | `pmos_rotterdam.json` | Evaluar criterios de Rotterdam, confirmación y fenotipo. |
| Resistencia a la insulina | `resistencia_insulina.json` | Calcular o evaluar HOMA-IR y QUICKI, grado y riesgos. |
| Nutrición | `nutricion_base.json` | Proponer enfoque, prioridad, macronutrientes, recomendaciones, restricciones y alertas. |

La estructura de las reglas responde al modelo de producción **SI–ENTONCES**. Por ejemplo:

> **SI** la paciente cumple al menos dos criterios de Rotterdam **Y** los diagnósticos diferenciales fueron descartados, **ENTONCES** el sistema propone la confirmación de PMOS.

> **SI** HOMA-IR es mayor o igual a 2,5, **ENTONCES** el sistema identifica compatibilidad con resistencia a la insulina y determina su grado según el intervalo correspondiente.

> **SI** existe resistencia a la insulina confirmada, **ENTONCES** el sistema propone un enfoque nutricional de bajo índice glucémico y alto contenido de fibra.

### Base de conocimiento para PMOS

El modelo PMOS agrupa el hiperandrogenismo clínico y bioquímico como un único criterio y contabiliza los tres criterios de Rotterdam:

1. alteración ovulatoria;
2. hiperandrogenismo;
3. morfología ovárica compatible.

La propuesta diagnóstica se confirma cuando se cumplen dos o más criterios y se han descartado diagnósticos diferenciales. Según la combinación encontrada, el sistema clasifica el fenotipo:

| Fenotipo | Combinación de criterios |
|---|---|
| A | Alteración ovulatoria, hiperandrogenismo y morfología ovárica. |
| B | Alteración ovulatoria e hiperandrogenismo. |
| C | Hiperandrogenismo y morfología ovárica. |
| D | Alteración ovulatoria y morfología ovárica. |

Si existen al menos dos criterios, pero no se completó el descarte diferencial, la conclusión permanece **en estudio**. Esta restricción evita que el motor produzca una confirmación únicamente por coincidencia de síntomas.

### Base de conocimiento para resistencia a la insulina

Cuando se dispone de glucosa e insulina de ayuno y no se enviaron indicadores calculados, el sistema obtiene:

\[
HOMA\text{-}IR = \frac{glucosa\ en\ ayunas \times insulina\ en\ ayunas}{405}
\]

\[
QUICKI = \frac{1}{\log_{10}(insulina\ en\ ayunas)+\log_{10}(glucosa\ en\ ayunas)}
\]

El modelo vigente considera compatible con resistencia a la insulina un HOMA-IR mayor o igual a 2,5 y utiliza los siguientes intervalos operativos:

| Valor HOMA-IR | Resultado del modelo |
|---|---|
| Menor a 2,5 | No confirmada. |
| Desde 2,5 y menor a 3,0 | Leve. |
| Desde 3,0 y menor a 5,0 | Moderada. |
| Mayor o igual a 5,0 | Severa. |

También se estiman el riesgo de diabetes y el riesgo cardiometabólico con los datos disponibles. Estos valores constituyen apoyo a la decisión y deben interpretarse dentro del contexto clínico de la paciente.

### Base de conocimiento nutricional

El modelo nutricional combina los diagnósticos endocrinológicos con los datos del perfil nutricional. Entre sus decisiones se incluyen:

- enfoque equilibrado cuando no se identifica una condición específica;
- enfoque de bajo índice glucémico y alto contenido de fibra ante RI;
- enfoque antiinflamatorio y de bajo índice glucémico ante PMOS;
- prioridad de control glucémico ante RI severa;
- déficit calórico moderado cuando el objetivo es pérdida de peso;
- incorporación de alergias, intolerancias y alimentos restringidos;
- alertas y recomendaciones relacionadas con azúcar, ultraprocesados, ansiedad por comida y cena tardía.

Las restricciones no son inventadas por el motor. Se obtienen de los datos registrados por el profesional o la paciente y se incorporan a la respuesta para evitar recomendaciones incompatibles.

### Trazabilidad del conocimiento

Cada evaluación genera información de trazabilidad compuesta por:

- hechos utilizados;
- reglas activadas;
- explicación del resultado;
- recomendaciones derivadas;
- nivel de confianza;
- versión del modelo de conocimiento;
- fecha de evaluación;
- estado de validación profesional.

La trazabilidad permite responder qué datos participaron, qué reglas se cumplieron y por qué se obtuvo una conclusión. Asimismo, las versiones `pmos-rotterdam-v1`, `ri-homa-quicki-v1` y la versión correspondiente al modelo nutricional permiten identificar el conjunto de reglas empleado en cada ejecución.

La base de conocimiento no reemplaza el criterio profesional. El endocrinólogo o nutricionista puede aprobar, rechazar o complementar la propuesta, y esa decisión queda registrada en el sistema.

## 5.3.1.8.4.2. Motor de inferencia

El motor de inferencia es el componente encargado de aplicar la base de conocimiento sobre los hechos de una paciente para obtener una conclusión. En el proyecto se utiliza **ZEN Engine**, integrado dentro de un microservicio desarrollado con FastAPI y Python 3.13.

ZEN Engine recibe un modelo JDM y un conjunto de hechos en formato JSON. Posteriormente recorre el grafo de decisión, ejecuta las condiciones y funciones definidas, y devuelve el resultado estructurado. La inferencia es determinista: los mismos hechos evaluados con la misma versión del modelo producen la misma conclusión.

### Funcionamiento del motor

El proceso de inferencia se desarrolla de la siguiente forma:

1. el profesional solicita una evaluación desde la interfaz;
2. Laravel recupera los datos clínicos o nutricionales reales;
3. el servicio constructor transforma los datos en hechos normalizados;
4. el orquestador Laravel envía los hechos al endpoint correspondiente de FastAPI;
5. FastAPI valida el contrato mediante esquemas Pydantic;
6. el servicio especializado carga el archivo JDM;
7. `ZenDecisionService` crea una decisión mediante `ZenEngine`;
8. el motor evalúa los hechos y devuelve el campo `result`;
9. el servicio genera explicación, reglas activadas, confianza y versión;
10. Laravel persiste la propuesta y su trazabilidad;
11. el profesional revisa y valida o rechaza el resultado.

Los principales endpoints de inferencia son:

- `POST /api/v1/diagnostico/pmos`;
- `POST /api/v1/diagnostico/resistencia-insulina`;
- `POST /api/v1/nutricion/recomendacion-base`.

### Mecanismo de razonamiento

El mecanismo aplicado se asemeja a un **encadenamiento hacia adelante**, debido a que el proceso comienza con hechos conocidos del expediente y avanza a través de condiciones hasta producir conclusiones. No parte de una hipótesis para buscar datos que la demuestren; las conclusiones se derivan de la información disponible.

De manera simplificada:

```text
Hechos clínicos o nutricionales
            ↓
Validación y normalización
            ↓
Evaluación de condiciones SI–ENTONCES
            ↓
Activación de reglas aplicables
            ↓
Conclusión + explicación + confianza
            ↓
Validación del profesional
```

### Separación entre inferencia y persistencia

El microservicio no accede directamente a la base de datos clínica. Su responsabilidad es evaluar hechos y devolver una respuesta. Laravel conserva la responsabilidad de:

- seleccionar los registros autorizados;
- construir los hechos;
- autenticar y autorizar al usuario;
- persistir la respuesta;
- controlar la validación profesional;
- generar reportes y auditoría.

Esta separación reduce el acoplamiento del motor con el expediente clínico y permite modificar o versionar el conocimiento sin trasladar la persistencia al microservicio.

### Resolución de resultados incompletos

El motor contempla escenarios con información insuficiente. Por ejemplo:

- PMOS permanece en estudio cuando no se descartaron diagnósticos diferenciales;
- RI presenta menor confianza cuando no puede calcularse HOMA-IR;
- la recomendación nutricional utiliza únicamente los datos disponibles y conserva restricciones registradas;
- una respuesta inválida o un error de evaluación genera una excepción controlada y no debe producir persistencia parcial.

### Explicabilidad y supervisión humana

El resultado no se limita a una clasificación. Incluye reglas activadas y textos explicativos que permiten al profesional revisar el razonamiento. La confianza experta representa el nivel de respaldo interno de la regla según la suficiencia de hechos; no debe interpretarse como probabilidad estadística ni como certeza médica.

La decisión definitiva permanece bajo supervisión humana. El sistema distingue entre resultado generado y resultado validado mediante los estados `pendiente`, `aprobado` y `rechazado`, junto con el profesional responsable, fecha y observación.

## 5.3.1.8.5. Etapa de pruebas

En la metodología Buchanan, la etapa de pruebas permite comprobar que el sistema experto represente adecuadamente el conocimiento, ejecute las reglas sin contradicciones y entregue respuestas coherentes con los casos planteados. La evaluación debe diferenciar la **verificación técnica** de la **validación del conocimiento**.

La verificación responde a la pregunta: **¿el sistema fue construido correctamente?** La validación responde: **¿el sistema representa correctamente el razonamiento esperado para el dominio?**

### Estrategia de pruebas

Se definieron los siguientes niveles:

#### a) Pruebas unitarias del motor experto

Comprueban cada modelo con hechos controlados y resultados esperados. En el microservicio se utilizan `pytest` y `TestClient` de FastAPI.

Para PMOS se verifican:

- confirmación y clasificación del fenotipo A;
- confirmación de los fenotipos B, C y D;
- conteo de criterios de Rotterdam;
- combinación del hiperandrogenismo clínico y bioquímico;
- ausencia de confirmación cuando los diagnósticos diferenciales siguen pendientes;
- reglas activadas, explicación y confianza.

Para RI se verifican:

- cálculo automático de HOMA-IR y QUICKI;
- clasificación leve, moderada y severa;
- caso sin resistencia confirmada;
- riesgo cardiometabólico alto;
- funcionamiento con información insuficiente;
- reglas activadas y confianza asociada.

Para nutrición se verifican:

- enfoque de bajo índice glucémico ante RI;
- ajuste de macronutrientes ante RI severa;
- recomendación antiinflamatoria ante PMOS;
- límite operativo de calorías ante pérdida de peso;
- incorporación de alergias, intolerancias y restricciones;
- exclusión de preferencias incompatibles;
- recomendaciones derivadas de hábitos alterados;
- presencia de resultado y trazabilidad.

#### b) Pruebas de contratos y API

Validan que FastAPI:

- responda correctamente en `/health`;
- acepte hechos con la estructura definida;
- rechace entradas inválidas;
- devuelva `resultado`, `explicacion`, `engine`, versión y trazabilidad;
- transforme los errores del motor en respuestas comprensibles.

#### c) Pruebas de integración Laravel–FastAPI

Laravel utiliza respuestas simuladas mediante `Http::fake`, evitando depender de que FastAPI esté activo durante la suite automatizada. Estas pruebas comprueban:

- URL y método HTTP correctos;
- contenido del payload enviado;
- interpretación de resultado y trazabilidad;
- manejo controlado de indisponibilidad o error HTTP;
- ausencia de guardados incompletos ante una falla.

#### d) Pruebas de construcción de hechos

Comprueban que los datos enviados al motor correspondan al expediente real. Se verifican:

- valores directos del diagnóstico;
- inferencia desde relaciones clínicas;
- inclusión de triglicéridos y HDL;
- normalización de valores ausentes;
- selección preferente de diagnósticos validados;
- exclusión de resultados expertos rechazados;
- integración de evaluación, objetivo y requerimiento nutricional;
- ausencia de modificaciones durante la construcción.

#### e) Pruebas de persistencia y orquestación

Comprueban el flujo completo desde los hechos hasta el registro del resultado:

- actualización de campos clínicos derivados;
- almacenamiento de hechos, reglas, explicación, confianza y versión;
- conservación de validaciones profesionales ya resueltas;
- transacción o interrupción segura si falla el microservicio;
- devolución del diagnóstico o recomendación actualizada.

#### f) Pruebas de seguridad y validación profesional

Verifican que:

- solo el rol autorizado ejecute o valide resultados;
- el usuario no autenticado sea redirigido;
- un rol no autorizado reciba respuesta 403;
- un estado de validación inválido produzca respuesta 422;
- la aprobación o rechazo registre responsable, fecha y observación;
- la inferencia no sustituya silenciosamente la decisión profesional.

### Casos representativos de validación

| Caso | Hechos principales | Resultado esperado |
|---|---|---|
| PMOS-A | Tres criterios y diferenciales descartados | PMOS confirmado, fenotipo A. |
| PMOS-B | Alteración ovulatoria e hiperandrogenismo | PMOS confirmado, fenotipo B. |
| PMOS-C | Hiperandrogenismo y morfología | PMOS confirmado, fenotipo C. |
| PMOS-D | Alteración ovulatoria y morfología | PMOS confirmado, fenotipo D. |
| PMOS pendiente | Dos o más criterios, sin descarte diferencial | Diagnóstico en estudio. |
| RI no confirmada | HOMA-IR menor a 2,5 | Resistencia no confirmada. |
| RI leve | HOMA-IR entre 2,5 y menor a 3,0 | Resistencia leve. |
| RI moderada | HOMA-IR entre 3,0 y menor a 5,0 | Resistencia moderada. |
| RI severa | HOMA-IR mayor o igual a 5,0 | Resistencia severa. |
| Nutrición con RI | RI confirmada | Enfoque de bajo índice glucémico y fibra. |
| Nutrición con restricción | Alergia o intolerancia registrada | Restricción conservada en la respuesta. |
| Servicio indisponible | FastAPI no responde | Error controlado y sin persistencia parcial. |

### Criterios de aceptación

La etapa se considera satisfactoria cuando:

1. los casos conocidos producen la conclusión esperada;
2. los límites de cada regla se comportan de forma consistente;
3. no se confirma PMOS sin descarte diferencial;
4. HOMA-IR y QUICKI se calculan únicamente con datos válidos;
5. las restricciones alimentarias se conservan sin contradicciones;
6. toda respuesta contiene información suficiente para su trazabilidad;
7. los errores externos son controlados y no generan registros parciales;
8. el acceso a ejecución y validación respeta los roles;
9. el profesional puede aprobar, rechazar o complementar el resultado;
10. la suite automatizada de Python y Laravel concluye sin fallos.

### Validación con expertos del dominio

Además de las pruebas automatizadas, la metodología Buchanan requiere contrastar la base de conocimiento con especialistas. Para ello se recomienda presentar casos clínicos anonimizados a profesionales de endocrinología y nutrición, registrar su conclusión y compararla con la propuesta del sistema.

La validación puede utilizar una matriz con:

- identificador anónimo del caso;
- hechos clínicos relevantes;
- conclusión del especialista;
- conclusión del sistema;
- reglas activadas;
- coincidencia o discrepancia;
- observación del experto;
- ajuste requerido en la base de conocimiento.

Los desacuerdos no deben corregirse ocultando el resultado, sino revisando la adquisición, formalización y umbral de la regla correspondiente. Después de cada modificación se debe incrementar la versión del modelo y volver a ejecutar los casos de regresión.

### Métricas sugeridas

Para documentar la validación pueden utilizarse:

- porcentaje de concordancia entre sistema y especialista;
- precisión por tipo de conclusión;
- sensibilidad y especificidad, si existe una muestra clínica suficiente y una referencia diagnóstica válida;
- cantidad de casos correctamente clasificados por fenotipo o grado;
- porcentaje de respuestas con trazabilidad completa;
- número de reglas corregidas después de la revisión experta;
- tiempo promedio de respuesta del motor.

Estas métricas solo deben reportarse como resultados obtenidos cuando se hayan ejecutado sobre una muestra documentada. Mientras no exista dicha evaluación, deben presentarse como parte del protocolo de validación y no como evidencia de eficacia clínica.

### Resultado de la etapa

La implementación dispone de pruebas automatizadas para el microservicio, la integración HTTP, la construcción de hechos, la orquestación, la persistencia y la validación por roles. Esto permite verificar el funcionamiento técnico y detectar regresiones. La aceptación clínica definitiva, de acuerdo con Buchanan, debe complementarse con la revisión de casos por especialistas y con el registro formal de concordancias, discrepancias y ajustes efectuados a la base de conocimiento.
