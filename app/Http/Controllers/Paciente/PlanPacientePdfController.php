<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Services\Paciente\ListaComprasPacienteService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PlanPacientePdfController extends Controller
{
    public function __invoke(Request $request, ListaComprasPacienteService $listaCompras): Response|RedirectResponse
    {
        $paciente = $request->user()->paciente()->first();
        if (! $paciente) return redirect()->route('paciente.dashboard')->with('error', 'No se encontró un perfil de paciente asociado a tu cuenta.');

        $plan = $paciente->planesAlimentarios()->whereIn('estado_plan', ['activo', 'aprobado'])
            ->orderByRaw("CASE WHEN estado_plan = 'activo' THEN 0 ELSE 1 END")
            ->latest('id_plan_alimentario')->with([
                'paciente.user', 'nutricionista', 'recomendacionNutricionalExperta', 'requerimientoNutricional',
                'dias.comidas.componentes.alimento',
                'dias.comidas.componentes.receta.recetaAlimentos.alimento',
            ])->first();

        if (! $plan) return redirect()->route('paciente.dashboard')->with('error', 'Aún no tienes un plan alimentario aprobado para descargar.');

        return Pdf::loadView('pdf.paciente.plan-alimentario-practico', [
            'paciente' => $paciente, 'plan' => $plan, 'listaCompras' => $listaCompras->generarParaPlan($plan),
            'fechaDescarga' => now(),
        ])->setPaper('a4')->stream('mi-plan-alimentario-semanal.pdf');
    }
}
