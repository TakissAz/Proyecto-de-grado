<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\HistoriaMenstrual;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReporteHistoriaMenstrualPdfController extends Controller
{
    public function __invoke(Request $request, Paciente $paciente): Response
    {
        abort_unless($request->user()?->tieneRol('endocrinologo'), 403);

        $filtros = $request->validate([
            'regularidad' => ['nullable', Rule::in(['regular', 'irregular', 'ausente'])],
            'hallazgo' => ['nullable', Rule::in(['amenorrea', 'oligomenorrea', 'sangrado_abundante', 'dolor_menstrual', 'sospecha_anovulacion', 'confirma_anovulacion_por_progesterona'])],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ]);

        $query = HistoriaMenstrual::where('id_paciente', $paciente->id_paciente)
            ->when($filtros['regularidad'] ?? null, fn ($q, $r) => $q->where('regularidad_ciclo', $r))
            ->when($filtros['hallazgo'] ?? null, fn ($q, $h) => $q->where($h, true))
            ->when($filtros['desde'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filtros['hasta'] ?? null, fn ($q, $h) => $q->whereDate('created_at', '<=', $h))
            ->latest('created_at');

        $registros = $query->get();

        $nombre = trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' '));

        $cronologicos = $registros->sortBy('created_at')->values();
        $total = $registros->count();
        $porcentaje = fn (int $cantidad): float => $total > 0 ? round(($cantidad / $total) * 100, 1) : 0;
        $stats = [
            'total' => $total,
            'promedio_duracion' => $registros->whereNotNull('duracion_ciclo_dias')->avg('duracion_ciclo_dias'),
            'promedio_intervalo' => $registros->whereNotNull('intervalo_entre_ciclos_dias')->avg('intervalo_entre_ciclos_dias'),
            'promedio_progesterona' => $registros->whereNotNull('progesterona_lutea')->avg('progesterona_lutea'),
            'con_anovulacion' => $registros->where('confirma_anovulacion_por_progesterona', true)->count(),
            'regulares' => $registros->where('regularidad_ciclo', 'regular')->count(),
            'hallazgos' => collect([
                'Amenorrea' => $registros->where('amenorrea', true)->count(),
                'Oligomenorrea' => $registros->where('oligomenorrea', true)->count(),
                'Sangrado abundante' => $registros->where('sangrado_abundante', true)->count(),
                'Dolor menstrual' => $registros->where('dolor_menstrual', true)->count(),
                'Sospecha de anovulación' => $registros->where('sospecha_anovulacion', true)->count(),
                'Anovulación confirmada' => $registros->where('confirma_anovulacion_por_progesterona', true)->count(),
            ])->map(fn ($cantidad) => ['cantidad' => $cantidad, 'porcentaje' => $porcentaje($cantidad)]),
        ];

        return Pdf::loadView('pdf.historia-menstrual', [
            'paciente' => $paciente,
            'nombrePaciente' => $nombre,
            'registros' => $registros,
            'cronologicos' => $cronologicos,
            'filtros' => $filtros,
            'stats' => $stats,
            'profesional' => $request->user(),
            'fechaGeneracion' => now(),
        ])->setPaper('a4')->stream("historia-menstrual-{$paciente->getKey()}.pdf");
    }
}
