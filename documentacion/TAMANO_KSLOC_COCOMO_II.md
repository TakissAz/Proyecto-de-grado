# Tamaño productivo del proyecto para COCOMO II Post-Arquitectónico

## 1. Resultado del conteo

El tamaño se obtuvo mediante conteo físico del código fuente existente en el repositorio. Se contaron líneas no vacías y no dedicadas exclusivamente a comentarios. No se realizó ninguna conversión desde Puntos de Función.

| Lenguaje o plataforma | Archivos productivos | SLOC productivas |
|---|---:|---:|
| PHP/Laravel, incluidas vistas Blade | 267 | **17,970** |
| TypeScript, TSX, JavaScript y React | 305 | **29,001** |
| Python/FastAPI | 21 | **621** |
| **Total** | **593** | **47,592** |

El tamaño expresado en miles de líneas es:

\[
KSLOC = \frac{47\,592}{1000} = \mathbf{47.592}
\]

Por tanto, el valor de tamaño que puede utilizarse como entrada del modelo COCOMO II Post-Arquitectónico es:

> **SIZE = 47.592 KSLOC**

## 2. Definición aplicada

Para hacer reproducible la medición se adoptó la siguiente definición operacional:

- se incluyen líneas físicas con código ejecutable, declaraciones, estructuras de interfaz, marcado Blade/JSX y configuración propia seleccionada;
- se excluyen líneas vacías;
- se excluyen líneas que contienen únicamente comentarios;
- una línea que contiene código y un comentario se cuenta una sola vez como código;
- se cuentan los archivos fuente maestros, no sus artefactos compilados;
- no se cuentan dependencias externas, pruebas ni datos de demostración masivos.

