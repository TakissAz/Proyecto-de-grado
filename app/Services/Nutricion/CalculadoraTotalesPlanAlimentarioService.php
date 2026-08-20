<?php

namespace App\Services\Nutricion;

use App\Models\ComidaPlanAlimentario;
use App\Models\DiaPlanAlimentario;
use App\Models\PlanAlimentario;

class CalculadoraTotalesPlanAlimentarioService
{
    private const CAMPOS = [
        'calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra',
    ];

    public function recalcularComida(
        ComidaPlanAlimentario $comida
    ): ComidaPlanAlimentario {
        $consulta = $comida->componentes()->where('estado', 'activo');
        $comida->update($this->sumas($consulta, false));

        return $comida->refresh();
    }

    public function recalcularDia(DiaPlanAlimentario $dia): DiaPlanAlimentario
    {
        $consulta = $dia->comidas()->where('estado', 'activo');
        $dia->update($this->sumas($consulta, true));

        return $dia->refresh();
    }

    public function recalcularPlan(PlanAlimentario $plan): PlanAlimentario
    {
        $consulta = $plan->dias()->where('estado', 'activo');
        $plan->update($this->sumas($consulta, true));

        return $plan->refresh();
    }

    private function sumas(mixed $consulta, bool $origenConTotales): array
    {
        $consulta->reorder();
        $resultado = [];
        foreach (self::CAMPOS as $campo) {
            $origen = $origenConTotales
                ? ($campo === 'fibra' ? 'fibra_total' : "{$campo}_totales")
                : $campo;
            $destino = $campo === 'fibra' ? 'fibra_total' : "{$campo}_totales";
            $resultado[$destino] = round((float) (clone $consulta)->sum($origen), 2);
        }

        return $resultado;
    }
}
