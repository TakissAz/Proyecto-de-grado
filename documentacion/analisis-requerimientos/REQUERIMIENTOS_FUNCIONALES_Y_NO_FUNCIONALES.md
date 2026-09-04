# Análisis y requerimientos del sistema

## 1. Propósito

El presente documento especifica los requerimientos funcionales y no funcionales del sistema web para apoyo al diagnóstico endocrinológico de síndrome de ovario poliquístico (PMOS), evaluación de resistencia a la insulina (RI), orientación nutricional experta, planificación alimentaria y seguimiento de pacientes.

La solución integra una aplicación Laravel con interfaces React/Inertia, un microservicio FastAPI y un motor de reglas ZEN Engine. El sistema proporciona apoyo a la decisión, pero no reemplaza el criterio del endocrinólogo ni de la nutricionista.

## 2. Alcance

El sistema comprende:

- administración de usuarios y roles;
- gestión de pacientes;
- registro del perfil clínico endocrinológico;
- evaluación de PMOS y resistencia a la insulina;
- ejecución y validación de resultados del sistema experto;
- derivación desde endocrinología hacia nutrición;
- registro del perfil nutricional;
- generación y validación de recomendaciones nutricionales expertas;
- generación, edición, aprobación y seguimiento de planes alimentarios;
- portal del paciente;
- citas, reportes, auditoría y respaldo de la base de datos;
- apoyo generativo controlado para la nutricionista mediante Groq.

Quedan fuera del alcance actual:

- sustitución del diagnóstico emitido por un profesional;
- prescripción farmacológica automática;
- modificación automática de un plan por parte de la IA generativa;
- autorregistro de usuarios mediante Google;
- entrenamiento de modelos predictivos con expedientes reales;
- interoperabilidad formal con sistemas hospitalarios externos mediante HL7 o FHIR.

## 3. Actores del sistema

| Actor | Descripción | Responsabilidades principales |
|---|---|---|
| Administrador | Usuario encargado de la gestión general y supervisión. | Usuarios, roles, métricas, auditoría, sesiones y respaldos. |
| Endocrinólogo | Profesional responsable de la evaluación endocrinológica. | Perfil clínico, diagnóstico PMOS/RI, validación y derivación. |
| Nutricionista | Profesional responsable de la intervención nutricional. | Perfil nutricional, recomendación, plan, seguimiento y reportes. |
| Paciente | Persona que recibe atención clínica y nutricional. | Consultar plan, registrar cumplimiento, síntomas y progreso. |
| Microservicio experto | Servicio FastAPI encargado de ejecutar modelos JDM. | Evaluar hechos y devolver resultados trazables. |
| Servicio Groq | Proveedor externo de IA generativa. | Explicar, auditar y proponer borradores no vinculantes. |

## 4. Convenciones

- **RF:** requerimiento funcional.
- **RNF:** requerimiento no funcional.
- **RN:** regla de negocio.
- **Alta:** necesaria para que el proceso principal funcione.
- **Media:** aporta una capacidad importante, pero el proceso básico puede operar sin ella.
- **Baja:** capacidad complementaria o de mejora.

# 5. Requerimientos funcionales

## 5.1. Autenticación, autorización y cuenta

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-01 | El sistema deberá permitir iniciar sesión mediante correo y contraseña. | Todos | Alta | Las credenciales válidas crean una sesión y las inválidas muestran un error. |
| RF-02 | El sistema deberá permitir iniciar sesión mediante Google solamente cuando el correo ya exista en `users`. | Todos | Media | Un correo autorizado inicia sesión; uno desconocido no crea una cuenta. |
| RF-03 | El sistema deberá cerrar la sesión del usuario de forma segura. | Todos | Alta | La sesión queda invalidada y el usuario vuelve a la pantalla de acceso. |
| RF-04 | El sistema deberá redirigir al usuario al panel correspondiente a su rol. | Todos | Alta | Administrador, endocrinólogo, nutricionista y paciente reciben paneles diferenciados. |
| RF-05 | El sistema deberá restringir rutas y acciones según autenticación, verificación y rol. | Todos | Alta | Un usuario sin autorización recibe redirección o respuesta 403. |
| RF-06 | El usuario deberá poder consultar y actualizar los datos permitidos de su cuenta. | Todos | Media | Los cambios válidos se guardan y los datos inválidos son rechazados. |
| RF-07 | El sistema deberá permitir recuperación y cambio seguro de contraseña. | Todos | Media | El proceso usa mecanismos de restablecimiento y validación de contraseña. |

