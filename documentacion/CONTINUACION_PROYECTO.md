# Documento de continuación del proyecto PMOS

Fecha de actualización: 25 de agosto de 2026  
Estado de referencia: aplicación Laravel, frontend React/Inertia y microservicio experto funcionando.

## 1. Propósito de este documento

Este archivo resume el estado técnico y funcional del proyecto para poder continuar el desarrollo sin reconstruir el contexto de las fases anteriores.

Regla importante acordada durante el desarrollo:

- El proyecto todavía está en desarrollo y la base puede reconstruirse.
- Evitar migraciones incrementales innecesarias.
- Cuando corresponda y sea seguro, agregar los campos directamente en las migraciones originales.
- Nunca ejecutar `migrate:fresh` sin una instrucción explícita.
- Antes de modificar una estructura existente, revisar migraciones, modelos, relaciones y datos que ya la utilizan.

## 2. Arquitectura general

El sistema está dividido en:

### Laravel

Responsable de:

- autenticación y autorización por roles;
- gestión de pacientes;
- perfil clínico endocrinológico;
- perfil nutricional;
- diagnósticos PMOS y resistencia a la insulina;
- persistencia de resultados expertos;
- validación médica;
- planes alimentarios;
- seguimiento del paciente;
- reportes PDF;
- paneles de endocrinólogo, nutricionista, paciente y administrador.

### React, Inertia, Tailwind y DaisyUI

Responsable de las interfaces de:

- endocrinólogo;
- nutricionista;
- paciente;
- administrador y superadministrador.

### Microservicio `pmos-experto`

Tecnologías:

- Python 3.13.6;
- FastAPI;
- ZEN Engine de GoRules;
- modelos de decisión JDM.

ZEN Engine reemplazó definitivamente las pruebas realizadas con Experta y Durable Rules.

El microservicio maneja actualmente decisiones para:

- diagnóstico PMOS mediante criterios de Rotterdam;
- resistencia a la insulina mediante indicadores clínicos y metabólicos;
- recomendación nutricional experta base.

Laravel se comunica con el microservicio mediante `SistemaExpertoZenService`.

## 3. Roles del sistema

Los roles principales son:

- administrador y superadministrador: representan el mismo perfil administrativo;
- endocrinólogo;
- nutricionista;
- paciente.

Cada rol tiene rutas, permisos e interfaz diferenciados.

## 4. Módulo endocrinológico

### Perfil clínico

El perfil clínico contiene registros históricos de:

- consulta endocrinológica;
- historia menstrual;
- hiperandrogenismo;
- antecedentes endocrino-metabólicos;
- evaluación física;
- perfil androgénico;
- perfil gonadotropo;
- diferenciales endocrinos;
- glucosa e insulina;
- perfil lipídico;
- ecografía.

### Antecedentes dinámicos

El formulario de antecedentes dejó de depender exclusivamente de casillas predefinidas.

Ahora permite registrar múltiples filas de:

- antecedentes personales, con fecha, estado y observación;
- antecedentes familiares, con condición, parentesco y observación;
- medicamentos, con nombre, dosis, frecuencia, motivo, fecha de inicio y estado.

Los campos estructurados se almacenan como JSON:

- `antecedentes_personales_detalle`;
- `antecedentes_familiares_detalle`;
- `medicamentos_detalle`.

Estos campos fueron agregados en la migración original de antecedentes. No existe una migración incremental adicional para ellos.

El backend deriva automáticamente indicadores compatibles con la lógica clínica anterior, como diabetes, hipertensión, dislipidemia, enfermedad tiroidea, metformina, anticonceptivos y corticoides.

### Diagnóstico PMOS

El flujo incluye:

1. registro de información clínica;
2. construcción de hechos reales;
3. evaluación mediante ZEN Engine;
4. persistencia de resultado y trazabilidad;
5. revisión del resultado final;
6. aprobación o rechazo por endocrinólogo;
7. edición clínica complementaria cuando corresponda;
8. generación de reporte PDF independiente.

### Diagnóstico de resistencia a la insulina

El flujo incluye:

- glucosa e insulina;
- HOMA-IR;
- QUICKI;
- perfil metabólico;
- riesgos asociados;
- inferencia experta;
- validación médica;
- reporte PDF independiente.

### Trazabilidad experta

Los diagnósticos conservan información como:

- hechos utilizados;
- reglas activadas;
- explicación experta;
- recomendaciones;
- confianza;
- versión del motor;
- fecha de evaluación;
- estado de validación;
- especialista que validó;
- fecha y observación de validación.

## 5. Integración Laravel con ZEN Engine

