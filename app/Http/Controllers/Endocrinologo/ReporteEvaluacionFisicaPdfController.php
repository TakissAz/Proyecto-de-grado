<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\EvaluacionFisicaEndocrina;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReporteEvaluacionFisicaPdfController extends Controller
{
    public function __invoke(Request $request, Paciente $paciente): Response
    {
        abort_unless($request->user()?->tieneRol('endocrinologo'), 403);

        $filtros = $request->validate([
            'signo' => ['nullable', Rule::in([
                'acantosis_nigricans', 'skin_tags', 'galactorrea',
                'hirsutismo_visible', 'acne_visible', 'alopecia_visible',
            ])],
            'imc' => ['nullable', Rule::in(['normal', 'sobrepeso', 'obesidad'])],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ]);

        $registros = EvaluacionFisicaEndocrina::where('id_paciente', $paciente->id_paciente)
            ->when($filtros['signo'] ?? null, fn ($q, $s) => $q->where($s, true))
            ->when($filtros['imc'] ?? null, function ($q, $rango) {
                return match ($rango) {
                    'normal' => $q->where('imc', '<', 25),
                    'sobrepeso' => $q->whereBetween('imc', [25, 29.99]),
                    'obesidad' => $q->where('imc', '>=', 30),
                    default => $q,
                };
            })
            ->when($filtros['desde'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filtros['hasta'] ?? null, fn ($q, $h) => $q->whereDate('created_at', '<=', $h))
            ->latest('created_at')
            ->get();

        $nombre = trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' '));

        $stats = [
            'total' => $registros->count(),
            'promedio_peso' => $registros->whereNotNull('peso')->avg('peso'),
            'promedio_imc' => $registros->whereNotNull('imc')->avg('imc'),
            'promedio_cintura' => $registros->whereNotNull('circunferencia_cintura')->avg('circunferencia_cintura'),
        ];

        return Pdf::loadView('pdf.evaluacion-fisica', [
            'paciente' => $paciente,
            'nombrePaciente' => $nombre,
            'registros' => $registros,
            'filtros' => $filtros,
            'stats' => $stats,
            'profesional' => $request->user(),
            'fechaGeneracion' => now(),
        ])->setPaper('a4', 'landscape')->stream("evaluacion-fisica-{$paciente->getKey()}.pdf");
    }
}
