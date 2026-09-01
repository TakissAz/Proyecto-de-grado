<?php

namespace Database\Seeders;

use App\Models\ConsultaEndocrinologica;
use App\Models\ConsultaNutricional;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\EvaluacionNutricional;
use App\Models\HabitoAlimentario;
use App\Models\ObjetivoNutricional;
use App\Models\Paciente;
use App\Models\PreferenciaAlimentaria;
use App\Models\RequerimientoNutricional;
use App\Models\RestriccionAlimentaria;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CompletarTodosLosPacientesSeeder extends Seeder
{
    private const FECHA = '2026-08-31';

    public function run(): void
    {
        $endocrinologo = User::query()->where('email', 'endocrinologia.datos@nutrigo.test')->first();
        $nutricionista = User::query()->where('email', 'nutricion.datos@nutrigo.test')->first();
        if (! $endocrinologo || ! $nutricionista) {
            throw new RuntimeException('Primero ejecuta DatosClinicosNutricionalesRealistasSeeder.');
        }

        $completadorEndocrino = app(PerfilesEndocrinologicosCompletosSeeder::class);
        $completadorFlujo = app(FlujoOperativoNutricionalRealistaSeeder::class);

        DB::transaction(function () use ($endocrinologo, $nutricionista, $completadorEndocrino, $completadorFlujo): void {
            Paciente::query()->where('estado', 'activo')->orderBy('id_paciente')->get()
                ->each(function (Paciente $paciente, int $indice) use ($endocrinologo, $nutricionista, $completadorEndocrino, $completadorFlujo): void {
                    $numero = $indice + 1;
                    $necesitaEndocrino = ! $paciente->consultasEndocrinologicas()->exists()
                        || ! $paciente->diagnosticosPmos()->exists()
                        || ! $paciente->diagnosticosResistenciaInsulina()->exists();

                    if ($necesitaEndocrino) {
                        $this->crearBaseEndocrina($paciente, $numero, $endocrinologo);
                        $paciente->load(['consultasEndocrinologicas', 'diagnosticosPmos', 'diagnosticosResistenciaInsulina', 'evaluacionesNutricionales']);
                        if (! $paciente->evaluacionesNutricionales->count()) {
                            $this->crearBaseNutricional($paciente, $numero, $nutricionista);
                            $paciente->load('evaluacionesNutricionales');
                        }
                        $completadorEndocrino->completar($numero, $paciente, $endocrinologo);
                    }

                    $necesitaNutricion = ! $paciente->evaluacionesNutricionales()->exists()
                        || ! $paciente->habitosAlimentarios()->exists()
                        || ! $paciente->preferenciasAlimentarias()->exists()
                        || ! $paciente->restriccionesAlimentarias()->exists()
                        || ! $paciente->objetivosNutricionales()->exists()
                        || ! $paciente->requerimientosNutricionales()->exists();

                    if ($necesitaNutricion) {
                        $this->crearBaseNutricional($paciente, $numero, $nutricionista);
                    }

                    if (! $paciente->planesAlimentarios()->exists()) {
                        $paciente->load('user');
                        $completadorFlujo->crearFlujo($numero, $paciente, $endocrinologo, $nutricionista);
                    }
                });
        });

        $this->command?->info('Cobertura completa: todos los pacientes activos tienen perfil endocrino, nutricional y plan de seguimiento.');
    }

    private function crearBaseEndocrina(Paciente $paciente, int $numero, User $endocrinologo): void
    {
        $fecha = Carbon::parse(self::FECHA)->subDays(2 + ($numero % 25))->toDateString();
        $pmos = $numero % 4 !== 0;
        $ri = $numero % 3 !== 0;
        $consulta = ConsultaEndocrinologica::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'fecha_consulta'=>$fecha],
            ['id_endocrinologo'=>$endocrinologo->id,
                'motivo_consulta'=>$pmos ? 'Alteraciones menstruales y signos de hiperandrogenismo.' : 'Control metabólico preventivo.',
                'sospecha_pmos'=>$pmos, 'sospecha_resistencia_insulina'=>$ri,
                'observaciones_generales'=>'Valoración endocrinológica integral completada para entorno académico.',
                'estado'=>'cerrada', 'deleted_at'=>null]
        );
        if ($consulta->trashed()) $consulta->restore();

        DiagnosticoPmos::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'fecha_diagnostico'=>$fecha],
            ['id_consulta_endocrinologica'=>$consulta->getKey(), 'id_endocrinologo'=>$endocrinologo->id,
                'cumple_alteracion_ovulatoria'=>$pmos, 'cumple_hiperandrogenismo_clinico'=>$pmos,
                'cumple_hiperandrogenismo_bioquimico'=>$pmos && $numero % 2 === 0,
                'cumple_hiperandrogenismo'=>$pmos, 'tipo_hiperandrogenismo'=>$pmos ? 'clinico' : 'ninguno',
                'cumple_morfologia_ovarica'=>$pmos && $numero % 2 !== 0,
                'total_criterios_rotterdam'=>$pmos ? ($numero % 2 ? 3 : 2) : 0,
                'fenotipo_pmos'=>$pmos ? ['A_clasico_completo','B_clasico_sin_morfologia','C_ovulatorio'][$numero % 3] : 'no_aplica',
                'diagnostico_confirmado'=>$pmos, 'diagnosticos_diferenciales_descartados'=>true,
                'severidad_clinica'=>$pmos ? ['leve','moderada','severa'][$numero % 3] : 'no_clasificada',
                'riesgo_metabolico'=>$ri ? 'alto' : 'bajo',
                'conclusion_medica'=>$pmos ? 'Hallazgos compatibles con PMOS por criterios de Rotterdam.' : 'No reúne criterios diagnósticos para PMOS.',
                'recomendaciones_medicas'=>'Seguimiento endocrinológico y control metabólico periódico.',
                'estado_validacion_experta'=>'aprobado', 'validado_por'=>$endocrinologo->id,
                'fecha_validacion'=>$fecha, 'estado'=>'registrado', 'deleted_at'=>null]
        );

        $glucosa = $ri ? 98 + ($numero % 12) : 82 + ($numero % 10);
        $insulina = $ri ? 15 + ($numero % 7) : 7 + ($numero % 4);
        DiagnosticoResistenciaInsulina::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'fecha_diagnostico'=>$fecha],
            ['id_consulta_endocrinologica'=>$consulta->getKey(), 'id_endocrinologo'=>$endocrinologo->id,
                'homa_ir'=>round($glucosa * $insulina / 405, 2),
                'quicki'=>round(1 / (log10($glucosa) + log10($insulina)), 4),
                'glucosa_ayunas'=>$glucosa, 'insulina_ayunas'=>$insulina,
                'hemoglobina_glicosilada'=>$ri ? 5.7 + (($numero % 4) / 10) : 5.2,
                'resistencia_confirmada'=>$ri, 'grado_resistencia'=>$ri ? ['leve','moderada','severa'][$numero % 3] : 'no_aplica',
                'riesgo_diabetes'=>$ri ? 'moderado' : 'bajo', 'riesgo_cardiometabolico'=>$ri ? 'moderado' : 'bajo',
                'conclusion_medica'=>$ri ? 'Resultados compatibles con resistencia a la insulina.' : 'Sin evidencia actual de resistencia a la insulina.',
                'recomendaciones_medicas'=>'Control periódico de glucosa, insulina y perfil lipídico.',
                'estado_validacion_experta'=>'aprobado', 'validado_por'=>$endocrinologo->id,
                'fecha_validacion'=>$fecha, 'estado'=>'registrado', 'deleted_at'=>null]
        );
    }

    private function crearBaseNutricional(Paciente $paciente, int $numero, User $nutricionista): void
    {
        $fecha = Carbon::parse(self::FECHA)->subDays(1 + ($numero % 18))->toDateString();
        $consulta = ConsultaNutricional::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'fecha_consulta'=>$fecha],
            ['id_nutricionista'=>$nutricionista->id, 'motivo_consulta'=>'Evaluación nutricional y mejora de hábitos.',
                'estado_consulta'=>'cerrada', 'observaciones_generales'=>'Valoración nutricional integral.',
                'estado'=>true, 'deleted_at'=>null]
        );
        if ($consulta->trashed()) $consulta->restore();
        $base = ['id_paciente'=>$paciente->getKey(), 'id_nutricionista'=>$nutricionista->id,
            'id_consulta_nutricional'=>$consulta->getKey()];
        $talla = round(1.53 + (($numero % 14) * .01), 2);
        $imc = round(22 + (($numero * 5) % 105) / 10, 1);
        $peso = round($imc * ($talla ** 2), 2);
        $cintura = round(69 + max(0, $imc - 21) * 2.2, 1);
        $evaluacion = EvaluacionNutricional::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'fecha_evaluacion'=>$fecha],
            $base + ['peso'=>$peso, 'talla'=>$talla, 'imc'=>$imc, 'circunferencia_cintura'=>$cintura,
                'circunferencia_cadera'=>$cintura + 14, 'indice_cintura_cadera'=>round($cintura / ($cintura + 14), 2),
                'porcentaje_grasa'=>round(25 + max(0, $imc - 22) * .7, 1), 'masa_muscular'=>round($peso * .34, 1),
                'nivel_actividad'=>['sedentario','ligero','moderado'][$numero % 3],
                'observaciones'=>'Evaluación antropométrica inicial.', 'estado'=>true, 'deleted_at'=>null]
        );
        if ($evaluacion->trashed()) $evaluacion->restore();
        HabitoAlimentario::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'id_consulta_nutricional'=>$consulta->getKey()],
            $base + ['comidas_por_dia'=>4, 'horarios_regulares'=>$numero % 3 !== 0, 'consume_desayuno'=>$numero % 4 !== 0,
                'consumo_agua_litros'=>1.4 + (($numero % 5) * .2), 'consumo_azucar'=>'ocasional',
                'consumo_ultraprocesados'=>'ocasional', 'consumo_frituras'=>'ocasional',
                'consumo_bebidas_azucaradas'=>$numero % 5 === 0 ? 'frecuente' : 'ocasional',
                'frecuencia_frutas_verduras'=>'diario', 'cena_tardia'=>$numero % 4 === 0,
                'ansiedad_por_comida'=>$numero % 5 === 0, 'hambre_nocturna'=>$numero % 7 === 0,
                'estado'=>true, 'deleted_at'=>null]
        );
        PreferenciaAlimentaria::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'id_consulta_nutricional'=>$consulta->getKey()],
            $base + ['alimentos_preferidos'=>['pollo, quinua, palta','avena, fruta, yogur sin lactosa','pescado, camote, verduras'][$numero % 3],
                'alimentos_no_preferidos'=>['brócoli','hígado','berenjena'][$numero % 3],
                'comidas_preferidas'=>['pollo con quinua','avena con fruta','pescado al horno'][$numero % 3],
                'comidas_frecuentes'=>'ensalada, sopa casera, plato a la plancha',
                'preparaciones_preferidas'=>'horno, plancha, vapor', 'sabores_preferidos'=>'salado',
                'estado'=>true, 'deleted_at'=>null]
        );
        RestriccionAlimentaria::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'id_consulta_nutricional'=>$consulta->getKey()],
            $base + ['alergias'=>$numero % 10 === 0 ? 'maní' : null,
                'intolerancias'=>$numero % 6 === 0 ? 'lactosa' : null,
                'alimentos_restringidos'=>null, 'alimentos_no_tolerados'=>$numero % 6 === 0 ? 'leche' : null,
                'alimentos_rechazados'=>$numero % 8 === 0 ? 'pescado' : null,
                'estado'=>true, 'deleted_at'=>null]
        );
        $objetivo = ObjetivoNutricional::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'id_consulta_nutricional'=>$consulta->getKey()],
            $base + ['objetivo_principal'=>$imc >= 25 ? 'perdida_peso' : 'mantenimiento',
                'objetivo_secundario'=>'Mejorar salud metabólica y hábitos alimentarios.',
                'meta_peso'=>round($imc >= 25 ? $peso * .93 : $peso, 2), 'meta_cintura'=>round(max(68, $cintura - 5), 1),
                'plazo_semanas'=>16, 'enfoque_nutricional'=>'alimentacion_equilibrada',
                'prioridad'=>$imc >= 30 ? 'alta' : 'media', 'estado'=>true, 'deleted_at'=>null]
        );
        $edad = $paciente->fecha_nacimiento?->age ?? 25;
        $factor = [1.2,1.375,1.55][$numero % 3];
        $tmb = round(10 * $peso + 6.25 * ($talla * 100) - 5 * $edad - 161, 2);
        $get = round($tmb * $factor, 2);
        $calorias = round(max(1300, $get - ($imc >= 25 ? 300 : 0)), 2);
        RequerimientoNutricional::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'fecha_calculo'=>$fecha],
            $base + ['id_evaluacion_nutricional'=>$evaluacion->getKey(), 'id_objetivo_nutricional'=>$objetivo->getKey(),
                'peso_referencia'=>$peso, 'talla_referencia'=>$talla, 'edad_referencia'=>$edad,
                'nivel_actividad'=>$evaluacion->nivel_actividad, 'factor_actividad'=>$factor, 'tmb'=>$tmb, 'get'=>$get,
                'ajuste_calorico'=>$imc >= 25 ? -300 : 0, 'calorias_objetivo'=>$calorias,
                'proteinas_diarias'=>round($calorias * .30 / 4, 2), 'carbohidratos_diarios'=>round($calorias * .35 / 4, 2),
                'grasas_diarias'=>round($calorias * .35 / 9, 2), 'fibra_diaria'=>30,
                'porcentaje_proteinas'=>30, 'porcentaje_carbohidratos'=>35, 'porcentaje_grasas'=>35,
                'metodo_calculo'=>'mifflin_st_jeor', 'estado'=>true, 'deleted_at'=>null]
        );
    }
}
