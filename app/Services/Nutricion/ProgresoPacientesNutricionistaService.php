<?php

namespace App\Services\Nutricion;

use App\Models\PlanAlimentario;
use App\Models\SeguimientoComida;
use App\Models\User;
use Illuminate\Support\Collection;

class ProgresoPacientesNutricionistaService
{
    public function obtener(User $nutricionista): array
    {
        $planes = PlanAlimentario::query()
            ->with(['paciente.user', 'dias.comidas', 'seguimientosComidas'])
            ->where('id_nutricionista', $nutricionista->getKey())
            ->whereIn('estado_plan', ['activo', 'aprobado'])
            ->orderByRaw("CASE WHEN estado_plan = 'activo' THEN 0 ELSE 1 END")
            ->latest('id_plan_alimentario')
            ->get()
            ->unique('id_paciente')
            ->map(fn (PlanAlimentario $plan): array => $this->resumir($plan))
            ->values();

        return [
            'resumen' => [
                'pacientes_con_plan' => $planes->count(),
                'al_dia' => $planes->where('estado_seguimiento', 'al_dia')->count(),
                'en_progreso' => $planes->where('estado_seguimiento', 'en_progreso')->count(),
                'requieren_atencion' => $planes->whereIn('estado_seguimiento', ['requiere_atencion', 'sin_registros'])->count(),
                'adherencia_promedio' => round((float) $planes->avg('adherencia_semanal'), 1),
                'planes_por_vencer' => $planes->whereIn('vigencia.estado', ['vence_hoy', 'vence_pronto'])->count(),
                'planes_vencidos' => $planes->where('vigencia.estado', 'vencido')->count(),
            ],
            'pacientes' => $planes->sortBy([
                fn (array $item) => match ($item['estado_seguimiento']) { 'requiere_atencion' => 0, 'sin_registros' => 1, 'en_progreso' => 2, default => 3 },
                fn (array $item) => $item['paciente']['nombre'],
            ])->values()->all(),
        ];
    }

    private function resumir(PlanAlimentario $plan): array
    {
        $dias = $plan->dias;
        $comidas = $dias->flatMap->comidas;
        $registros = $plan->seguimientosComidas->keyBy('id_comida_plan_alimentario');
        $hoy = today()->toDateString();
        $diaHoy = $dias->first(fn ($dia) => $dia->fecha?->toDateString() === $hoy);
        $comidasHoy = $diaHoy?->comidas ?? collect();
        $estadisticasSemana = $this->estadisticas($comidas, $registros);
        $estadisticasHoy = $this->estadisticas($comidasHoy, $registros);
        $diasTranscurridos = $dias->filter(fn ($dia) => $dia->fecha && $dia->fecha->toDateString() <= $hoy);
        $diasCumplidos = $diasTranscurridos->filter(function ($dia) use ($registros): bool {
            return $dia->comidas->isNotEmpty() && $dia->comidas->every(
                fn ($comida) => $registros->get($comida->getKey())?->estado_cumplimiento === 'completada'
            );
        })->count();
        $conRegistro = $estadisticasSemana['registradas'] > 0;
        $requiereAtencion = $conRegistro && $diasTranscurridos->count() >= 2 && $estadisticasSemana['porcentaje'] < 50;
        $alDia = $conRegistro && ($estadisticasSemana['porcentaje'] >= 85 || ($diaHoy && $estadisticasHoy['porcentaje'] >= 85));
        $estado = ! $conRegistro ? 'sin_registros' : ($requiereAtencion ? 'requiere_atencion' : ($alDia ? 'al_dia' : 'en_progreso'));
        $nombre = trim(implode(' ', array_filter([$plan->paciente?->nombres, $plan->paciente?->apellido_paterno, $plan->paciente?->apellido_materno])));
        $hoyBolivia = now('America/La_Paz')->startOfDay();
        $fin = $plan->fecha_fin?->copy()->startOfDay();
        $diasRestantes = $fin ? (int) $hoyBolivia->diffInDays($fin, false) : null;
        $estadoVigencia = $diasRestantes === null ? 'sin_fecha' : match (true) {
            $diasRestantes < 0 => 'vencido',
            $diasRestantes === 0 => 'vence_hoy',
            $diasRestantes <= 2 => 'vence_pronto',
            default => 'vigente',
        };

        return [
            'paciente' => ['id_paciente' => $plan->id_paciente, 'nombre' => $nombre ?: 'Paciente sin nombre', 'ci' => $plan->paciente?->ci, 'avatar_url' => $plan->paciente?->user?->avatar_url],
            'plan' => ['id_plan_alimentario' => $plan->getKey(), 'nombre' => $plan->nombre, 'estado' => $plan->estado_plan, 'fecha_inicio' => $plan->fecha_inicio?->toDateString(), 'fecha_fin' => $plan->fecha_fin?->toDateString()],
            'estado_seguimiento' => $estado,
            'adherencia_semanal' => $estadisticasSemana['porcentaje'],
            'semana' => $estadisticasSemana,
            'hoy' => $estadisticasHoy + ['tiene_dia_planificado' => (bool) $diaHoy, 'nombre_dia' => $diaHoy?->nombre_dia, 'fecha' => $diaHoy?->fecha?->toDateString()],
            'dias_transcurridos' => $diasTranscurridos->count(),
            'dias_cumplidos' => $diasCumplidos,
            'total_dias' => $dias->count(),
            'ultima_actualizacion' => $plan->seguimientosComidas->max('updated_at')?->toISOString(),
            'vigencia' => ['estado' => $estadoVigencia, 'dias_restantes' => $diasRestantes, 'fecha_fin' => $plan->fecha_fin?->toDateString()],
        ];
    }

    private function estadisticas(Collection $comidas, Collection $registros): array
    {
        $estados = $comidas->map(fn ($comida) => $registros->get($comida->getKey()))->filter();
        $puntos = $estados->sum(fn (SeguimientoComida $registro): float => match ($registro->estado_cumplimiento) {
            'completada' => 1,
            'parcial' => ($registro->porcentaje_consumido ?? 50) / 100,
            'reemplazada' => .5,
            default => 0,
        });
        $total = $comidas->count();

        return [
            'total' => $total,
            'registradas' => $estados->where('estado_cumplimiento', '!=', 'pendiente')->count(),
            'completadas' => $estados->where('estado_cumplimiento', 'completada')->count(),
            'parciales' => $estados->where('estado_cumplimiento', 'parcial')->count(),
            'reemplazadas' => $estados->where('estado_cumplimiento', 'reemplazada')->count(),
            'no_realizadas' => $estados->where('estado_cumplimiento', 'no_realizada')->count(),
            'pendientes' => max(0, $total - $estados->where('estado_cumplimiento', '!=', 'pendiente')->count()),
            'porcentaje' => $total > 0 ? round($puntos / $total * 100, 1) : 0,
        ];
    }
}
