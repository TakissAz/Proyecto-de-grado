# Cálculo de Puntos de Función del sistema experto para PMOS y resistencia a la insulina

## 1. Propósito y criterio de medición

Este documento presenta el conteo de Puntos de Función (PF) del sistema experto de apoyo al diagnóstico, planificación nutricional y seguimiento de pacientes con síndrome de ovario poliquístico (PMOS/SOMP) y resistencia a la insulina. Se emplea el esquema divulgado por Pressman: entradas externas (EE), salidas externas (SE), consultas externas (CE), archivos lógicos internos (ALI) y archivos o interfaces externas (AIE).

El conteo se realizó sobre las funciones realmente implementadas y contrastadas con:

- `routes/web.php` y `routes/auth.php`;
- controladores, servicios y modelos de la aplicación Laravel;
- migraciones de PostgreSQL;
- microservicio `pmos-experto` (FastAPI, ZEN Engine y modelos JDM);
- pruebas automatizadas y requerimientos funcionales RF-01 a RF-98.

No se utilizó la equivalencia incorrecta «una ruta = una función» ni «un modelo = un archivo lógico».

### 1.1. Frontera de la aplicación

La frontera medida comprende la solución completa desarrollada para la tesis:

1. interfaz React/Inertia;
2. aplicación Laravel;
3. base de datos propia PostgreSQL;
4. microservicio FastAPI y motor ZEN;
5. modelos de decisión JDM propios.

El navegador y los cuatro roles —administrador, endocrinólogo, nutricionista y paciente— están fuera de la frontera y se consideran usuarios. Google y Groq son sistemas externos. FastAPI/Zen no es una interfaz externa, porque es un componente propio incluido en la frontera del producto medido.

### 1.2. Regla de agrupación

Se contó un proceso elemental cuando la interacción tiene un propósito reconocible para el usuario y deja al sistema en un estado funcionalmente consistente. En consecuencia:

- las rutas `create` y `edit` solo presentan formularios y no se cuentan por separado;
- `POST` y `PUT/PATCH` se agrupan cuando implementan el mismo mantenimiento lógico;
- las variantes de una misma función para endocrinólogo y nutricionista no se duplican;
- activar, inactivar o bloquear se agrupan como un único cambio de estado cuando comparten propósito y lógica;
- tablas hijas que solo existen como parte de un agregado —ingredientes de receta, días, comidas y componentes de un plan— no se cuentan como ALI independientes;
- middleware, redirecciones, comandos de consola, endpoints de salud, caché, colas y pruebas no representan funciones de usuario.

## 2. Resultado final del dominio de información

| Tipo funcional | Sigla | Cantidad final |
|---|---:|---:|
| Entradas externas de usuario | EE | **46** |
| Salidas externas | SE | **31** |
| Consultas o peticiones externas | CE | **31** |
| Archivos lógicos internos | ALI | **24** |
| Archivos o interfaces externas | AIE | **2** |

Estos valores son el resultado del conteo lógico consolidado. Las 214 rutas web y los 39 modelos Eloquent solo se emplearon como evidencia de cobertura, no como unidades de conteo.

## 3. Entradas externas (EE = 46)

Una EE introduce datos o información de control desde fuera de la frontera y su intención principal es mantener uno o más ALI o modificar el comportamiento del sistema.

