<?php

namespace App\Services\Paciente;

use App\Models\PlanAlimentario;
use App\Models\User;

class PortalPacienteService
{
    public function __construct(
        private readonly SeguimientoComidaPacienteService $seguimientos,
        private readonly ListaComprasPacienteService $listaCompras,
        private readonly ProgresoPacienteService $progreso,
        private readonly SeguimientoSintomasPacienteService $sintomas,
        private readonly CitasPacienteService $citas,
    ) {}

    public function obtenerDashboard(User $user): array
    {
        $paciente = $user->paciente()->first();
        if (! $paciente) {
            return ['paciente' => null, 'planAlimentario' => null, 'resumenAdherencia' => null, 'indicadoresSiguientePlan' => null, 'listaCompras' => null, 'progresoPaciente' => null, 'seguimientoSintomas' => null, 'citasPaciente' => null, 'retroalimentaciones' => ['items' => [], 'total_no_leidas' => 0]];
        }

        $plan = $paciente->planesAlimentarios()
            ->whereIn('estado_plan', ['activo', 'aprobado'])
            ->orderByRaw("CASE WHEN estado_plan = 'activo' THEN 0 ELSE 1 END")
            ->latest('id_plan_alimentario')
            ->with([
                'recomendacionNutricionalExperta',
                'requerimientoNutricional',
                'dias.comidas.componentes.receta',
                'dias.comidas.componentes.alimento',
                'dias.comidas.seguimientosComidas' => fn ($query) => $query->where('id_paciente', $paciente->getKey()),
            ])->first();

        return [
            'paciente' => [
                'nombre' => trim(implode(' ', array_filter([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno]))),
                'ci' => $paciente->ci,
                'fecha_nacimiento' => $paciente->fecha_nacimiento?->toDateString(),
                'edad' => $paciente->fecha_nacimiento?->age,
                'telefono' => $paciente->telefono,
                'estado' => $paciente->estado,
            ],
            'planAlimentario' => $plan ? $this->transformarPlan($plan) : null,
            'resumenAdherencia' => $plan ? $this->seguimientos->calcularResumenAdherencia($plan, $paciente) : null,
            'indicadoresSiguientePlan' => $plan ? $this->seguimientos->calcularIndicadoresParaSiguientePlan($plan, $paciente) : null,
            'listaCompras' => $plan ? $this->listaCompras->generarParaPlan($plan) : null,
            'progresoPaciente' => $this->progreso->obtenerResumen($paciente, $plan),
            'seguimientoSintomas' => $this->sintomas->obtenerResumen($paciente),
            'citasPaciente' => $this->citas->obtenerResumen($paciente),
            'retroalimentaciones' => $this->retroalimentaciones($paciente),
        ];
    }

    private function retroalimentaciones($paciente): array
    {
        $items = $paciente->retroalimentacionesPaciente()
            ->where('estado', 'activo')->where('visible_para_paciente', true)
            ->with(['usuarioEmisor:id,name', 'planAlimentario:id_plan_alimentario,nombre',
                'seguimientoComida.comidaPlanAlimentario', 'seguimientoSintomaPaciente'])
            ->latest('created_at')->limit(10)->get();

        return [
            'items' => $items->map(fn ($item) => [
                'id_retroalimentacion_paciente' => $item->getKey(),
                'tipo_retroalimentacion' => $item->tipo_retroalimentacion,
                'prioridad' => $item->prioridad,
                'mensaje' => $item->mensaje,
                'leido_por_paciente' => $item->leido_por_paciente,
                'fecha_lectura_paciente' => $item->fecha_lectura_paciente?->toISOString(),
                'created_at' => $item->created_at?->toISOString(),
                'profesional' => $item->usuarioEmisor?->name,
                'contexto' => [
                    'plan' => $item->planAlimentario?->nombre,
                    'comida' => $item->seguimientoComida?->comidaPlanAlimentario?->nombre_comida,
                    'sintoma_fecha' => $item->seguimientoSintomaPaciente?->fecha_registro?->toDateString(),
                ],
            ])->all(),
            'total_no_leidas' => $paciente->retroalimentacionesPaciente()
                ->where('estado', 'activo')->where('visible_para_paciente', true)
                ->where('leido_por_paciente', false)->count(),
        ];
    }

