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

        $stats = [
            'total' => $registros->count(),
            'con_acne' => $registros->where('acne', true)->count(),
            'con_hirsutismo' => $registros->where('hirsutismo', true)->count(),
            'ferriman_promedio' => $registros->whereNotNull('puntaje_ferriman_gallwey')->avg('puntaje_ferriman_gallwey'),
        ];

        return Pdf::loadView('pdf.hiperandrogenismo', [
            'paciente' => $paciente,
            'nombrePaciente' => $nombre,
            'registros' => $registros,
            'filtros' => $filtros,
            'stats' => $stats,
            'profesional' => $request->user(),
            'fechaGeneracion' => now(),
        ])->setPaper('a4')->stream("hiperandrogenismo-{$paciente->getKey()}.pdf");
    }
}
