# Métrica de confiabilidad basada en pruebas ejecutadas

## 1. Objetivo y criterio de conteo

Este apartado calcula la confiabilidad observable del sistema experto a partir de pruebas ejecutadas realmente sobre la versión actual del proyecto. La medición corresponde a la ejecución realizada el **2 de septiembre de 2026**.

Se consideran como ejecuciones verificables:

1. los casos recogidos y ejecutados por PHPUnit mediante `php artisan test`;
2. los casos recogidos y ejecutados por Pytest mediante el entorno virtual del microservicio;
3. la prueba directa de compatibilidad de ZEN Engine, implementada como script con aserción y código de salida verificable.

No se cuentan archivos, métodos auxiliares ni aserciones individuales como pruebas. Los casos parametrizados de PHPUnit sí se cuentan como ejecuciones distintas cuando el runner los reporta como conjuntos de datos separados, porque validan escenarios de entrada diferentes.

## 2. Comandos y resultados observados

### 2.1. Laravel/PHPUnit

Comando ejecutado desde la raíz del proyecto:

```powershell
php artisan test
```

Resumen real entregado por PHPUnit:

```text
Tests:    1 failed, 397 passed (1856 assertions)
Duration: 247.00s
```

La suite está definida en `phpunit.xml` y comprende `tests/Unit` y `tests/Feature`. Utiliza el entorno `testing` y la base PostgreSQL `pmos_testing`.

Resultado Laravel:

| Total ejecutadas | Aprobadas | Fallidas | Omitidas/incompletas |
|---:|---:|---:|---:|
| **398** | **397** | **1** | **0** |

### 2.2. Microservicio FastAPI/Pytest

El comando documentado `python -m pytest` no funciona con el Python global del equipo porque ese intérprete no tiene Pytest instalado. Por ello se utilizó correctamente el entorno virtual incluido en `pmos-experto/venv`:

```powershell
cd pmos-experto
.\venv\Scripts\python.exe -m pytest -ra
```

Resumen real entregado por Pytest:

```text
collected 31 items
31 passed, 1 warning in 0.54s
```

Resultado Pytest:

| Total ejecutadas | Aprobadas | Fallidas | Omitidas/xfail |
|---:|---:|---:|---:|
| **31** | **31** | **0** | **0** |

La advertencia de deprecación de `httpx`/`TestClient` no es una prueba fallida y no cambia el conteo, pero debe considerarse deuda técnica de compatibilidad futura.

### 2.3. Verificación directa de ZEN Engine

El archivo `pmos-experto/scripts/test_zen_engine.py` no contiene una función con el patrón de descubrimiento de Pytest, por lo que Pytest no lo recoge. Sin embargo, implementa una aserción explícita y termina con código distinto de cero si el motor devuelve un resultado incorrecto. Se ejecutó una vez, sin duplicarlo con la suite:

```powershell
cd pmos-experto
.\venv\Scripts\python.exe scripts\test_zen_engine.py
```

Resultado:

```text
zen-engine OK
```

Resultado de la verificación directa:

| Total ejecutadas | Aprobadas | Fallidas |
|---:|---:|---:|
| **1** | **1** | **0** |

## 3. Consolidación final

| Suite o ejecución | Total | Aprobadas | Fallidas | Excluidas |
|---|---:|---:|---:|---:|
| Laravel/PHPUnit | 398 | 397 | 1 | 0 |
| FastAPI/Pytest | 31 | 31 | 0 | 0 |
| Verificación directa ZEN | 1 | 1 | 0 | 0 |
| **Total consolidado** | **430** | **429** | **1** | **0** |

Por tanto:

- número total de pruebas o ejecuciones verificables: **430**;
- pruebas aprobadas: **429**;
- pruebas fallidas: **1**;
- pruebas deshabilitadas, omitidas o no ejecutables incluidas en el denominador: **0**;
- estado general: **no pasan todas las pruebas actualmente**, debido a una falla reproducible en la suite Laravel.