## 5.2. Administración y supervisión

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-08 | El administrador deberá visualizar un panel con métricas generales. | Administrador | Alta | El panel muestra usuarios, pacientes, actividad y métricas operativas disponibles. |
| RF-09 | El administrador deberá listar, buscar y filtrar usuarios. | Administrador | Alta | Los filtros actualizan el listado y la paginación conserva su estructura. |
| RF-10 | El administrador deberá crear y actualizar usuarios y asignarles roles existentes. | Administrador | Alta | El usuario queda almacenado una sola vez y con el rol seleccionado. |
| RF-11 | El administrador deberá activar o inactivar cuentas. | Administrador | Alta | El estado determina la posibilidad de utilizar el sistema. |
| RF-12 | El administrador deberá consultar el listado general de pacientes. | Administrador | Media | El listado muestra información segura, filtros y paginación. |
| RF-13 | El administrador deberá consultar la auditoría de creación, actualización y eliminación de registros. | Administrador | Alta | Cada evento muestra autor, fecha, entidad, acción y cambios disponibles. |
| RF-14 | El administrador deberá consultar registros de inicio y cierre de sesión. | Administrador | Alta | El historial identifica usuario, fecha y resultado de acceso disponible. |
| RF-15 | El administrador deberá descargar un respaldo de PostgreSQL. | Administrador | Alta | El sistema genera un archivo válido o presenta un error controlado. |
| RF-16 | El administrador deberá consultar métricas del funcionamiento clínico y nutricional sin alterar expedientes. | Administrador | Media | La consulta es de solo lectura y respeta los permisos administrativos. |

## 5.3. Gestión de pacientes y citas

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-17 | El personal autorizado deberá registrar pacientes con datos personales y cuenta de acceso. | Endocrinólogo, nutricionista | Alta | Los campos obligatorios y la edad admitida son validados antes de guardar. |
| RF-18 | El sistema deberá calcular la edad desde la fecha de nacimiento. | Sistema | Alta | La edad mostrada cambia de acuerdo con la fecha actual sin duplicarse como dato manual. |
| RF-19 | El personal autorizado deberá consultar, buscar y filtrar pacientes. | Endocrinólogo, nutricionista | Alta | Los filtros de estado y búsqueda afectan correctamente el listado. |
| RF-20 | El sistema deberá mostrar un perfil diferenciado de cada paciente. | Profesionales | Alta | El perfil reúne datos del módulo correspondiente sin exponer acciones no autorizadas. |
| RF-21 | Los profesionales deberán registrar, confirmar, atender o cancelar citas según el flujo permitido. | Endocrinólogo, nutricionista | Media | La cita conserva fecha, hora, profesional, modalidad, motivo y estado. |
| RF-22 | El paciente deberá consultar sus próximas citas y su calendario personal. | Paciente | Media | Solo se muestran las citas asociadas al paciente autenticado. |

## 5.4. Perfil clínico endocrinológico

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-23 | El endocrinólogo deberá registrar consultas endocrinológicas. | Endocrinólogo | Alta | La consulta queda asociada al paciente y profesional autenticado. |
| RF-24 | El endocrinólogo deberá registrar y consultar historia menstrual. | Endocrinólogo | Alta | Se conservan registros históricos y el último registro se presenta como principal. |
| RF-25 | El endocrinólogo deberá registrar antecedentes de hiperandrogenismo. | Endocrinólogo | Alta | Se almacenan manifestaciones clínicas y observaciones relacionadas. |
| RF-26 | El endocrinólogo deberá registrar antecedentes personales, familiares y medicamentos como colecciones dinámicas. | Endocrinólogo | Alta | Se pueden añadir múltiples elementos con condición, parentesco, dosis u observación. |
| RF-27 | El endocrinólogo deberá registrar evaluaciones físicas y antropométricas. | Endocrinólogo | Alta | El sistema almacena peso, talla, IMC, cintura, presión y hallazgos disponibles. |
| RF-28 | El endocrinólogo deberá registrar perfiles androgénico y gonadotrópico. | Endocrinólogo | Alta | Los resultados quedan vinculados con consulta y paciente. |
| RF-29 | El endocrinólogo deberá registrar estudios diferenciales endocrinos. | Endocrinólogo | Alta | Los datos permiten documentar el descarte de diagnósticos diferenciales. |
| RF-30 | El endocrinólogo deberá registrar glucosa, insulina y perfil lipídico. | Endocrinólogo | Alta | Los valores se validan y quedan disponibles para la evaluación metabólica. |
| RF-31 | El endocrinólogo deberá registrar evaluaciones ecográficas. | Endocrinólogo | Alta | El registro conserva los hallazgos ováricos necesarios para PMOS. |
| RF-32 | El sistema deberá conservar el historial de cada sección endocrinológica. | Endocrinólogo | Alta | Los nuevos registros no eliminan físicamente la evolución previa. |
| RF-33 | El sistema deberá presentar seguimiento gráfico de indicadores endocrinológicos. | Endocrinólogo | Media | Los gráficos muestran fechas y valores clínicos comparables. |

