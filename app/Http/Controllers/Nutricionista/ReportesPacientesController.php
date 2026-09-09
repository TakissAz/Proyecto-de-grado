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
        $reporte = $servicio->generar($request->user(), $tipo, $filtros);
        $pagina = max(1, (int) $request->query('page', 1));
        $porPagina = 10;
        $total = count($reporte['filas']);
        $ultimaPagina = max(1, (int) ceil($total / $porPagina));
        $pagina = min($pagina, $ultimaPagina);
        $reporte['filas'] = array_slice($reporte['filas'], ($pagina - 1) * $porPagina, $porPagina);
        $reporte['paginacion'] = [
            'pagina_actual' => $pagina,
            'ultima_pagina' => $ultimaPagina,
            'por_pagina' => $porPagina,
            'total' => $total,
            'desde' => $total ? (($pagina - 1) * $porPagina) + 1 : 0,
            'hasta' => min($pagina * $porPagina, $total),
        ];

        return Inertia::render('Nutricionista/Reportes/Index', ['catalogo'=>GeneradorReportesNutricionistaService::TIPOS,'reporte'=>$reporte,'filtros'=>$filtros]);
    }
}
