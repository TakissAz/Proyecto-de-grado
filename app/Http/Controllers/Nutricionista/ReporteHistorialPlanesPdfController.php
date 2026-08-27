<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Services\Nutricion\HistorialPlanesAlimentariosService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReporteHistorialPlanesPdfController extends Controller
{
    public function __invoke(Request $request, Paciente $paciente, HistorialPlanesAlimentariosService $historial): Response
    {
        abort_unless($request->user()?->tieneRol('nutricionista'), 403);

        $filtros = $request->validate([
            'estado' => ['nullable', Rule::in(['sugerido', 'en_revision', 'aprobado', 'activo', 'rechazado', 'finalizado'])],
            'origen' => ['nullable', Rule::in(['experto', 'manual'])],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ]);

        $planes = collect($historial->obtenerParaNutricionista($paciente)['planes'])
            ->when($filtros['estado'] ?? null, fn ($items, $estado) => $items->where('estado_plan', $estado))
            ->when($filtros['origen'] ?? null, function ($items, $origen) {
                return $items->filter(fn (array $plan): bool => $origen === 'experto'
                    ? (bool) ($plan['generado_por_sistema_experto'] ?? false)
                    : ! (bool) ($plan['generado_por_sistema_experto'] ?? false));
            })
            ->when($filtros['desde'] ?? null, fn ($items, $desde) => $items->filter(fn (array $plan): bool => ($plan['fecha_inicio'] ?? '') >= $desde))
            ->when($filtros['hasta'] ?? null, fn ($items, $hasta) => $items->filter(fn (array $plan): bool => ($plan['fecha_inicio'] ?? '') <= $hasta))
            ->values();

        $nombre = trim(implode(' ', array_filter([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])));

        return Pdf::loadView('pdf.nutricion.reporte-historial-planes', [
            'paciente' => $paciente,
            'nombrePaciente' => $nombre,
            'planes' => $planes,
            'filtros' => $filtros,
            'fechaGeneracion' => now(),
            'nutricionista' => $request->user(),
        ])->setPaper('a4')->stream("historial-planes-paciente-{$paciente->getKey()}.pdf");
    }
}
