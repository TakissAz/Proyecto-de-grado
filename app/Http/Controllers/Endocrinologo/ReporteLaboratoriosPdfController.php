<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\ResultadoDiferencialEndocrino;
use App\Models\ResultadoGlucosaInsulina;
use App\Models\ResultadoPerfilAndrogenico;
use App\Models\ResultadoPerfilGonadotropo;
use App\Models\ResultadoPerfilLipidico;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReporteLaboratoriosPdfController extends Controller
{
    public function __invoke(Request $request, Paciente $paciente): Response
    {
        abort_unless($request->user()?->tieneRol('endocrinologo'), 403);

        $filtros = $request->validate([
            'panel' => ['nullable', Rule::in([
                'perfil_androgenico', 'perfil_gonadotropo', 'diferencial_endocrino',
                'glucosa_insulina', 'perfil_lipidico',
            ])],
            'solo_alterados' => ['nullable', 'boolean'],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ]);

        $pid = $paciente->id_paciente;
        $desde = $filtros['desde'] ?? null;
        $hasta = $filtros['hasta'] ?? null;
        $panel = $filtros['panel'] ?? null;
        $soloAlterados = (bool) ($filtros['solo_alterados'] ?? false);

        $rangoFecha = static function ($q) use ($desde, $hasta) {
            return $q
                ->when($desde, fn ($qq, $d) => $qq->whereDate('fecha_resultado', '>=', $d))
                ->when($hasta, fn ($qq, $h) => $qq->whereDate('fecha_resultado', '<=', $h))
                ->latest('fecha_resultado');
        };

        $incluir = fn (string $key) => $panel === null || $panel === $key;

        $androgenico = $incluir('perfil_androgenico')
            ? $rangoFecha(ResultadoPerfilAndrogenico::where('id_paciente', $pid))->get()
                ->when($soloAlterados, fn ($c) => $c->where('hiperandrogenismo_bioquimico', true)->values())
            : collect();

        $gonadotropo = $incluir('perfil_gonadotropo')
            ? $rangoFecha(ResultadoPerfilGonadotropo::where('id_paciente', $pid))->get()
                ->when($soloAlterados, fn ($c) => $c->filter(fn ($r) => $r->relacion_lh_fsh !== null && $r->relacion_lh_fsh > 2)->values())
            : collect();

        $diferencial = $incluir('diferencial_endocrino')
            ? $rangoFecha(ResultadoDiferencialEndocrino::where('id_paciente', $pid))->get()
                ->when($soloAlterados, fn ($c) => $c->filter(fn ($r) => ! ($r->alteracion_tiroidea_descartada && $r->hiperprolactinemia_descartada && $r->hiperplasia_suprarrenal_descartada && $r->cushing_descartado))->values())
            : collect();

        $diferencial->each(function ($resultado) {
            $resultado->descartados_count = collect([
                $resultado->alteracion_tiroidea_descartada,
                $resultado->hiperprolactinemia_descartada,
                $resultado->hiperplasia_suprarrenal_descartada,
                $resultado->cushing_descartado,
            ])->filter()->count();
        });

        $glucosa = $incluir('glucosa_insulina')
            ? $rangoFecha(ResultadoGlucosaInsulina::where('id_paciente', $pid))->get()
                ->when($soloAlterados, fn ($c) => $c->filter(fn ($r) => $r->resistencia_insulina_sugerida || $r->hiperinsulinemia)->values())
            : collect();

        $lipidico = $incluir('perfil_lipidico')
            ? $rangoFecha(ResultadoPerfilLipidico::where('id_paciente', $pid))->get()
                ->when($soloAlterados, fn ($c) => $c->where('dislipidemia_sugerida', true)->values())
            : collect();

        $nombre = trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' '));

        // Resumen de hallazgos clínicamente relevantes (para orientar al profesional)
        $resumen = [
            'total' => $androgenico->count() + $gonadotropo->count() + $diferencial->count() + $glucosa->count() + $lipidico->count(),
            'hiperandrogenismo' => $androgenico->where('hiperandrogenismo_bioquimico', true)->count(),
            'resistencia_insulina' => $glucosa->where('resistencia_insulina_sugerida', true)->count(),
            'dislipidemia' => $lipidico->where('dislipidemia_sugerida', true)->count(),
            'ultimo_homa' => $glucosa->sortByDesc('fecha_resultado')->first()?->homa_ir,
        ];

        $panelesResumen = [
            ['nombre' => 'Andrógenos', 'resultados' => $androgenico->count(), 'hallazgos' => $androgenico->where('hiperandrogenismo_bioquimico', true)->count(), 'ultimo' => $androgenico->first()?->fecha_resultado],
            ['nombre' => 'Gonadotropo', 'resultados' => $gonadotropo->count(), 'hallazgos' => $gonadotropo->filter(fn ($r) => $r->relacion_lh_fsh !== null && $r->relacion_lh_fsh > 2)->count(), 'ultimo' => $gonadotropo->first()?->fecha_resultado],
            ['nombre' => 'Diferenciales', 'resultados' => $diferencial->count(), 'hallazgos' => $diferencial->filter(fn ($r) => ! ($r->alteracion_tiroidea_descartada && $r->hiperprolactinemia_descartada && $r->hiperplasia_suprarrenal_descartada && $r->cushing_descartado))->count(), 'ultimo' => $diferencial->first()?->fecha_resultado],
            ['nombre' => 'Glucosa / insulina', 'resultados' => $glucosa->count(), 'hallazgos' => $glucosa->filter(fn ($r) => $r->resistencia_insulina_sugerida || $r->hiperinsulinemia)->count(), 'ultimo' => $glucosa->first()?->fecha_resultado],
            ['nombre' => 'Lípidos', 'resultados' => $lipidico->count(), 'hallazgos' => $lipidico->where('dislipidemia_sugerida', true)->count(), 'ultimo' => $lipidico->first()?->fecha_resultado],
        ];

        return Pdf::loadView('pdf.laboratorios', [
            'paciente' => $paciente,
            'nombrePaciente' => $nombre,
            'androgenico' => $androgenico,
            'gonadotropo' => $gonadotropo,
            'diferencial' => $diferencial,
            'glucosa' => $glucosa,
            'lipidico' => $lipidico,
            'filtros' => $filtros,
            'resumen' => $resumen,
            'panelesResumen' => $panelesResumen,
            'maxResultadosPanel' => max(1, collect($panelesResumen)->max('resultados')),
            'esReporteGeneral' => $panel === null,
            'profesional' => $request->user(),
            'fechaGeneracion' => now(),
        ])->setPaper('a4', 'landscape')->stream("laboratorios-{$paciente->getKey()}.pdf");
    }
}
