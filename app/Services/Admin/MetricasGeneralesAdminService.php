<?php

namespace App\Services\Admin;

use App\Models\Cita;
use App\Models\ComponenteComidaPlan;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\RetroalimentacionPaciente;
use App\Models\SeguimientoComida;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use App\Services\Prediccion\PredictorRiesgoAdherenciaService;
use Illuminate\Support\Collection;

class MetricasGeneralesAdminService
{
    public function __construct(private readonly PredictorRiesgoAdherenciaService $predictor) {}

    public function obtenerMetricas(): array
    {
        $ahora = now();
        $hace7 = $ahora->copy()->subDays(7);
        $hace30 = $ahora->copy()->subDays(30);
        $pacientes = Paciente::query();
        $planes = PlanAlimentario::query();
        $recomendaciones = RecomendacionNutricionalExperta::query();
        $seguimientos = SeguimientoComida::query()->get();
        $ultimosPmos = $this->ultimosPorPaciente(DiagnosticoPmos::query()->latest('id_diagnostico_pmos')->get());
        $ultimosRi = $this->ultimosPorPaciente(DiagnosticoResistenciaInsulina::query()->latest('id_diagnostico_ri')->get());
        $adherencias = $this->adherenciasPorPaciente($seguimientos);
        $pacientesConPlan = PlanAlimentario::query()->whereIn('estado_plan', ['aprobado', 'activo'])->distinct()->pluck('id_paciente');
        $conSeguimientoReciente = SeguimientoComida::query()->whereDate('fecha_seguimiento', '>=', $hace7)->distinct()->pluck('id_paciente');

        $resumen = [
            'total_usuarios' => User::query()->count(),
            'total_pacientes' => (clone $pacientes)->count(),
            'total_administradores' => $this->usuariosRol('administrador'),
            'total_nutricionistas' => $this->usuariosRol('nutricionista'),
            'total_endocrinologos' => $this->usuariosRol('endocrinologo'),
            'usuarios_pacientes' => $this->usuariosRol('paciente'),
            'pacientes_activos' => (clone $pacientes)->where('estado', 'activo')->count(),
            'pacientes_inactivos' => (clone $pacientes)->where('estado', '!=', 'activo')->count(),
        ];

        $diagnosticos = [
            'pmos_confirmado' => $ultimosPmos->where('diagnostico_confirmado', true)->count(),
            'pmos_no_confirmado' => $ultimosPmos->whereStrict('diagnostico_confirmado', false)->count(),
            'pmos_en_estudio' => $ultimosPmos->whereNull('diagnostico_confirmado')->count(),
            'pmos_fenotipos' => $this->fenotipos($ultimosPmos),
            'ri_confirmada' => $ultimosRi->where('resistencia_confirmada', true)->count(),
            'ri_no_confirmada' => $ultimosRi->whereStrict('resistencia_confirmada', false)->count(),
            'ri_no_evaluada' => $ultimosRi->whereNull('resistencia_confirmada')->count(),
            'ri_grados' => $this->conteos($ultimosRi, 'grado_resistencia', ['leve', 'moderada', 'severa', 'no_evaluada']),
        ];

        $planesMetricas = [
            'total' => (clone $planes)->count(),
            ...$this->conteosConsulta($planes, 'estado_plan', ['sugerido', 'en_revision', 'aprobado', 'activo', 'rechazado', 'finalizado']),
            'generados_por_sistema_experto' => (clone $planes)->where('generado_por_sistema_experto', true)->count(),
            'con_componentes_manuales' => PlanAlimentario::query()->whereHas('dias.comidas.componentes', fn ($q) => $q->where('tipo_componente', 'manual'))->count(),
            'con_solo_recetas' => PlanAlimentario::query()->whereHas('dias.comidas.componentes')->whereDoesntHave('dias.comidas.componentes', fn ($q) => $q->where('tipo_componente', '!=', 'receta'))->count(),
        ];

        $recomendacionesMetricas = [
            'total' => (clone $recomendaciones)->count(),
            'pendientes' => (clone $recomendaciones)->where('estado_validacion_experta', 'pendiente')->count(),
            'aprobadas' => (clone $recomendaciones)->whereIn('estado_validacion_experta', ['aprobado', 'validado'])->count(),
            'rechazadas' => (clone $recomendaciones)->where('estado_validacion_experta', 'rechazado')->count(),
            'generadas_por_motor_experto' => (clone $recomendaciones)->where('generado_por_motor_experto', true)->count(),
            'confianza_promedio' => round((float) ((clone $recomendaciones)->avg('confianza_experta') ?? 0), 2),
        ];

        $bajaAdherencia = $adherencias->filter(fn ($valor) => $valor < 60)->count();
        $sinSeguimientoReciente = $pacientesConPlan->diff($conSeguimientoReciente)->count();
        $seguimiento = [
            'seguimientos_comidas' => $seguimientos->count(),
            'seguimientos_sintomas' => SeguimientoSintomaPaciente::query()->count(),
            'adherencia_promedio' => round((float) ($adherencias->avg() ?? 0), 1),
            'pacientes_con_seguimiento' => $adherencias->count(),
            'pacientes_baja_adherencia' => $bajaAdherencia,
            'pacientes_sin_seguimiento_reciente' => $sinSeguimientoReciente,
        ];

        $citas = [
            'total' => Cita::query()->count(),
            'pendientes' => Cita::query()->whereIn('estado', ['programada', 'confirmada'])->count(),
            'realizadas' => Cita::query()->where('estado', 'atendida')->count(),
            'canceladas' => Cita::query()->whereIn('estado', ['cancelada', 'reprogramada', 'no_asistio'])->count(),
            'proximas' => Cita::query()->whereDate('fecha_cita', '>', $ahora)->whereIn('estado', ['programada', 'confirmada'])->count(),
            'hoy' => Cita::query()->whereDate('fecha_cita', $ahora)->count(),
        ];

        $actividad = [
            'pacientes_registrados_ultimos_30_dias' => Paciente::query()->where('created_at', '>=', $hace30)->count(),
            'planes_generados_ultimos_30_dias' => PlanAlimentario::query()->where('created_at', '>=', $hace30)->count(),
            'recomendaciones_generadas_ultimos_30_dias' => RecomendacionNutricionalExperta::query()->where('created_at', '>=', $hace30)->count(),
            'seguimientos_comidas_ultimos_7_dias' => SeguimientoComida::query()->where('created_at', '>=', $hace7)->count(),
            'seguimientos_sintomas_ultimos_7_dias' => SeguimientoSintomaPaciente::query()->where('created_at', '>=', $hace7)->count(),
            'retroalimentaciones_ultimos_7_dias' => RetroalimentacionPaciente::query()->where('created_at', '>=', $hace7)->count(),
            'citas_proximos_7_dias' => Cita::query()->whereBetween('fecha_cita', [$ahora->toDateString(), $ahora->copy()->addDays(7)->toDateString()])->whereIn('estado', ['programada', 'confirmada'])->count(),
        ];

        $alertas = [
            'pacientes_baja_adherencia' => $bajaAdherencia,
            'pacientes_sin_plan' => Paciente::query()->whereDoesntHave('planesAlimentarios', fn ($q) => $q->whereIn('estado_plan', ['aprobado', 'activo']))->count(),
            'planes_pendientes_revision' => PlanAlimentario::query()->whereIn('estado_plan', ['sugerido', 'en_revision'])->count(),
            'pacientes_sin_seguimiento_reciente' => $sinSeguimientoReciente,
            'recomendaciones_pendientes' => $recomendacionesMetricas['pendientes'],
            'citas_pendientes_proximas' => $actividad['citas_proximos_7_dias'],
        ];

        $predicciones = ['riesgo_alto' => 0, 'riesgo_medio' => 0, 'riesgo_bajo' => 0, 'sin_datos' => 0];
        Paciente::query()->where('estado', 'activo')->each(function (Paciente $paciente) use (&$predicciones) {
            $prediccion = $this->predictor->predecir($paciente);
            if ($prediccion['sin_datos']) {
                $predicciones['sin_datos']++;
            } else {
                $predicciones['riesgo_'.$prediccion['riesgo_baja_adherencia']]++;
            }
        });

        return compact('resumen', 'diagnosticos', 'seguimiento', 'citas', 'actividad') + [
            'planes' => $planesMetricas,
            'recomendaciones_expertas' => $recomendacionesMetricas,
            'alertas' => $alertas,
            'alertas_admin' => $this->alertasAdmin($alertas),
            'prediccion_adherencia' => $predicciones,
        ];
    }

