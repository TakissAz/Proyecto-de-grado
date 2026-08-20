<?php

namespace Database\Seeders;

use App\Models\ConsultaNutricional;
use App\Models\EvaluacionNutricional;
use App\Models\HabitoAlimentario;
use App\Models\ObjetivoNutricional;
use App\Models\Paciente;
use App\Models\PreferenciaAlimentaria;
use App\Models\RequerimientoNutricional;
use App\Models\RestriccionAlimentaria;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OtrosPerfilesNutricionalesSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $nutricionista = User::query()->where('email', 'nutri@pmos.test')->firstOrFail();

            foreach ($this->perfiles() as $ci => $datos) {
                $paciente = Paciente::query()->where('ci', $ci)->first();
                if (! $paciente) {
                    $this->command?->warn("Paciente con CI {$ci} no encontrado; perfil omitido.");
                    continue;
                }

                $this->crearPerfil($paciente, $nutricionista, $datos);
                $this->command?->info("Perfil nutricional listo: paciente {$paciente->id_paciente} - {$paciente->nombres}");
            }
        });
    }

    private function crearPerfil(Paciente $paciente, User $nutricionista, array $datos): void
    {
        $consulta = ConsultaNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->id_paciente, 'fecha_consulta' => $datos['fecha']],
            [
                'id_nutricionista' => $nutricionista->id,
                'motivo_consulta' => $datos['motivo'],
                'estado_consulta' => 'abierta',
                'observaciones_generales' => $datos['observacion_consulta'],
                'estado' => true,
                'deleted_at' => null,
            ]
        );

        $base = [
            'id_paciente' => $paciente->id_paciente,
            'id_nutricionista' => $nutricionista->id,
            'id_consulta_nutricional' => $consulta->id_consulta_nutricional,
        ];

        $evaluacion = EvaluacionNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->id_paciente, 'fecha_evaluacion' => $datos['fecha']],
            $base + $datos['evaluacion'] + [
                'fecha_evaluacion' => $datos['fecha'],
                'estado' => true,
                'deleted_at' => null,
            ]
        );

        HabitoAlimentario::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->id_paciente, 'id_consulta_nutricional' => $consulta->id_consulta_nutricional],
            $base + $datos['habitos'] + ['estado' => true, 'deleted_at' => null]
        );

        PreferenciaAlimentaria::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->id_paciente, 'id_consulta_nutricional' => $consulta->id_consulta_nutricional],
            $base + $datos['preferencias'] + ['estado' => true, 'deleted_at' => null]
        );

        RestriccionAlimentaria::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->id_paciente, 'id_consulta_nutricional' => $consulta->id_consulta_nutricional],
            $base + $datos['restricciones'] + ['estado' => true, 'deleted_at' => null]
        );

        $objetivo = ObjetivoNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->id_paciente, 'id_consulta_nutricional' => $consulta->id_consulta_nutricional],
            $base + $datos['objetivo'] + ['estado' => true, 'deleted_at' => null]
        );

        RequerimientoNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->id_paciente, 'fecha_calculo' => $datos['fecha']],
            [
                ...$base,
                'id_evaluacion_nutricional' => $evaluacion->id_evaluacion_nutricional,
                'id_objetivo_nutricional' => $objetivo->id_objetivo_nutricional,
                ...$datos['requerimiento'],
                'fecha_calculo' => $datos['fecha'],
                'estado' => true,
                'deleted_at' => null,
            ]
        );
    }

    private function perfiles(): array
    {
        return [
            '8308424' => [
                'fecha' => '2026-08-18',
                'motivo' => 'Mejorar la organización de comidas y mantener una composición corporal saludable.',
                'observacion_consulta' => 'Perfil orientado a mantenimiento, educación nutricional y regularidad de horarios.',
                'evaluacion' => [
                    'peso' => 60.00, 'talla' => 1.64, 'imc' => 22.31,
                    'circunferencia_cintura' => 72.00, 'circunferencia_cadera' => 94.00,
                    'indice_cintura_cadera' => 0.77, 'porcentaje_grasa' => 27.00,
                    'masa_muscular' => 24.50, 'nivel_actividad' => 'moderado',
                    'observaciones' => 'Estado nutricional adecuado y actividad física regular.',
                ],
                'habitos' => [
                    'comidas_por_dia' => 4, 'horarios_regulares' => true,
                    'consume_desayuno' => true, 'consumo_agua_litros' => 2.00,
                    'consumo_azucar' => 'ocasional', 'consumo_ultraprocesados' => 'ocasional',
                    'consumo_frituras' => 'ocasional', 'consumo_bebidas_azucaradas' => 'nunca',
                    'frecuencia_frutas_verduras' => 'diario', 'cena_tardia' => false,
                    'ansiedad_por_comida' => false, 'hambre_nocturna' => false,
                    'observaciones' => 'Buen patrón general; reforzar variedad y planificación semanal.',
                ],
                'preferencias' => [
                    'alimentos_preferidos' => 'Avena, huevo, pollo, pescado, quinua, verduras, banana y yogur.',
                    'alimentos_no_preferidos' => 'Remolacha y vísceras.',
                    'comidas_preferidas' => 'Bowls de quinua, pollo a la plancha y ensaladas.',
                    'comidas_frecuentes' => 'Avena en desayuno, plato casero en almuerzo, fruta en merienda y cena ligera.',
                    'preparaciones_preferidas' => 'Plancha, horno y hervido.',
                    'sabores_preferidos' => 'Salado y fresco',
                    'observaciones' => 'Acepta amplia variedad de alimentos y preparaciones.',
                ],
                'restricciones' => [
                    'alergias' => null, 'intolerancias' => null,
                    'alimentos_restringidos' => 'Bebidas energéticas y exceso de azúcar añadida.',
                    'alimentos_no_tolerados' => null, 'alimentos_rechazados' => 'Vísceras.',
                    'observaciones' => 'Sin alergias ni intolerancias conocidas.',
                ],
                'objetivo' => [
                    'objetivo_principal' => 'mantenimiento',
                    'objetivo_secundario' => 'Mejorar variedad y planificación de las cuatro comidas.',
                    'meta_peso' => 60.00, 'meta_cintura' => 72.00, 'plazo_semanas' => 12,
                    'enfoque_nutricional' => 'balanceado', 'prioridad' => 'media',
                    'observaciones' => 'Mantener peso y consolidar hábitos sostenibles.',
                ],
                'requerimiento' => [
                    'peso_referencia' => 60.00, 'talla_referencia' => 1.64, 'edad_referencia' => 24,
                    'nivel_actividad' => 'moderado', 'factor_actividad' => 1.550,
                    'tmb' => 1334.00, 'get' => 2067.70, 'ajuste_calorico' => 0,
                    'calorias_objetivo' => 2050.00, 'proteinas_diarias' => 128.13,
                    'carbohidratos_diarios' => 205.00, 'grasas_diarias' => 79.72,
                    'fibra_diaria' => 28.00, 'porcentaje_proteinas' => 25,
                    'porcentaje_carbohidratos' => 40, 'porcentaje_grasas' => 35,
                    'metodo_calculo' => 'mifflin_st_jeor',
                    'observaciones' => 'Requerimiento de mantenimiento con actividad moderada.',
                    'reglas_aplicadas' => [['codigo' => 'NUT-MANT-01', 'nombre' => 'Mantenimiento energético', 'tipo_regla' => 'objetivo', 'prioridad' => 60]],
                ],
            ],
            '151515' => [
                'fecha' => '2026-08-18',
                'motivo' => 'Reducir peso, controlar apetito y prevenir alteraciones glucémicas.',
                'observacion_consulta' => 'Perfil de riesgo metabólico con hábitos irregulares y alto consumo de ultraprocesados.',
                'evaluacion' => [
                    'peso' => 86.00, 'talla' => 1.60, 'imc' => 33.59,
                    'circunferencia_cintura' => 101.00, 'circunferencia_cadera' => 112.00,
                    'indice_cintura_cadera' => 0.90, 'porcentaje_grasa' => 42.00,
                    'masa_muscular' => 26.00, 'nivel_actividad' => 'sedentario',
                    'observaciones' => 'Obesidad grado I y adiposidad abdominal; iniciar cambios progresivos.',
                ],
                'habitos' => [
                    'comidas_por_dia' => 4, 'horarios_regulares' => false,
                    'consume_desayuno' => false, 'consumo_agua_litros' => 1.00,
                    'consumo_azucar' => 'diario', 'consumo_ultraprocesados' => 'diario',
                    'consumo_frituras' => 'frecuente', 'consumo_bebidas_azucaradas' => 'diario',
                    'frecuencia_frutas_verduras' => 'ocasional', 'cena_tardia' => true,
                    'ansiedad_por_comida' => true, 'hambre_nocturna' => true,
                    'observaciones' => 'Omisión frecuente del desayuno y mayor ingesta durante la noche.',
                ],
                'preferencias' => [
                    'alimentos_preferidos' => 'Pollo, carne, arroz, papa, pan, queso, cítricos y tomate.',
                    'alimentos_no_preferidos' => 'Brócoli, pescado y avena.',
                    'comidas_preferidas' => 'Arroz con carne, hamburguesa y sándwiches.',
                    'comidas_frecuentes' => 'Comida rápida, gaseosa, pan y snacks salados.',
                    'preparaciones_preferidas' => 'Frito y al horno.',
                    'sabores_preferidos' => 'Salado y dulce',
                    'observaciones' => 'Introducir cambios graduales usando versiones saludables de preparaciones conocidas.',
                ],
                'restricciones' => [
                    'alergias' => 'Maní.', 'intolerancias' => null,
                    'alimentos_restringidos' => 'Maní, bebidas azucaradas, frituras y comida rápida.',
                    'alimentos_no_tolerados' => null, 'alimentos_rechazados' => 'Pescado y brócoli.',
                    'observaciones' => 'Evitar completamente maní y productos con posible contaminación cruzada.',
                ],
                'objetivo' => [
                    'objetivo_principal' => 'perdida_peso',
                    'objetivo_secundario' => 'Mejorar control glucémico, hambre nocturna y circunferencia abdominal.',
                    'meta_peso' => 76.00, 'meta_cintura' => 90.00, 'plazo_semanas' => 20,
                    'enfoque_nutricional' => 'control_calorico', 'prioridad' => 'alta',
                    'observaciones' => 'Déficit moderado con seguimiento frecuente y educación alimentaria.',
                ],
                'requerimiento' => [
                    'peso_referencia' => 86.00, 'talla_referencia' => 1.60, 'edad_referencia' => 23,
                    'nivel_actividad' => 'sedentario', 'factor_actividad' => 1.200,
                    'tmb' => 1584.00, 'get' => 1900.80, 'ajuste_calorico' => -300,
                    'calorias_objetivo' => 1600.00, 'proteinas_diarias' => 120.00,
                    'carbohidratos_diarios' => 140.00, 'grasas_diarias' => 62.22,
                    'fibra_diaria' => 30.00, 'porcentaje_proteinas' => 30,
                    'porcentaje_carbohidratos' => 35, 'porcentaje_grasas' => 35,
                    'metodo_calculo' => 'mifflin_st_jeor',
                    'observaciones' => 'Déficit energético moderado, proteína suficiente y énfasis en fibra.',
                    'reglas_aplicadas' => [
                        ['codigo' => 'NUT-OB-01', 'nombre' => 'Déficit moderado', 'tipo_regla' => 'antropometrica', 'prioridad' => 100],
                        ['codigo' => 'NUT-ALE-01', 'nombre' => 'Excluir alérgenos', 'tipo_regla' => 'seguridad', 'prioridad' => 120],
                    ],
                ],
            ],
        ];
    }
}