La ejecución inicial fallida con el Python global (`No module named pytest`) no se cuenta como prueba, porque fue un problema de selección del intérprete y no la ejecución de un caso. La posterior ejecución con el entorno virtual es la evidencia válida.

## 4. Prueba fallida confirmada

La única falla corresponde a:

```text
Tests\Feature\Database\FlujoOperativoNutricionalRealistaSeederTest
test_panel_del_paciente_recibe_progreso_y_seguimiento_visible
```

Ubicación de la aserción:

```text
tests/Feature/Database/FlujoOperativoNutricionalRealistaSeederTest.php:71
```

Mensaje:

```text
Failed asserting that null is not null.
```

La aserción espera que `seguimientoSintomas.registro_hoy` no sea nulo. El escenario de prueba fija la fecha operativa en `2026-08-31` mediante el método `today()`, mientras el servicio interpreta “hoy” a partir de la fecha actual de ejecución. Al ejecutarse el 2 de septiembre de 2026, el registro sembrado ya no coincide con el día actual.

La prueba se volvió a ejecutar de forma aislada con:

```powershell
php artisan test tests\Feature\Database\FlujoOperativoNutricionalRealistaSeederTest.php --filter=test_panel_del_paciente_recibe_progreso_y_seguimiento_visible
```

Resultado de confirmación:

```text
Tests: 1 failed (6 assertions)
```

Esta repetición se utilizó únicamente para confirmar la falla y **no se volvió a sumar** al total de 430 ejecuciones.

## 5. Módulos cubiertos

La evidencia de las suites muestra cobertura funcional de los siguientes módulos:

| Módulo | Cobertura observable resumida |
|---|---|
| Autenticación y cuenta | Inicio/cierre de sesión, registro, verificación de correo, recuperación y cambio de contraseña, perfil y Google OAuth. |
| Administración y seguridad | Gestión de usuarios, roles, autorización, métricas administrativas, auditoría y registros de acceso. |
| Gestión de pacientes | Registro, validaciones, aislamiento entre pacientes y creación de perfiles de prueba. |
| Citas | Próxima cita, estados, historial, separación por paciente y control de acceso. |
| Endocrinología | Edición y preservación de diagnósticos PMOS/RI, evidencia clínica, reportes PDF y permisos. |
| Derivación nutricional | Creación idempotente, notificaciones, estados y autorización por rol. |
| Perfil nutricional | Evaluaciones, requerimientos energéticos, objetivos, reglas, cálculos y manejo de datos incompletos. |
| Sistema experto PMOS | Construcción de hechos, criterios Rotterdam, fenotipos, ejecución ZEN, trazabilidad, persistencia y validación profesional. |
| Sistema experto de RI | Construcción de hechos, HOMA-IR/QUICKI, clasificación, riesgos, trazabilidad y validación. |
| Recomendación nutricional experta | Integración de hechos, restricciones, generación, persistencia, aprobación/rechazo y fallos controlados. |
| Alimentos y recetas | Seeders, ingredientes, restricciones, compatibilidad y clasificación/ranking. |
| Planificación alimentaria | Generación de siete días y 28 comidas, diversidad, energía, edición, aprobación, estados, ciclos y rollback. |
| Seguimiento y adherencia | Cumplimiento de comidas, síntomas, indicadores, adherencia diaria/semanal y riesgo predictivo. |
| Analítica y alertas | Evolución antropométrica, aceptación, síntomas frecuentes, alertas y sugerencias de ajuste. |
| Portal del paciente | Panel, visibilidad del plan, progreso, citas, lista de compras, aislamiento de datos y seguimiento. |
| Retroalimentación | Mensajes, visibilidad, lectura, validaciones y asociación con plan/seguimiento. |
| Reportes | Diagnóstico, plan, historial, adherencia y seguimiento/evolución en PDF. |
| Copiloto Groq | Respuesta estructurada, autorización, límite 429, error controlado y conservación del plan. |
| Datos de demostración | Seeders clínicos y nutricionales, idempotencia, cantidades y variedad de estados. |
| Microservicio FastAPI/ZEN | API de decisiones, diagnóstico PMOS, diagnóstico RI, nutrición y trazabilidad experta. |

