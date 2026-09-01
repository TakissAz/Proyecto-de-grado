<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\EvaluacionEcografica;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReporteEcografiaPdfController extends Controller
{
    public function __invoke(Request $request, Paciente $paciente): Response
    {
        abort_unless($request->user()?->tieneRol('endocrinologo'), 403);

        $filtros = $request->validate([
            'tipo' => ['nullable', Rule::in(['transvaginal', 'abdominal', 'otra'])],
            'morfologia' => ['nullable', Rule::in(['compatible', 'normal'])],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ]);

        $registros = EvaluacionEcografica::where('id_paciente', $paciente->id_paciente)
            ->when($filtros['tipo'] ?? null, fn ($q, $t) => $q->where('tipo_ecografia', $t))
            ->when(($filtros['morfologia'] ?? null) === 'compatible', fn ($q) => $q->where('morfologia_compatible_pmos', true))
            ->when(($filtros['morfologia'] ?? null) === 'normal', fn ($q) => $q->where('morfologia_compatible_pmos', false))
            ->when($filtros['desde'] ?? null, fn ($q, $d) => $q->whereDate('fecha_ecografia', '>=', $d))
            ->when($filtros['hasta'] ?? null, fn ($q, $h) => $q->whereDate('fecha_ecografia', '<=', $h))
            ->latest('fecha_ecografia')
            ->get();

        $nombre = trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' '));

        $compatibles = $registros->where('morfologia_compatible_pmos', true)->count();
        $stats = [
            'total' => $registros->count(),
            'compatibles' => $compatibles,
            'porcentaje' => $registros->count() > 0 ? round(($compatibles / $registros->count()) * 100) : 0,
            'promedio_vol_od' => $registros->whereNotNull('volumen_ovario_derecho')->avg('volumen_ovario_derecho'),
            'promedio_vol_oi' => $registros->whereNotNull('volumen_ovario_izquierdo')->avg('volumen_ovario_izquierdo'),
        ];

        return Pdf::loadView('pdf.ecografia', [
            'paciente' => $paciente,
            'nombrePaciente' => $nombre,
            'registros' => $registros,
            'filtros' => $filtros,
            'stats' => $stats,
            'profesional' => $request->user(),
            'fechaGeneracion' => now(),
        ])->setPaper('a4')->stream("ecografia-{$paciente->getKey()}.pdf");
    }
}
