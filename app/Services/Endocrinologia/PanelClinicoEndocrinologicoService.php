<?php

namespace App\Services\Endocrinologia;

use App\Models\Paciente;
use Illuminate\Support\Facades\Schema;
use App\Services\Nutricion\ElegibilidadPlanificacionNutricionalService;
use Illuminate\Support\Collection;

class PanelClinicoEndocrinologicoService
{
    public function __construct(
        private readonly ElegibilidadPlanificacionNutricionalService $elegibilidad,
    ) {}

    public function construir(Paciente $paciente): array
    {
        $pmos = $paciente->diagnosticosPmos()->latest('fecha_diagnostico')->latest('id_diagnostico_pmos')->get();
        $ri = $paciente->diagnosticosResistenciaInsulina()->latest('fecha_diagnostico')->latest('id_diagnostico_ri')->get();

        return [
            'derivacion_nutricional' => $this->derivacion($paciente),
            'elegibilidad' => array_merge($this->elegibilidad->evaluar($paciente), [
                'pmos' => $this->resumenPmos($pmos->first()),
                'ri' => $this->resumenRi($ri->first()),
            ]),
            'seguimiento' => [
                'antropometria' => $paciente->evaluacionesFisicasEndocrinas()->latest('created_at')->limit(12)->get()->reverse()->values()->map(fn ($r) => [
                    'fecha' => $r->created_at?->toDateString(), 'peso' => $r->peso, 'imc' => $r->imc,
                    'cintura' => $r->circunferencia_cintura, 'icc' => $r->indice_cintura_cadera,
                ]),
                'glucosa_insulina' => $paciente->resultadosGlucosaInsulina()->latest('fecha_resultado')->limit(12)->get()->reverse()->values()->map(fn ($r) => [
                    'fecha' => $r->fecha_resultado?->format('Y-m-d'), 'glucosa' => $r->glucosa_ayunas,
                    'insulina' => $r->insulina_ayunas, 'homa_ir' => $r->homa_ir,
                    'quicki' => $this->quicki($r->glucosa_ayunas, $r->insulina_ayunas), 'hba1c' => $r->hemoglobina_glicosilada,
                ]),
                'perfil_lipidico' => $paciente->resultadosPerfilLipidico()->latest('fecha_resultado')->limit(12)->get()->reverse()->values()->map(fn ($r) => [
                    'fecha' => $r->fecha_resultado?->format('Y-m-d'), 'colesterol_total' => $r->colesterol_total,
                    'hdl' => $r->hdl, 'ldl' => $r->ldl, 'trigliceridos' => $r->trigliceridos,
                ]),
                'sintomas' => $paciente->seguimientosSintomas()->latest('fecha_registro')->limit(8)->get()->map(fn ($r) => [
                    'fecha' => $r->fecha_registro?->format('Y-m-d'), 'energia' => $r->nivel_energia,
                    'ansiedad' => $r->ansiedad_por_comida, 'acne' => $r->acne,
                    'dolor_menstrual' => $r->dolor_menstrual, 'irregularidad_menstrual' => $r->irregularidad_menstrual,
                    'observaciones' => $r->observaciones,
                ]),
            ],
            'historial_diagnostico' => $this->historial($pmos, $ri),
        ];
    }

    private function derivacion(Paciente $paciente): ?array
    {
        if (! Schema::hasTable('derivaciones_nutricionales')) return null;
        $d = $paciente->derivacionesNutricionales()->with('nutricionista:id,name')->latest('fecha_derivacion')->first();
        return $d ? ['id_derivacion_nutricional'=>$d->getKey(),'estado'=>$d->estado,'prioridad'=>$d->prioridad,'motivo_derivacion'=>$d->motivo_derivacion,'fecha_derivacion'=>$d->fecha_derivacion?->toIso8601String(),'nutricionista'=>$d->nutricionista?->name] : null;
    }

    private function resumenPmos($r): ?array
    {
        return $r ? ['id' => $r->id_diagnostico_pmos, 'fecha' => $r->fecha_diagnostico?->format('Y-m-d'), 'confirmado' => (bool) $r->diagnostico_confirmado, 'fenotipo' => $r->fenotipo_pmos, 'validacion' => $r->estado_validacion_experta] : null;
    }

    private function resumenRi($r): ?array
    {
        return $r ? ['id' => $r->id_diagnostico_ri, 'fecha' => $r->fecha_diagnostico?->format('Y-m-d'), 'confirmado' => (bool) $r->resistencia_confirmada, 'grado' => $r->grado_resistencia, 'validacion' => $r->estado_validacion_experta] : null;
    }

    private function historial(Collection $pmos, Collection $ri): array
    {
        return $pmos->map(fn ($r) => [
            'id' => 'pmos-'.$r->id_diagnostico_pmos, 'tipo' => 'PMOS', 'fecha' => $r->fecha_diagnostico?->format('Y-m-d'),
            'confirmado' => (bool) $r->diagnostico_confirmado, 'resultado' => $r->fenotipo_pmos,
            'estado_validacion' => $r->estado_validacion_experta, 'confianza' => $r->confianza_experta,
            'generado_por_motor' => (bool) $r->generado_por_motor_experto, 'fecha_actualizacion' => $r->updated_at?->toISOString(),
            'conclusion' => $r->conclusion_medica, 'observacion_validacion' => $r->observacion_validacion,
        ])->concat($ri->map(fn ($r) => [
            'id' => 'ri-'.$r->id_diagnostico_ri, 'tipo' => 'Resistencia a la insulina', 'fecha' => $r->fecha_diagnostico?->format('Y-m-d'),
            'confirmado' => (bool) $r->resistencia_confirmada, 'resultado' => $r->grado_resistencia,
            'estado_validacion' => $r->estado_validacion_experta, 'confianza' => $r->confianza_experta,
            'generado_por_motor' => (bool) $r->generado_por_motor_experto, 'fecha_actualizacion' => $r->updated_at?->toISOString(),
            'conclusion' => $r->conclusion_medica, 'observacion_validacion' => $r->observacion_validacion,
        ]))->sortByDesc('fecha')->values()->all();
    }

    private function quicki($glucosa, $insulina): ?float
    {
        $g = (float) $glucosa; $i = (float) $insulina;
        return $g > 0 && $i > 0 ? round(1 / (log10($g) + log10($i)), 4) : null;
    }
}
