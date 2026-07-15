<?php

use App\Http\Controllers\Admin\AuditoriaPacienteController;
use App\Http\Controllers\Admin\PacienteController as AdminPacienteController;
use App\Http\Controllers\Admin\UserController;
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
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Nutricionista\PacienteController as NutricionistaPacienteController;
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

Route::middleware(['auth', 'role:administrador'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');

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
    });

Route::middleware(['auth', 'role:paciente'])
    ->prefix('paciente')
    ->name('paciente.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Paciente/Dashboard');
        })->name('dashboard');
    });

require __DIR__.'/auth.php';
