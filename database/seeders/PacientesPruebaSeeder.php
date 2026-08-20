<?php

namespace Database\Seeders;

use App\Models\AntecedenteEndocrinoMetabolico;
use App\Models\ConsultaEndocrinologica;
use App\Models\ConsultaNutricional;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\EvaluacionEcografica;
use App\Models\EvaluacionFisicaEndocrina;
use App\Models\EvaluacionNutricional;
use App\Models\HabitoAlimentario;
use App\Models\HistoriaHiperandrogenica;
use App\Models\HistoriaMenstrual;
use App\Models\ObjetivoNutricional;
use App\Models\Paciente;
use App\Models\PreferenciaAlimentaria;
use App\Models\RequerimientoNutricional;
use App\Models\RestriccionAlimentaria;
use App\Models\ResultadoDiferencialEndocrino;
use App\Models\ResultadoGlucosaInsulina;
use App\Models\ResultadoPerfilAndrogenico;
use App\Models\ResultadoPerfilGonadotropo;
use App\Models\ResultadoPerfilLipidico;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PacientesPruebaSeeder extends Seeder
{
    private const FECHA = '2026-08-19';

    public function run(): void
    {
        DB::transaction(function (): void {
            $nutricionista = $this->usuarioConRol(
                'nutricionista.prueba@pmos.test', 'Nutricionista Prueba', 'nutricionista'
            );
            $endocrinologo = $this->usuarioConRol(
                'endocrinologo.prueba@pmos.test', 'Endocrinologo Prueba', 'endocrinologo'
            );

            foreach ($this->escenarios() as $indice => $datos) {
                $usuario = $this->usuarioConRol($datos['email'], $datos['nombre'], 'paciente');
                $paciente = Paciente::withTrashed()->updateOrCreate(
                    ['ci' => sprintf('PRUEBA-PMOS-%03d', $indice + 1)],
                    [
                        'user_id' => $usuario->id,
                        'nombres' => $datos['nombre'],
                        'apellido_paterno' => 'Prueba',
                        'apellido_materno' => 'PMOS',
                        'fecha_nacimiento' => $datos['fecha_nacimiento'],
                        'sexo' => 'femenino',
                        'telefono' => '71000'.str_pad((string) ($indice + 1), 3, '0', STR_PAD_LEFT),
                        'direccion' => 'La Paz, Bolivia',
                        'ocupacion' => 'Paciente de prueba',
                        'estado_civil' => 'soltera',
                        'fecha_registro' => self::FECHA,
                        'estado' => 'activo',
                        'observaciones' => 'Escenario controlado para validar el flujo clínico y nutricional.',
                        'deleted_at' => null,
                    ]
                );
                if ($paciente->trashed()) $paciente->restore();

                if (! ($datos['incompleta'] ?? false)) {
                    $this->crearDatosEndocrinos($paciente, $endocrinologo, $datos);
                }
                $this->crearDatosNutricionales($paciente, $nutricionista, $datos);
            }
        });

        $this->command?->info('PacientesPruebaSeeder: 8 pacientes y 2 profesionales creados o actualizados.');
    }

    private function usuarioConRol(string $email, string $nombre, string $rolNombre): User
    {
        $rol = Role::withTrashed()->updateOrCreate(
            ['nombre' => $rolNombre],
            ['descripcion' => ucfirst($rolNombre), 'estado' => 'activo', 'deleted_at' => null]
        );
        if ($rol->trashed()) $rol->restore();

        $usuario = User::withTrashed()->updateOrCreate(
            ['email' => $email],
            ['name' => $nombre, 'password' => Hash::make('password'), 'estado' => 'activo', 'deleted_at' => null]
        );
        if ($usuario->trashed()) $usuario->restore();
        $usuario->forceFill(['email_verified_at' => now()])->save();

        $asignacion = UserRole::withTrashed()->firstOrNew([
            'user_id' => $usuario->id, 'id_rol' => $rol->id_rol,
        ]);
        $asignacion->estado = 'activo';
        $asignacion->deleted_at = null;
        $asignacion->save();

        return $usuario;
    }

    private function crearDatosEndocrinos(Paciente $paciente, User $endocrinologo, array $d): void
    {
        $pmos = $d['pmos'];
        $ri = $d['ri'];
        $consulta = ConsultaEndocrinologica::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->id_paciente, 'fecha_consulta' => self::FECHA],
            [
                'id_endocrinologo' => $endocrinologo->id,
                'motivo_consulta' => 'Evaluación endocrinológica integral de prueba.',
                'sospecha_pmos' => $pmos !== false,
                'sospecha_resistencia_insulina' => $ri['confirmada'],
                'observaciones_generales' => 'Datos controlados para validación del sistema experto.',
                'estado' => 'abierta', 'deleted_at' => null,
            ]
        );
        if ($consulta->trashed()) $consulta->restore();
        $base = ['id_consulta_endocrinologica' => $consulta->getKey(), 'id_paciente' => $paciente->getKey()];
        $lab = $base + ['id_endocrinologo' => $endocrinologo->id];
        $cumplePmos = $pmos === true;

        $menstrual = HistoriaMenstrual::withTrashed()->updateOrCreate($base, [
            'fecha_ultima_menstruacion' => '2026-07-10', 'edad_menarquia' => 12,
            'regularidad_ciclo' => $cumplePmos ? 'irregular' : 'regular', 'duracion_ciclo_dias' => 5,
            'intervalo_entre_ciclos_dias' => $cumplePmos ? 45 : 29, 'amenorrea' => false,
            'oligomenorrea' => $cumplePmos, 'sangrado_abundante' => false, 'dolor_menstrual' => false,
            'sospecha_anovulacion' => $cumplePmos, 'progesterona_lutea' => $cumplePmos ? 2.1 : 8.0,
            'confirma_anovulacion_por_progesterona' => $cumplePmos,
            'observaciones' => 'Historia menstrual de escenario de prueba.', 'estado' => 'activo', 'deleted_at' => null,
        ]);
        $hiper = HistoriaHiperandrogenica::withTrashed()->updateOrCreate($base, [
            'acne' => $cumplePmos, 'acne_grado' => $cumplePmos ? 'moderado' : 'leve',
            'hirsutismo' => $cumplePmos, 'hirsutismo_zona' => $cumplePmos ? 'Mentón y línea alba' : null,
            'puntaje_ferriman_gallwey' => $cumplePmos ? 11 : 3, 'alopecia_androgenica' => false,
            'seborrea' => $cumplePmos, 'inicio_sintomas' => 'adolescencia', 'progresion_sintomas' => 'estable',
            'observaciones' => 'Evaluación hiperandrogénica de prueba.', 'estado' => 'activo', 'deleted_at' => null,
        ]);
        AntecedenteEndocrinoMetabolico::withTrashed()->updateOrCreate($base, [
            'diabetes_familiar' => $ri['confirmada'], 'diabetes_personal' => false,
            'hipertension_familiar' => false, 'hipertension_personal' => false,
            'dislipidemia_familiar' => $ri['confirmada'], 'dislipidemia_personal' => false,
            'enfermedad_tiroidea' => false, 'hiperprolactinemia_previa' => false,
            'uso_anticonceptivos' => false, 'uso_metformina' => false, 'uso_corticoides' => false,
            'observaciones' => 'Antecedentes de prueba.', 'estado' => 'activo', 'deleted_at' => null,
        ]);

        $talla = 1.62;
        $peso = round($d['imc'] * ($talla ** 2), 2);
        $fisica = EvaluacionFisicaEndocrina::withTrashed()->updateOrCreate($base, [
            'peso' => $peso, 'talla' => $talla, 'imc' => $d['imc'],
            'circunferencia_cintura' => $d['cintura'], 'circunferencia_cadera' => $d['cintura'] + 12,
            'indice_cintura_cadera' => round($d['cintura'] / ($d['cintura'] + 12), 2),
            'presion_sistolica' => 120, 'presion_diastolica' => 80,
            'acantosis_nigricans' => $ri['confirmada'], 'skin_tags' => false, 'galactorrea' => false,
            'hirsutismo_visible' => $cumplePmos, 'puntaje_ferriman_gallwey' => $cumplePmos ? 11 : 3,
            'acne_visible' => $cumplePmos, 'alopecia_visible' => false,
            'observaciones' => 'Evaluación física endocrina de prueba.', 'estado' => 'activo', 'deleted_at' => null,
        ]);
        $androgenico = ResultadoPerfilAndrogenico::withTrashed()->updateOrCreate($lab, [
            'fecha_resultado' => self::FECHA, 'testosterona_total' => $cumplePmos ? 70 : 38,
            'testosterona_libre' => $cumplePmos ? 5.5 : 2.1, 'shbg' => 30,
            'indice_androgenico_libre' => $cumplePmos ? 9.5 : 3.0, 'dhea_s' => $cumplePmos ? 350 : 220,
            'androstenediona' => $cumplePmos ? 3.1 : 1.8, 'hiperandrogenismo_bioquimico' => $cumplePmos,
            'interpretacion' => 'Perfil androgénico controlado.', 'estado' => 'registrado', 'deleted_at' => null,
        ]);
        $gonadotropo = ResultadoPerfilGonadotropo::withTrashed()->updateOrCreate($lab, [
            'fecha_resultado' => self::FECHA, 'lh' => $cumplePmos ? 11 : 6, 'fsh' => 5,
            'relacion_lh_fsh' => $cumplePmos ? 2.2 : 1.2, 'estradiol' => 55,
            'progesterona' => $cumplePmos ? 2.1 : 8, 'progesterona_dia_ciclo' => 21,
            'progesterona_fase_ciclo' => 'lutea', 'interpretacion' => 'Perfil gonadotropo controlado.',
            'estado' => 'registrado', 'deleted_at' => null,
        ]);
        $diferencial = ResultadoDiferencialEndocrino::withTrashed()->updateOrCreate($lab, [
            'fecha_resultado' => self::FECHA, 'tsh' => 2.0, 't3_libre' => 3.1, 't4_libre' => 1.1,
            'prolactina' => 13, 'diecisiete_oh_progesterona' => 1.1, 'cortisol' => 13,
            'alteracion_tiroidea_descartada' => true, 'hiperprolactinemia_descartada' => true,
            'hiperplasia_suprarrenal_descartada' => true, 'cushing_descartado' => true,
            'interpretacion' => 'Diagnósticos diferenciales descartados.', 'estado' => 'registrado', 'deleted_at' => null,
        ]);
        $glucosa = ResultadoGlucosaInsulina::withTrashed()->updateOrCreate($lab, [
            'fecha_resultado' => self::FECHA, 'glucosa_ayunas' => $ri['glucosa'],
            'insulina_ayunas' => $ri['insulina'], 'homa_ir' => $ri['homa'],
            'hemoglobina_glicosilada' => $ri['hba1c'], 'hiperinsulinemia' => $ri['confirmada'],
            'resistencia_insulina_sugerida' => $ri['confirmada'],
            'interpretacion' => 'Evaluación glucosa-insulina de prueba.', 'estado' => 'registrado', 'deleted_at' => null,
        ]);
        $lipidico = ResultadoPerfilLipidico::withTrashed()->updateOrCreate($lab, [
            'fecha_resultado' => self::FECHA, 'colesterol_total' => $ri['confirmada'] ? 210 : 175,
            'hdl' => $ri['hdl'], 'ldl' => $ri['confirmada'] ? 135 : 105, 'vldl' => 30,
            'trigliceridos' => $ri['trigliceridos'], 'colesterol_no_hdl' => $ri['confirmada'] ? 168 : 125,
            'dislipidemia_sugerida' => $ri['trigliceridos'] >= 150,
            'interpretacion' => 'Perfil lipídico de prueba.', 'estado' => 'registrado', 'deleted_at' => null,
        ]);
        $eco = EvaluacionEcografica::withTrashed()->updateOrCreate($lab, [
            'fecha_ecografia' => self::FECHA, 'tipo_ecografia' => 'transvaginal',
            'volumen_ovario_derecho' => $cumplePmos ? 12 : 8, 'volumen_ovario_izquierdo' => $cumplePmos ? 11.5 : 8,
            'foliculos_ovario_derecho' => $cumplePmos ? 22 : 10, 'foliculos_ovario_izquierdo' => $cumplePmos ? 21 : 9,
            'morfologia_compatible_pmos' => $cumplePmos, 'distribucion_periferica' => $cumplePmos,
            'observaciones' => 'Ecografía de prueba.', 'estado' => 'registrada', 'deleted_at' => null,
        ]);

        DiagnosticoPmos::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_diagnostico' => self::FECHA],
            $lab + [
                'id_historia_menstrual' => $menstrual->getKey(), 'id_historia_hiperandrogenica' => $hiper->getKey(),
                'id_perfil_androgenico' => $androgenico->getKey(), 'id_perfil_gonadotropo' => $gonadotropo->getKey(),
                'id_diferencial_endocrino' => $diferencial->getKey(), 'id_ecografia' => $eco->getKey(),
                'fecha_diagnostico' => self::FECHA, 'cumple_alteracion_ovulatoria' => $cumplePmos,
                'cumple_hiperandrogenismo_clinico' => $cumplePmos, 'cumple_hiperandrogenismo_bioquimico' => $cumplePmos,
                'cumple_hiperandrogenismo' => $cumplePmos, 'tipo_hiperandrogenismo' => $cumplePmos ? 'clinico_y_bioquimico' : 'ninguno',
                'cumple_morfologia_ovarica' => $cumplePmos, 'total_criterios_rotterdam' => $cumplePmos ? 3 : 0,
                'fenotipo_pmos' => $d['fenotipo'] ?? ($cumplePmos ? 'A_clasico_completo' : 'no_aplica'),
                'diagnostico_confirmado' => $cumplePmos, 'diagnosticos_diferenciales_descartados' => true,
                'severidad_clinica' => $cumplePmos ? 'moderada' : 'no_clasificada',
                'riesgo_metabolico' => $ri['confirmada'] ? 'alto' : 'bajo',
                'conclusion_medica' => $cumplePmos ? 'Diagnóstico PMOS confirmado.' : 'PMOS no confirmado.',
                'recomendaciones_medicas' => 'Seguimiento endocrinológico.', 'generado_por_motor_experto' => true,
                'criterios_rotterdam_cumplidos' => $cumplePmos ? ['alteracion_ovulatoria', 'hiperandrogenismo', 'morfologia_ovarica'] : [],
                'reglas_activadas' => ['PMOS-ROTTERDAM'], 'confianza_experta' => 0.95,
                'version_motor_experto' => 'seed-prueba-v1', 'evaluado_por_motor_experto_en' => now(),
                'estado_validacion_experta' => 'aprobado', 'validado_por' => $endocrinologo->id,
                'fecha_validacion' => now(), 'estado' => 'activo', 'deleted_at' => null,
            ]
        );
        DiagnosticoResistenciaInsulina::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_diagnostico' => self::FECHA],
            $lab + [
                'id_glucosa_insulina' => $glucosa->getKey(), 'id_perfil_lipidico' => $lipidico->getKey(),
                'id_evaluacion_fisica' => $fisica->getKey(), 'fecha_diagnostico' => self::FECHA,
                'homa_ir' => $ri['homa'], 'quicki' => $this->quicki($ri['glucosa'], $ri['insulina']),
                'glucosa_ayunas' => $ri['glucosa'], 'insulina_ayunas' => $ri['insulina'],
                'hemoglobina_glicosilada' => $ri['hba1c'], 'resistencia_confirmada' => $ri['confirmada'],
                'grado_resistencia' => $ri['grado'], 'riesgo_diabetes' => $ri['confirmada'] ? 'alto' : 'bajo',
                'riesgo_cardiometabolico' => $ri['confirmada'] ? 'alto' : 'bajo',
                'conclusion_medica' => $ri['confirmada'] ? 'Resistencia a la insulina confirmada.' : 'Sin resistencia a la insulina.',
                'recomendaciones_medicas' => 'Seguimiento metabólico.', 'generado_por_motor_experto' => true,
                'reglas_activadas' => ['RI-HOMA'], 'confianza_experta' => 0.93,
                'version_motor_experto' => 'seed-prueba-v1', 'evaluado_por_motor_experto_en' => now(),
                'estado_validacion_experta' => 'aprobado', 'validado_por' => $endocrinologo->id,
                'fecha_validacion' => now(), 'estado' => 'activo', 'deleted_at' => null,
            ]
        );
    }

    private function crearDatosNutricionales(Paciente $paciente, User $nutricionista, array $d): void
    {
        $consulta = ConsultaNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_consulta' => self::FECHA],
            ['id_nutricionista' => $nutricionista->id, 'motivo_consulta' => $d['objetivo'],
                'estado_consulta' => 'abierta', 'observaciones_generales' => 'Consulta nutricional de prueba.',
                'estado' => true, 'deleted_at' => null]
        );
        $base = ['id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->id,
            'id_consulta_nutricional' => $consulta->getKey()];
        $talla = 1.62;
        $evaluacion = EvaluacionNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_evaluacion' => self::FECHA],
            $base + ['fecha_evaluacion' => self::FECHA, 'peso' => round($d['imc'] * $talla ** 2, 2),
                'talla' => $talla, 'imc' => $d['imc'], 'circunferencia_cintura' => $d['cintura'],
                'circunferencia_cadera' => $d['cintura'] + 12,
                'indice_cintura_cadera' => round($d['cintura'] / ($d['cintura'] + 12), 2),
                'porcentaje_grasa' => $d['imc'] + 7, 'masa_muscular' => 25,
                'nivel_actividad' => $d['actividad'], 'observaciones' => 'Evaluación nutricional de prueba.',
                'estado' => true, 'deleted_at' => null]
        );

        if ($d['incompleta'] ?? false) return;

        HabitoAlimentario::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_consulta_nutricional' => $consulta->getKey()],
            $base + array_merge([
                'comidas_por_dia' => 4, 'horarios_regulares' => true, 'consume_desayuno' => true,
                'consumo_agua_litros' => 2, 'consumo_azucar' => 'ocasional',
                'consumo_ultraprocesados' => 'ocasional', 'consumo_frituras' => 'ocasional',
                'consumo_bebidas_azucaradas' => 'nunca', 'frecuencia_frutas_verduras' => 'diario',
                'cena_tardia' => false, 'ansiedad_por_comida' => false, 'hambre_nocturna' => false,
                'estado' => true, 'deleted_at' => null,
            ], $d['habitos'])
        );
        PreferenciaAlimentaria::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_consulta_nutricional' => $consulta->getKey()],
            $base + $d['preferencias'] + ['estado' => true, 'deleted_at' => null]
        );
        RestriccionAlimentaria::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_consulta_nutricional' => $consulta->getKey()],
            $base + $d['restricciones'] + ['estado' => true, 'deleted_at' => null]
        );
        $objetivo = ObjetivoNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_consulta_nutricional' => $consulta->getKey()],
            $base + ['objetivo_principal' => $d['objetivo'], 'objetivo_secundario' => 'Mejorar salud metabólica.',
                'meta_peso' => round($evaluacion->peso * 0.92, 2), 'meta_cintura' => max(70, $d['cintura'] - 6),
                'plazo_semanas' => 16, 'enfoque_nutricional' => $d['ri']['confirmada'] ? 'bajo_indice_glucemico' : 'balanceado',
                'prioridad' => $d['ri']['confirmada'] ? 'alta' : 'media', 'estado' => true, 'deleted_at' => null]
        );
        $calorias = $d['imc'] >= 30 ? 1600 : ($d['imc'] >= 27 ? 1700 : 1900);
        RequerimientoNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_calculo' => self::FECHA],
            $base + ['id_evaluacion_nutricional' => $evaluacion->getKey(), 'id_objetivo_nutricional' => $objetivo->getKey(),
                'fecha_calculo' => self::FECHA, 'peso_referencia' => $evaluacion->peso, 'talla_referencia' => $talla,
                'edad_referencia' => $d['edad'], 'nivel_actividad' => $d['actividad'],
                'factor_actividad' => $d['actividad'] === 'moderado' ? 1.55 : ($d['actividad'] === 'sedentario' ? 1.2 : 1.375),
                'tmb' => 1450, 'get' => 1950, 'ajuste_calorico' => $d['objetivo'] === 'mantenimiento' ? 0 : -300,
                'calorias_objetivo' => $calorias, 'proteinas_diarias' => round($calorias * .30 / 4, 2),
                'carbohidratos_diarios' => round($calorias * .35 / 4, 2), 'grasas_diarias' => round($calorias * .35 / 9, 2),
                'fibra_diaria' => 30, 'porcentaje_proteinas' => 30, 'porcentaje_carbohidratos' => 35,
                'porcentaje_grasas' => 35, 'metodo_calculo' => 'escenario_controlado',
                'reglas_aplicadas' => [['codigo' => 'SEED-TEST', 'nombre' => 'Escenario controlado']],
                'estado' => true, 'deleted_at' => null]
        );
    }

    private function quicki(float $glucosa, float $insulina): float
    {
        return round(1 / (log10($glucosa) + log10($insulina)), 4);
    }

    private function escenarios(): array
    {
        $ri = fn (bool $confirmada, float $homa, string $grado, float $glucosa = 90, float $insulina = 9,
            float $hba1c = 5.3, float $tg = 120, float $hdl = 50): array => compact(
                'confirmada', 'homa', 'grado', 'glucosa', 'insulina', 'hba1c', 'tg', 'hdl'
            ) + ['trigliceridos' => $tg];
        $basePreferencias = fn (string $preferidos, string $comidas, ?string $noPreferidos = null): array => [
            'alimentos_preferidos' => $preferidos, 'alimentos_no_preferidos' => $noPreferidos,
            'comidas_preferidas' => $comidas, 'comidas_frecuentes' => $comidas,
            'preparaciones_preferidas' => 'horno, plancha', 'sabores_preferidos' => 'salado',
        ];
        $restricciones = fn (?string $alergias = null, ?string $intolerancias = null,
            ?string $restringidos = null, ?string $noTolerados = null, ?string $rechazados = null): array => [
                'alergias' => $alergias, 'intolerancias' => $intolerancias,
                'alimentos_restringidos' => $restringidos, 'alimentos_no_tolerados' => $noTolerados,
                'alimentos_rechazados' => $rechazados,
            ];

        return [
            ['nombre'=>'Paciente PMOS RI Alergia','email'=>'paciente.pmos.ri.alergia@pmos.test','edad'=>25,'fecha_nacimiento'=>'2001-04-10','pmos'=>true,'ri'=>$ri(true,3.8,'moderada',102,15,5.8,170,42),'imc'=>29,'cintura'=>92,'actividad'=>'bajo','objetivo'=>'perdida_peso','preferencias'=>$basePreferencias('pollo, quinua, palta','omelette, ensalada de pollo'),'restricciones'=>$restricciones('maní','lactosa',null,null,'pescado'),'habitos'=>['cena_tardia'=>true,'ansiedad_por_comida'=>true,'consumo_agua_litros'=>1]],
            ['nombre'=>'Paciente PMOS Sin RI','email'=>'paciente.pmos.sinri@pmos.test','edad'=>28,'fecha_nacimiento'=>'1998-03-15','pmos'=>true,'ri'=>$ri(false,1.9,'no_aplica'),'imc'=>24,'cintura'=>76,'actividad'=>'moderado','objetivo'=>'mantenimiento','preferencias'=>$basePreferencias('yogur natural, avena, frutas','yogur con avena, ensaladas'),'restricciones'=>$restricciones(),'habitos'=>['horarios_regulares'=>true]],
            ['nombre'=>'Paciente RI Severa','email'=>'paciente.ri.severa@pmos.test','edad'=>32,'fecha_nacimiento'=>'1994-02-12','pmos'=>false,'ri'=>$ri(true,5.5,'severa',115,19,6.1,210,38),'imc'=>31,'cintura'=>101,'actividad'=>'sedentario','objetivo'=>'control_glucemico','preferencias'=>$basePreferencias('pollo, huevo, verduras','pollo con verduras'),'restricciones'=>$restricciones(null,null,null,null,'arroz, pan'),'habitos'=>['consumo_bebidas_azucaradas'=>'diario','consumo_azucar'=>'diario','hambre_nocturna'=>true]],
            ['nombre'=>'Paciente Restricciones Multiples','email'=>'paciente.restricciones@pmos.test','edad'=>23,'fecha_nacimiento'=>'2003-05-20','pmos'=>true,'ri'=>$ri(true,2.7,'leve'),'imc'=>26,'cintura'=>84,'actividad'=>'bajo','objetivo'=>'perdida_peso','preferencias'=>$basePreferencias('huevo, pollo, avena','omelette'),'restricciones'=>$restricciones('nueces, almendras','lactosa','atún','garbanzos','brócoli'),'habitos'=>['consume_desayuno'=>false,'horarios_regulares'=>false]],
            ['nombre'=>'Paciente Preferencias Marcadas','email'=>'paciente.preferencias@pmos.test','edad'=>30,'fecha_nacimiento'=>'1996-01-18','pmos'=>true,'ri'=>$ri(false,1.8,'no_aplica'),'imc'=>25,'cintura'=>79,'actividad'=>'moderado','objetivo'=>'mejorar_habitos','preferencias'=>$basePreferencias('avena, yogur natural, frutilla, pollo','avena con chía, pollo con quinua','lentejas') + ['sabores_preferidos'=>'dulce suave, salado'],'restricciones'=>$restricciones(),'habitos'=>[]],
            ['nombre'=>'Paciente Datos Incompletos','email'=>'paciente.incompleta@pmos.test','edad'=>27,'fecha_nacimiento'=>'1999-06-14','pmos'=>null,'ri'=>$ri(false,0,'no_evaluada'),'imc'=>23,'cintura'=>74,'actividad'=>'bajo','objetivo'=>'evaluacion_inicial','preferencias'=>[],'restricciones'=>[],'habitos'=>[],'incompleta'=>true],
            ['nombre'=>'Paciente Fenotipo A RI','email'=>'paciente.fenotipoa@pmos.test','edad'=>26,'fecha_nacimiento'=>'2000-03-11','pmos'=>true,'fenotipo'=>'A_clasico_completo','ri'=>$ri(true,3.4,'moderada'),'imc'=>28,'cintura'=>88,'actividad'=>'bajo','objetivo'=>'perdida_grasa_control_metabolico','preferencias'=>$basePreferencias('pescado, verduras, quinua','pescado con verduras'),'restricciones'=>$restricciones(null,null,null,null,'carne roja'),'habitos'=>['ansiedad_por_comida'=>true]],
            ['nombre'=>'Paciente Plan Completo','email'=>'paciente.plancompleto@pmos.test','edad'=>29,'fecha_nacimiento'=>'1997-04-09','pmos'=>true,'ri'=>$ri(true,2.9,'leve'),'imc'=>27,'cintura'=>86,'actividad'=>'ligero','objetivo'=>'perdida_peso','preferencias'=>$basePreferencias('pollo, huevo, quinua, palta, yogur natural','omelette, pollo con quinua, yogur con chía'),'restricciones'=>$restricciones(null,null,null,null,'atún'),'habitos'=>['consumo_agua_litros'=>1.2,'cena_tardia'=>true]],
        ];
    }
}
