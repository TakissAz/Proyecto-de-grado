<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\HistoriaHiperandrogenica;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReporteHiperandrogenismoPdfController extends Controller
{
    public function __invoke(Request $request, Paciente $paciente): Response
    {
        abort_unless($request->user()?->tieneRol('endocrinologo'), 403);

        $filtros = $request->validate([
            'signo' => ['nullable', Rule::in(['acne', 'hirsutismo', 'alopecia_androgenica', 'seborrea'])],
            'progresion' => ['nullable', Rule::in(['estable', 'progresivo', 'regresivo'])],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ]);

        $registros = HistoriaHiperandrogenica::where('id_paciente', $paciente->id_paciente)
            ->when($filtros['signo'] ?? null, fn ($q, $s) => $q->where($s, true))
            ->when($filtros['progresion'] ?? null, fn ($q, $p) => $q->where('progresion_sintomas', $p))
            ->when($filtros['desde'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filtros['hasta'] ?? null, fn ($q, $h) => $q->whereDate('created_at', '<=', $h))
            ->latest('created_at')
            ->get();

        $nombre = trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' '));

        $cronologicos = $registros->sortBy('created_at')->values();
        $ferrimanEvaluados = $cronologicos->whereNotNull('puntaje_ferriman_gallwey');
        $primeroFg = $ferrimanEvaluados->first()?->puntaje_ferriman_gallwey;
        $ultimoFg = $ferrimanEvaluados->last()?->puntaje_ferriman_gallwey;
        $total = $registros->count();
        $porcentaje = fn (int $cantidad): float => $total > 0 ? round(($cantidad / $total) * 100, 1) : 0;

        $stats = [
            'total' => $total,
            'con_acne' => $registros->where('acne', true)->count(),
            'con_hirsutismo' => $registros->where('hirsutismo', true)->count(),
            'con_alopecia' => $registros->where('alopecia_androgenica', true)->count(),
            'con_seborrea' => $registros->where('seborrea', true)->count(),
            'ferriman_promedio' => $registros->whereNotNull('puntaje_ferriman_gallwey')->avg('puntaje_ferriman_gallwey'),
            'ferriman_evaluados' => $ferrimanEvaluados->count(),
            'ferriman_positivos' => $ferrimanEvaluados->where('puntaje_ferriman_gallwey', '>=', 8)->count(),
            'ferriman_inicial' => $primeroFg,
            'ferriman_actual' => $ultimoFg,
            'ferriman_cambio' => $primeroFg !== null && $ultimoFg !== null ? $ultimoFg - $primeroFg : null,
            'prevalencias' => [
                'Acné' => $porcentaje($registros->where('acne', true)->count()),
                'Hirsutismo' => $porcentaje($registros->where('hirsutismo', true)->count()),
                'Alopecia' => $porcentaje($registros->where('alopecia_androgenica', true)->count()),
                'Seborrea' => $porcentaje($registros->where('seborrea', true)->count()),
            ],
        ];

        return Pdf::loadView('pdf.hiperandrogenismo', [
            'paciente' => $paciente,
            'nombrePaciente' => $nombre,
            'registros' => $registros,
            'cronologicos' => $cronologicos,
            'filtros' => $filtros,
            'stats' => $stats,
            'profesional' => $request->user(),
            'fechaGeneracion' => now(),
        ])->setPaper('a4')->stream("hiperandrogenismo-{$paciente->getKey()}.pdf");
    }
}
