# Ajuste de complejidad de Puntos de Función

## 1. Base del cálculo

El conteo funcional consolidado del sistema es:

| EE | SE | CE | ALI | AIE | PF sin ajustar (PFSA) |
|---:|---:|---:|---:|---:|---:|
| 46 | 31 | 31 | 24 | 2 | **717** |

Las 14 características generales del sistema se valoran con la escala indicada por el método clásico IFPUG difundido por Pressman: 0 = sin influencia, 1 = incidental, 2 = moderada, 3 = media, 4 = significativa y 5 = esencial o con fuerte influencia en todo el sistema.

La valoración se hizo de manera conservadora: la existencia de una tecnología no basta por sí sola para asignar un valor alto. Se exigió evidencia de que la característica influye realmente en el diseño o funcionamiento del producto.

## 2. Evaluación técnica de las 14 características

| N.º | Característica | Valor | Justificación concreta | Evidencia técnica observable |
|---:|---|---:|---|---|
| 1 | Comunicación de datos | **3** | El sistema intercambia datos entre navegador y Laravel, y Laravel se comunica por HTTP/JSON con FastAPI/ZEN, Google OAuth y Groq. La comunicación es importante, pero no se evidencia una red heterogénea, múltiples protocolos de negocio ni gestión avanzada de telecomunicaciones que justifique 4 o 5. | Rutas web en `routes/web.php`; OAuth en `routes/auth.php:26-30`; cliente HTTP en `app/Services/SistemaExperto/SistemaExpertoZenService.php:144-147`; API Groq en `config/openai.php:14,34,45`. |
| 2 | Procesamiento distribuido | **3** | Laravel ejecuta autenticación, transacciones y persistencia, mientras FastAPI/ZEN realiza inferencia en otro proceso y devuelve resultados. Existe distribución real de procesamiento, pero limitada a un microservicio especializado; no hay orquestación de múltiples nodos ni balanceo distribuido demostrado. | Arquitectura descrita en `documentacion/analisis-requerimientos/ARQUITECTURA_Y_PATRONES_DEL_SISTEMA.md`; fachada HTTP `SistemaExpertoZenService.php`; routers y servicios en `pmos-experto/app`. |
| 3 | Rendimiento | **2** | Se implementaron límites de espera y paginación, por lo que el rendimiento influye moderadamente. Sin embargo, los objetivos p95 y los tiempos máximos no se han validado mediante pruebas formales de carga; por ello no corresponde 3 o más. | Timeout ZEN de 10 s en `SistemaExpertoZenService.php:24-26,147`; timeout Groq en `config/openai.php:45`; paginación en `app/Services/Admin/UserService.php:37`, `app/Services/Nutricion/AlimentoService.php:32` y `app/Http/Controllers/Admin/LogAccesoController.php:25`; advertencia expresa en requisitos RNF-16 a RNF-19 y nota final. |
| 4 | Configuración fuertemente utilizada | **0** | No se documentan restricciones críticas de CPU, memoria, almacenamiento o infraestructura compartida que condicionen el diseño. Las variables `.env` son configuración normal de despliegue, no evidencia de una configuración física fuertemente utilizada. | Archivos `config/*.php` y `.env.example`; ausencia de pruebas o requisitos de saturación/capacidad de hardware. |
| 5 | Tasa de transacciones | **0** | No existe requisito de transacciones por segundo, picos horarios, concurrencia sostenida ni pruebas de volumen. La cantidad de rutas no demuestra una tasa alta de transacciones. | Requerimientos no funcionales sin TPS ni concurrencia; suite sin pruebas de carga o estrés. |
| 6 | Entrada de datos en línea | **4** | La captura principal se realiza en línea: pacientes, citas, datos clínicos, laboratorios, diagnósticos, perfil nutricional, planes y seguimiento. Los formularios aplican validaciones. Es significativa, pero no se asigna 5 porque no se midió formalmente qué porcentaje de todas las transacciones corresponde a entrada interactiva ni se demostró influencia esencial en todo el producto. | Rutas `POST`, `PUT` y `PATCH` en `routes/web.php`; Form Requests en `app/Http/Requests`; validación clínica y nutricional; pruebas Feature de autenticación, endocrinología, nutrición y paciente. |
| 7 | Eficiencia del usuario final | **3** | Hay paneles por rol, filtros, paginación, búsqueda/autocompletado y flujos especializados. Estas ayudas influyen de forma media. No corresponde 4 o 5 porque no existe estudio de usabilidad, medición de tiempos de tarea, accesibilidad certificada ni prueba con usuarios finales. | Middleware y paneles por rol en `routes/web.php`; búsqueda de alimentos; servicios paginados; componentes React/Inertia en `resources/js`; pruebas de paneles y flujos por rol. |
| 8 | Actualización en línea | **4** | Los usuarios autorizados actualizan en línea la mayoría de los ALI operativos. Se utilizan validaciones, autorización y transacciones de base de datos para preservar consistencia. No se asigna 5 porque no se demuestra recuperación automatizada integral, alta disponibilidad ni protección especial para todas las actualizaciones. | Operaciones `POST/PUT/PATCH/DELETE` en `routes/web.php`; `DB::transaction` en `UserService.php`, `DiagnosticoPmosService.php`, `DerivacionNutricionalService.php` y `CicloPlanAlimentarioService.php`; middleware de autenticación y roles. |
| 9 | Procesamiento complejo | **5** | Es una influencia esencial: el propósito central del producto depende de construir hechos, ejecutar reglas PMOS y RI, calcular HOMA-IR y QUICKI, generar recomendaciones explicables, clasificar recetas, distribuir energía, producir planes de siete días y analizar adherencia. No es un CRUD convencional. | Modelos JDM en `pmos-experto/app/jdm`; reglas en `pmos_service.py`, `ri_service.py` y `nutricion_service.py`; orquestadores en `app/Services/SistemaExperto`; planificación y analítica en `app/Services/Nutricion`; pruebas de trazabilidad e inferencia. |
| 10 | Reutilización | **2** | La solución tiene servicios, componentes, recursos y reglas reutilizados dentro del mismo producto. No existe evidencia de empaquetado, publicación o requisito para reutilizar módulos en otras aplicaciones; por ello la influencia es moderada. | Capa de servicios en `app/Services`; componentes React; recursos HTTP; fachada ZEN y esquemas Pydantic reutilizados internamente; ausencia de paquetes independientes publicados. |
| 11 | Facilidad de instalación | **1** | Existen manifiestos de dependencias y variables de configuración, pero el despliegue exige preparar PHP/Laravel, Node, PostgreSQL, Python/FastAPI, ZEN y credenciales externas. No hay instalador, contenedores ni despliegue automatizado de un paso demostrado. | `composer.json`, `package.json`, `pmos-experto/requirements.txt`, `.env.example` y documentación README; dependencia de `pg_dump`; ausencia de Docker/instalador o pipeline de despliegue reproducible. |
| 12 | Facilidad operacional | **2** | El sistema incorpora auditoría, manejo de excepciones, respaldo, timeouts y degradación controlada ante Groq. Aun así, el inicio de componentes, monitoreo, restauración y recuperación operativa no están completamente automatizados. | `RespaldoBaseDatosService.php`; `AccessLogService.php`; excepciones controladas en `SistemaExpertoZenService.php`; RNF-21 y RNF-22; pruebas de fallos del sistema experto y Groq. |
| 13 | Múltiples sitios | **0** | Que la aplicación sea web no prueba operación multisitio. No hay evidencia de varias instalaciones, configuraciones específicas por sede, sincronización entre centros o requerimiento de despliegue en ubicaciones múltiples. | Arquitectura describe un entorno de despliegue, no sedes múltiples; ausencia de entidades o configuración por centro/sede y de pruebas multisitio. |
| 14 | Facilidad de cambio | **3** | La separación modular, la capa de servicios, las reglas JDM externas a controladores y las pruebas automatizadas facilitan cambios de forma apreciable. Se mantiene en 3 porque no existen métricas formales de mantenibilidad, parametrización integral, gestión de variantes por cliente ni demostración de cambios en producción. | Organización modular en `app/Services` y controladores por dominio; modelos JDM en JSON; inyección de dependencias; pruebas en `tests/Feature`, `tests/Unit` y `pmos-experto/tests`; documento de arquitectura. |

