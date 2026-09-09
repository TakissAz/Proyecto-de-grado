<?php

require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$recetas = Illuminate\Support\Facades\DB::table('recetas')
    ->select(['id_receta', 'nombre', 'tipo_comida', 'imagen_url'])
    ->whereNull('deleted_at')
    ->orderBy('tipo_comida')
    ->orderBy('nombre')
    ->get();

echo json_encode($recetas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
