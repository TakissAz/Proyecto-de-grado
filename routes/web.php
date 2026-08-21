<?php

use App\Http\Controllers\Admin\AuditoriaPacienteController;
use App\Http\Controllers\Admin\PacienteController as AdminPacienteController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardAdminController;
use App\Http\Controllers\Endocrinologo\AntecedentesEndocrinoMetabolicosController;
use App\Http\Controllers\Endocrinologo\ConsultaEndocrinologicaController;
use App\Http\Controllers\Endocrinologo\DiagnosticoPmosController;
use App\Http\Controllers\Endocrinologo\DiagnosticoResistenciaInsulinaController;
use App\Http\Controllers\Endocrinologo\EcografiaController;
use App\Http\Controllers\Endocrinologo\EvaluacionFisicaController;
use App\Http\Controllers\Endocrinologo\HiperandrogenismoController;
use App\Http\Controllers\Endocrinologo\HistoriaMenstrualController;
use App\Http\Controllers\Endocrinologo\LaboratoriosController;
use App\Http\Controllers\Endocrinologo\PacienteController as EndocrinologoPacienteController;
use App\Http\Controllers\Endocrinologo\ReporteDiagnosticoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Paciente\DashboardController as PacienteDashboardController;
use App\Http\Controllers\Paciente\SeguimientoComidaController;
use App\Http\Controllers\Paciente\SeguimientoSintomasController;
use App\Http\Controllers\Paciente\RetroalimentacionPacienteController as PacienteRetroalimentacionController;
use App\Http\Controllers\Paciente\PlanPacientePdfController;
use App\Http\Controllers\Nutricionista\AlimentoBusquedaController;
use App\Http\Controllers\Nutricionista\AlimentoController as NutricionistaAlimentoController;
use App\Http\Controllers\Nutricionista\PacienteController as NutricionistaPacienteController;
use App\Http\Controllers\Nutricionista\PerfilNutricionalController;
use App\Http\Controllers\Nutricionista\PlanAlimentarioController;
use App\Http\Controllers\Nutricionista\RecomendacionNutricionalExpertaController;
use App\Http\Controllers\Nutricionista\ReportePlanAlimentarioPdfController;
use App\Http\Controllers\Nutricionista\ReporteSeguimientoEvolucionPdfController;
use App\Http\Controllers\Nutricionista\ReporteCambiosPlanPdfController;
use App\Http\Controllers\Nutricionista\CicloPlanAlimentarioController;
use App\Http\Controllers\Nutricionista\RecetaController as NutricionistaRecetaController;
use App\Http\Controllers\Nutricionista\RetroalimentacionPacienteController as NutricionistaRetroalimentacionController;
use App\Http\Controllers\Endocrinologo\CitaController as EndocrinologoCitaController;
use App\Http\Controllers\SistemaExperto\EjecutarSistemaExpertoController;
use App\Http\Controllers\SistemaExperto\ValidarResultadoExpertoController;
use App\Http\Controllers\Nutricionista\CitaController as NutricionistaCitaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = Auth::user();

    if (! $user) {
        return redirect()->route('login');
    }

    if ($user->tieneRol('administrador')) {
        return redirect()->route('admin.dashboard');
    }

    if ($user->tieneRol('endocrinologo')) {
        return redirect()->route('endocrinologo.dashboard');
    }

    if ($user->tieneRol('nutricionista')) {
        return redirect()->route('nutricionista.dashboard');
    }

    if ($user->tieneRol('paciente')) {
        return redirect()->route('paciente.dashboard');
    }

    abort(403, 'El usuario no tiene un rol asignado.');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'role:administrador'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', DashboardAdminController::class)->name('dashboard');

        Route::resource('users', UserController::class)
            ->except(['show', 'destroy']);

        Route::patch('users/{user}/activar', [UserController::class, 'activar'])
            ->name('users.activar');

        Route::patch('users/{user}/inactivar', [UserController::class, 'inactivar'])
            ->name('users.inactivar');

        Route::patch('users/{user}/bloquear', [UserController::class, 'bloquear'])
            ->name('users.bloquear');

        Route::get('pacientes', [AdminPacienteController::class, 'index'])
            ->name('pacientes.index');
        Route::get('pacientes/create', [AdminPacienteController::class, 'create'])
            ->name('pacientes.create');
        Route::post('pacientes', [AdminPacienteController::class, 'store'])
            ->name('pacientes.store');
        Route::get('pacientes/{paciente}', [AdminPacienteController::class, 'show'])
            ->name('pacientes.show');
        Route::get('pacientes/{paciente}/edit', [AdminPacienteController::class, 'edit'])
            ->name('pacientes.edit');
        Route::match(['put', 'patch'], 'pacientes/{paciente}', [AdminPacienteController::class, 'update'])
            ->name('pacientes.update');
        Route::patch('pacientes/{paciente}/activar', [AdminPacienteController::class, 'activar'])
            ->name('pacientes.activar');
        Route::patch('pacientes/{paciente}/inactivar', [AdminPacienteController::class, 'inactivar'])
            ->name('pacientes.inactivar');

        Route::get('auditoria/pacientes', [AuditoriaPacienteController::class, 'pacientes'])
            ->name('auditoria.pacientes');

        Route::get('auditoria/actividad', [AuditoriaPacienteController::class, 'actividad'])
            ->name('auditoria.actividad');
    });