## 5.5. Diagnóstico experto de PMOS y RI

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-34 | El sistema deberá construir hechos PMOS desde los registros clínicos disponibles. | Sistema | Alta | Los hechos reflejan alteración ovulatoria, hiperandrogenismo, morfología y diferenciales. |
| RF-35 | El sistema deberá evaluar PMOS mediante criterios de Rotterdam formalizados en JDM. | Endocrinólogo, motor experto | Alta | La respuesta incluye total de criterios, confirmación, fenotipo y conclusión. |
| RF-36 | El sistema deberá construir hechos metabólicos para RI. | Sistema | Alta | Se incluyen glucosa, insulina, HOMA-IR, QUICKI y riesgos disponibles. |
| RF-37 | El sistema deberá calcular HOMA-IR y QUICKI cuando existan valores válidos de glucosa e insulina. | Motor experto | Alta | Los índices se calculan sin división inválida y se incluyen en la respuesta. |
| RF-38 | El sistema deberá evaluar y clasificar resistencia a la insulina. | Endocrinólogo, motor experto | Alta | La respuesta contiene confirmación, grado y riesgos asociados. |
| RF-39 | El sistema deberá persistir resultado, hechos, reglas, explicación, confianza y versión del motor. | Sistema | Alta | La trazabilidad queda asociada al diagnóstico real. |
| RF-40 | El endocrinólogo deberá visualizar el fundamento de cada resultado experto. | Endocrinólogo | Alta | La interfaz muestra criterios, indicadores, reglas y explicación. |
| RF-41 | El endocrinólogo deberá aprobar o rechazar una propuesta experta con una observación opcional. | Endocrinólogo | Alta | Se registran estado, validador, fecha y observación. |
| RF-42 | El endocrinólogo deberá complementar o corregir el diagnóstico clínico sin alterar silenciosamente la inferencia original. | Endocrinólogo | Alta | La edición profesional queda diferenciada y auditada. |
| RF-43 | El sistema deberá generar reportes PDF separados para PMOS y RI. | Endocrinólogo | Media | Cada PDF contiene datos, criterios, resultados, fundamento y validación disponible. |
| RF-44 | El sistema deberá determinar elegibilidad para planificación nutricional. | Sistema | Alta | La paciente es elegible cuando existe PMOS o RI confirmada. |
| RF-45 | El endocrinólogo deberá consultar el historial diagnóstico y evolución metabólica. | Endocrinólogo | Media | Se presenta una línea temporal y comparación de indicadores disponibles. |

## 5.6. Derivación a nutrición

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-46 | El endocrinólogo deberá derivar una paciente elegible a nutrición. | Endocrinólogo | Alta | La derivación conserva motivo, prioridad, observaciones y profesional. |
| RF-47 | El nutricionista deberá recibir una notificación de nueva derivación. | Nutricionista | Alta | La notificación identifica al paciente y permite acceder al caso autorizado. |
| RF-48 | El nutricionista deberá cambiar el estado de atención de la derivación. | Nutricionista | Media | Se distinguen estados pendiente, vista, aceptada y atendida. |

## 5.7. Perfil y evaluación nutricional

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-49 | El nutricionista deberá registrar consultas nutricionales. | Nutricionista | Alta | La consulta queda asociada al paciente y al profesional. |
| RF-50 | El nutricionista deberá crear y editar evaluaciones nutricionales. | Nutricionista | Alta | Nuevo registro y edición utilizan operaciones diferenciadas. |
| RF-51 | El nutricionista deberá registrar hábitos alimentarios históricos. | Nutricionista | Alta | Se conservan comidas, horarios, consumo de agua, azúcar y conductas disponibles. |
| RF-52 | El nutricionista deberá registrar preferencias alimentarias. | Nutricionista | Alta | Se almacenan alimentos, comidas, preparaciones y sabores preferidos o rechazados. |
| RF-53 | El nutricionista deberá registrar alergias, intolerancias y restricciones. | Nutricionista | Alta | Los datos se presentan como restricciones obligatorias para el plan. |
| RF-54 | El nutricionista deberá registrar objetivos y metas nutricionales. | Nutricionista | Alta | El objetivo conserva prioridad, plazo, peso, cintura y enfoque disponibles. |
| RF-55 | El sistema deberá calcular requerimientos energéticos y macronutrientes. | Nutricionista, sistema | Alta | Se muestran TMB, GET, ajuste, calorías, proteínas, carbohidratos, grasas y fibra. |
| RF-56 | El nutricionista deberá consultar qué reglas fueron aplicadas al cálculo. | Nutricionista | Media | Cada cálculo muestra regla, prioridad, condición y explicación disponible. |
| RF-57 | El nutricionista deberá crear y editar reglas nutricionales autorizadas. | Nutricionista | Media | Las reglas validan condiciones, ajustes y suma de macronutrientes. |