Servicios principales:

- `HechosSistemaExpertoService`;
- `SistemaExpertoZenService`;
- `PersistenciaDiagnosticoExpertoService`;
- `OrquestadorSistemaExpertoService`;
- `HechosNutricionalesSistemaExpertoService`.

Flujo endocrinológico:

```text
Diagnóstico Laravel
    -> construcción de hechos
    -> petición HTTP a FastAPI
    -> evaluación JDM con ZEN Engine
    -> resultado y trazabilidad
    -> persistencia en diagnóstico real
    -> validación del especialista
```

La configuración se lee desde:

```env
PMOS_EXPERTO_URL=http://127.0.0.1:8001
PMOS_EXPERTO_TIMEOUT=10
```

## 6. Módulo nutricional

### Perfil nutricional

Incluye:

- consulta nutricional;
- evaluación nutricional;
- hábitos alimentarios;
- preferencias;
- restricciones;
- objetivos nutricionales;
- requerimientos nutricionales;
- recomendación experta;
- planificación semanal;
- adherencia y seguimiento.

Los botones `Nuevo registro` y `Editar` están separados en:

- evaluación nutricional;
- hábitos alimentarios;
- preferencias;
- restricciones;
- objetivos.

`Nuevo registro` abre un formulario limpio y utiliza `POST`.  
`Editar` carga el registro actual y utiliza `POST` con `_method=PUT` para evitar redirecciones incorrectas con método PUT.

### Hechos nutricionales integrados

Laravel reúne de forma segura:

- datos del paciente;
- diagnóstico PMOS;
- diagnóstico de resistencia a la insulina;
- evaluación nutricional;
- hábitos;
- preferencias;
- restricciones;
- objetivos;
- requerimientos.

Se priorizan diagnósticos validados por especialista y se toleran datos faltantes.

### Recomendación nutricional experta

ZEN Engine devuelve una orientación nutricional base con:

- enfoque;
- prioridad;
- calorías sugeridas;
- distribución de macronutrientes;
- fibra;
- recomendaciones;
- restricciones consideradas;
- alertas;
- reglas activadas;
- explicación y confianza.

La nutricionista puede revisar y validar esta recomendación antes de generar un plan.

## 7. Plan alimentario semanal

El plan utiliza siete días y cuatro tiempos de comida:

- desayuno: 25 %;
- almuerzo: 40 %;
- merienda: 15 %;
- cena: 20 %.

Horas sugeridas:

- desayuno: 08:00;
- almuerzo: 13:00;
- merienda: 16:30;
- cena: 19:30.

El generador busca producir 28 comidas y utiliza el clasificador experto de recetas para considerar:

- tipo de comida;
- objetivos nutricionales;
- preferencias;
- alergias, intolerancias y restricciones;
- disponibilidad;
- variedad semanal;
- antecedentes endocrinológicos;
- seguimiento y retroalimentación previa.

### Flujo actual de edición de comidas

La interfaz está centrada en recetas.

Para cada tiempo de comida, la nutricionista puede:

- seleccionar una receta existente;
- buscarla en el catálogo;
- crear una receta personalizada;
- cambiar la receta asignada;
- eliminar una asignación;
- configurar nombre, horario e indicaciones adicionales.

Las opciones directas `Alimento` y `Manual` fueron ocultadas para nuevos componentes.

El soporte backend para componentes antiguos de tipo alimento o manual se conserva para no romper datos anteriores ni resultados del generador.

Cuando existe un componente manual pendiente, la interfaz muestra `Completar con receta`.

### Creación de receta desde una comida

La nutricionista puede crear una receta sin abandonar el plan:

1. selecciona `Crear nueva receta`;
2. registra nombre y tipo de comida;
3. selecciona alimentos del catálogo;
4. asigna cantidades y unidades;
5. define porciones y tiempo;
6. registra los pasos de preparación;
7. revisa el cálculo nutricional;
8. utiliza `Crear y asignar receta`.

La receta se crea en el catálogo y se asigna automáticamente al tiempo de comida. Si reemplaza un componente manual, se actualiza el componente existente para evitar duplicados.

### Información visible en las tarjetas

Cada tarjeta de comida muestra:

- nombre y horario;
- receta asignada;
- porciones;
- calorías y macronutrientes;
- ingredientes;
- cantidad y unidad de cada ingrediente;
- pasos de preparación;
- indicaciones adicionales de la nutricionista.

La carga de datos sigue esta relación:

```text
Plan
  -> días
    -> comidas
      -> componentes
        -> receta
          -> receta_alimentos
            -> alimento
```