    private function usuariosRol(string $rol): int
    {
        return User::query()->whereHas('roles', fn ($q) => $q->where('roles.nombre', $rol))->count();
    }

    private function ultimosPorPaciente(Collection $registros): Collection
    {
        return $registros->unique('id_paciente')->values();
    }

    private function fenotipos(Collection $registros): array
    {
        $resultado = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'no_clasificado' => 0];
        foreach ($registros as $registro) {
            $valor = strtoupper((string) $registro->fenotipo_pmos);
            $clave = in_array(substr($valor, 0, 1), ['A', 'B', 'C', 'D'], true) ? substr($valor, 0, 1) : 'no_clasificado';
            $resultado[$clave]++;
        }
        return $resultado;
    }

    private function conteos(Collection $registros, string $campo, array $valores): array
    {
        return collect($valores)->mapWithKeys(fn ($v) => [$v => $registros->filter(fn ($r) => ($r->{$campo} ?: 'no_evaluada') === $v)->count()])->all();
    }

    private function conteosConsulta($consulta, string $campo, array $valores): array
    {
        return collect($valores)->mapWithKeys(fn ($v) => [$v === 'sugerido' ? 'sugeridos' : ($v === 'aprobado' ? 'aprobados' : ($v === 'activo' ? 'activos' : ($v === 'rechazado' ? 'rechazados' : ($v === 'finalizado' ? 'finalizados' : $v)))) => (clone $consulta)->where($campo, $v)->count()])->all();
    }

    private function adherenciasPorPaciente(Collection $registros): Collection
    {
        return $registros->groupBy('id_paciente')->map(function (Collection $items) {
            $puntos = $items->sum(fn ($s) => match ($s->estado_cumplimiento) {
                'completada' => 1,
                'parcial' => $s->porcentaje_consumido !== null ? $s->porcentaje_consumido / 100 : .5,
                'reemplazada' => .5,
                default => 0,
            });
            return round($puntos / max(1, $items->count()) * 100, 1);
        });
    }

    private function alertasAdmin(array $alertas): array
    {
        $definiciones = [
            ['pacientes_baja_adherencia', 'Baja adherencia', 'Pacientes con adherencia inferior al 60%.', 'alta', 'seguimiento'],
            ['pacientes_sin_plan', 'Pacientes sin plan vigente', 'Pacientes sin un plan aprobado o activo.', 'media', 'planes'],
            ['planes_pendientes_revision', 'Planes por revisar', 'Planes sugeridos o en revisión pendientes de gestión.', 'media', 'planes'],
            ['pacientes_sin_seguimiento_reciente', 'Seguimiento pendiente', 'Pacientes con plan vigente sin seguimiento en 7 días.', 'media', 'seguimiento'],
            ['recomendaciones_pendientes', 'Recomendaciones pendientes', 'Recomendaciones expertas pendientes de validación.', 'media', 'sistema_experto'],
            ['citas_pendientes_proximas', 'Citas próximas', 'Citas programadas o confirmadas en los próximos 7 días.', 'baja', 'citas'],
        ];
        return collect($definiciones)->filter(fn ($d) => $alertas[$d[0]] > 0)->map(fn ($d) => [
            'titulo' => $d[1], 'mensaje' => $alertas[$d[0]].' '.$d[2], 'severidad' => $d[3], 'categoria' => $d[4],
        ])->values()->all();
    }
}
