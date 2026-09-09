<?php

namespace App\Services\Nutricion;

use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Services\Paciente\SeguimientoComidaPacienteService;
use App\Services\Paciente\SeguimientoSintomasPacienteService;
use Illuminate\Support\Carbon;

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
                'estado_periodo' => 'sin_plan',
                'resumen_adherencia' => null,
                'adherencia_por_tipo_comida' => $this->resumenPorTipoVacio(),
                'seguimiento_comidas' => [],
                'indicadores_siguiente_plan' => $this->indicadoresVacios(),
                'seguimiento_sintomas' => $this->sintomas->obtenerResumen($paciente),
            ];
        }

        $hoy = Carbon::today('America/La_Paz');
        $estadoPeriodo = $plan->fecha_inicio?->gt($hoy)
            ? 'no_iniciado'
            : ($plan->fecha_fin?->lt($hoy) ? 'finalizado' : 'en_curso');
        $resumen = $this->seguimientos->calcularResumenAdherencia($plan, $paciente);
        $vencidas = $this->idsComidasVencidasSinRegistro($plan);
        $resumen['sin_registro_vencidas'] = $vencidas->count();
        $resumen['pendientes'] = max(0, $resumen['pendientes'] - $vencidas->count());
        $evaluables = ($resumen['registradas'] ?? 0) + $vencidas->count();
        $puntos = $plan->seguimientosComidas->sum(fn ($registro) => match ($registro->estado_cumplimiento) {
            'completada' => 1,
            'parcial' => $registro->porcentaje_consumido !== null ? $registro->porcentaje_consumido / 100 : .5,
            'reemplazada' => .5,
            default => 0,
        });
        $resumen['porcentaje_adherencia'] = $evaluables > 0 ? round($puntos / $evaluables * 100, 1) : 0;
        if ($estadoPeriodo === 'en_curso' && ($resumen['registradas'] ?? 0) === 0 && $vencidas->isEmpty()) $estadoPeriodo = 'sin_registros';

        return [
            'plan' => $plan->only(['id_plan_alimentario', 'nombre', 'estado_plan', 'fecha_inicio', 'fecha_fin']),
            'estado_periodo' => $estadoPeriodo,
            'resumen_adherencia' => $resumen,
            'adherencia_por_tipo_comida' => $this->calcularAdherenciaPorTipo($plan),
            'seguimiento_comidas' => $this->construirDetalle($plan),
            'indicadores_siguiente_plan' => $this->seguimientos->calcularIndicadoresParaSiguientePlan($plan, $paciente),
            'seguimiento_sintomas' => $this->sintomas->obtenerResumenEnPeriodo($paciente, $plan->fecha_inicio, $plan->fecha_fin, $hoy),
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
            'seguimientosComidas' => function ($consulta) use ($paciente, $plan) {
                $consulta->where('id_paciente', $paciente->getKey())
                    ->whereDate('fecha_seguimiento', '<=', Carbon::today('America/La_Paz'));
                if ($plan->fecha_inicio) $consulta->whereDate('fecha_seguimiento', '>=', $plan->fecha_inicio);
                if ($plan->fecha_fin) $consulta->whereDate('fecha_seguimiento', '<=', $plan->fecha_fin);
            },
        ]);
    }

    private function calcularAdherenciaPorTipo(PlanAlimentario $plan): array
    {
        $vencidas = $this->idsComidasVencidasSinRegistro($plan);
        return collect(self::TIPOS_COMIDA)->mapWithKeys(function (string $tipo) use ($plan) {
            $hoy = Carbon::today('America/La_Paz');
            $comidas = $plan->dias->filter(fn ($dia) => ! $dia->fecha || $dia->fecha->lte($hoy))
                ->flatMap->comidas->where('tipo_comida', $tipo);
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
        })->map(function ($datos, $tipo) use ($plan, $vencidas) {
            $idsTipo = $plan->dias->flatMap->comidas->where('tipo_comida', $tipo)->pluck('id_comida_plan_alimentario');
            $sinRegistro = $vencidas->intersect($idsTipo)->count();
            $registradas = $datos['completadas'] + $datos['parciales'] + $datos['no_realizadas'] + $datos['reemplazadas'];
            $evaluables = $registradas + $sinRegistro;
            $registrosTipo = $plan->seguimientosComidas->whereIn('id_comida_plan_alimentario', $idsTipo);
            $puntos = $registrosTipo->sum(fn ($registro) => match ($registro->estado_cumplimiento) {
                'completada' => 1,
                'parcial' => $registro->porcentaje_consumido !== null ? $registro->porcentaje_consumido / 100 : .5,
                'reemplazada' => .5,
                default => 0,
            });
            $datos['registradas'] = $registradas;
            $datos['evaluables'] = $evaluables;
            $datos['sin_registro_vencidas'] = $sinRegistro;
            $datos['pendientes'] = max(0, $datos['comidas_totales'] - $registradas - $sinRegistro);
            $datos['porcentaje_adherencia'] = $evaluables > 0 ? round($puntos / $evaluables * 100, 1) : 0;
            return $datos;
        })->all();
    }

    private function construirDetalle(PlanAlimentario $plan): array
    {
        return $plan->dias->map(fn ($dia) => [
            'id_dia_plan_alimentario' => $dia->getKey(),
            'numero_dia' => $dia->numero_dia,
            'nombre_dia' => $dia->nombre_dia,
            'fecha' => $dia->fecha?->toDateString(),
            'comidas' => $dia->comidas->map(function ($comida) use ($plan, $dia) {
                $registro = $plan->seguimientosComidas->firstWhere('id_comida_plan_alimentario', $comida->getKey());
                $componentes = $comida->componentes->map(fn ($componente) => $componente->receta?->nombre
                    ?? $componente->alimento?->nombre
                    ?? $componente->nombre_manual)->filter()->values()->all();

                $estado = $registro?->estado_cumplimiento
                    ?? ($this->comidaVencida($dia, $comida) ? 'sin_registro' : 'pendiente');
                return [
                    'id_comida_plan_alimentario' => $comida->getKey(),
                    'tipo_comida' => $comida->tipo_comida,
                    'hora_sugerida' => $comida->hora_sugerida,
                    'nombre_comida' => $comida->nombre_comida,
                    'componentes' => $componentes,
                    'estado_cumplimiento' => $estado,
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
            'porcentaje_adherencia' => 0, 'sin_registro_vencidas' => 0,
        ]])->all();
    }

    private function idsComidasVencidasSinRegistro(PlanAlimentario $plan)
    {
        $registradas = $plan->seguimientosComidas->pluck('id_comida_plan_alimentario');
        return $plan->dias->flatMap(fn ($dia) => $dia->comidas->filter(fn ($comida) => $this->comidaVencida($dia, $comida)))
            ->pluck('id_comida_plan_alimentario')->reject(fn ($id) => $registradas->contains($id))->values();
    }

    private function comidaVencida($dia, $comida): bool
    {
        $ahora = Carbon::now('America/La_Paz');
        if (! $dia->fecha || $dia->fecha->gt($ahora->copy()->startOfDay())) return false;
        if ($dia->fecha->lt($ahora->copy()->startOfDay())) return true;
        if (! $comida->hora_sugerida) return false;
        return Carbon::parse($dia->fecha->toDateString().' '.$comida->hora_sugerida, 'America/La_Paz')->addHour()->lte($ahora);
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