## 3. Tabla de valoración lista para tesis

| N.º | Característica | 0 | 1 | 2 | 3 | 4 | 5 | Valor |
|---:|---|:---:|:---:|:---:|:---:|:---:|:---:|---:|
| 1 | Comunicación de datos |  |  |  | X |  |  | 3 |
| 2 | Procesamiento distribuido |  |  |  | X |  |  | 3 |
| 3 | Rendimiento |  |  | X |  |  |  | 2 |
| 4 | Configuración fuertemente utilizada | X |  |  |  |  |  | 0 |
| 5 | Tasa de transacciones | X |  |  |  |  |  | 0 |
| 6 | Entrada de datos en línea |  |  |  |  | X |  | 4 |
| 7 | Eficiencia del usuario final |  |  |  | X |  |  | 3 |
| 8 | Actualización en línea |  |  |  |  | X |  | 4 |
| 9 | Procesamiento complejo |  |  |  |  |  | X | 5 |
| 10 | Reutilización |  |  | X |  |  |  | 2 |
| 11 | Facilidad de instalación |  | X |  |  |  |  | 1 |
| 12 | Facilidad operacional |  |  | X |  |  |  | 2 |
| 13 | Múltiples sitios | X |  |  |  |  |  | 0 |
| 14 | Facilidad de cambio |  |  |  | X |  |  | 3 |
|  | **Total ΣFi** |  |  |  |  |  |  | **32** |

