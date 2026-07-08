<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProfileController;
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

/*
|--------------------------------------------------------------------------
| Redirección general después del login
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| Perfil de usuario de Breeze
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Módulo Administrador
|--------------------------------------------------------------------------
*/
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
    });

/*
|--------------------------------------------------------------------------
| Módulo Endocrinólogo
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:endocrinologo'])
    ->prefix('endocrinologo')
    ->name('endocrinologo.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Endocrinologo/Dashboard');
        })->name('dashboard');
    });

require __DIR__.'/auth.php';