| ID | Proceso lógico contado | Rutas agrupadas o alcance | Justificación |
|---:|---|---|---|
| EE-01 | Iniciar y cerrar sesión local | `login`, `logout` | Introduce credenciales/control y mantiene el estado de acceso. Inicio y cierre forman la gestión de la sesión, no pantallas independientes. |
| EE-02 | Registrar cuenta desde el formulario público | `register` | Mantiene usuarios. Se cuenta porque la ruta está habilitada e implementada, aunque su inclusión funcional debe confirmarse con el alcance final. |
| EE-03 | Solicitar y completar recuperación de contraseña | `forgot-password`, `reset-password` | Las dos rutas son pasos del mismo objetivo lógico: recuperar el acceso. |
| EE-04 | Cambiar contraseña autenticada | `password.update` | Mantiene credenciales mediante un proceso distinto al restablecimiento por token. |
| EE-05 | Actualizar o eliminar cuenta propia | `profile.update`, `profile.destroy` | Un único mantenimiento del perfil propio; la eliminación es una variante del ciclo de vida de la cuenta. |
| EE-06 | Mantener usuarios administrativos | alta y actualización de usuarios | Mantiene datos y rol del usuario; formularios GET excluidos. |
| EE-07 | Cambiar estado de usuario | activar, inactivar y bloquear | Las tres acciones constituyen un solo proceso de control de estado. |
| EE-08 | Registrar o actualizar paciente | rutas de pacientes de los tres roles | Es el mismo proceso lógico aunque existan controladores por rol. |
| EE-09 | Cambiar estado de paciente | activar e inactivar | Mantiene el estado operativo del expediente. |
| EE-10 | Registrar o actualizar cita | rutas de citas de endocrinología y nutrición | Agenda, fecha, modalidad y motivo; no se duplica por tipo profesional. |
| EE-11 | Cambiar estado de cita | confirmar, atendida, no asistió y cancelar | Un proceso de transición del ciclo de vida de la cita. |
| EE-12 | Registrar o actualizar consulta endocrinológica | consulta endocrinológica | Mantiene la atención endocrinológica. |
| EE-13 | Registrar o actualizar historia menstrual | historia menstrual | Mantiene un grupo clínico reconocible e histórico. |
| EE-14 | Registrar o actualizar hiperandrogenismo | historia hiperandrogénica | Mantiene manifestaciones clínicas de hiperandrogenismo. |
| EE-15 | Registrar o actualizar antecedentes | antecedentes endocrino-metabólicos | Mantiene antecedentes personales, familiares y medicamentos. |
| EE-16 | Registrar o actualizar evaluación física | evaluación física endocrina | Mantiene antropometría, presión y hallazgos físicos. |
| EE-17 | Registrar o actualizar perfil androgénico | laboratorios/perfil-androgenico | Mantiene resultados de este perfil de laboratorio. |
| EE-18 | Registrar o actualizar perfil gonadotrópico | laboratorios/perfil-gonadotropo | Mantiene resultados de este perfil. |
| EE-19 | Registrar o actualizar estudios diferenciales | laboratorios/diferenciales | Mantiene resultados para descarte diferencial. |
| EE-20 | Registrar o actualizar glucosa e insulina | laboratorios/glucosa-insulina | Mantiene valores metabólicos de entrada. |
| EE-21 | Registrar o actualizar perfil lipídico | laboratorios/perfil-lipidico | Mantiene resultados lipídicos. |
| EE-22 | Registrar o actualizar ecografía | ecografía | Mantiene hallazgos ecográficos ováricos. |
| EE-23 | Registrar o corregir diagnóstico clínico PMOS | diagnóstico PMOS | Mantiene la conclusión profesional, diferenciada de la inferencia automática. |
| EE-24 | Registrar o corregir diagnóstico clínico de RI | diagnóstico RI | Mantiene la conclusión profesional de resistencia a la insulina. |
| EE-25 | Validar o rechazar resultado experto PMOS | sistema experto/PMOS/validar | Introduce decisión, observación y responsable profesional. |
| EE-26 | Validar o rechazar resultado experto RI | sistema experto/RI/validar | Proceso equivalente, pero con reglas, datos y ALI diagnóstico distintos. |
| EE-27 | Derivar paciente a nutrición | derivar-nutricion | Crea la derivación con motivo, prioridad y profesional. |
| EE-28 | Cambiar estado de derivación | vista, en proceso y atendida | Mantiene una única máquina de estados de atención. |
| EE-29 | Registrar o actualizar consulta nutricional | perfil nutricional/consulta | Mantiene la atención nutricional. |
| EE-30 | Registrar o actualizar evaluación nutricional | perfil nutricional/evaluación | Mantiene antropometría y evaluación nutricional. |
| EE-31 | Registrar o actualizar hábitos alimentarios | perfil nutricional/hábitos | Mantiene hábitos históricos del paciente. |
| EE-32 | Registrar o actualizar preferencias | perfil nutricional/preferencias | Mantiene preferencias y rechazos. |
| EE-33 | Registrar o actualizar restricciones | perfil nutricional/restricciones | Mantiene alergias, intolerancias y restricciones obligatorias. |
| EE-34 | Registrar o actualizar objetivos | perfil nutricional/objetivos | Mantiene metas, prioridad y plazo. |
| EE-35 | Validar recomendación nutricional experta | recomendaciones/validar | Mantiene aprobación, rechazo, observación y responsable. |
| EE-36 | Mantener catálogo de alimentos | alta, actualización y estado de alimentos | Un único proceso CRUD lógico; las pantallas y cambios de estado no se duplican. |
| EE-37 | Mantener catálogo de recetas | alta, actualización y estado de recetas/ingredientes | Receta e ingredientes forman un agregado mantenido en conjunto. |
| EE-38 | Mantener reglas nutricionales | alta y actualización de reglas | Introduce y modifica conocimiento nutricional autorizado. |
| EE-39 | Editar contenido del plan alimentario | comidas y componentes del plan | Crear, modificar y retirar componentes son variantes de edición de un mismo agregado. |
| EE-40 | Aprobar o rechazar plan alimentario | actualización de estado del plan | Introduce la decisión profesional y ejecuta validaciones de estructura. |
| EE-41 | Finalizar ciclo del plan | finalizar-y-generar-siguiente | Mantiene el cierre del plan; la generación del siguiente se clasifica como salida. |
| EE-42 | Registrar cumplimiento de comida | seguimiento de comida | El paciente introduce estado, porcentaje y observación. |
| EE-43 | Registrar síntomas y bienestar | seguimiento-síntomas | Introduce energía, hambre, síntomas, sueño, actividad y agua. |
| EE-44 | Enviar retroalimentación profesional/paciente | retroalimentaciones | Mantiene un mensaje asociado al expediente. |
| EE-45 | Marcar retroalimentación como leída | retroalimentaciones/marcar-leida | Mantiene un estado de lectura con intención distinta al envío. |
| EE-46 | Marcar notificaciones como leídas | notificaciones/leer y leer-todas | Una sola función, individual o masiva, que mantiene el estado de notificación. |