## 4. Fórmula correcta: 0.65, no 0.85

Para el método de las 14 características generales empleado por Pressman/IFPUG, la fórmula clásica correcta es:

\[
FA = 0.65 + (0.01 \times \sum_{i=1}^{14} F_i)
\]

La constante base es **0.65**. Como cada característica puede valer entre 0 y 5, la suma puede variar entre 0 y 70; en consecuencia, el factor puede variar entre 0.65 y 1.35. Ese intervalo permite ajustar el conteo sin ajustar en ±35 %.

La constante **0.85 no pertenece a esta fórmula**. Puede aparecer en ejemplos por alguna de estas razones:

1. se sustituyó previamente un grado total de influencia de 20, pues `0.65 + 0.01 × 20 = 0.85`;
2. se aplicó una adaptación institucional distinta;
3. se transcribió incorrectamente la fórmula.

No debe reemplazarse 0.65 por 0.85 mientras se afirme que se utiliza el ajuste clásico de Pressman con las 14 características. Fuentes metodológicas que presentan la fórmula `VAF = 0.65 + 0.01 × TDI` incluyen el material de formación IFPUG alojado por la [Universidad de São Paulo](https://sites.poli.usp.br/d/pmr2490/fp_training.pdf), el capítulo académico de [Pearson Higher Education](https://www.pearsonhighered.com/assets/samplechapter/0/2/0/1/0201729156.pdf) y el estudio revisado por pares en [Information and Software Technology](https://doi.org/10.1016/S0950-5849(00)00108-7).

Como precisión metodológica, el ajuste mediante GSC/VAF es una extensión tradicional y actualmente puede tratarse como opcional; el tamaño funcional más reproducible sigue siendo el PF sin ajustar. Para una tesis que explícitamente sigue el procedimiento clásico de Pressman, sí corresponde mostrar ambos resultados y documentar las valoraciones.

## 5. Cálculo final

La suma de las características es:

\[
\sum F_i = 3+3+2+0+0+4+3+4+5+2+1+2+0+3 = 32
\]

El factor de ajuste es:

\[
FA = 0.65 + (0.01 \times 32)
\]

\[
FA = 0.65 + 0.32 = \mathbf{0.97}
\]

Con `PFSA = 717`:

\[
PFA = PFSA \times FA
\]

\[
PFA = 717 \times 0.97 = \mathbf{695.49}
\]

Por tanto:

- **Puntos de Función sin ajustar: 717 PF**.
- **Factor de ajuste: 0.97**.
- **Puntos de Función ajustados: 695.49 PF**.
- Si la presentación exige números enteros: **695 PF**, redondeando solo al final.

## 6. Párrafo listo para tesis

> Para determinar el factor de ajuste de complejidad se evaluaron las 14 características generales del sistema propuestas en el método clásico de Puntos de Función difundido por Pressman, utilizando una escala de cero a cinco. La valoración se sustentó en la implementación observable y se mantuvo un criterio conservador, evitando asignar niveles altos a características sin pruebas de carga, operación multisitio o automatización de despliegue. La suma de los grados de influencia fue 32. Aplicando la fórmula `FA = 0.65 + (0.01 × ΣFi)`, se obtuvo un factor de ajuste de 0.97. Finalmente, al multiplicar los 717 Puntos de Función sin ajustar por dicho factor, se obtuvo un tamaño ajustado de 695.49 Puntos de Función, equivalente a 695 PF al redondear al entero más próximo. La constante utilizada es 0.65, ya que corresponde a la formulación clásica basada en las 14 características; el valor 0.85 no es una constante alternativa del método, sino que podría resultar de sustituir una suma de influencias igual a 20 o de aplicar una adaptación diferente.