Este resultado es **SLOC física productiva**. El manual de COCOMO II utiliza como definición de referencia las declaraciones lógicas de código y reconoce que su aplicación uniforme entre lenguajes diferentes es difícil. También establece que deben excluirse comentarios, líneas en blanco, generados y software de apoyo no entregado, y recomienda informar cada lenguaje por separado. Véase el [COCOMO II Model Definition Manual](https://llavoie.espaceweb.usherbrooke.ca/llavoie/enseignement/References/CocomoII_Model_Manual.pdf).

Para este proyecto multilenguaje se utiliza la SLOC física no vacía/no comentada como aproximación automatizable y auditable. Esta decisión debe declararse en la tesis, ya que una línea física TSX no es necesariamente equivalente a una sentencia lógica PHP o Python.

## 3. Código incluido

### 3.1. PHP/Laravel

Se incluyeron:

- `app/**/*.php`: controladores, modelos, solicitudes, servicios, middleware, recursos, proveedores y comandos operativos;
- `routes/*.php`: rutas web, autenticación y consola;
- `resources/views/**/*.php`: vistas Blade y plantillas PDF desarrolladas para el producto;
- `database/migrations/*.php`: definición propia del esquema entregado;
- seeders productivos seleccionados: `RoleSeeder.php`, `ReglasNutricionalesSeeder.php`, `RecetasSeeder.php` y `CatalogoAmpliadoRecetasSeeder.php`;
- `config/openai.php` y `config/services.php`, porque contienen configuración propia de Groq, FastAPI/PMOS y Google.

Las vistas Blade se agrupan en PHP/Laravel porque son fuente mantenida y entregada como parte de la aplicación, aunque contengan marcado HTML.

### 3.2. TypeScript/TSX/JavaScript/React

Se incluyó:

- `resources/js/**/*.{ts,tsx,js,jsx}`.

Esto comprende páginas React, componentes, layouts, formularios, tipados, utilidades y el punto de entrada frontend. No se incluyeron los paquetes instalados ni la salida de Vite.

### 3.3. Python/FastAPI

Se incluyó:

- `pmos-experto/app/**/*.py`.

Esto comprende la aplicación FastAPI, routers, esquemas Pydantic y servicios de inferencia PMOS, resistencia a la insulina y nutrición. Los modelos JDM en JSON no se incorporaron porque el cálculo solicitado se limita a PHP, TypeScript/JavaScript y Python; además, son conocimiento declarativo, no SLOC del lenguaje Python.

## 4. Exclusiones aplicadas

### 4.1. Directorios y categorías excluidas

- `.git/`;
- `vendor/`;
- `node_modules/`;
- `pmos-experto/venv/`;
- `storage/`;
- `tests/` y `pmos-experto/tests/`;
- `pmos-experto/scripts/test_zen_engine.py`;
- `__pycache__/`, `.pytest_cache/` y otros cachés;
- `public/build/`, `build/` y `dist/`;
- archivos binarios, imágenes, fuentes y documentos;
- `composer.lock`, `package-lock.json` y demás lock files;
- archivos JSON/JDM, CSS, Markdown, configuración del compilador y manifiestos de dependencias, por no pertenecer a los tres lenguajes solicitados;
- `bootstrap/`, `public/index.php`, `artisan` y la configuración estándar restante de Laravel, por ser scaffolding o soporte técnico del framework y no lógica desarrollada específicamente para el dominio;
- `database/factories/`, porque apoyan pruebas y generación de datos;
- el propio script de conteo `scripts/Count-ProductiveSloc.ps1`.

### 4.2. Seeders de demostración excluidos

Se excluyeron los siguientes seeders por crear usuarios, pacientes o escenarios masivos destinados a demostración/pruebas:

- `DatabaseSeeder.php`;
- `CompletarTodosLosPacientesSeeder.php`;
- `DatosClinicosNutricionalesRealistasSeeder.php`;
- `FlujoOperativoNutricionalRealistaSeeder.php`;
- `OtrosPerfilesNutricionalesSeeder.php`;
- `PacienteDiagnosticoClinicoSeeder.php`;
- `PacientesPruebaSeeder.php`;
- `PerfilesEndocrinologicosCompletosSeeder.php`;
- `PerfilNutricionalPacienteSeeder.php`;
- `UserSeeder.php`;
- `UsuariosGoogleSeeder.php`.

No se excluyeron los seeders de roles, reglas y catálogos de alimentos/recetas porque proporcionan datos maestros necesarios para el funcionamiento del dominio, no expedientes ficticios de demostración.

### 4.3. Comandos de desarrollo excluidos

Aunque se encuentran dentro de `app`, no forman parte del producto operativo entregado y se excluyeron:

- `DebugAjustePlanCommand.php`;
- `DebugNutricionSistemaExpertoCommand.php`;
- `DebugPlanRecetasCommand.php`;
- `ProbarEstructuraPlanAlimentarioCommand.php`;
- `ProbarHechosSistemaExpertoCommand.php`;
- `ProbarNutricionSistemaExpertoCommand.php`;
- `ProbarPersistenciaSistemaExpertoCommand.php`;
- `ProbarSistemaExpertoZenCommand.php`;
- `ResumenPacientesPruebaCommand.php`.

## 5. Comando reproducible

Se creó el script auditable `scripts/Count-ProductiveSloc.ps1`. Desde la raíz del repositorio se ejecutó:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\Count-ProductiveSloc.ps1 -SummaryOnly
```

El resumen generado fue:

```json
{
  "PHP/Laravel": { "files": 267, "SLOC": 17970 },
  "TypeScript/JavaScript/React": { "files": 305, "SLOC": 29001 },
  "Python/FastAPI": { "files": 21, "SLOC": 621 },
  "TotalSLOC": 47592,
  "KSLOC": 47.592
}
```

Para obtener además el detalle por cada archivo puede ejecutarse el mismo comando sin `-SummaryOnly`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\Count-ProductiveSloc.ps1
```

El script contiene las raíces incluidas y las listas nominales de seeders y comandos excluidos, evitando que el resultado dependa de una selección manual posterior.

## 6. Validaciones realizadas

Se verificó que:

\[
17\,970 + 29\,001 + 621 = 47\,592
\]

\[
47\,592 / 1000 = 47.592\;KSLOC
\]

El conteo se ejecutó después de comprobar que no había herramientas `cloc`, `scc` o `tokei` instaladas. Por ello se utilizó un script local versionable que aplica la misma regla a todas las ejecuciones y permite auditar el detalle por archivo.

## 7. Elección entre KSLOC real y conversión desde Puntos de Función

Para este proyecto es metodológicamente más defendible utilizar **47.592 KSLOC medidas sobre el producto implementado** como entrada de COCOMO II Post-Arquitectónico que convertir 960.78 PF mediante un único factor LDC/PF.

Las razones son:

1. **La arquitectura y el código ya existen.** La conversión PF→LDC se utiliza principalmente cuando todavía no se conoce el tamaño de implementación. En fase post-arquitectónica, el repositorio ofrece evidencia directa del producto.
2. **El sistema es multilenguaje.** PHP, TypeScript/TSX y Python tienen densidades y estilos expresivos diferentes. Un único factor LDC/PF supone falsamente que toda la funcionalidad fue implementada en un solo lenguaje homogéneo.
3. **La distribución funcional no es uniforme.** React concentra interfaz y presentación; PHP concentra persistencia y casos de uso; Python concentra inferencia. No hay una asignación fiable de los 960.78 PF a cada lenguaje que permita aplicar factores separados sin introducir nuevas estimaciones.
4. **El conteo es reproducible.** Los 47,592 SLOC pueden volver a obtenerse sobre la versión evaluada con un comando y exclusiones explícitas.
5. **Se evita doble inferencia.** Convertir PF ajustados a LDC y después usar esas LDC para estimar esfuerzo añade la incertidumbre del conteo funcional, del ajuste y del factor de conversión lingüística.

No obstante, el KSLOC real tampoco debe presentarse como universalmente exacto: COCOMO II prefiere sentencias lógicas, mientras este informe utiliza líneas físicas productivas no vacías/no comentadas. Para máxima rigurosidad se recomienda:

- usar **47.592 KSLOC** como estimación principal y declarar la definición operacional;
- conservar **17.970 KSLOC PHP**, **29.001 KSLOC frontend** y **0.621 KSLOC Python** por separado en los anexos;
- utilizar los PF como métrica independiente de tamaño funcional y como control de coherencia, no convertirlos con un factor único;
- no sumar en estimaciones futuras código generado, dependencias o pruebas;
- volver a ejecutar el conteo sobre el commit exacto presentado al tribunal.

Si por exigencia académica se requiere una conversión desde PF, debería distribuirse primero la funcionalidad entre PHP, TypeScript y Python y aplicar un factor específico y citado para cada lenguaje. Esa alternativa seguiría siendo menos observable que el conteo directo en el estado actual del proyecto.

## 8. Texto listo para tesis

> Para determinar el tamaño del producto en el modelo COCOMO II Post-Arquitectónico se realizó un conteo físico y reproducible del código fuente implementado, sin efectuar conversiones desde Puntos de Función. Se incluyeron únicamente archivos productivos desarrollados para la solución en PHP/Laravel, TypeScript/React y Python/FastAPI, excluyendo dependencias, pruebas, entornos virtuales, cachés, artefactos compilados, archivos binarios, lock files, comandos de depuración y seeders con datos masivos de demostración. El conteo consideró líneas no vacías y no dedicadas exclusivamente a comentarios. Se obtuvieron 17,970 líneas PHP/Laravel, 29,001 líneas TypeScript/JavaScript/React y 621 líneas Python/FastAPI, para un total de 47,592 líneas productivas. En consecuencia, el tamaño empleado como entrada del modelo es 47.592 KSLOC. Debido a que la implementación combina tres lenguajes con diferente nivel de expresividad, este conteo directo resulta más defendible que convertir 960.78 Puntos de Función mediante un único factor LDC/PF, el cual introduciría una homogeneidad lingüística inexistente en la arquitectura real.