## 4. Salidas externas (SE = 31)

Una SE entrega información fuera de la frontera y contiene cálculo, agregación, transformación, reglas, inferencia o formato significativo. No se cuentan simples lecturas sin cálculo.

| ID | Salida lógica contada | Justificación |
|---:|---|---|
| SE-01 | Panel administrativo de métricas | Agrega usuarios, pacientes, actividad y métricas operativas. |
| SE-02 | Respaldo descargable de PostgreSQL | Transforma la persistencia en un archivo externo recuperable. |
| SE-03 | Panel endocrinológico | Calcula y resume pacientes, citas e indicadores clínicos. |
| SE-04 | Panel nutricional | Agrega derivaciones, planes, seguimiento y alertas. |
| SE-05 | Panel principal del paciente | Combina plan, progreso, citas, alertas y acciones próximas. |
| SE-06 | Seguimiento gráfico endocrinológico | Presenta series temporales e indicadores calculados. |
| SE-07 | Inferencia experta PMOS | Construye hechos, ejecuta reglas Rotterdam y produce conclusión, fenotipo y trazabilidad. |
| SE-08 | Inferencia experta de resistencia a la insulina | Calcula HOMA-IR/QUICKI, ejecuta reglas y produce clasificación explicable. |
| SE-09 | Reporte PDF conjunto de diagnóstico | Integra datos clínicos, resultados PMOS/RI y validación. |
| SE-10 | Reporte PDF específico PMOS | Formatea criterios, fenotipo, reglas y decisión profesional. |
| SE-11 | Reporte PDF específico de RI | Formatea índices, clasificación, riesgos y validación. |
| SE-12 | Reporte PDF de historia menstrual | Produce documento clínico a partir del historial. |
| SE-13 | Reporte PDF de hiperandrogenismo | Produce documento clínico especializado. |
| SE-14 | Reporte PDF de antecedentes | Consolida colecciones de antecedentes y medicamentos. |
| SE-15 | Reporte PDF de evaluación física | Presenta valores y cálculos antropométricos. |
| SE-16 | Reporte PDF de laboratorios | Consolida los cinco perfiles de laboratorio. |
| SE-17 | Reporte PDF de ecografía | Formatea hallazgos ecográficos. |
| SE-18 | Cálculo de requerimientos nutricionales | Calcula TMB, GET, energía, macronutrientes, fibra y reglas aplicadas; además persiste el resultado. La intención principal es producir información derivada. |
| SE-19 | Recomendación nutricional experta | Integra hechos endocrinos/nutricionales y produce enfoque, macros, restricciones, alertas y trazabilidad. |
| SE-20 | Generación de plan alimentario semanal | Clasifica recetas, distribuye energía y produce siete días y 28 comidas. |
| SE-21 | Generación del siguiente plan | Usa seguimiento y plan anterior para producir un nuevo plan justificado. |
| SE-22 | Respuesta del copiloto nutricional | Produce explicación, auditoría o respuesta profesional estructurada mediante Groq, sin modificar el plan. |
| SE-23 | Reporte PDF justificativo del plan | Presenta fundamentos técnicos, distribución y trazabilidad. |
| SE-24 | Reporte PDF de cambios del plan | Calcula y presenta diferencias entre versiones/ciclos. |
| SE-25 | Reporte PDF del historial de planes | Consolida períodos, estados, comidas y cambios. |
| SE-26 | Analítica de progreso de pacientes para nutrición | Clasifica seguimiento pendiente, parcial o adecuado y agrega evolución. |
| SE-27 | Reporte PDF de adherencia de pacientes | Calcula adherencia filtrada y genera documento. |
| SE-28 | Reporte PDF de seguimiento y evolución | Combina antropometría, adherencia, síntomas y períodos. |
| SE-29 | Progreso personal del paciente | Calcula adherencia diaria/semanal y evolución autorizada. |
| SE-30 | Lista de compras semanal | Agrupa y consolida ingredientes por alimento/categoría. |
| SE-31 | PDF práctico del plan para el paciente | Transforma el plan en instrucciones y comidas, omitiendo trazabilidad técnica. |

