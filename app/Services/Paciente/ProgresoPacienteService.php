<?php

namespace App\Services\Paciente;

use App\Models\Paciente;
use App\Models\PlanAlimentario;

class ProgresoPacienteService
{
    public function __construct(private readonly SeguimientoComidaPacienteService $seguimientos) {}

    public function obtenerResumen(Paciente $paciente, ?PlanAlimentario $plan = null): array
    {
        $evaluaciones = $paciente->evaluacionesNutricionales()->where('estado', true)
            ->orderBy('fecha_evaluacion')->orderBy('id_evaluacion_nutricional')->get();
        $inicial = $evaluaciones->first();
        $actual = $evaluaciones->last();
        $objetivo = $paciente->objetivosNutricionales()->where('estado', true)
            ->latest('id_objetivo_nutricional')->first();
        $requerimiento = $paciente->requerimientosNutricionales()->where('estado', true)
            ->latest('id_requerimiento_nutricional')->first();

        $imcInicial = $this->imc($inicial);
        $imcActual = $this->imc($actual);
        $adherencia = $plan
            ? $this->seguimientos->calcularResumenAdherencia($plan, $paciente)
            : $this->adherenciaVacia();
        $totalComidas = $plan?->dias->sum(fn ($dia) => $dia->comidas->count()) ?? 0;

        return [
            'evaluacion' => [
                'fecha_ultima_evaluacion' => $actual?->fecha_evaluacion?->toDateString(),
                'peso_inicial' => $this->numero($inicial?->peso),
                'peso_actual' => $this->numero($actual?->peso),
                'cambio_peso' => $this->diferencia($actual?->peso, $inicial?->peso),
                'altura_actual' => $this->numero($actual?->talla),
                'imc_actual' => $imcActual,
                'clasificacion_imc' => $this->clasificarImc($imcActual),
                'cambio_imc' => $this->diferencia($imcActual, $imcInicial),
                'cintura_inicial' => $this->numero($inicial?->circunferencia_cintura),
                'cintura_actual' => $this->numero($actual?->circunferencia_cintura),
                'cambio_cintura' => $this->diferencia($actual?->circunferencia_cintura, $inicial?->circunferencia_cintura),
                'cadera_actual' => $this->numero($actual?->circunferencia_cadera),
                'icc_actual' => $this->numero($actual?->indice_cintura_cadera) ?? $actual?->calcularIndiceCinturaCadera(),
            ],
            'objetivo' => [
                'objetivo_principal' => $objetivo?->objetivo_principal,
                'calorias_objetivo' => $this->numero($requerimiento?->calorias_objetivo ?? $plan?->calorias_objetivo),
                'proteinas_objetivo' => $this->numero($requerimiento?->proteinas_diarias ?? $plan?->proteinas_objetivo),
                'carbohidratos_objetivo' => $this->numero($requerimiento?->carbohidratos_diarios ?? $plan?->carbohidratos_objetivo),
                'grasas_objetivo' => $this->numero($requerimiento?->grasas_diarias ?? $plan?->grasas_objetivo),
                'fibra_objetivo' => $this->numero($requerimiento?->fibra_diaria ?? $plan?->fibra_objetivo),
            ],
            'plan' => $plan ? [
                'id_plan_alimentario' => $plan->getKey(), 'nombre_plan' => $plan->nombre,
                'estado_plan' => $plan->estado_plan, 'fecha_inicio' => $plan->fecha_inicio?->toDateString(),
                'fecha_fin' => $plan->fecha_fin?->toDateString(),
                'calorias_planificadas' => $this->numero($plan->calorias_totales),
                'comidas_totales' => $totalComidas,
            ] : null,
            'adherencia' => $adherencia,
            'mensaje' => $this->mensaje($inicial !== null, $plan, $adherencia, $this->diferencia($actual?->peso, $inicial?->peso), $this->diferencia($actual?->circunferencia_cintura, $inicial?->circunferencia_cintura)),
        ];
    }

    private function imc(?object $evaluacion): ?float
    {
        if (! $evaluacion) return null;
        return $this->numero($evaluacion->imc) ?? $evaluacion->calcularImc();
    }

    private function numero(mixed $valor): ?float
    {
        return $valor === null || $valor === '' ? null : round((float) $valor, 2);
    }

    private function diferencia(mixed $actual, mixed $inicial): ?float
    {
        $actual = $this->numero($actual); $inicial = $this->numero($inicial);
        return $actual === null || $inicial === null ? null : round($actual - $inicial, 2);
    }

    private function clasificarImc(?float $imc): ?string
    {
        if ($imc === null) return null;
        return match (true) { $imc < 18.5 => 'Bajo peso', $imc < 25 => 'Peso saludable', $imc < 30 => 'Sobrepeso', default => 'Obesidad' };
    }

    private function adherenciaVacia(): array
    {
        return ['comidas_totales' => 0, 'completadas' => 0, 'parciales' => 0, 'no_realizadas' => 0, 'reemplazadas' => 0, 'pendientes' => 0, 'registradas' => 0, 'porcentaje_adherencia' => 0.0];
    }

    private function mensaje(bool $tieneEvaluacion, ?PlanAlimentario $plan, array $adherencia, ?float $cambioPeso, ?float $cambioCintura): string
    {
        if (! $tieneEvaluacion) return 'Aún no tienes evaluaciones nutricionales registradas.';
        if (! $plan) return 'Aún no tienes un plan activo o aprobado.';
        if ($adherencia['porcentaje_adherencia'] < 50) return 'Tu adherencia aún puede mejorar. Registra tus comidas para recibir mejor orientación.';
        if (($cambioPeso !== null && $cambioPeso < 0) || ($cambioCintura !== null && $cambioCintura < 0)) return 'Vas avanzando hacia tu objetivo. Continúa registrando tu seguimiento.';
        return 'Continúa registrando tus comidas y evaluaciones para acompañar tu progreso.';
    }
}
