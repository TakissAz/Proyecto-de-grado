<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Services\Paciente\ProgresoPacienteService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReporteProgresoPacientePdfController extends Controller
{
    public function __invoke(Request $request, ProgresoPacienteService $progreso): Response|RedirectResponse
    {
        $paciente = $request->user()->paciente()->first();
        if (! $paciente) {
            return redirect()->route('paciente.dashboard')->with('error', 'No se encontró un perfil de paciente asociado a tu cuenta.');
        }

        $plan = $paciente->planesAlimentarios()->whereIn('estado_plan', ['activo', 'aprobado'])
            ->orderByRaw("CASE WHEN estado_plan = 'activo' THEN 0 ELSE 1 END")
            ->latest('id_plan_alimentario')->with('dias.comidas')->first();

        $historial = $progreso->obtenerHistorial($paciente);
        if ($historial === []) {
            return redirect()->route('paciente.progreso')->with('error', 'Aún no existen mediciones para generar tu reporte de progreso.');
        }

        return Pdf::loadView('pdf.paciente.progreso', [
            'paciente' => $paciente,
            'resumen' => $progreso->obtenerResumen($paciente, $plan),
            'historial' => $historial,
            'fechaGeneracion' => now('America/La_Paz'),
        ])->setPaper('a4')->stream('mi-evolucion-nutricional.pdf');
    }
}
