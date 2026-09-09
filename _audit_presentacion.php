<?php

require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$pacientes = App\Models\Paciente::with('user:id,name,email')
    ->orderBy('id_paciente')
    ->get(['id_paciente', 'user_id', 'ci', 'nombres', 'apellido_paterno', 'apellido_materno']);

echo json_encode([
    'totales' => [
        'pacientes' => $pacientes->count(),
        'demo' => $pacientes->filter(fn ($p) => str_starts_with((string) $p->ci, 'DEMO-'))->count(),
        'prueba' => $pacientes->filter(fn ($p) => str_starts_with((string) $p->ci, 'PRUEBA-'))->count(),
        'clinica' => $pacientes->filter(fn ($p) => str_starts_with((string) $p->ci, 'CLINICA-'))->count(),
    ],
    'primeros' => $pacientes->take(12)->map(fn ($p) => [
        'id' => $p->id_paciente,
        'ci' => $p->ci,
        'nombre' => trim("{$p->nombres} {$p->apellido_paterno} {$p->apellido_materno}"),
        'email' => $p->user?->email,
        'planes' => $p->planesAlimentarios()->count(),
    ])->values(),
    'planes' => App\Models\PlanAlimentario::query()
        ->selectRaw('estado_plan, COUNT(*) total')
        ->groupBy('estado_plan')
        ->pluck('total', 'estado_plan'),
    'seguimientos' => App\Models\SeguimientoComida::query()
        ->selectRaw('estado_cumplimiento, COUNT(*) total')
        ->groupBy('estado_cumplimiento')
        ->pluck('total', 'estado_cumplimiento'),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE).PHP_EOL;