## 5. Consultas externas (CE = 31)

Una CE tiene entrada de selección —identificador, búsqueda o filtro— y salida inmediata, sin cálculo sustancial ni mantenimiento de ALI. Paginación, búsqueda y filtro de una misma lista se consideran una sola consulta.

| ID | Consulta lógica contada | Justificación |
|---:|---|---|
| CE-01 | Consultar usuarios | Lista, busca y filtra usuarios sin modificar datos. |
| CE-02 | Consultar pacientes | Lista, busca y filtra pacientes; no se duplica por rol. |
| CE-03 | Consultar detalle del paciente | Recupera el expediente demográfico autorizado. |
| CE-04 | Consultar auditoría de pacientes/actividad | Recupera eventos y cambios con filtros, sin transformación sustancial. |
| CE-05 | Consultar registros de acceso | Recupera intentos de inicio/cierre de sesión. |
| CE-06 | Consultar citas | Lista/calendario por profesional o paciente; mismo objetivo lógico. |
| CE-07 | Consultar bloques disponibles de cita | Recibe fecha/profesional y devuelve disponibilidad sin mantener datos. |
| CE-08 | Consultar notificaciones | Recupera notificaciones del usuario autenticado. |
| CE-09 | Consultar derivaciones | Lista y detalle forman la consulta del caso derivado. |
| CE-10 | Consultar perfil clínico endocrinológico | Recupera las secciones clínicas del paciente. |
| CE-11 | Consultar historial menstrual | Recupera registros cronológicos. |
| CE-12 | Consultar historial de hiperandrogenismo | Recupera registros cronológicos. |
| CE-13 | Consultar historial de antecedentes | Recupera antecedentes históricos. |
| CE-14 | Consultar historial de evaluaciones físicas | Recupera evaluaciones históricas. |
| CE-15 | Consultar historial de laboratorios | Recupera los perfiles de laboratorio sin recalcularlos. |
| CE-16 | Consultar historial ecográfico | Recupera evaluaciones ecográficas. |
| CE-17 | Consultar historial/estado diagnóstico | Recupera diagnósticos PMOS/RI y validaciones existentes. |
| CE-18 | Consultar perfil nutricional | Recupera consulta, evaluación, contexto y requerimientos. |
| CE-19 | Consultar historial de evaluaciones nutricionales | Lectura cronológica sin cálculo. |
| CE-20 | Consultar historial de hábitos | Lectura cronológica. |
| CE-21 | Consultar historial de preferencias | Lectura cronológica. |
| CE-22 | Consultar historial de restricciones | Lectura cronológica. |
| CE-23 | Consultar historial de objetivos | Lectura cronológica. |
| CE-24 | Consultar/buscar alimentos | Lista y autocompletado son variantes de la misma consulta al catálogo. |
| CE-25 | Consultar recetas | Lista y detalle de receta se agrupan como consulta del catálogo. |
| CE-26 | Consultar reglas nutricionales | Recupera reglas y condiciones existentes. |
| CE-27 | Consultar planes de un paciente | Lista períodos y estados, sin cálculo. |
| CE-28 | Consultar detalle del plan | Recupera días, comidas, componentes y fundamento persistido. |
| CE-29 | Consultar historial de planes | Recupera ciclos previos; el PDF derivado se contó como SE. |
| CE-30 | Consultar seguimiento, síntomas e historial personal | Vistas de lectura del registro diario del paciente; se agrupan por el mismo propósito de revisión. |
| CE-31 | Consultar retroalimentaciones/orientación | Recupera mensajes profesionales autorizados. |

