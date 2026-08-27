<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Services\Nutricion\ProgresoPacientesNutricionistaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgresoPacientesController extends Controller
{
    public function __invoke(Request $request, ProgresoPacientesNutricionistaService $servicio): Response
    {
        return Inertia::render('Nutricionista/Progreso/Index', $servicio->obtener($request->user()));
    }
}