Route::middleware(['auth', 'role:nutricionista'])
    ->prefix('nutricionista')
    ->name('nutricionista.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Nutricionista/Dashboard');
        })->name('dashboard');

        Route::get('pacientes', [NutricionistaPacienteController::class, 'index'])
            ->name('pacientes.index');
        Route::get('pacientes/create', [NutricionistaPacienteController::class, 'create'])
            ->name('pacientes.create');
        Route::post('pacientes', [NutricionistaPacienteController::class, 'store'])
            ->name('pacientes.store');
        Route::get('pacientes/{paciente}', [NutricionistaPacienteController::class, 'show'])
            ->name('pacientes.show');
        Route::get('pacientes/{paciente}/edit', [NutricionistaPacienteController::class, 'edit'])
            ->name('pacientes.edit');
        Route::match(['put', 'patch'], 'pacientes/{paciente}', [NutricionistaPacienteController::class, 'update'])
            ->name('pacientes.update');
        Route::patch('pacientes/{paciente}/activar', [NutricionistaPacienteController::class, 'activar'])
            ->name('pacientes.activar');
        Route::patch('pacientes/{paciente}/inactivar', [NutricionistaPacienteController::class, 'inactivar'])
            ->name('pacientes.inactivar');

        // Perfil nutricional
        Route::get('pacientes/{paciente}/perfil-nutricional', [PerfilNutricionalController::class, 'index'])->name('pacientes.perfil-nutricional');
        Route::post('pacientes/{paciente}/perfil-nutricional/consulta', [PerfilNutricionalController::class, 'storeConsulta'])->name('pacientes.perfil-nutricional.consulta.store');
        Route::put('pacientes/{paciente}/perfil-nutricional/consulta/{consulta}', [PerfilNutricionalController::class, 'updateConsulta'])->name('pacientes.perfil-nutricional.consulta.update');
        Route::post('pacientes/{paciente}/perfil-nutricional/evaluacion', [PerfilNutricionalController::class, 'storeEvaluacion'])->name('pacientes.perfil-nutricional.evaluacion.store');
        Route::put('pacientes/{paciente}/perfil-nutricional/evaluacion/{evaluacion}', [PerfilNutricionalController::class, 'updateEvaluacion'])->name('pacientes.perfil-nutricional.evaluacion.update');
        Route::post('pacientes/{paciente}/perfil-nutricional/habitos', [PerfilNutricionalController::class, 'storeHabitos'])->name('pacientes.perfil-nutricional.habitos.store');
        Route::put('pacientes/{paciente}/perfil-nutricional/habitos/{habito}', [PerfilNutricionalController::class, 'updateHabitos'])->name('pacientes.perfil-nutricional.habitos.update');
        Route::post('pacientes/{paciente}/perfil-nutricional/preferencias', [PerfilNutricionalController::class, 'storePreferencias'])->name('pacientes.perfil-nutricional.preferencias.store');
        Route::put('pacientes/{paciente}/perfil-nutricional/preferencias/{preferencia}', [PerfilNutricionalController::class, 'updatePreferencias'])->name('pacientes.perfil-nutricional.preferencias.update');
        Route::post('pacientes/{paciente}/perfil-nutricional/restricciones', [PerfilNutricionalController::class, 'storeRestricciones'])->name('pacientes.perfil-nutricional.restricciones.store');
        Route::put('pacientes/{paciente}/perfil-nutricional/restricciones/{restriccion}', [PerfilNutricionalController::class, 'updateRestricciones'])->name('pacientes.perfil-nutricional.restricciones.update');
        Route::post('pacientes/{paciente}/perfil-nutricional/objetivos', [PerfilNutricionalController::class, 'storeObjetivo'])->name('pacientes.perfil-nutricional.objetivos.store');
        Route::put('pacientes/{paciente}/perfil-nutricional/objetivos/{objetivo}', [PerfilNutricionalController::class, 'updateObjetivo'])->name('pacientes.perfil-nutricional.objetivos.update');
        Route::post('pacientes/{paciente}/perfil-nutricional/requerimientos/calcular', [PerfilNutricionalController::class, 'calcularRequerimientos'])->name('pacientes.perfil-nutricional.requerimientos.calcular');
        Route::post('pacientes/{paciente}/recomendacion-experta/generar', [RecomendacionNutricionalExpertaController::class, 'generar'])
            ->middleware('verified')
            ->name('recomendacion-experta.generar');
        Route::post('recomendaciones-expertas/{recomendacion}/validar', [RecomendacionNutricionalExpertaController::class, 'validar'])
            ->middleware('verified')
            ->name('recomendacion-experta.validar');
        Route::middleware('verified')->group(function () {
            Route::get('pacientes/{paciente}/reporte-seguimiento-evolucion-pdf', ReporteSeguimientoEvolucionPdfController::class)
                ->name('pacientes.reporte-seguimiento-evolucion-pdf');
            Route::post('pacientes/{paciente}/retroalimentaciones', [NutricionistaRetroalimentacionController::class, 'store'])
                ->name('pacientes.retroalimentaciones.store');
            Route::get('pacientes/{paciente}/planes-alimentarios', [PlanAlimentarioController::class, 'index'])->name('planes.index');
            Route::post('recomendaciones-expertas/{recomendacion}/generar-plan', [PlanAlimentarioController::class, 'generarDesdeRecomendacion'])->name('planes.generar-desde-recomendacion');
            Route::get('planes-alimentarios/{plan}', [PlanAlimentarioController::class, 'show'])->name('planes.show');
            Route::get('planes-alimentarios/{plan}/reporte-pdf', ReportePlanAlimentarioPdfController::class)
                ->name('planes.reporte-pdf');
            Route::get('planes-alimentarios/{plan}/reporte-cambios-pdf', ReporteCambiosPlanPdfController::class)
                ->name('planes.reporte-cambios-pdf');
            Route::post('planes-alimentarios/{plan}/finalizar-y-generar-siguiente', [CicloPlanAlimentarioController::class, 'finalizarYGenerar'])
                ->name('planes.finalizar-y-generar-siguiente');
            Route::patch('planes-alimentarios/{plan}/estado', [PlanAlimentarioController::class, 'actualizarEstado'])->name('planes.estado');
            Route::patch('comidas-plan/{comida}', [PlanAlimentarioController::class, 'actualizarComida'])->name('planes.comidas.update');
            Route::post('comidas-plan/{comida}/componentes', [PlanAlimentarioController::class, 'crearComponente'])->name('planes.componentes.store');
            Route::patch('componentes-plan/{componente}', [PlanAlimentarioController::class, 'actualizarComponente'])->name('planes.componentes.update');
            Route::delete('componentes-plan/{componente}', [PlanAlimentarioController::class, 'eliminarComponente'])->name('planes.componentes.destroy');
        });

        // Historiales nutricionales
        Route::get('pacientes/{paciente}/perfil-nutricional/evaluaciones/historial', [PerfilNutricionalController::class, 'historialEvaluaciones'])->name('pacientes.perfil-nutricional.evaluaciones.historial');
        Route::get('pacientes/{paciente}/perfil-nutricional/habitos/historial', [PerfilNutricionalController::class, 'historialHabitos'])->name('pacientes.perfil-nutricional.habitos.historial');
        Route::get('pacientes/{paciente}/perfil-nutricional/preferencias/historial', [PerfilNutricionalController::class, 'historialPreferencias'])->name('pacientes.perfil-nutricional.preferencias.historial');
        Route::get('pacientes/{paciente}/perfil-nutricional/restricciones/historial', [PerfilNutricionalController::class, 'historialRestricciones'])->name('pacientes.perfil-nutricional.restricciones.historial');
        Route::get('pacientes/{paciente}/perfil-nutricional/objetivos/historial', [PerfilNutricionalController::class, 'historialObjetivos'])->name('pacientes.perfil-nutricional.objetivos.historial');

        // Alimentos
        Route::get('alimentos', [NutricionistaAlimentoController::class, 'index'])
            ->name('alimentos.index');
        Route::get('alimentos/create', [NutricionistaAlimentoController::class, 'create'])
            ->name('alimentos.create');
        Route::post('alimentos', [NutricionistaAlimentoController::class, 'store'])
            ->name('alimentos.store');
        Route::get('alimentos/{alimento}/edit', [NutricionistaAlimentoController::class, 'edit'])
            ->name('alimentos.edit');
        Route::match(['put', 'patch'], 'alimentos/{alimento}', [NutricionistaAlimentoController::class, 'update'])
            ->name('alimentos.update');
        Route::patch('alimentos/{alimento}/activar', [NutricionistaAlimentoController::class, 'activar'])
            ->name('alimentos.activar');
        Route::patch('alimentos/{alimento}/inactivar', [NutricionistaAlimentoController::class, 'inactivar'])
            ->name('alimentos.inactivar');

        // Recetas
        Route::get('recetas', [NutricionistaRecetaController::class, 'index'])
            ->name('recetas.index');
        Route::get('recetas/create', [NutricionistaRecetaController::class, 'create'])
            ->name('recetas.create');
        Route::post('recetas', [NutricionistaRecetaController::class, 'store'])
            ->name('recetas.store');
        Route::get('recetas/{receta}', [NutricionistaRecetaController::class, 'show'])
            ->name('recetas.show');
        Route::get('recetas/{receta}/edit', [NutricionistaRecetaController::class, 'edit'])
            ->name('recetas.edit');
        Route::match(['put', 'patch'], 'recetas/{receta}', [NutricionistaRecetaController::class, 'update'])
            ->name('recetas.update');
        Route::patch('recetas/{receta}/activar', [NutricionistaRecetaController::class, 'activar'])
            ->name('recetas.activar');
        Route::patch('recetas/{receta}/inactivar', [NutricionistaRecetaController::class, 'inactivar'])
            ->name('recetas.inactivar');

        // Búsqueda de alimentos (API para autocomplete)
        Route::get('api/alimentos/buscar', AlimentoBusquedaController::class)
            ->name('api.alimentos.buscar');

        // Citas
        Route::get('citas', [NutricionistaCitaController::class, 'index'])->name('citas.index');
        Route::get('citas/create', [NutricionistaCitaController::class, 'create'])->name('citas.create');
        Route::post('citas', [NutricionistaCitaController::class, 'store'])->name('citas.store');
        Route::get('citas/{cita}/edit', [NutricionistaCitaController::class, 'edit'])->name('citas.edit');
        Route::match(['put', 'patch'], 'citas/{cita}', [NutricionistaCitaController::class, 'update'])->name('citas.update');
        Route::post('citas/{cita}/confirmar', [NutricionistaCitaController::class, 'confirmar'])->name('citas.confirmar');
        Route::post('citas/{cita}/atendida', [NutricionistaCitaController::class, 'marcarAtendida'])->name('citas.marcarAtendida');
        Route::post('citas/{cita}/no-asistio', [NutricionistaCitaController::class, 'marcarNoAsistio'])->name('citas.marcarNoAsistio');
        Route::post('citas/{cita}/cancelar', [NutricionistaCitaController::class, 'cancelar'])->name('citas.cancelar');
        Route::get('citas/bloques', [NutricionistaCitaController::class, 'bloques'])->name('citas.bloques');
    });

