<?php

namespace App\Services\Nutricion;

class ClasificadorDisponibilidadAlimentoService
{
    /**
     * Clasifica la disponibilidad temporal de un alimento según su nombre y grupo.
     *
     * @return array{disponibilidad_temporal: string, temporada_escasez: string|null, mensaje_disponibilidad: string}
     */
    public function clasificar(string $nombre, string $grupoAlimentario): array
    {
        $nombreNormalizado = mb_strtolower(trim($nombre));

        // Estacionales — escasez en seca/fría (mayo-octubre)
        $estacionalSecaFria = [
            'tomate', 'locoto', 'arveja', 'lechuga', 'espinaca', 'acelga',
            'pepino', 'zapallo', 'choclo', 'durazno', 'uva', 'chirimoya',
            'tumbo', 'mango', 'papaya',
        ];

        foreach ($estacionalSecaFria as $patron) {
            if (str_contains($nombreNormalizado, $patron)) {
                return [
                    'disponibilidad_temporal' => 'estacional',
                    'temporada_escasez' => 'seca_fria',
                    'mensaje_disponibilidad' => 'Puede tener menor disponibilidad entre mayo y octubre durante la época seca y fría.',
                ];
            }
        }

        // Estacionales — escasez en lluvias (noviembre-abril)
        $estacionalLluvias = [
            'papa nueva', 'oca', 'isaño', 'papalisa', 'naranja', 'mandarina',
            'lima', 'pomelo', 'apio',
        ];

        foreach ($estacionalLluvias as $patron) {
            if (str_contains($nombreNormalizado, $patron)) {
                return [
                    'disponibilidad_temporal' => 'estacional',
                    'temporada_escasez' => 'lluvias',
                    'mensaje_disponibilidad' => 'Puede tener menor disponibilidad entre noviembre y abril durante la época de lluvias.',
                ];
            }
        }

        // Disponibles todo el año
        $todoElAnio = [
            'avena', 'arroz', 'quinua', 'trigo', 'maiz', 'fideo', 'pan',
            'pollo', 'res', 'cerdo', 'huevo', 'leche', 'yogur', 'queso',
            'aceite', 'mantequilla', 'azucar', 'sal', 'papa', 'cebolla',
            'zanahoria', 'platano', 'banana', 'manzana', 'lenteja', 'poroto',
            'garbanzo', 'atun', 'sardina',
        ];

        foreach ($todoElAnio as $patron) {
            if (str_contains($nombreNormalizado, $patron)) {
                return [
                    'disponibilidad_temporal' => 'todo_el_anio',
                    'temporada_escasez' => null,
                    'mensaje_disponibilidad' => 'Disponible normalmente durante todo el año.',
                ];
            }
        }

        // Clasificación por grupo si no se reconoce por nombre
        if (in_array($grupoAlimentario, ['proteina', 'lacteo', 'grasa', 'carbohidrato'])) {
            return [
                'disponibilidad_temporal' => 'todo_el_anio',
                'temporada_escasez' => null,
                'mensaje_disponibilidad' => 'Disponible normalmente durante todo el año.',
            ];
        }

        // Desconocido
        return [
            'disponibilidad_temporal' => 'desconocida',
            'temporada_escasez' => null,
            'mensaje_disponibilidad' => 'No se cuenta con información estacional para este alimento.',
        ];
    }
}