## 8. Seguimiento nutricional

El paciente puede consultar su planificación y registrar seguimiento de comidas.

Se implementaron elementos relacionados con:

- cumplimiento de comidas;
- porcentaje consumido;
- agrado;
- saciedad;
- hambre posterior;
- ansiedad;
- molestias digestivas;
- acceso a ingredientes;
- comentarios y sugerencias;
- seguimiento de síntomas PMOS y RI;
- lista de compras;
- citas;
- progreso personal.

La nutricionista cuenta con:

- panel de seguimiento;
- retroalimentación al paciente;
- alertas automáticas;
- sugerencias de ajuste;
- analítica de evolución;
- historial de planes;
- finalización y generación del siguiente plan;
- reportes PDF de seguimiento y cambios.

## 9. Reportes PDF

Actualmente existen reportes relacionados con:

- diagnóstico PMOS;
- diagnóstico de resistencia a la insulina;
- plan alimentario justificativo;
- plan práctico para paciente;
- seguimiento y evolución;
- comparación de cambios entre planes.

Los reportes deben conservar datos clínicos suficientes para fundamentar conclusiones, reglas o decisiones, evitando mostrar únicamente el resultado final.

## 10. Paneles

### Endocrinólogo

- pacientes y citas;
- perfil clínico;
- diagnósticos PMOS y RI;
- resultados expertos;
- validación médica;
- reportes.

### Nutricionista

- pacientes y citas;
- perfil nutricional;
- recomendaciones expertas;
- recetas y alimentos;
- planes semanales;
- seguimiento, alertas y evolución.

### Paciente

- plan alimentario;
- cumplimiento de comidas;
- síntomas;
- lista de compras;
- citas;
- progreso;
- retroalimentación;
- descarga de plan práctico.

### Administrador

- dashboard administrativo;
- gestión de usuarios;
- métricas generales;
- auditoría y actividad del sistema.

## 11. Archivos clave para continuar

### Sistema experto Laravel

```text
app/Services/SistemaExperto/
```

### Microservicio

```text
pmos-experto/
```

### Perfil clínico endocrinológico

```text
resources/js/Pages/Endocrinologo/Pacientes/PerfilClinico/
```

### Perfil nutricional

```text
resources/js/Pages/Nutricionista/Pacientes/PerfilNutricional/
```

### Plan semanal y edición de recetas

```text
resources/js/Components/planes/
resources/js/Components/Nutricion/Recetas/
app/Http/Controllers/Nutricionista/PlanAlimentarioController.php
app/Services/Nutricion/GeneradorPlanSemanalService.php
app/Services/Nutricion/ClasificadorRecetasSistemaExpertoService.php
```

### Portal del paciente

```text
resources/js/Pages/Paciente/
app/Services/Paciente/
```

## 12. Comandos habituales de validación

Laravel:

```bash
php artisan optimize:clear
composer dump-autoload
php artisan route:list
php artisan test
```

Frontend:

```bash
npm run build
```

Microservicio:

```bash
cd pmos-experto
venv\Scripts\activate
python -m pytest
uvicorn app.main:app --reload --port 8001
```

Comprobaciones del microservicio:

```text
http://127.0.0.1:8001/health
http://127.0.0.1:8001/docs
```

## 13. Última validación conocida

Después de integrar ingredientes y preparación en las tarjetas del plan:

- sintaxis PHP: correcta;
- compilación frontend: correcta;
- pruebas Laravel: 337 aprobadas;
- aserciones Laravel: 1372;
- migraciones creadas en estos últimos ajustes: ninguna.

## 14. Recomendaciones para la siguiente sesión

Antes de implementar una nueva fase:

1. leer este documento;
2. revisar `git status --short` para preservar cambios existentes;
3. inspeccionar migraciones y relaciones antes de crear estructuras;
4. reutilizar servicios y componentes actuales;
5. mantener separados los flujos `Nuevo registro` y `Editar`;
6. conservar compatibilidad con registros históricos;
7. ejecutar pruebas, listado de rutas y compilación;
8. no ejecutar `migrate:fresh` sin autorización explícita.

Posibles mejoras posteriores:

- mejorar la edición de ingredientes de una receta ya asignada desde el plan;
- agregar variantes de recetas sin contaminar el catálogo general;
- diferenciar recetas globales y recetas privadas por nutricionista si el alcance lo requiere;
- mostrar ingredientes y preparación también en todas las vistas del paciente de manera consistente;
- añadir pruebas específicas para creación y asignación de recetas mediante respuesta JSON;
- revisar accesibilidad y comportamiento móvil de modales extensos.