## 5.8. Recomendación nutricional experta

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-58 | El sistema deberá construir hechos nutricionales integrando información endocrina y nutricional. | Sistema | Alta | Se priorizan diagnósticos validados y se toleran datos opcionales ausentes. |
| RF-59 | El sistema deberá solicitar una recomendación base al microservicio ZEN. | Nutricionista, sistema | Alta | El endpoint recibe hechos y devuelve resultado más trazabilidad. |
| RF-60 | La recomendación deberá contener enfoque, prioridad, energía, macros, fibra, recomendaciones, restricciones y alertas. | Motor experto | Alta | Los campos se entregan con estructura predecible. |
| RF-61 | El sistema deberá incorporar restricciones del paciente aunque no sean producidas por una regla general. | Sistema | Alta | Alergias e intolerancias registradas aparecen en las restricciones resultantes. |
| RF-62 | El nutricionista deberá aprobar o rechazar la recomendación experta. | Nutricionista | Alta | La decisión registra profesional, fecha y observación. |
| RF-63 | El sistema no deberá permitir generar el plan desde una recomendación pendiente o rechazada. | Sistema | Alta | El intento es bloqueado con mensaje comprensible. |

## 5.9. Recetas y planificación alimentaria

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-64 | El nutricionista deberá crear, consultar y editar alimentos. | Nutricionista | Media | Cada alimento conserva grupo, unidad y composición nutricional. |
| RF-65 | El nutricionista deberá crear, consultar y editar recetas con ingredientes. | Nutricionista | Alta | La receta conserva preparación, porciones, tipo de comida, ingredientes y nutrientes. |
| RF-66 | El sistema deberá clasificar recetas compatibles con la recomendación y restricciones. | Sistema | Alta | Una receta incompatible se descarta y una compatible recibe puntuación y motivos. |
| RF-67 | El sistema deberá generar un plan de siete días. | Nutricionista, sistema | Alta | El plan contiene exactamente siete días consecutivos. |
| RF-68 | Cada día deberá contener desayuno, almuerzo, merienda y cena. | Sistema | Alta | Se generan exactamente cuatro comidas por día y 28 en total. |
| RF-69 | El sistema deberá distribuir inicialmente la energía en 25 %, 40 %, 15 % y 20 %. | Sistema | Alta | La distribución corresponde a desayuno, almuerzo, merienda y cena. |
| RF-70 | El sistema deberá evitar repetición excesiva y favorecer diversidad de recetas. | Sistema | Alta | La selección considera recetas ya utilizadas y variedad proteica. |
| RF-71 | El sistema deberá crear un componente manual cuando no exista una receta compatible suficiente. | Sistema | Alta | La comida queda marcada para revisión, sin inventar una receta. |
| RF-72 | El nutricionista deberá editar comidas y componentes mientras el plan sea editable. | Nutricionista | Alta | Los cambios recalculan totales de comida, día y plan. |
| RF-73 | El nutricionista deberá aprobar o rechazar el plan. | Nutricionista | Alta | Solo se aprueba si contiene siete días, cuatro comidas por día y componentes. |
| RF-74 | El sistema deberá asignar automáticamente un período de siete días desde la fecha seleccionada. | Sistema | Alta | La fecha final corresponde a inicio más seis días. |
| RF-75 | El nutricionista deberá finalizar un plan y generar el siguiente considerando seguimiento previo. | Nutricionista | Media | El plan anterior queda finalizado y el nuevo conserva contexto de ajuste. |
| RF-76 | El nutricionista deberá consultar historial y comparación de planes. | Nutricionista | Media | Se muestran fechas, estados, comidas, fundamentos y cambios. |
| RF-77 | El sistema deberá generar un PDF justificativo y un PDF práctico del plan. | Nutricionista, paciente | Media | Los documentos contienen período, comidas e información apropiada para cada destinatario. |

