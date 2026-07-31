<?php

namespace Database\Seeders;

use App\Models\ReglaNutricional;
use Illuminate\Database\Seeder;

class ReglasNutricionalesSeeder extends Seeder
{
    public function run(): void
    {
        $fuente = 'Criterio nutricional definido para el sistema.';

        $reglas = [
            [
                'codigo' => 'RN-001',
                'nombre' => 'Ajuste calórico para pérdida de peso',
                'tipo_regla' => 'ajuste_calorico',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => '=',
                'condicion_valor' => 'perdida_peso',
                'resultado' => ['ajuste_calorico' => -300],
                'prioridad' => 20,
                'descripcion' => 'Ajuste moderado para pérdida de peso.',
                'fuente' => $fuente,
            ],
            [
                'codigo' => 'RN-002',
                'nombre' => 'Ajuste calórico para mejora de resistencia a la insulina',
                'tipo_regla' => 'ajuste_calorico',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => '=',
                'condicion_valor' => 'mejora_resistencia_insulina',
                'resultado' => ['ajuste_calorico' => -200],
                'prioridad' => 30,
                'descripcion' => 'Ajuste moderado asociado a control metabólico.',
                'fuente' => $fuente,
            ],
            [
                'codigo' => 'RN-003',
                'nombre' => 'Ajuste calórico para control glucémico',
                'tipo_regla' => 'ajuste_calorico',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => '=',
                'condicion_valor' => 'control_glucemico',
                'resultado' => ['ajuste_calorico' => -200],
                'prioridad' => 30,
            ],
            [
                'codigo' => 'RN-004',
                'nombre' => 'Ajuste calórico para mejora de composición corporal',
                'tipo_regla' => 'ajuste_calorico',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => '=',
                'condicion_valor' => 'mejora_composicion_corporal',
                'resultado' => ['ajuste_calorico' => -100],
                'prioridad' => 20,
            ],
            [
                'codigo' => 'RN-005',
                'nombre' => 'Ajuste calórico para mantenimiento',
                'tipo_regla' => 'ajuste_calorico',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => '=',
                'condicion_valor' => 'mantenimiento',
                'resultado' => ['ajuste_calorico' => 0],
                'prioridad' => 20,
            ],
            [
                'codigo' => 'RN-006',
                'nombre' => 'Ajuste calórico para educación nutricional',
                'tipo_regla' => 'ajuste_calorico',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => '=',
                'condicion_valor' => 'educacion_nutricional',
                'resultado' => ['ajuste_calorico' => 0],
                'prioridad' => 10,
            ],
            [
                'codigo' => 'RN-007',
                'nombre' => 'Ajuste calórico por defecto',
                'tipo_regla' => 'ajuste_calorico',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => 'default',
                'condicion_valor' => null,
                'resultado' => ['ajuste_calorico' => 0],
                'prioridad' => 1,
            ],
            [
                'codigo' => 'RN-008',
                'nombre' => 'Distribución de macronutrientes para PMOS y RI',
                'tipo_regla' => 'distribucion_macros',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => 'in',
                'condicion_valor' => [
                    'perdida_peso',
                    'mejora_resistencia_insulina',
                    'control_glucemico',
                    'mejora_composicion_corporal',
                    'otro',
                ],
                'resultado' => [
                    'porcentaje_proteinas' => 30,
                    'porcentaje_carbohidratos' => 35,
                    'porcentaje_grasas' => 35,
                    'fibra_diaria' => 25,
                ],
                'prioridad' => 30,
                'descripcion' => 'Distribución moderada de carbohidratos y mayor proporción proteica para apoyo en PMOS/RI.',
                'fuente' => $fuente,
            ],
            [
                'codigo' => 'RN-009',
                'nombre' => 'Distribución de macronutrientes para mantenimiento',
                'tipo_regla' => 'distribucion_macros',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => 'in',
                'condicion_valor' => ['mantenimiento', 'educacion_nutricional'],
                'resultado' => [
                    'porcentaje_proteinas' => 25,
                    'porcentaje_carbohidratos' => 40,
                    'porcentaje_grasas' => 35,
                    'fibra_diaria' => 25,
                ],
                'prioridad' => 20,
            ],
            [
                'codigo' => 'RN-010',
                'nombre' => 'Distribución de macronutrientes por defecto',
                'tipo_regla' => 'distribucion_macros',
                'condicion_campo' => 'objetivo_principal',
                'condicion_operador' => 'default',
                'condicion_valor' => null,
                'resultado' => [
                    'porcentaje_proteinas' => 30,
                    'porcentaje_carbohidratos' => 35,
                    'porcentaje_grasas' => 35,
                    'fibra_diaria' => 25,
                ],
                'prioridad' => 1,
            ],
            [
                'codigo' => 'RN-011',
                'nombre' => 'Límite mínimo calórico',
                'tipo_regla' => 'limite_calorico',
                'condicion_campo' => 'calorias_objetivo',
                'condicion_operador' => '<',
                'condicion_valor' => 1200,
                'resultado' => [
                    'calorias_minimas' => 1200,
                    'observacion' => 'Se aplicó límite mínimo calórico de 1200 kcal/día.',
                ],
                'prioridad' => 100,
                'descripcion' => 'Regla de seguridad nutricional para evitar recomendaciones calóricas demasiado bajas.',
                'fuente' => $fuente,
            ],
        ];

        foreach ($reglas as $regla) {
            ReglaNutricional::withTrashed()->updateOrCreate(
                ['codigo' => $regla['codigo']],
                [...$regla, 'estado' => true, 'deleted_at' => null],
            );
        }
    }
}
