<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Services\Nutricion\AnaliticaEvolucionPacienteService;
use App\Services\Nutricion\SeguimientoPacienteNutricionistaService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReporteSeguimientoEvolucionPdfController extends Controller
{
    public function __invoke(Paciente $paciente, AnaliticaEvolucionPacienteService $analiticaService, SeguimientoPacienteNutricionistaService $seguimientoService): Response
    {
        abort_unless(request()->user()?->tieneRol('nutricionista'), 403);
        $paciente->loadMissing('user');
        $analitica = $analiticaService->obtenerAnalitica($paciente);
        $retroalimentaciones = $paciente->retroalimentacionesPaciente()->with('usuarioEmisor')
            ->where('estado', 'activo')->latest()->limit(10)->get();
        $planActual = $paciente->planesAlimentarios()->whereIn('estado_plan', ['activo', 'aprobado', 'publicado'])
            ->latest('fecha_inicio')->first();

        return Pdf::loadView('pdf.nutricion.reporte-seguimiento-evolucion', [
            'paciente' => $paciente, 'profesional' => request()->user(), 'fechaGeneracion' => now(),
            'analitica' => $analitica, 'retroalimentaciones' => $retroalimentaciones, 'planActual' => $planActual,
            'seguimiento' => $seguimientoService->obtenerResumen($paciente),
        ])->setPaper('a4')->stream("reporte-seguimiento-evolucion-paciente-{$paciente->getKey()}.pdf");
    }
}