## 5.10. Seguimiento nutricional y reportes

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-78 | El paciente deberá marcar cumplimiento de cada comida. | Paciente | Alta | El registro conserva estado, porcentaje consumido y observaciones disponibles. |
| RF-79 | El paciente deberá registrar síntomas y bienestar. | Paciente | Alta | El seguimiento conserva energía, hambre, síntomas, sueño, actividad y agua. |
| RF-80 | El sistema deberá calcular adherencia diaria y semanal. | Sistema | Alta | Los porcentajes se calculan desde comidas planificadas y registros existentes. |
| RF-81 | El nutricionista deberá consultar pacientes con seguimiento pendiente, parcial o adecuado. | Nutricionista | Alta | El panel permite identificar casos que requieren revisión. |
| RF-82 | Nutricionista y paciente deberán intercambiar retroalimentación autorizada. | Nutricionista, paciente | Media | Los mensajes conservan emisor, rol, prioridad, visibilidad y lectura. |
| RF-83 | El sistema deberá generar alertas de seguimiento. | Sistema | Media | Las alertas consideran adherencia, síntomas y registros faltantes. |
| RF-84 | El sistema deberá generar sugerencias para el siguiente plan sin aplicarlas automáticamente. | Sistema | Media | Las sugerencias permanecen pendientes de revisión profesional. |
| RF-85 | El nutricionista deberá consultar gráficos de evolución. | Nutricionista | Media | Se comparan evaluaciones, adherencia y planes cuando existen datos suficientes. |
| RF-86 | El nutricionista deberá generar reportes filtrados de pacientes, planes, adherencia y evolución. | Nutricionista | Media | El reporte respeta los filtros y solo incluye pacientes autorizados. |
| RF-87 | El sistema deberá generar un PDF de seguimiento y evolución. | Nutricionista | Media | El PDF presenta indicadores, período, observaciones y evolución disponible. |

## 5.11. Portal del paciente

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-88 | El paciente deberá visualizar un panel personal con información relevante de salud y seguimiento. | Paciente | Alta | El panel presenta plan, progreso, próximas acciones y alertas autorizadas. |
| RF-89 | El paciente deberá consultar su plan alimentario vigente organizado por día. | Paciente | Alta | Solo puede visualizar planes aprobados o activos asociados a su cuenta. |
| RF-90 | El paciente deberá consultar ingredientes y preparación de las recetas. | Paciente | Alta | Cada comida muestra la información disponible sin exponer herramientas profesionales. |
| RF-91 | El paciente deberá generar una lista de compras semanal desde su plan. | Paciente | Media | Los ingredientes se agrupan y consolidan por alimento o categoría. |
| RF-92 | El paciente deberá consultar su progreso, adherencia y mensajes profesionales. | Paciente | Alta | La información corresponde exclusivamente al expediente autenticado. |
| RF-93 | El paciente deberá descargar la versión práctica de su plan. | Paciente | Media | El PDF contiene instrucciones y comidas, sin trazabilidad técnica innecesaria. |

## 5.12. Copiloto nutricional generativo

| ID | Requerimiento funcional | Actor | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|---|
| RF-94 | El nutricionista deberá poder solicitar una explicación profesional del plan. | Nutricionista | Media | Groq responde con resumen, hallazgos, recomendaciones y alertas estructuradas. |
| RF-95 | El nutricionista deberá auditar diversidad y balance mediante el copiloto. | Nutricionista | Media | La respuesta identifica observaciones sin modificar el plan. |
| RF-96 | El copiloto deberá limitar las alternativas a recetas previamente compatibles. | Sistema | Alta | No se aceptan identificadores inventados ni recetas fuera del conjunto autorizado. |
| RF-97 | El nutricionista deberá formular preguntas profesionales sobre el contexto autorizado. | Nutricionista | Media | La pregunta válida recibe una respuesta estructurada o un error controlado. |
| RF-98 | El sistema deberá conservar el plan intacto ante error, indisponibilidad o límite de Groq. | Sistema | Alta | Un error 429/502 no modifica ningún registro del plan. |

# 6. Requerimientos no funcionales

## 6.1. Seguridad y privacidad

| ID | Requerimiento no funcional | Prioridad | Criterio verificable |
|---|---|---|---|
| RNF-01 | Todas las funciones privadas deberán requerir autenticación. | Alta | Una solicitud anónima es redirigida o rechazada. |
| RNF-02 | La autorización deberá aplicarse mediante roles y principio de mínimo privilegio. | Alta | Cada rol accede únicamente a rutas y acciones definidas. |
| RNF-03 | Las contraseñas deberán almacenarse mediante hash seguro de Laravel. | Alta | La base de datos no contiene contraseñas en texto plano. |
| RNF-04 | Las operaciones mutables deberán estar protegidas contra CSRF. | Alta | Solicitudes web sin token válido son rechazadas. |
| RNF-05 | Toda entrada deberá validarse en el backend aunque también exista validación visual. | Alta | Datos inválidos producen 422 y no alteran registros. |
| RNF-06 | Las credenciales de Google, Groq y otros servicios deberán almacenarse en variables de entorno. | Alta | Las claves no aparecen en el repositorio ni en respuestas al navegador. |
| RNF-07 | El inicio mediante Google no deberá crear cuentas automáticamente ni guardar tokens del proveedor. | Alta | Solo correos preexistentes pueden ingresar. |
| RNF-08 | Los pacientes solamente deberán consultar información asociada con su propia cuenta. | Alta | Intentos de acceso a recursos de otro paciente son rechazados. |
| RNF-09 | El contexto enviado a Groq deberá limitarse a datos necesarios para la tarea. | Alta | No se incluyen credenciales ni campos administrativos ajenos al análisis. |