## 6. Archivos lógicos internos (ALI = 24)

Un ALI es un grupo lógico de datos reconocible por el usuario, mantenido dentro de la frontera. No equivale automáticamente a una tabla o modelo. Las tablas hijas inseparables se agrupan y las tablas técnicas de framework se excluyen.

| ID | Grupo lógico | Tablas/modelos incluidos de forma resumida | Razón de agrupación |
|---:|---|---|---|
| ALI-01 | Identidad, roles y credenciales | usuarios, roles y relación usuario-rol | Se mantienen como una unidad de acceso y autorización. |
| ALI-02 | Paciente | datos demográficos y vínculo con cuenta | Expediente básico independiente. |
| ALI-03 | Auditoría y accesos | actividad y registros de acceso | Historial transversal reconocido por administración. |
| ALI-04 | Citas | citas profesionales/paciente | Ciclo de vida propio. |
| ALI-05 | Consultas endocrinológicas | consultas endocrinas | Cabecera clínica con mantenimiento propio. |
| ALI-06 | Historia menstrual | registros menstruales | Historial clínico autónomo y reconocible. |
| ALI-07 | Hiperandrogenismo | historia hiperandrogénica | Sección clínica independiente. |
| ALI-08 | Antecedentes endocrino-metabólicos | antecedentes y colecciones asociadas | Se mantienen conjuntamente. |
| ALI-09 | Evaluaciones físicas | evaluaciones físicas endocrinas | Historial antropométrico/físico propio. |
| ALI-10 | Resultados de laboratorio | androgénico, gonadotrópico, diferenciales, glucosa-insulina y lípidos | Cinco tipos de registro (RET) dentro del expediente lógico de laboratorios; no cinco ALI artificiales. |
| ALI-11 | Evaluaciones ecográficas | ecografías ováricas | Historial y mantenimiento propios. |
| ALI-12 | Diagnósticos y trazabilidad experta | diagnósticos PMOS y RI, hechos, reglas, explicación y validación | PMOS y RI son tipos de registro del mismo expediente diagnóstico. |
| ALI-13 | Derivaciones nutricionales | derivación, prioridad y estado | Ciclo de atención independiente. |
| ALI-14 | Notificaciones internas | notificaciones y lectura | Grupo lógico mantenido por el sistema. |
| ALI-15 | Consultas y evaluaciones nutricionales | consultas y evaluaciones | Cabecera y valoración del perfil nutricional. |
| ALI-16 | Contexto alimentario del paciente | hábitos, preferencias y restricciones | Datos de contexto usados conjuntamente para decidir el plan; se consideran RET, no tres archivos separados. |
| ALI-17 | Objetivos y requerimientos nutricionales | objetivos, TMB, GET, macros y reglas aplicadas | Objetivos y cálculo prescrito forman el expediente de metas/requerimientos. |
| ALI-18 | Catálogo de alimentos | alimentos y composición | Catálogo mantenido independientemente. |
| ALI-19 | Catálogo de recetas | recetas y receta-alimentos | Ingredientes no existen funcionalmente fuera de su receta. |
| ALI-20 | Reglas nutricionales | condiciones, prioridad y ajustes | Conocimiento mantenido por nutrición. |
| ALI-21 | Recomendaciones nutricionales expertas | resultado, hechos, reglas, restricciones y validación | Expediente trazable de recomendación. |
| ALI-22 | Planes alimentarios | plan, días, comidas y componentes | Un agregado único de siete días; sus tablas hijas no son ALI independientes. |
| ALI-23 | Seguimiento del paciente | cumplimiento de comidas y síntomas/bienestar | Dos tipos de registro del seguimiento diario. |
| ALI-24 | Retroalimentación profesional-paciente | mensajes, prioridad, visibilidad y lectura | Conversación clínica con ciclo propio. |