No existe un runner de pruebas JavaScript/TypeScript configurado en `package.json`; solo están definidos `dev` y `build`. En consecuencia, la compilación frontend no se presenta ni se suma como prueba automatizada.

## 6. Exclusión de duplicados y pruebas no válidas

Se aplicaron las siguientes reglas para evitar inflar la métrica:

- se contó una sola vez la ejecución completa de PHPUnit;
- se contó una sola vez la ejecución completa de Pytest; la ejecución previa limitada a `tests` no se sumó nuevamente;
- la repetición aislada de la prueba Laravel fallida no se sumó;
- `tests/TestCase.php` no se contó porque es una clase base y no contiene casos;
- `__pycache__` y `.pytest_cache` no se contaron;
- no se encontraron marcas `skip`, `markTestSkipped`, `xfail`, `test.skip`, `describe.skip` ni pruebas omitidas reportadas por los runners;
- las 1,856 aserciones de PHPUnit no se contabilizaron como 1,856 pruebas;
- la advertencia de Pytest no se contabilizó como falla;
- los escenarios parametrizados reportados por PHPUnit se conservaron como ejecuciones distintas, no como duplicados, porque utilizan conjuntos de datos funcionalmente diferentes.

## 7. Cálculo de confiabilidad y tasa de fallos

Se utilizan:

- `Et`: total de ejecuciones válidas = **430**;
- `Ec`: ejecuciones correctas = **429**;
- `Ef`: ejecuciones fallidas = **1**.

### 7.1. Confiabilidad

\[
C = \left(\frac{E_c}{E_t}\right) \times 100
\]

\[
C = \left(\frac{429}{430}\right) \times 100 = 99.7674\% \approx \mathbf{99.77\%}
\]

### 7.2. Tasa de fallos

\[
TF = \left(\frac{E_f}{E_t}\right) \times 100
\]

\[
TF = \left(\frac{1}{430}\right) \times 100 = 0.2326\% \approx \mathbf{0.23\%}
\]

Se cumple la comprobación:

\[
C + TF = 99.77\% + 0.23\% = 100.00\%
\]

## 8. Resultado listo para tesis

> La confiabilidad observable del sistema se determinó mediante la ejecución completa de las suites automatizadas de Laravel/PHPUnit y FastAPI/Pytest, complementadas por una verificación directa de compatibilidad con ZEN Engine. Se registraron 430 ejecuciones válidas: 429 aprobadas y una fallida. No se incluyeron repeticiones diagnósticas, archivos auxiliares, pruebas omitidas ni ejecuciones que no llegaron a iniciar. Aplicando `C = (Ec/Et) × 100`, se obtuvo una confiabilidad de 99.77 %. La tasa de fallos, calculada mediante `TF = (Ef/Et) × 100`, fue de 0.23 %. Por tanto, no puede afirmarse que todas las pruebas pasen actualmente: existe una falla reproducible en el escenario del panel del paciente generado por el seeder operativo, causada por la diferencia entre una fecha fija de prueba y la fecha dinámica considerada como “hoy”. El resultado refleja el estado concreto de la versión evaluada y no sustituye pruebas de carga, seguridad, usabilidad o validación clínica.

## 9. Nota metodológica

El porcentaje calculado representa la **proporción de casos automatizados aprobados en una ejecución concreta**. Es defendible como indicador interno de confiabilidad de pruebas, pero no equivale por sí solo a confiabilidad operacional, probabilidad de funcionamiento libre de fallos en producción o cobertura de código. Para sostener estas últimas afirmaciones serían necesarias métricas adicionales, como cobertura, tiempo medio entre fallos, pruebas de carga y observación en operación.