## 6.2. Integridad, trazabilidad y auditoría

| ID | Requerimiento no funcional | Prioridad | Criterio verificable |
|---|---|---|---|
| RNF-10 | Las operaciones compuestas deberán utilizar transacciones. | Alta | Ante una excepción no quedan diagnósticos o planes parcialmente persistidos. |
| RNF-11 | Los registros históricos relevantes deberán usar eliminación lógica. | Alta | La eliminación establece `deleted_at` y permite auditoría. |
| RNF-12 | Los resultados expertos deberán ser reproducibles mediante hechos, reglas y versión. | Alta | Cada resultado persistido identifica sus entradas y versión del motor. |
| RNF-13 | Las validaciones profesionales deberán identificar usuario y fecha. | Alta | Los campos de validador y fecha se completan al aprobar o rechazar. |
| RNF-14 | Las acciones administrativas y clínicas relevantes deberán registrarse en auditoría. | Alta | El historial presenta evento, autor, entidad y cambios disponibles. |
| RNF-15 | El sistema deberá evitar duplicados al ejecutar seeders de prueba repetidamente. | Media | Los seeders idempotentes conservan cantidades estables. |

## 6.3. Rendimiento

Los siguientes valores constituyen objetivos verificables para un entorno local o de despliegue con recursos adecuados; deben confirmarse mediante pruebas de rendimiento antes de declararlos como resultados alcanzados.

| ID | Requerimiento no funcional | Prioridad | Criterio verificable propuesto |
|---|---|---|---|
| RNF-16 | Las páginas y consultas ordinarias deberán responder con fluidez. | Media | Tiempo de respuesta p95 menor o igual a 2 segundos, excluyendo servicios externos y PDFs. |
| RNF-17 | La inferencia ZEN deberá responder dentro del tiempo configurado. | Alta | La llamada no supera `PMOS_EXPERTO_TIMEOUT`; el valor inicial es 10 segundos. |
| RNF-18 | Las llamadas a Groq deberán respetar un tiempo máximo. | Media | La llamada no supera `GROQ_REQUEST_TIMEOUT`; el valor inicial es 30 segundos. |
| RNF-19 | Los listados extensos deberán usar paginación o límites. | Media | El frontend no requiere cargar todos los registros para presentar una página. |
| RNF-20 | Los cálculos agregados deberán evitar consultas repetitivas innecesarias. | Media | Se emplea carga anticipada y no se presentan patrones N+1 en los flujos críticos revisados. |

## 6.4. Disponibilidad y tolerancia a fallos

| ID | Requerimiento no funcional | Prioridad | Criterio verificable |
|---|---|---|---|
| RNF-21 | La indisponibilidad del microservicio deberá producir un error controlado. | Alta | Laravel devuelve un mensaje claro y no persiste cambios incompletos. |
| RNF-22 | La indisponibilidad de Groq no deberá bloquear la lógica clínica determinista. | Alta | El sistema mantiene el ranking seguro o informa el error sin modificar el plan. |
| RNF-23 | Los límites de uso de Groq deberán diferenciarse de errores internos. | Media | El sistema devuelve 429 y un mensaje de reintento cuando corresponde. |
| RNF-24 | El administrador deberá disponer de un mecanismo de respaldo descargable. | Alta | `pg_dump` genera un archivo no vacío o informa claramente la configuración faltante. |
| RNF-25 | Las operaciones críticas deberán fallar de forma atómica. | Alta | No quedan estados intermedios tras una excepción comprobada. |

## 6.5. Usabilidad y accesibilidad

| ID | Requerimiento no funcional | Prioridad | Criterio verificable |
|---|---|---|---|
| RNF-26 | La interfaz deberá ser consistente entre los distintos roles. | Media | Mantiene componentes, navegación, colores y patrones de interacción comunes. |
| RNF-27 | Los formularios deberán mostrar mensajes específicos de validación. | Alta | Un error 422 presenta el campo o condición que debe corregirse. |
| RNF-28 | Las acciones prolongadas deberán mostrar estado de carga. | Media | Los botones se deshabilitan temporalmente y muestran progreso. |
| RNF-29 | La interfaz deberá adaptarse a pantallas de escritorio, tableta y móvil. | Media | El contenido permanece utilizable en anchos comunes sin pérdida de acciones. |
| RNF-30 | Los elementos interactivos deberán utilizar etiquetas comprensibles. | Media | Botones y controles expresan la acción profesional, no términos técnicos internos. |
| RNF-31 | El contraste, foco y navegación deberán aproximarse a WCAG 2.1 nivel AA. | Media | La revisión de accesibilidad no detecta bloqueos críticos de contraste o teclado. |
| RNF-32 | Las fechas y cantidades deberán mostrarse en formatos legibles y consistentes. | Media | No se presentan cadenas ISO completas cuando corresponde una fecha de usuario. |