Se excluyen expresamente `cache`, `jobs`, sesiones y tablas auxiliares del framework porque no son grupos de información reconocibles por el usuario. Los documentos PDF tampoco son ALI: son representaciones de salida regenerables.

## 7. Archivos o interfaces externas (AIE = 2)

Para mantener compatibilidad con el tratamiento simplificado de Pressman usado habitualmente en tesis, se cuentan las interfaces de datos externas realmente consumidas por la aplicación:

| ID | Interfaz externa | Información intercambiada | Justificación |
|---:|---|---|---|
| AIE-01 | Google OAuth | identidad, correo, identificador Google y avatar | Google mantiene la identidad externa; la aplicación solo la consulta para autenticar una cuenta local previamente autorizada. |
| AIE-02 | API de Groq | contexto autorizado del plan, preguntas y respuestas estructuradas | El proveedor externo procesa la solicitud y devuelve explicación/ranking; Laravel no mantiene el modelo externo. |

No se cuentan:

- **FastAPI/ZEN:** es parte de la solución medida, por tanto la llamada HTTP es una interfaz interna entre componentes;
- **PostgreSQL:** es el mecanismo de persistencia de los ALI, no otro sistema de negocio;
- **Dompdf:** es una biblioteca incluida, no un sistema externo que mantenga datos;
- **`pg_dump`:** es una herramienta técnica de respaldo;
- **correo SMTP:** existe configuración de framework, pero no se identificó una función de negocio propia suficientemente autónoma para contarlo como AIE.

> **Salvedad metodológica:** en IFPUG estricto, un AIE debe ser un grupo lógico de datos identificable por el usuario y mantenido por otra aplicación. Una API transitoria no siempre cumple esa definición. Bajo esa lectura estricta, Groq —y posiblemente Google OAuth— no serían AIE y el total AIE podría ser cero. En este informe se adopta la interpretación de “interfaces externas” de Pressman solicitada por el estudio y se muestra más adelante el efecto de la alternativa conservadora.

## 8. Tabla de ponderaciones de Pressman

| Dominio | Simple | Media | Compleja |
|---|---:|---:|---:|
| Entradas externas (EE) | 3 | 4 | 6 |
| Salidas externas (SE) | 4 | 5 | 7 |
| Consultas externas (CE) | 3 | 4 | 6 |
| Archivos lógicos internos (ALI) | 7 | 10 | 15 |
| Archivos/interfaces externas (AIE) | 5 | 7 | 10 |

La clasificación formal de cada función como simple, media o compleja exige contar tipos de datos elementales (DET), tipos de archivos referenciados (FTR) y tipos de registros (RET). Debido a que la solicitud requiere el cálculo con ponderación media homogénea, se aplican los pesos de la columna **Media** a todas las funciones. Esto evita atribuir complejidad alta sin una matriz DET/FTR/RET validada campo por campo.

