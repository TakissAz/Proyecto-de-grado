<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\AntecedenteEndocrinoMetabolico;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReporteAntecedentesPdfController extends Controller
{
    public function __invoke(Request $request, Paciente $paciente): Response
    {
        abort_unless($request->user()?->tieneRol('endocrinologo'), 403);

        $filtros = $request->validate([
            'condicion' => ['nullable', Rule::in([
                'diabetes_personal', 'diabetes_familiar',
                'hipertension_personal', 'hipertension_familiar',
                'dislipidemia_personal', 'dislipidemia_familiar',
                'enfermedad_tiroidea', 'hiperprolactinemia_previa',
                'uso_anticonceptivos', 'uso_metformina', 'uso_corticoides',
            ])],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ]);

        $registros = AntecedenteEndocrinoMetabolico::where('id_paciente', $paciente->id_paciente)
            ->when($filtros['condicion'] ?? null, fn ($q, $c) => $q->where($c, true))
            ->when($filtros['desde'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filtros['hasta'] ?? null, fn ($q, $h) => $q->whereDate('created_at', '<=', $h))
            ->latest('created_at')
            ->get();

        $nombre = trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' '));

        $stats = [
            'total' => $registros->count(),
            'con_personales' => $registros->filter(fn ($r) => $r->diabetes_personal || $r->hipertension_personal || $r->dislipidemia_personal || $r->enfermedad_tiroidea || $r->hiperprolactinemia_previa)->count(),
            'con_familiares' => $registros->filter(fn ($r) => $r->diabetes_familiar || $r->hipertension_familiar || $r->dislipidemia_familiar)->count(),
            'con_medicacion' => $registros->filter(fn ($r) => $r->uso_anticonceptivos || $r->uso_metformina || $r->uso_corticoides)->count(),
        ];

        return Pdf::loadView('pdf.antecedentes', [
            'paciente' => $paciente,
            'nombrePaciente' => $nombre,
            'registros' => $registros,
            'filtros' => $filtros,
            'stats' => $stats,
            'profesional' => $request->user(),
            'fechaGeneracion' => now(),
        ])->setPaper('a4')->stream("antecedentes-endocrino-metabolicos-{$paciente->getKey()}.pdf");
    }
}