## 6.6. Compatibilidad e interoperabilidad

| ID | Requerimiento no funcional | Prioridad | Criterio verificable |
|---|---|---|---|
| RNF-33 | La aplicación deberá funcionar en navegadores modernos. | Media | Se valida en versiones actuales de Chrome, Edge y Firefox. |
| RNF-34 | El backend deberá ser compatible con PHP 8.2 o superior y Laravel 12. | Alta | Composer instala dependencias y la suite se ejecuta en el entorno definido. |
| RNF-35 | El microservicio deberá funcionar con Python 3.13.x y `zen-engine`. | Alta | El entorno instala dependencias y ejecuta sus pruebas. |
| RNF-36 | Laravel y FastAPI deberán comunicarse mediante JSON sobre HTTP. | Alta | Los contratos de los endpoints producen estructuras válidas y versionadas. |
| RNF-37 | El sistema deberá usar PostgreSQL como gestor de datos principal. | Alta | Migraciones, consultas y respaldos funcionan con la conexión configurada. |

## 6.7. Mantenibilidad y extensibilidad

| ID | Requerimiento no funcional | Prioridad | Criterio verificable |
|---|---|---|---|
| RNF-38 | La lógica deberá separarse entre controladores, servicios, modelos y componentes. | Alta | Los controladores delegan la inferencia y persistencia a servicios especializados. |
| RNF-39 | Los modelos JDM deberán versionarse de forma explícita. | Alta | Cada respuesta identifica `version_motor_experto`. |
| RNF-40 | La incorporación de una nueva regla no deberá exigir cambios en el frontend si el contrato no cambia. | Media | El motor puede actualizar su conocimiento conservando el esquema de respuesta. |
| RNF-41 | Los componentes visuales repetidos deberán reutilizarse. | Media | Botones, tarjetas y validaciones compartidas no se duplican entre PMOS y RI. |
| RNF-42 | La configuración de URLs, claves y tiempos deberá ser externa al código. | Alta | Los valores se leen desde `.env` mediante archivos de configuración. |
| RNF-43 | El código deberá conservar nombres y mensajes coherentes con el dominio. | Media | No se mezclan Experta o Durable Rules con la arquitectura ZEN vigente. |

## 6.8. Pruebas y calidad

| ID | Requerimiento no funcional | Prioridad | Criterio verificable |
|---|---|---|---|
| RNF-44 | Los servicios Laravel que consumen APIs deberán poder probarse con respuestas simuladas. | Alta | Las pruebas usan `Http::fake` u objetos falsos sin depender del servicio real. |
| RNF-45 | El microservicio deberá disponer de pruebas para sus endpoints y modelos. | Alta | `python -m pytest` valida salud, PMOS, RI y nutrición. |
| RNF-46 | Los cambios deberán conservar la compilación del frontend. | Alta | `npm run build` termina sin errores. |
| RNF-47 | Las rutas deberán poder inspeccionarse sin errores. | Alta | `php artisan route:list` termina correctamente. |
| RNF-48 | La suite Laravel deberá validar autorización, reglas, persistencia y errores controlados. | Alta | `php artisan test` finaliza sin fallos antes de una entrega. |

# 7. Reglas de negocio

| ID | Regla de negocio |
|---|---|
| RN-01 | Los roles principales son administrador, endocrinólogo, nutricionista y paciente. |
| RN-02 | Administrador y superadministrador representan el mismo rol técnico `administrador`, salvo cambio explícito del catálogo. |
| RN-03 | El sistema está orientado a pacientes mujeres dentro del rango de edad definido por el proyecto. |
| RN-04 | Un diagnóstico automático constituye una propuesta hasta ser validado por el endocrinólogo. |
| RN-05 | PMOS se confirma cuando se cumplen al menos dos criterios de Rotterdam y los diferenciales fueron descartados. |
| RN-06 | Si existen criterios suficientes pero faltan diferenciales, PMOS permanece en estudio. |
| RN-07 | RI se confirma cuando HOMA-IR es mayor o igual a 2,5 según el modelo vigente. |
| RN-08 | La confianza experta expresa completitud y consistencia de las reglas, no una probabilidad estadística de enfermedad. |
| RN-09 | Una paciente solamente es elegible para planificación asistida si tiene PMOS o RI confirmada. |
| RN-10 | Solamente el endocrinólogo puede validar resultados expertos PMOS y RI. |
| RN-11 | Solamente la nutricionista puede validar una recomendación nutricional y un plan. |
| RN-12 | Una recomendación pendiente o rechazada no puede originar un plan. |
| RN-13 | Las alergias, intolerancias y restricciones prevalecen sobre las preferencias. |
| RN-14 | El plan semanal contiene siete días consecutivos. |
| RN-15 | Cada día contiene desayuno, almuerzo, merienda y cena; no se usa media mañana ni colación. |
| RN-16 | La distribución inicial es 25 %, 40 %, 15 % y 20 %, respectivamente. |
| RN-17 | Un plan no puede aprobarse si falta un día, una comida o todos los componentes de una comida. |
| RN-18 | Un plan aprobado o finalizado no permite edición directa de su contenido. |
| RN-19 | La IA generativa no modifica automáticamente diagnósticos, recomendaciones ni planes. |
| RN-20 | Si Groq falla, el sistema conserva la decisión determinista y el plan existente. |
| RN-21 | El inicio mediante Google solo autoriza usuarios previamente registrados. |
| RN-22 | Los reportes del paciente deben omitir detalles técnicos que no sean necesarios para cumplir el plan. |