## 9. Puntos de Función sin ajustar con ponderación media

La fórmula empleada es:

\[
PFSA = (EE \times 4) + (SE \times 5) + (CE \times 4) + (ALI \times 10) + (AIE \times 7)
\]

| Dominio | Cantidad | Peso medio | Subtotal |
|---|---:|---:|---:|
| EE | 46 | 4 | 184 |
| SE | 31 | 5 | 155 |
| CE | 31 | 4 | 124 |
| ALI | 24 | 10 | 240 |
| AIE | 2 | 7 | 14 |
| **Total** | **134 funciones** |  | **717 PFSA** |

Por tanto, el tamaño funcional principal que debe informarse es:

> **Puntos de Función sin ajustar (PFSA): 717**

## 10. Factor de ajuste por las 14 características generales

Pressman utiliza 14 características generales del sistema, valoradas de 0 (sin influencia) a 5 (influencia esencial). El factor de ajuste se calcula como:

\[
FA = 0.65 + 0.01 \times \sum F_i
\]

La valoración siguiente es deliberadamente conservadora y se fundamenta en la implementación observable, no en beneficios futuros.

| N.º | Característica | Valor | Evidencia y justificación |
|---:|---|---:|---|
| 1 | Comunicación de datos | 3 | Navegador-Laravel, Laravel-FastAPI por HTTP/JSON, Google y Groq; no se demuestra una red especialmente heterogénea. |
| 2 | Procesamiento distribuido | 3 | Laravel coordina persistencia y FastAPI/ZEN ejecuta inferencia en otro proceso, sin una malla distribuida compleja. |
| 3 | Rendimiento | 2 | Existen timeouts y paginación, pero los tiempos documentados siguen siendo objetivos sin prueba formal de carga. |
| 4 | Configuración fuertemente utilizada | 0 | No existe evidencia de restricciones críticas de hardware ni utilización intensiva de una configuración específica. |
| 5 | Tasa de transacciones | 0 | No hay requisito ni prueba de picos, alto volumen o concurrencia sostenida. |
| 6 | Entrada de datos en línea | 4 | La mayoría de expedientes, planes y seguimientos se capturan y validan en la web; no se asigna 5 sin medición cuantitativa. |
| 7 | Eficiencia del usuario final | 3 | Hay flujos por rol, filtros, paneles, autocompletado y formularios especializados, pero no estudio formal de usabilidad. |
| 8 | Actualización en línea | 4 | La mayoría de los ALI operativos se actualizan en línea con validación y transacciones; no se acredita recuperación automatizada integral. |
| 9 | Procesamiento complejo | 5 | Reglas PMOS/RI, HOMA-IR/QUICKI, recomendación, clasificación de recetas, planificación y adherencia. |
| 10 | Reutilización | 2 | Existen servicios y componentes reutilizados dentro del producto, pero no evidencia de diseño o distribución para otros sistemas. |
| 11 | Facilidad de instalación | 1 | Existen dependencias y configuración, pero no instalador autónomo ni despliegue de un paso demostrado. |
| 12 | Facilidad operacional | 2 | Hay auditoría, errores controlados, respaldo y degradación ante Groq, pero no operación autónoma ni recuperación completa demostrada. |
| 13 | Múltiples sitios | 0 | Ser una aplicación web no prueba despliegue multisitio; no hay requisito ni evidencia de instalaciones múltiples. |
| 14 | Facilidad de cambio | 3 | Monolito modular, servicios, reglas JDM y pruebas favorecen cambios, sin métricas formales de mantenibilidad. |
|  | **Grado total de influencia (GDI)** | **32** |  |

Por tanto:

\[
FA = 0.65 + (0.01 \times 32) = 0.97
\]

\[
PFA = 717 \times 0.97 = 695.49
\]

El resultado ajustado es:

> **Puntos de Función ajustados (PFA): 695.49 ≈ 695 PF**

La cifra con decimales debe conservarse durante los cálculos; si el formato de la tesis exige un entero, se redondea al final a 695 PF.

## 11. Análisis de sensibilidad y elementos dudosos

Para evitar inflación artificial, estos puntos deben exponerse ante el tribunal:

