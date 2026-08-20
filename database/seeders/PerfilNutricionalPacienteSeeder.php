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

class PerfilNutricionalPacienteSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $nutricionista = User::query()->where('email', 'nutri@pmos.test')->firstOrFail();
            $paciente = Paciente::query()->where('ci', 'CLINICA-PMOS-001')->firstOrFail();

            $consulta = ConsultaNutricional::withTrashed()->updateOrCreate(
                ['id_paciente' => $paciente->id_paciente, 'fecha_consulta' => '2026-08-18'],
                [
                    'id_nutricionista' => $nutricionista->id,
                    'motivo_consulta' => 'Control de peso, mejora de resistencia a la insulina y organización de la alimentación asociada a PMOS.',
                    'estado_consulta' => 'abierta',
                    'observaciones_generales' => 'Paciente motivada. Se prioriza adherencia, bajo índice glucémico, fibra y distribución regular de cuatro comidas.',
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
                ['id_paciente' => $paciente->id_paciente, 'fecha_evaluacion' => '2026-08-18'],
                $base + [
                    'fecha_evaluacion' => '2026-08-18',
                    'peso' => 78.00,
                    'talla' => 1.62,
                    'imc' => 29.72,
                    'circunferencia_cintura' => 92.00,
                    'circunferencia_cadera' => 104.00,
                    'indice_cintura_cadera' => 0.88,
                    'porcentaje_grasa' => 37.50,
                    'masa_muscular' => 27.80,
                    'nivel_actividad' => 'ligero',
                    'observaciones' => 'Sobrepeso con adiposidad abdominal. Actividad física ligera tres veces por semana.',
                    'estado' => true,
                    'deleted_at' => null,
                ]
            );

            HabitoAlimentario::withTrashed()->updateOrCreate(
                ['id_paciente' => $paciente->id_paciente, 'id_consulta_nutricional' => $consulta->id_consulta_nutricional],
                $base + [
                    'comidas_por_dia' => 4,
                    'horarios_regulares' => false,
                    'consume_desayuno' => true,
                    'consumo_agua_litros' => 1.50,
                    'consumo_azucar' => 'frecuente',
                    'consumo_ultraprocesados' => 'frecuente',
                    'consumo_frituras' => 'ocasional',
                    'consumo_bebidas_azucaradas' => 'frecuente',
                    'frecuencia_frutas_verduras' => 'ocasional',
                    'cena_tardia' => true,
                    'ansiedad_por_comida' => true,
                    'hambre_nocturna' => false,
                    'observaciones' => 'Mayor ansiedad por alimentos dulces durante la tarde; horarios variables por actividades universitarias.',
                    'estado' => true,
                    'deleted_at' => null,
                ]
            );

            PreferenciaAlimentaria::withTrashed()->updateOrCreate(
                ['id_paciente' => $paciente->id_paciente, 'id_consulta_nutricional' => $consulta->id_consulta_nutricional],
                $base + [
                    'alimentos_preferidos' => 'Pollo, huevo, avena, quinua, arroz integral, yogur natural, manzana, frutilla, palta y verduras frescas.',
                    'alimentos_no_preferidos' => 'Hígado, sardina y coliflor.',
                    'comidas_preferidas' => 'Desayunos con avena, ensaladas con pollo, sopas de verduras y yogur con fruta.',
                    'comidas_frecuentes' => 'Pan con té en desayuno; arroz con pollo en almuerzo; galletas o yogur en merienda; sopa o sándwich en cena.',
                    'preparaciones_preferidas' => 'Horno, plancha, hervido y salteado con poco aceite.',
                    'sabores_preferidos' => 'Salado y ligeramente dulce',
                    'observaciones' => 'Prefiere preparaciones simples, económicas y fáciles de transportar.',
                    'estado' => true,
                    'deleted_at' => null,
                ]
            );

            RestriccionAlimentaria::withTrashed()->updateOrCreate(
                ['id_paciente' => $paciente->id_paciente, 'id_consulta_nutricional' => $consulta->id_consulta_nutricional],
                $base + [
                    'alergias' => null,
                    'intolerancias' => 'Intolerancia leve a la lactosa; tolera yogur natural y productos deslactosados.',
                    'alimentos_restringidos' => 'Bebidas azucaradas, azúcar añadida, dulces, frituras y productos ultraprocesados.',
                    'alimentos_no_tolerados' => 'Leche entera en grandes cantidades.',
                    'alimentos_rechazados' => 'Hígado y sardina.',
                    'observaciones' => 'No se reportan alergias alimentarias. Priorizar alternativas sin lactosa cuando corresponda.',
                    'estado' => true,
                    'deleted_at' => null,
                ]
            );

            $objetivo = ObjetivoNutricional::withTrashed()->updateOrCreate(
                ['id_paciente' => $paciente->id_paciente, 'id_consulta_nutricional' => $consulta->id_consulta_nutricional],
                $base + [
                    'objetivo_principal' => 'mejora_resistencia_insulina',
                    'objetivo_secundario' => 'Pérdida gradual de peso y reducción de circunferencia de cintura.',
                    'meta_peso' => 70.00,
                    'meta_cintura' => 84.00,
                    'plazo_semanas' => 16,
                    'enfoque_nutricional' => 'bajo_indice_glucemico',
                    'prioridad' => 'alta',
                    'observaciones' => 'Meta progresiva y realista, con reevaluación antropométrica cada cuatro semanas.',
                    'estado' => true,
                    'deleted_at' => null,
                ]
            );

            RequerimientoNutricional::withTrashed()->updateOrCreate(
                ['id_paciente' => $paciente->id_paciente, 'fecha_calculo' => '2026-08-18'],
                [
                    ...$base,
                    'id_evaluacion_nutricional' => $evaluacion->id_evaluacion_nutricional,
                    'id_objetivo_nutricional' => $objetivo->id_objetivo_nutricional,
                    'peso_referencia' => 78.00,
                    'talla_referencia' => 1.62,
                    'edad_referencia' => 28,
                    'nivel_actividad' => 'ligero',
                    'factor_actividad' => 1.375,
                    'tmb' => 1491.50,
                    'get' => 2050.81,
                    'ajuste_calorico' => -350.00,
                    'calorias_objetivo' => 1700.00,
                    'proteinas_diarias' => 127.50,
                    'carbohidratos_diarios' => 148.75,
                    'grasas_diarias' => 66.11,
                    'fibra_diaria' => 30.00,
                    'porcentaje_proteinas' => 30.00,
                    'porcentaje_carbohidratos' => 35.00,
                    'porcentaje_grasas' => 35.00,
                    'metodo_calculo' => 'mifflin_st_jeor',
                    'observaciones' => 'Déficit moderado con distribución orientada al control glucémico y preservación de masa muscular.',
                    'reglas_aplicadas' => [
                        ['codigo' => 'NUT-RI-01', 'nombre' => 'Control glucémico', 'tipo_regla' => 'metabolica', 'prioridad' => 100],
                        ['codigo' => 'NUT-FIBRA-01', 'nombre' => 'Aumento de fibra', 'tipo_regla' => 'composicion', 'prioridad' => 80],
                    ],
                    'estado' => true,
                    'deleted_at' => null,
                ]
            );

            $this->command?->info("Perfil nutricional listo: paciente {$paciente->id_paciente} - {$paciente->nombres}");
        });
    }
}
