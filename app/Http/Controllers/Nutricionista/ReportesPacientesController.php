<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Services\Nutricion\GeneradorReportesNutricionistaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportesPacientesController extends Controller
{
    public function __invoke(Request $request, GeneradorReportesNutricionistaService $servicio): Response
    {
        $tipo = array_key_exists((string)$request->query('tipo'), GeneradorReportesNutricionistaService::TIPOS) ? (string)$request->query('tipo') : 'pacientes';
        $filtros = $request->only(['buscar','nivel','estado','estado_plan','desde','hasta']);
        return Inertia::render('Nutricionista/Reportes/Index', ['catalogo'=>GeneradorReportesNutricionistaService::TIPOS,'reporte'=>$servicio->generar($request->user(),$tipo,$filtros),'filtros'=>$filtros]);
    }
}
