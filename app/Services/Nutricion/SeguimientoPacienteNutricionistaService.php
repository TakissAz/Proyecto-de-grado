<?php

namespace App\Services\Nutricion;

use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Services\Paciente\SeguimientoComidaPacienteService;
use App\Services\Paciente\SeguimientoSintomasPacienteService;

class SeguimientoPacienteNutricionistaService
{
    private const TIPOS_COMIDA = ['desayuno', 'almuerzo', 'merienda', 'cena'];

    public function __construct(
        private readonly SeguimientoComidaPacienteService $seguimientos,
        private readonly SeguimientoSintomasPacienteService $sintomas,
    ) {}

    public function obtenerResumen(Paciente $paciente): array
    {
        $plan = $this->obtenerPlan($paciente);

        if (! $plan) {
            return [
                'plan' => null,
                'resumen_adherencia' => null,
                'adherencia_por_tipo_comida' => $this->resumenPorTipoVacio(),
                'seguimiento_comidas' => [],
                'indicadores_siguiente_plan' => $this->indicadoresVacios(),
                'seguimiento_sintomas' => $this->sintomas->obtenerResumen($paciente),
            ];
        }

        return [
            'plan' => $plan->only(['id_plan_alimentario', 'nombre', 'estado_plan', 'fecha_inicio', 'fecha_fin']),
            'resumen_adherencia' => $this->seguimientos->calcularResumenAdherencia($plan, $paciente),
            'adherencia_por_tipo_comida' => $this->calcularAdherenciaPorTipo($plan),
            'seguimiento_comidas' => $this->construirDetalle($plan),
            'indicadores_siguiente_plan' => $this->seguimientos->calcularIndicadoresParaSiguientePlan($plan, $paciente),
            'seguimiento_sintomas' => $this->sintomas->obtenerResumen($paciente),
        ];
    }

    private function obtenerPlan(Paciente $paciente): ?PlanAlimentario
    {
        $plan = $paciente->planesAlimentarios()
            ->whereIn('estado_plan', ['activo', 'aprobado'])
            ->orderByRaw("CASE WHEN estado_plan = 'activo' THEN 0 ELSE 1 END")
            ->latest('id_plan_alimentario')
            ->first();

        return $plan?->load([
            'dias.comidas.componentes.receta',
            'dias.comidas.componentes.alimento',
            'seguimientosComidas' => fn ($consulta) => $consulta->where('id_paciente', $paciente->getKey()),
        ]);
    }

    private function calcularAdherenciaPorTipo(PlanAlimentario $plan): array
    {
        return collect(self::TIPOS_COMIDA)->mapWithKeys(function (string $tipo) use ($plan) {
            $comidas = $plan->dias->flatMap->comidas->where('tipo_comida', $tipo);
            $ids = $comidas->pluck('id_comida_plan_alimentario');
            $registros = $plan->seguimientosComidas->whereIn('id_comida_plan_alimentario', $ids);
            $puntos = $registros->sum(fn ($registro) => match ($registro->estado_cumplimiento) {
                'completada' => 1,
                'parcial' => $registro->porcentaje_consumido !== null ? $registro->porcentaje_consumido / 100 : .5,
                'reemplazada' => .5,
                default => 0,
            });
            $total = $comidas->count();

            return [$tipo => [
                'comidas_totales' => $total,
                'completadas' => $registros->where('estado_cumplimiento', 'completada')->count(),
                'parciales' => $registros->where('estado_cumplimiento', 'parcial')->count(),
                'no_realizadas' => $registros->where('estado_cumplimiento', 'no_realizada')->count(),
                'reemplazadas' => $registros->where('estado_cumplimiento', 'reemplazada')->count(),
                'pendientes' => max(0, $total - $registros->where('estado_cumplimiento', '!=', 'pendiente')->count()),
                'porcentaje_adherencia' => $total > 0 ? round($puntos / $total * 100, 1) : 0,
            ]];
        })->all();
    }

    private function construirDetalle(PlanAlimentario $plan): array
    {
        return $plan->dias->map(fn ($dia) => [
            'id_dia_plan_alimentario' => $dia->getKey(),
            'numero_dia' => $dia->numero_dia,
            'nombre_dia' => $dia->nombre_dia,
            'fecha' => $dia->fecha?->toDateString(),
            'comidas' => $dia->comidas->map(function ($comida) use ($plan) {
                $registro = $plan->seguimientosComidas->firstWhere('id_comida_plan_alimentario', $comida->getKey());
                $componentes = $comida->componentes->map(fn ($componente) => $componente->receta?->nombre
                    ?? $componente->alimento?->nombre
                    ?? $componente->nombre_manual)->filter()->values()->all();

                return [
                    'id_comida_plan_alimentario' => $comida->getKey(),
                    'tipo_comida' => $comida->tipo_comida,
                    'hora_sugerida' => $comida->hora_sugerida,
                    'nombre_comida' => $comida->nombre_comida,
                    'componentes' => $componentes,
                    'estado_cumplimiento' => $registro?->estado_cumplimiento ?? 'pendiente',
                    'porcentaje_consumido' => $registro?->porcentaje_consumido,
                    'nivel_agrado' => $registro?->nivel_agrado,
                    'nivel_saciedad' => $registro?->nivel_saciedad,
                    'nivel_hambre_posterior' => $registro?->nivel_hambre_posterior,
                    'ansiedad_posterior' => $registro?->ansiedad_posterior,
                    'presento_molestia' => $registro?->presento_molestia,
                    'tipo_molestia' => $registro?->tipo_molestia,
                    'intensidad_molestia' => $registro?->intensidad_molestia,
                    'consiguio_ingredientes' => $registro?->consiguio_ingredientes,
                    'motivo_no_cumplimiento' => $registro?->motivo_no_cumplimiento,
                    'comentario_paciente' => $registro?->comentario_paciente,
                    'sugerencia_paciente' => $registro?->sugerencia_paciente,
                ];
            })->values()->all(),
        ])->values()->all();
    }

    private function resumenPorTipoVacio(): array
    {
        return collect(self::TIPOS_COMIDA)->mapWithKeys(fn ($tipo) => [$tipo => [
            'comidas_totales' => 0, 'completadas' => 0, 'parciales' => 0,
            'no_realizadas' => 0, 'reemplazadas' => 0, 'pendientes' => 0,
            'porcentaje_adherencia' => 0,
        ]])->all();
    }

    private function indicadoresVacios(): array
    {
        return [
            'recetas_bien_aceptadas' => [], 'recetas_a_evitar' => [],
            'alimentos_o_preparaciones_problematicas' => [], 'horarios_problematicos' => [],
            'hambre_frecuente' => 0, 'baja_adherencia_por_tipo_comida' => [],
            'recomendaciones_para_nutricionista' => [],
        ];
    }
}