    private function transformarPlan(PlanAlimentario $plan): array
    {
        $recomendacion = $plan->recomendacionNutricionalExperta;

        return [
            'id_plan_alimentario' => $plan->getKey(),
            'nombre_plan' => $plan->nombre,
            'estado_plan' => $plan->estado_plan,
            'fecha_inicio' => $plan->fecha_inicio?->toDateString(),
            'fecha_fin' => $plan->fecha_fin?->toDateString(),
            'objetivos' => $this->nutrientes($plan, '_objetivo'),
            'planificados' => [
                'calorias' => (float) $plan->calorias_totales,
                'proteinas' => (float) $plan->proteinas_totales,
                'carbohidratos' => (float) $plan->carbohidratos_totales,
                'grasas' => (float) $plan->grasas_totales,
                'fibra' => (float) $plan->fibra_total,
            ],
            'dias' => $plan->dias->map(fn ($dia) => [
                'numero_dia' => $dia->numero_dia,
                'nombre_dia' => $dia->nombre_dia,
                'fecha' => $dia->fecha?->toDateString(),
                'nutrientes' => $this->nutrientes($dia, '_totales'),
                'comidas' => $dia->comidas->map(fn ($comida) => [
                    'id_comida_plan_alimentario' => $comida->getKey(),
                    'tipo_comida' => $comida->tipo_comida,
                    'hora_sugerida' => $comida->hora_sugerida,
                    'nombre_comida' => $comida->nombre_comida,
                    'nutrientes' => $this->nutrientes($comida, '_totales'),
                    'componentes' => $comida->componentes->map(fn ($componente) => [
                        'tipo_componente' => $componente->tipo_componente,
                        'nombre' => $componente->receta?->nombre ?? $componente->alimento?->nombre ?? $componente->nombre_manual,
                        'cantidad' => (float) $componente->cantidad,
                        'unidad' => $componente->unidad,
                        'nutrientes' => $this->nutrientes($componente),
                        'receta' => $componente->receta ? [
                            'descripcion' => $componente->receta->descripcion,
                            'preparacion' => $componente->receta->preparacion,
                        ] : null,
                    ])->values(),
                    'seguimiento' => $this->transformarSeguimiento($comida->seguimientosComidas->first()),
                ])->values(),
            ])->values(),
            'recomendacionOrigen' => $recomendacion ? [
                'enfoque_nutricional_experto' => $recomendacion->enfoque_nutricional_experto,
                'prioridad_nutricional' => $recomendacion->prioridad_nutricional,
                'recomendaciones' => $this->lista($recomendacion->recomendaciones),
                'restricciones' => $this->lista($recomendacion->restricciones),
                'alertas' => $this->lista($recomendacion->alertas),
                'conclusion' => $recomendacion->conclusion,
            ] : null,
        ];
    }

    private function transformarSeguimiento($seguimiento): array
    {
        $campos = [
            'estado_cumplimiento', 'porcentaje_consumido', 'nivel_agrado', 'desea_repetir',
            'nivel_saciedad', 'nivel_hambre_posterior', 'ansiedad_posterior', 'presento_molestia',
            'tipo_molestia', 'intensidad_molestia', 'dificultad_preparacion', 'consiguio_ingredientes',
            'motivo_no_cumplimiento', 'comida_reemplazo', 'motivo_reemplazo', 'comentario_paciente',
            'sugerencia_paciente', 'observacion_para_siguiente_plan',
        ];
        if (! $seguimiento) return array_merge(array_fill_keys($campos, null), ['estado_cumplimiento' => 'pendiente', 'updated_at' => null]);
        return array_merge($seguimiento->only($campos), ['updated_at' => $seguimiento->updated_at?->toISOString()]);
    }

    private function nutrientes(object $modelo, string $sufijo = ''): array
    {
        return collect(['calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra'])
            ->mapWithKeys(function (string $campo) use ($modelo, $sufijo) {
                $atributo = $campo === 'fibra' && $sufijo === '_totales' ? 'fibra_total' : $campo.$sufijo;
                return [$campo => (float) ($modelo->{$atributo} ?? 0)];
            })->all();
    }

    private function lista(mixed $valor): array
    {
        if (is_array($valor)) return array_values(array_filter($valor));
        if (! is_string($valor) || trim($valor) === '') return [];
        $json = json_decode($valor, true);
        if (is_array($json)) return array_values(array_filter($json));
        return array_values(array_filter(array_map('trim', preg_split('/[,;\n]+/', $valor) ?: [])));
    }
}
