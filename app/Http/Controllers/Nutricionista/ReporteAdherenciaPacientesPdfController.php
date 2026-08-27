<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Services\Nutricion\GeneradorReportesNutricionistaService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReporteAdherenciaPacientesPdfController extends Controller
{
    public function __invoke(Request $request, GeneradorReportesNutricionistaService $servicio): Response
    {
        $filtros = $request->validate([
            'tipo' => ['nullable', Rule::in(array_keys(GeneradorReportesNutricionistaService::TIPOS))],
            'nivel' => ['nullable', Rule::in(['alta', 'media', 'baja', 'cero', 'sin_registros'])],
            'estado' => ['nullable', Rule::in(['al_dia', 'en_progreso', 'requiere_atencion', 'sin_registros'])],
            'buscar' => ['nullable', 'string', 'max:100'],
            'estado_plan' => ['nullable', Rule::in(['sugerido','en_revision','aprobado','activo','rechazado','finalizado'])],
            'desde' => ['nullable','date'], 'hasta' => ['nullable','date','after_or_equal:desde'],
        ]);
        $tipo = $filtros['tipo'] ?? 'pacientes';
        $reporte = $servicio->generar($request->user(), $tipo, $filtros);

        return Pdf::loadView('pdf.nutricion.reporte-adherencia-pacientes', [
            'reporte' => $reporte,
            'filtros' => $filtros,
            'nutricionista' => $request->user(),
            'fechaGeneracion' => now(),
        ])->setPaper('a4', count($reporte['columnas']) > 6 ? 'landscape' : 'portrait')->stream("reporte-{$tipo}.pdf");
    }
}
