<?php

namespace App\Services\Nutricion;

use App\Models\ReglaNutricional;
use Illuminate\Support\Collection;

class MotorReglasNutricionalesService
{
    public function evaluar(array $hechos): array
    {
        $reglas = ReglaNutricional::query()
            ->where('estado', true)
            ->orderByDesc('prioridad')
            ->orderBy('id_regla_nutricional')
            ->get()
            ->groupBy('tipo_regla');

        $resultado = [
            'ajuste_calorico' => 0,
            'porcentaje_proteinas' => 30,
            'porcentaje_carbohidratos' => 35,
            'porcentaje_grasas' => 35,
            'fibra_diaria' => 25,
            'calorias_minimas' => null,
            'observaciones' => [],
            'reglas_aplicadas' => [],
        ];

        foreach ($reglas as $tipo => $reglasDelTipo) {
            $regla = $this->seleccionarRegla($reglasDelTipo, $hechos);

            if (! $regla) {
                continue;
            }

            foreach ($regla->resultado as $clave => $valor) {
                if ($clave === 'observacion') {
                    $resultado['observaciones'][] = $valor;
                    continue;
                }

                $resultado[$clave] = $valor;
            }

            $resultado['reglas_aplicadas'][] = [
                'id_regla_nutricional' => $regla->id_regla_nutricional,
                'codigo' => $regla->codigo,
                'nombre' => $regla->nombre,
                'tipo_regla' => $tipo,
                'prioridad' => $regla->prioridad,
                'descripcion' => $regla->descripcion,
                'fuente' => $regla->fuente,
                'condicion_campo' => $regla->condicion_campo,
                'condicion_operador' => $regla->condicion_operador,
                'condicion_valor' => $regla->condicion_valor,
                'resultado' => $regla->resultado,
            ];
        }

        return $resultado;
    }

    private function seleccionarRegla(Collection $reglas, array $hechos): ?ReglaNutricional
    {
        $especifica = $reglas
            ->where('condicion_operador', '!=', 'default')
            ->first(fn (ReglaNutricional $regla) => $regla->aplica($hechos));

        if ($especifica) {
            return $especifica;
        }

        return $reglas
            ->where('condicion_operador', 'default')
            ->first(fn (ReglaNutricional $regla) => $regla->aplica($hechos));
    }
}
