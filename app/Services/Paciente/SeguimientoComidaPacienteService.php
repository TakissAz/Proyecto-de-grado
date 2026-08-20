<?php

namespace App\Services\Paciente;

use App\Models\ComidaPlanAlimentario;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\SeguimientoComida;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;

class SeguimientoComidaPacienteService
{
    public function guardarSeguimiento(Paciente $paciente, ComidaPlanAlimentario $comida, array $datos): SeguimientoComida
    {
        $this->validarComidaPerteneceAlPaciente($paciente, $comida);
        $plan = $comida->dia->plan;

        return SeguimientoComida::query()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_comida_plan_alimentario' => $comida->getKey()],
            array_merge($datos, [
                'id_plan_alimentario' => $plan->getKey(),
                'id_dia_plan_alimentario' => $comida->dia->getKey(),
                'fecha_seguimiento' => $comida->dia->fecha ?? now()->toDateString(),
                'registrado_por' => Auth::id(),
                'revisado_por_nutricionista' => false,
                'fecha_revision_nutricionista' => null,
            ])
        );
    }

    public function validarComidaPerteneceAlPaciente(Paciente $paciente, ComidaPlanAlimentario $comida): void
    {
        $comida->loadMissing('dia.plan');
        $plan = $comida->dia?->plan;
        if (! $plan || $plan->id_paciente !== $paciente->getKey()) {
            throw new AuthorizationException('Esta comida no pertenece al paciente autenticado.');
        }
        if (! in_array($plan->estado_plan, ['aprobado', 'activo'], true)) {
            throw new AuthorizationException('Solo se puede registrar seguimiento en un plan aprobado o activo.');
        }
    }

    public function calcularResumenAdherencia(PlanAlimentario $plan, Paciente $paciente): array
    {
        $total = $plan->dias->sum(fn ($dia) => $dia->comidas->count());
        $seguimientos = $this->seguimientos($plan, $paciente);
        $conteos = collect(['completada', 'parcial', 'no_realizada', 'reemplazada'])
            ->mapWithKeys(fn ($estado) => [$estado => $seguimientos->where('estado_cumplimiento', $estado)->count()]);
        $puntos = $seguimientos->sum(fn ($s) => match ($s->estado_cumplimiento) {
            'completada' => 1,
            'parcial' => $s->porcentaje_consumido !== null ? $s->porcentaje_consumido / 100 : .5,
            'reemplazada' => .5,
            default => 0,
        });

        return [
            'comidas_totales' => $total,
            'completadas' => $conteos['completada'],
            'parciales' => $conteos['parcial'],
            'no_realizadas' => $conteos['no_realizada'],
            'reemplazadas' => $conteos['reemplazada'],
            'pendientes' => max(0, $total - $seguimientos->where('estado_cumplimiento', '!=', 'pendiente')->count()),
            'registradas' => $seguimientos->where('estado_cumplimiento', '!=', 'pendiente')->count(),
            'porcentaje_adherencia' => $total > 0 ? round($puntos / $total * 100, 1) : 0,
        ];
    }

    public function calcularIndicadoresParaSiguientePlan(PlanAlimentario $plan, Paciente $paciente): array
    {
        $seguimientos = $this->seguimientos($plan, $paciente)->loadMissing('comidaPlanAlimentario.componentes.receta', 'comidaPlanAlimentario.componentes.alimento');
        $nombre = fn ($s) => $s->comidaPlanAlimentario?->componentes->map(fn ($c) => $c->receta?->nombre ?? $c->alimento?->nombre ?? $c->nombre_manual)->filter()->implode(', ') ?: $s->comidaPlanAlimentario?->nombre_comida;
        $bien = $seguimientos->filter(fn ($s) => in_array($s->estado_cumplimiento, ['completada', 'parcial'], true) && $s->nivel_agrado === 'me_gusto' && ! $s->presento_molestia)->map($nombre)->filter()->unique()->values();
        $evitar = $seguimientos->filter(fn ($s) => $s->estado_cumplimiento === 'no_realizada' || $s->nivel_agrado === 'no_me_gusto' || ($s->presento_molestia && in_array($s->intensidad_molestia, ['moderada', 'severa'], true)))->map($nombre)->filter()->unique()->values();
        $problematicos = $seguimientos->filter(fn ($s) => $s->presento_molestia || $s->nivel_agrado === 'no_me_gusto' || $s->consiguio_ingredientes === false)->map($nombre)->filter()->unique()->values();
        $horarios = $seguimientos->filter(fn ($s) => in_array($s->motivo_no_cumplimiento, ['falta_tiempo', 'olvido', 'comi_fuera'], true))->map(fn ($s) => $s->comidaPlanAlimentario?->tipo_comida)->filter()->countBy()->all();
        $baja = $seguimientos->filter(fn ($s) => in_array($s->estado_cumplimiento, ['no_realizada', 'reemplazada'], true))->map(fn ($s) => $s->comidaPlanAlimentario?->tipo_comida)->filter()->countBy()->filter(fn ($v) => $v >= 2)->all();
        $hambre = $seguimientos->filter(fn ($s) => $s->nivel_hambre_posterior === 'alta' || $s->ansiedad_posterior)->count();
        $recomendaciones = collect();
        if ($hambre > 0) $recomendaciones->push('Considerar comidas o meriendas más saciantes.');
        if ($evitar->isNotEmpty()) $recomendaciones->push('Evitar repetir recetas con baja aceptación o molestias.');
        if ($seguimientos->contains(fn ($s) => $s->presento_molestia && $s->comidaPlanAlimentario?->tipo_comida === 'cena')) $recomendaciones->push('Revisar cenas por molestias digestivas.');
        if ($seguimientos->contains(fn ($s) => $s->dificultad_preparacion === 'dificil')) $recomendaciones->push('Simplificar preparaciones por dificultad alta.');
        if ($seguimientos->contains(fn ($s) => $s->consiguio_ingredientes === false || $s->motivo_no_cumplimiento === 'no_tenia_ingredientes')) $recomendaciones->push('Revisar disponibilidad de ingredientes para el siguiente plan.');

        return [
            'recetas_bien_aceptadas' => $bien->all(), 'recetas_a_evitar' => $evitar->all(),
            'alimentos_o_preparaciones_problematicas' => $problematicos->all(), 'horarios_problematicos' => $horarios,
            'hambre_frecuente' => $hambre, 'baja_adherencia_por_tipo_comida' => $baja,
            'recomendaciones_para_nutricionista' => $recomendaciones->unique()->values()->all(),
        ];
    }

    private function seguimientos(PlanAlimentario $plan, Paciente $paciente)
    {
        return SeguimientoComida::query()->where('id_plan_alimentario', $plan->getKey())
            ->where('id_paciente', $paciente->getKey())->get();
    }
}
