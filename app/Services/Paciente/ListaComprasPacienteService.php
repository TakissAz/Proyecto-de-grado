<?php

namespace App\Services\Paciente;

use App\Models\PlanAlimentario;
use Illuminate\Support\Str;

class ListaComprasPacienteService
{
    public function generarParaPlan(PlanAlimentario $plan): array
    {
        $plan->loadMissing([
            'dias.comidas.componentes.alimento',
            'dias.comidas.componentes.receta.recetaAlimentos.alimento',
        ]);
        $items = [];
        $manuales = [];

        foreach ($plan->dias as $dia) {
            foreach ($dia->comidas as $comida) {
                $referencia = 'Día '.$dia->numero_dia.' - '.Str::ucfirst(str_replace('_', ' ', $comida->tipo_comida));
                foreach ($comida->componentes as $componente) {
                    if ($componente->tipo_componente === 'manual') {
                        $manuales[] = [
                            'nombre' => $componente->nombre_manual ?: 'Indicación manual',
                            'cantidad' => (float) $componente->cantidad,
                            'unidad' => $componente->unidad,
                            'observaciones' => $componente->observaciones,
                            'usado_en' => [$referencia],
                        ];
                        continue;
                    }
                    if ($componente->tipo_componente === 'alimento' && $componente->alimento) {
                        $this->agregar($items, $componente->alimento, (float) $componente->cantidad, (string) $componente->unidad, $referencia);
                        continue;
                    }
                    if ($componente->tipo_componente === 'receta' && $componente->receta) {
                        $factor = max((float) $componente->cantidad, 0);
                        foreach ($componente->receta->recetaAlimentos as $ingrediente) {
                            if ($ingrediente->alimento) {
                                $this->agregar($items, $ingrediente->alimento, (float) $ingrediente->cantidad * $factor, (string) $ingrediente->unidad, $referencia);
                            }
                        }
                    }
                }
            }
        }

        $items = collect($items)->map(function (array $item) {
            $referencias = $item['referencias'];
            unset($item['referencias']);
            $item['usado_en'] = array_slice($referencias, 0, 5);
            if (count($referencias) > 5) {
                $item['usado_en'][] = '+ '.(count($referencias) - 5).' usos más';
            }

            return $item;
        })->all();

        $categorias = collect($items)->groupBy('grupo')->map(fn ($grupo, $nombre) => [
            'nombre' => $nombre,
            'items' => $grupo->sortBy('nombre')->values()->all(),
        ])->sortBy('nombre')->values()->all();

        return [
            'resumen' => [
                'total_items' => count($items),
                'total_categorias' => count($categorias),
                'tiene_indicaciones_manuales' => count($manuales) > 0,
            ],
            'categorias' => $categorias,
            'indicaciones_manuales' => $manuales,
        ];
    }

    private function agregar(array &$items, object $alimento, float $cantidad, string $unidad, string $referencia): void
    {
        $unidad = trim(Str::lower($unidad)) ?: 'unidad';
        $nombre = trim((string) $alimento->nombre) ?: 'Alimento';
        $identidad = $alimento->getKey() ?: Str::slug($nombre);
        $clave = $identidad.'|'.$unidad;
        $grupo = trim((string) ($alimento->grupo_alimentario ?? '')) ?: 'Otros';
        if (! isset($items[$clave])) {
            $items[$clave] = [
                'id_alimento' => $alimento->getKey(), 'nombre' => $nombre,
                'cantidad' => 0.0, 'unidad' => $unidad, 'grupo' => $grupo,
                'referencias' => [],
            ];
        }
        $items[$clave]['cantidad'] = round($items[$clave]['cantidad'] + $cantidad, 2);
        if (! in_array($referencia, $items[$clave]['referencias'], true)) {
            $items[$clave]['referencias'][] = $referencia;
        }
    }
}
