<?php

namespace App\Services\Nutricion;

use App\Models\PlanAlimentario;
use App\Models\User;
use Carbon\CarbonImmutable;

class VigenciaPlanesNutricionistaService
{
    public function navbar(User $nutricionista): array
    {
        $datos = $this->obtener($nutricionista);
        return ['total' => count($datos['requieren_atencion']), 'items' => array_slice($datos['requieren_atencion'], 0, 5)];
    }

    public function obtener(User $nutricionista, ?string $mes = null): array
    {
        $hoy = CarbonImmutable::now('America/La_Paz')->startOfDay();
        $inicioMes = $mes && preg_match('/^\d{4}-\d{2}$/', $mes)
            ? CarbonImmutable::createFromFormat('Y-m', $mes, 'America/La_Paz')->startOfMonth()
            : $hoy->startOfMonth();
        $finMes = $inicioMes->endOfMonth();

        $planes = PlanAlimentario::query()
            ->with('paciente.user')
            ->where('id_nutricionista', $nutricionista->getKey())
            ->whereIn('estado_plan', ['activo', 'aprobado'])
            ->whereNotNull('fecha_fin')
            ->latest('id_plan_alimentario')->get()->unique('id_paciente')
            ->map(function (PlanAlimentario $plan) use ($hoy): array {
                $fin = CarbonImmutable::parse($plan->fecha_fin, 'America/La_Paz')->startOfDay();
                $dias = (int) $hoy->diffInDays($fin, false);
                $estado = match (true) { $dias < 0 => 'vencido', $dias === 0 => 'vence_hoy', $dias <= 2 => 'vence_pronto', $dias <= 7 => 'esta_semana', default => 'vigente' };
                $nombre = trim(implode(' ', array_filter([$plan->paciente?->nombres, $plan->paciente?->apellido_paterno, $plan->paciente?->apellido_materno])));
                return [
                    'id_plan_alimentario' => $plan->getKey(), 'nombre_plan' => $plan->nombre,
                    'fecha_inicio' => $plan->fecha_inicio?->toDateString(), 'fecha_fin' => $fin->toDateString(),
                    'dias_restantes' => $dias, 'estado_vigencia' => $estado,
                    'paciente' => ['id_paciente' => $plan->id_paciente, 'nombre' => $nombre ?: 'Paciente sin nombre', 'ci' => $plan->paciente?->ci, 'avatar_url' => $plan->paciente?->user?->avatar_url],
                ];
            })->values();

        $atencion = $planes->filter(fn (array $plan): bool => $plan['dias_restantes'] <= 7)
            ->sortBy('dias_restantes')->values();

        return [
            'mes' => $inicioMes->format('Y-m'), 'fecha_actual_bolivia' => $hoy->toDateString(),
            'resumen' => [
                'vencidos' => $planes->where('estado_vigencia', 'vencido')->count(),
                'vencen_hoy' => $planes->where('estado_vigencia', 'vence_hoy')->count(),
                'proximos_2_dias' => $planes->where('estado_vigencia', 'vence_pronto')->count(),
                'proximos_7_dias' => $planes->filter(fn (array $p): bool => $p['dias_restantes'] >= 0 && $p['dias_restantes'] <= 7)->count(),
            ],
            'eventos_mes' => $planes->filter(fn (array $plan): bool => CarbonImmutable::parse($plan['fecha_fin'])->betweenIncluded($inicioMes, $finMes))->values()->all(),
            'requieren_atencion' => $atencion->all(),
        ];
    }
}