### 11.1. Registro público de cuenta (EE-02)

La ruta y pruebas de registro existen, pero los requerimientos del dominio indican que el personal autorizado registra pacientes. Si el formulario público será deshabilitado en la versión entregada, debe excluirse: el total bajaría 4 PFSA y el ajustado sería `713 × 0.97 = 691.61 PF`.

### 11.2. Google y Groq como AIE

Se cuentan bajo la interpretación simplificada solicitada de interfaces externas. Bajo IFPUG estricto, si se determina que no son grupos lógicos persistentes referenciados, se usaría AIE = 0:

\[
PFSA_{conservador} = 717 - (2 \times 7) = 703
\]

\[
PFA_{conservador} = 703 \times 0.97 = 681.91
\]

Por transparencia académica, se recomienda presentar **717 PFSA** como resultado Pressman y mencionar **703 PFSA** como sensibilidad bajo la interpretación estricta de AIE.

### 11.3. Autenticación y mantenimiento de estados

No se contaron como funciones independientes todas las rutas de activar, inactivar, bloquear, confirmar, cancelar o marcar lectura. Se agruparon por objetivo y entidad. Esta decisión reduce el conteo frente a una medición basada en endpoints.

### 11.4. Informes PDF

Cada PDF se mantuvo como SE únicamente cuando posee audiencia, contenido o formato funcional diferente. No se contaron plantillas, controladores ni botones como funciones adicionales. El reporte conjunto y los reportes PMOS/RI se mantienen separados porque responden a solicitudes y productos clínicos distintos; si el tribunal los considera variantes del mismo reporte, pueden consolidarse y restarse 10 PFSA (dos SE menos respecto de tres salidas).

### 11.5. Archivos clínicos y nutricionales

El conteo de 24 ALI agrupa tablas hijas y tipos estrechamente dependientes. En particular, cinco tablas de laboratorio se consideran tipos de registro de un solo ALI; cuatro tablas estructurales del plan forman un solo ALI; hábitos, preferencias y restricciones forman el contexto alimentario. Separarlas por tabla inflaría fuertemente el resultado.

### 11.6. Factor de ajuste

Las calificaciones de las 14 características contienen juicio técnico. El PFSA es la cifra más reproducible. Para una defensa sólida, debe presentarse primero 717 PFSA, acompañar la matriz de valores y declarar que 695.49 PF depende del GDI = 32. No deben asignarse valores de 4 o 5 a volumen, multisitio o instalación sin pruebas.

## 12. Resultado recomendado para la tesis

> Mediante el método de Puntos de Función de Pressman se identificaron 46 entradas externas, 31 salidas externas, 31 consultas externas, 24 archivos lógicos internos y 2 interfaces externas. Aplicando ponderación media se obtuvieron 717 Puntos de Función sin ajustar. La suma conservadora de las 14 características generales fue 32, lo que produjo un factor de ajuste de 0.97 y un tamaño funcional ajustado de 695.49, redondeado a 695 Puntos de Función. El conteo consolidó rutas pertenecientes al mismo proceso elemental y agrupó las tablas dependientes en archivos lógicos reconocibles, evitando estimar el tamaño a partir del número de endpoints o modelos físicos.

## 13. Trazabilidad y reproducibilidad

La medición debe versionarse junto con la entrega evaluada. Si se agrega, elimina o deshabilita una funcionalidad antes de la defensa, se actualiza primero el inventario EE/SE/CE/ALI/AIE y después se repite la multiplicación. No corresponde modificar el conteo por refactorizaciones internas que no cambien lo que el usuario recibe.

Las evidencias principales del repositorio son:

- `documentacion/analisis-requerimientos/REQUERIMIENTOS_FUNCIONALES_Y_NO_FUNCIONALES.md`;
- `documentacion/analisis-requerimientos/ARQUITECTURA_Y_PATRONES_DEL_SISTEMA.md`;
- `routes/web.php` y `routes/auth.php`;
- `app/Http/Controllers`;
- `app/Services`;
- `database/migrations`;
- `pmos-experto/app`;
- `tests/Feature` y `tests/Unit`.
