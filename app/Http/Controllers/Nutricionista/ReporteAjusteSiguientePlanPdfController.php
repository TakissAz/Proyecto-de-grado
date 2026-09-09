<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Services\Nutricion\AnaliticaEvolucionPacienteService;
use App\Services\Nutricion\ContextoAjustePlanService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReporteAjusteSiguientePlanPdfController extends Controller
{
    public function __invoke(
        Paciente $paciente,
        ContextoAjustePlanService $contextoService,
        AnaliticaEvolucionPacienteService $analiticaService,
    ): Response {
        abort_unless(request()->user()?->tieneRol('nutricionista'), 403);

        return Pdf::loadView('pdf.nutricion.reporte-ajuste-siguiente-plan', [
            'paciente' => $paciente,
            'profesional' => request()->user(),
            'fechaGeneracion' => now(),
            'contexto' => $contextoService->construirParaPaciente($paciente),
            'analitica' => $analiticaService->obtenerAnalitica($paciente),
        ])->setPaper('a4')->stream("reporte-ajuste-siguiente-plan-paciente-{$paciente->getKey()}.pdf");
    }
}
