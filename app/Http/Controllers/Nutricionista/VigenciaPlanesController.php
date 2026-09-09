<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Services\Nutricion\VigenciaPlanesNutricionistaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VigenciaPlanesController extends Controller
{
    public function __invoke(Request $request, VigenciaPlanesNutricionistaService $servicio): Response
    {
        $datos = $request->validate(['mes' => ['nullable', 'date_format:Y-m']]);
        return Inertia::render('Nutricionista/VigenciaPlanes/Index', $servicio->obtener($request->user(), $datos['mes'] ?? null));
    }
}