Route::middleware(['auth', 'role:endocrinologo'])
    ->prefix('endocrinologo')
    ->name('endocrinologo.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Endocrinologo/Dashboard');
        })->name('dashboard');

        Route::get('pacientes', [EndocrinologoPacienteController::class, 'index'])
            ->name('pacientes.index');
        Route::get('pacientes/create', [EndocrinologoPacienteController::class, 'create'])
            ->name('pacientes.create');
        Route::post('pacientes', [EndocrinologoPacienteController::class, 'store'])
            ->name('pacientes.store');
        Route::get('pacientes/{paciente}', [EndocrinologoPacienteController::class, 'show'])
            ->name('pacientes.show');
        Route::get('pacientes/{paciente}/edit', [EndocrinologoPacienteController::class, 'edit'])
            ->name('pacientes.edit');
        Route::match(['put', 'patch'], 'pacientes/{paciente}', [EndocrinologoPacienteController::class, 'update'])
            ->name('pacientes.update');
        Route::patch('pacientes/{paciente}/activar', [EndocrinologoPacienteController::class, 'activar'])
            ->name('pacientes.activar');
        Route::patch('pacientes/{paciente}/inactivar', [EndocrinologoPacienteController::class, 'inactivar'])
            ->name('pacientes.inactivar');

        // Perfil clínico completo
        Route::get('pacientes/{paciente}/perfil-clinico', [EndocrinologoPacienteController::class, 'perfilClinico'])
            ->name('pacientes.perfil-clinico');

        // Consultas endocrinológicas
        Route::post('pacientes/{paciente}/consultas', [ConsultaEndocrinologicaController::class, 'store'])
            ->name('pacientes.consultas.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/consultas/{consulta}', [ConsultaEndocrinologicaController::class, 'update'])
            ->name('pacientes.consultas.update');

        // Historia menstrual
        Route::post('pacientes/{paciente}/historia-menstrual', [HistoriaMenstrualController::class, 'store'])
            ->name('pacientes.historia-menstrual.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/historia-menstrual/{historia}', [HistoriaMenstrualController::class, 'update'])
            ->name('pacientes.historia-menstrual.update');
        Route::get('pacientes/{paciente}/historia-menstrual/historial', [HistoriaMenstrualController::class, 'historial'])
            ->name('pacientes.historia-menstrual.historial');

        // Hiperandrogenismo
        Route::post('pacientes/{paciente}/hiperandrogenismo', [HiperandrogenismoController::class, 'store'])
            ->name('pacientes.hiperandrogenismo.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/hiperandrogenismo/{hiperandrogenismo}', [HiperandrogenismoController::class, 'update'])
            ->name('pacientes.hiperandrogenismo.update');
        Route::get('pacientes/{paciente}/hiperandrogenismo/historial', [HiperandrogenismoController::class, 'historial'])
            ->name('pacientes.hiperandrogenismo.historial');

        // Antecedentes endocrino-metabólicos
        Route::post('pacientes/{paciente}/antecedentes', [AntecedentesEndocrinoMetabolicosController::class, 'store'])
            ->name('pacientes.antecedentes.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/antecedentes/{antecedente}', [AntecedentesEndocrinoMetabolicosController::class, 'update'])
            ->name('pacientes.antecedentes.update');
        Route::get('pacientes/{paciente}/antecedentes/historial', [AntecedentesEndocrinoMetabolicosController::class, 'historial'])
            ->name('pacientes.antecedentes.historial');

        // Evaluación física endocrina
        Route::post('pacientes/{paciente}/evaluacion-fisica', [EvaluacionFisicaController::class, 'store'])
            ->name('pacientes.evaluacion-fisica.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/evaluacion-fisica/{evaluacion}', [EvaluacionFisicaController::class, 'update'])
            ->name('pacientes.evaluacion-fisica.update');
        Route::get('pacientes/{paciente}/evaluacion-fisica/historial', [EvaluacionFisicaController::class, 'historial'])
            ->name('pacientes.evaluacion-fisica.historial');

        // Laboratorios - Perfil androgénico
        Route::post('pacientes/{paciente}/laboratorios/perfil-androgenico', [LaboratoriosController::class, 'storePerfilAndrogenico'])
            ->name('pacientes.laboratorios.perfil-androgenico.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/laboratorios/perfil-androgenico/{perfilAndrogenico}', [LaboratoriosController::class, 'updatePerfilAndrogenico'])
            ->name('pacientes.laboratorios.perfil-androgenico.update');

        // Laboratorios - Perfil gonadotropo
        Route::post('pacientes/{paciente}/laboratorios/perfil-gonadotropo', [LaboratoriosController::class, 'storePerfilGonadotropo'])
            ->name('pacientes.laboratorios.perfil-gonadotropo.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/laboratorios/perfil-gonadotropo/{perfilGonadotropo}', [LaboratoriosController::class, 'updatePerfilGonadotropo'])
            ->name('pacientes.laboratorios.perfil-gonadotropo.update');

        // Laboratorios - Diferenciales endocrinos
        Route::post('pacientes/{paciente}/laboratorios/diferenciales', [LaboratoriosController::class, 'storeDiferencialesEndocrinos'])
            ->name('pacientes.laboratorios.diferenciales.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/laboratorios/diferenciales/{diferencial}', [LaboratoriosController::class, 'updateDiferencialesEndocrinos'])
            ->name('pacientes.laboratorios.diferenciales.update');

        // Laboratorios - Glucosa e insulina
        Route::post('pacientes/{paciente}/laboratorios/glucosa-insulina', [LaboratoriosController::class, 'storeGlucosaInsulina'])
            ->name('pacientes.laboratorios.glucosa-insulina.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/laboratorios/glucosa-insulina/{glucosaInsulina}', [LaboratoriosController::class, 'updateGlucosaInsulina'])
            ->name('pacientes.laboratorios.glucosa-insulina.update');

        // Laboratorios - Perfil lipídico
        Route::post('pacientes/{paciente}/laboratorios/perfil-lipidico', [LaboratoriosController::class, 'storePerfilLipidico'])
            ->name('pacientes.laboratorios.perfil-lipidico.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/laboratorios/perfil-lipidico/{perfilLipidico}', [LaboratoriosController::class, 'updatePerfilLipidico'])
            ->name('pacientes.laboratorios.perfil-lipidico.update');
        Route::get('pacientes/{paciente}/laboratorios/historial', [LaboratoriosController::class, 'historial'])
            ->name('pacientes.laboratorios.historial');

        // Ecografía
        Route::post('pacientes/{paciente}/ecografia', [EcografiaController::class, 'store'])
            ->name('pacientes.ecografia.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/ecografia/{ecografia}', [EcografiaController::class, 'update'])
            ->name('pacientes.ecografia.update');
        Route::get('pacientes/{paciente}/ecografia/historial', [EcografiaController::class, 'historial'])
            ->name('pacientes.ecografia.historial');

        // Diagnóstico PMOS
        Route::post('pacientes/{paciente}/diagnostico-pmos', [DiagnosticoPmosController::class, 'store'])
            ->name('pacientes.diagnostico-pmos.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/diagnostico-pmos/{diagnostico}', [DiagnosticoPmosController::class, 'update'])
            ->name('pacientes.diagnostico-pmos.update');

        // Diagnóstico Resistencia a la Insulina
        Route::post('pacientes/{paciente}/diagnostico-ri', [DiagnosticoResistenciaInsulinaController::class, 'store'])
            ->name('pacientes.diagnostico-ri.store');
        Route::match(['put', 'patch'], 'pacientes/{paciente}/diagnostico-ri/{diagnosticoRi}', [DiagnosticoResistenciaInsulinaController::class, 'update'])
            ->name('pacientes.diagnostico-ri.update');

        Route::middleware('verified')->group(function () {
            Route::post('sistema-experto/pmos/{diagnostico}/ejecutar', [EjecutarSistemaExpertoController::class, 'ejecutarPmos'])
                ->name('sistema-experto.pmos.ejecutar');

            Route::post('sistema-experto/resistencia-insulina/{diagnostico}/ejecutar', [EjecutarSistemaExpertoController::class, 'ejecutarResistenciaInsulina'])
                ->name('sistema-experto.ri.ejecutar');

            Route::post('sistema-experto/pmos/{diagnostico}/validar', [ValidarResultadoExpertoController::class, 'validarPmos'])
                ->name('sistema-experto.pmos.validar');

            Route::post('sistema-experto/resistencia-insulina/{diagnostico}/validar', [ValidarResultadoExpertoController::class, 'validarResistenciaInsulina'])
                ->name('sistema-experto.ri.validar');

            Route::put('diagnosticos/pmos/{diagnostico}', [DiagnosticoPmosController::class, 'actualizarClinico'])
                ->name('diagnosticos.pmos.update');

            Route::put('diagnosticos/resistencia-insulina/{diagnostico}', [DiagnosticoResistenciaInsulinaController::class, 'actualizarClinico'])
                ->name('diagnosticos.ri.update');

            Route::get('pacientes/{paciente}/diagnostico/reporte-pdf', [ReporteDiagnosticoController::class, 'generar'])
                ->name('pacientes.diagnostico.reporte-pdf');

            Route::get('pacientes/{paciente}/diagnostico/pmos/reporte-pdf', [ReporteDiagnosticoController::class, 'generarPmos'])
                ->name('pacientes.diagnostico.pmos.reporte-pdf');

            Route::get('pacientes/{paciente}/diagnostico/resistencia-insulina/reporte-pdf', [ReporteDiagnosticoController::class, 'generarResistenciaInsulina'])
                ->name('pacientes.diagnostico.ri.reporte-pdf');
        });

        // Citas
        Route::get('citas', [EndocrinologoCitaController::class, 'index'])->name('citas.index');
        Route::get('citas/create', [EndocrinologoCitaController::class, 'create'])->name('citas.create');
        Route::post('citas', [EndocrinologoCitaController::class, 'store'])->name('citas.store');
        Route::get('citas/{cita}/edit', [EndocrinologoCitaController::class, 'edit'])->name('citas.edit');
        Route::match(['put', 'patch'], 'citas/{cita}', [EndocrinologoCitaController::class, 'update'])->name('citas.update');
        Route::post('citas/{cita}/confirmar', [EndocrinologoCitaController::class, 'confirmar'])->name('citas.confirmar');
        Route::post('citas/{cita}/atendida', [EndocrinologoCitaController::class, 'marcarAtendida'])->name('citas.marcarAtendida');
        Route::post('citas/{cita}/no-asistio', [EndocrinologoCitaController::class, 'marcarNoAsistio'])->name('citas.marcarNoAsistio');
        Route::post('citas/{cita}/cancelar', [EndocrinologoCitaController::class, 'cancelar'])->name('citas.cancelar');
        Route::get('citas/bloques', [EndocrinologoCitaController::class, 'bloques'])->name('citas.bloques');
    });

Route::middleware(['auth', 'role:paciente'])
    ->prefix('paciente')
    ->name('paciente.')
    ->group(function () {
        Route::get('/dashboard', PacienteDashboardController::class)->name('dashboard');
        Route::get('/mi-plan-alimentario/pdf', PlanPacientePdfController::class)
            ->middleware('verified')->name('plan-alimentario.pdf');
        Route::post('/comidas-plan/{comida}/seguimiento', [SeguimientoComidaController::class, 'guardar'])
            ->middleware('verified')->name('comidas.seguimiento.guardar');
        Route::post('/seguimiento-sintomas', [SeguimientoSintomasController::class, 'store'])
            ->middleware('verified')->name('seguimiento-sintomas.guardar');
        Route::post('/retroalimentaciones/{retroalimentacion}/marcar-leida', [PacienteRetroalimentacionController::class, 'marcarLeida'])
            ->middleware('verified')->name('retroalimentaciones.marcar-leida');
    });

require __DIR__.'/auth.php';