# 8. Restricciones técnicas y dependencias

| ID | Restricción o dependencia |
|---|---|
| RT-01 | Backend principal implementado con Laravel 12 y PHP 8.2 o superior. |
| RT-02 | Frontend implementado con React, TypeScript, Inertia, Tailwind y DaisyUI. |
| RT-03 | Persistencia principal en PostgreSQL. |
| RT-04 | Microservicio experto implementado con FastAPI, Python 3.13.x y ZEN Engine. |
| RT-05 | Los modelos de decisión se almacenan como documentos JDM JSON. |
| RT-06 | La generación de PDF depende de Dompdf. |
| RT-07 | El inicio con Google depende de Laravel Socialite y credenciales válidas de Google Cloud. |
| RT-08 | El copiloto depende de una API key y cuota disponible en Groq. |
| RT-09 | El respaldo depende de `pg_dump` compatible con la versión de PostgreSQL. |
| RT-10 | Laravel deberá funcionar aunque Groq no esté disponible; la inferencia ZEN requiere el microservicio activo. |

# 9. Matriz resumida de trazabilidad

| Objetivo del sistema | Requerimientos relacionados | Evidencia de verificación sugerida |
|---|---|---|
| Apoyar diagnóstico PMOS | RF-23 a RF-35, RF-39 a RF-45 | Pruebas del servicio de hechos, endpoint PMOS, persistencia y validación. |
| Evaluar resistencia a la insulina | RF-27, RF-30, RF-36 a RF-45 | Casos HOMA-IR leve, moderado, severo y datos insuficientes. |
| Generar orientación nutricional | RF-49 a RF-63 | Pruebas de hechos integrados, restricciones y validación. |
| Generar plan semanal | RF-64 a RF-77 | Verificar 7 días, 28 comidas, diversidad, edición y aprobación. |
| Dar seguimiento al paciente | RF-78 a RF-93 | Pruebas de adherencia, síntomas, progreso, mensajes y portal. |
| Mantener explicabilidad | RF-39 a RF-42, RNF-10 a RNF-14 | Inspección de hechos, reglas, confianza, versión y validador. |
| Proteger la información | RF-01 a RF-07, RNF-01 a RNF-09 | Pruebas de autenticación, roles, aislamiento y validación. |
| Brindar apoyo generativo seguro | RF-94 a RF-98, RNF-22 y RNF-23 | Respuesta estructurada, límite 429 y ausencia de cambios en el plan. |

# 10. Criterios generales de aceptación

El sistema podrá considerarse funcionalmente aceptable cuando:

1. cada rol acceda únicamente a sus módulos autorizados;
2. el endocrinólogo pueda completar el perfil, evaluar PMOS/RI y validar resultados;
3. una paciente elegible pueda ser derivada a nutrición;
4. la nutricionista pueda registrar el perfil, obtener y validar una recomendación;
5. una recomendación aprobada pueda convertirse en un plan de siete días y 28 comidas;
6. el paciente pueda visualizar el plan y registrar seguimiento;
7. la trazabilidad permita identificar hechos, reglas, versión y validación;
8. los fallos de FastAPI o Groq no dejen información parcialmente guardada;
9. las pruebas automatizadas, rutas y compilación frontend concluyan sin errores;
10. los reportes principales puedan generarse con datos del expediente autorizado.

## Nota para la documentación final

Los tiempos definidos en RNF-16, RNF-17 y RNF-18 deben presentarse como objetivos de calidad hasta realizar pruebas formales de carga y documentar los resultados. Asimismo, la justificación clínica de los umbrales y reglas debe acompañarse con las referencias bibliográficas empleadas por el proyecto.
