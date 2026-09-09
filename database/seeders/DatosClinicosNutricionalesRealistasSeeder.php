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
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatosClinicosNutricionalesRealistasSeeder extends Seeder
{
    public const TOTAL_PACIENTES = 70;
    public const EMAIL_ENDOCRINOLOGIA = 'valeria.mendoza@nutrigo.bo';
    public const EMAIL_NUTRICION = 'daniela.rojas@nutrigo.bo';

    private const CI_BASE = 8308424;

    public function run(): void
    {
        DB::transaction(function (): void {
            $endocrinologo = $this->profesional(
                self::EMAIL_ENDOCRINOLOGIA,
                'Dra. Valeria Mendoza',
                'endocrinologo',
                ['endocrinologia.datos@nutrigo.test'],
            );
            $nutricionista = $this->profesional(
                self::EMAIL_NUTRICION,
                'Lic. Daniela Rojas',
                'nutricionista',
                ['nutricion.datos@nutrigo.test'],
            );

            foreach ($this->pacientes() as $indice => $datos) {
                $this->crearExpediente($indice + 1, $datos, $endocrinologo, $nutricionista);
            }
        });

        $this->command?->info('Cohorte clínica: 70 expedientes completos con datos consistentes creados o actualizados.');
    }

    /** @return array<int, string> */
    public static function identificacionesPacientes(): array
    {
        return array_map(
            fn (int $numero): string => self::identificacionPaciente($numero),
            range(1, self::TOTAL_PACIENTES),
        );
    }

    public static function identificacionPaciente(int $numero): string
    {
        return (string) (self::CI_BASE + (($numero - 1) * 137));
    }

    private function crearExpediente(int $numero, array $d, User $endocrinologo, User $nutricionista): void
    {
        $email = sprintf(
            '%s.%02d@nutrigo.bo',
            Str::of("{$d['nombres']}.{$d['paterno']}")->ascii()->lower()->replaceMatches('/[^a-z0-9]+/', '.')->trim('.'),
            $numero,
        );
        $correoAnterior = sprintf('paciente.demo.%03d@nutrigo.test', $numero);
        $correoTemporal = sprintf(
            '%s.%02d@gmail.test',
            Str::of("{$d['nombres']}.{$d['paterno']}")->ascii()->lower()->replaceMatches('/[^a-z0-9]+/', '.')->trim('.'),
            $numero,
        );
        $usuario = $this->profesional(
            $email,
            "{$d['nombres']} {$d['paterno']}",
            'paciente',
            [$correoAnterior, $correoTemporal],
        );

        $ci = self::identificacionPaciente($numero);
        $paciente = Paciente::withTrashed()
            ->where('ci', $ci)
            ->orWhere('ci', sprintf('DEMO-%06d', $numero))
            ->orWhere('user_id', $usuario->id)
            ->firstOrNew();
        $paciente->forceFill([
            'ci' => $ci, 'user_id' => $usuario->id, 'nombres' => $d['nombres'], 'apellido_paterno' => $d['paterno'],
            'apellido_materno' => $d['materno'], 'fecha_nacimiento' => $d['nacimiento'], 'sexo' => 'femenino',
            'telefono' => '7'.str_pad((string) (1000000 + $numero * 7919), 7, '0', STR_PAD_LEFT),
            'direccion' => $d['direccion'], 'ocupacion' => $d['ocupacion'], 'estado_civil' => $d['estado_civil'],
            'fecha_registro' => Carbon::today('America/La_Paz')->subDays(90 + ($numero % 180))->toDateString(), 'estado' => 'activo',
            'observaciones' => 'Paciente derivada para valoración endocrinológica y acompañamiento nutricional integral.',
            'deleted_at' => null,
        ])->save();
        if ($paciente->trashed()) $paciente->restore();

        $fecha = Carbon::today('America/La_Paz')->subDays(12 + ($numero % 45))->toDateString();
        $consultaEndo = ConsultaEndocrinologica::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_consulta' => $fecha],
            ['id_endocrinologo' => $endocrinologo->id, 'motivo_consulta' => $d['motivo'],
                'sospecha_pmos' => $d['pmos'], 'sospecha_resistencia_insulina' => $d['ri'],
                'observaciones_generales' => 'Valoración endocrinológica integral con revisión de antecedentes, síntomas y perfil metabólico.',
                'estado' => 'cerrada', 'deleted_at' => null]
        );
        if ($consultaEndo->trashed()) $consultaEndo->restore();

        $criterios = $d['pmos'] ? (($numero % 3) + 2 > 3 ? 3 : 2) : ($numero % 2);
        DiagnosticoPmos::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_diagnostico' => $fecha],
            ['id_consulta_endocrinologica' => $consultaEndo->getKey(), 'id_endocrinologo' => $endocrinologo->id,
                'cumple_alteracion_ovulatoria' => $d['pmos'], 'cumple_hiperandrogenismo_clinico' => $d['pmos'],
                'cumple_hiperandrogenismo_bioquimico' => $d['pmos'] && $numero % 2 === 0,
                'cumple_hiperandrogenismo' => $d['pmos'], 'tipo_hiperandrogenismo' => $d['pmos'] ? 'clinico' : 'ninguno',
                'cumple_morfologia_ovarica' => $d['pmos'] && $criterios === 3,
                'total_criterios_rotterdam' => $criterios, 'fenotipo_pmos' => $d['pmos'] ? $d['fenotipo'] : 'no_aplica',
                'diagnostico_confirmado' => $d['pmos'], 'diagnosticos_diferenciales_descartados' => true,
                'severidad_clinica' => $d['pmos'] ? $d['severidad'] : 'no_clasificada',
                'riesgo_metabolico' => $d['ri'] ? 'alto' : 'bajo',
                'conclusion_medica' => $d['pmos'] ? 'Hallazgos compatibles con PMOS según criterios de Rotterdam.' : 'No reúne criterios diagnósticos para PMOS.',
                'recomendaciones_medicas' => 'Mantener controles clínicos y metabólicos periódicos.',
                'generado_por_motor_experto' => false, 'estado_validacion_experta' => 'aprobado',
                'validado_por' => $endocrinologo->id, 'fecha_validacion' => $fecha, 'estado' => 'registrado',
                'deleted_at' => null]
        );

        $glucosa = $d['ri'] ? 96 + ($numero % 15) : 78 + ($numero % 15);
        $insulina = $d['ri'] ? 14 + ($numero % 8) : 6 + ($numero % 5);
        $homa = round($glucosa * $insulina / 405, 2);
        DiagnosticoResistenciaInsulina::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_diagnostico' => $fecha],
            ['id_consulta_endocrinologica' => $consultaEndo->getKey(), 'id_endocrinologo' => $endocrinologo->id,
                'homa_ir' => $homa, 'quicki' => round(1 / (log10($glucosa) + log10($insulina)), 4),
                'glucosa_ayunas' => $glucosa, 'insulina_ayunas' => $insulina,
                'hemoglobina_glicosilada' => $d['ri'] ? 5.7 + (($numero % 4) / 10) : 5.1 + (($numero % 4) / 10),
                'resistencia_confirmada' => $d['ri'], 'grado_resistencia' => $d['ri'] ? $d['grado_ri'] : 'no_aplica',
                'riesgo_diabetes' => $d['ri'] ? 'moderado' : 'bajo',
                'riesgo_cardiometabolico' => $d['ri'] ? 'moderado' : 'bajo',
                'conclusion_medica' => $d['ri'] ? 'Índices bioquímicos compatibles con resistencia a la insulina.' : 'Sin evidencia actual de resistencia a la insulina.',
                'recomendaciones_medicas' => 'Control de glucosa, insulina y perfil lipídico según evolución.',
                'generado_por_motor_experto' => false, 'estado_validacion_experta' => 'aprobado',
                'validado_por' => $endocrinologo->id, 'fecha_validacion' => $fecha, 'estado' => 'registrado',
                'deleted_at' => null]
        );

        $consultaNutri = ConsultaNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_consulta' => $fecha],
            ['id_nutricionista' => $nutricionista->id, 'motivo_consulta' => $d['objetivo'],
                'estado_consulta' => 'cerrada', 'observaciones_generales' => 'Evaluación nutricional inicial integral.',
                'estado' => true, 'deleted_at' => null]
        );
        if ($consultaNutri->trashed()) $consultaNutri->restore();
        $base = ['id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->id,
            'id_consulta_nutricional' => $consultaNutri->getKey()];
        $talla = round(1.52 + (($numero % 15) * .01), 2);
        $imc = round(21.5 + (($numero * 7) % 125) / 10, 1);
        $peso = round($imc * ($talla ** 2), 2);
        $cintura = round(68 + max(0, $imc - 21) * 2.4, 1);
        $evaluacion = EvaluacionNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_evaluacion' => $fecha],
            $base + ['fecha_evaluacion' => $fecha, 'peso' => $peso, 'talla' => $talla, 'imc' => $imc,
                'circunferencia_cintura' => $cintura, 'circunferencia_cadera' => $cintura + 14,
                'indice_cintura_cadera' => round($cintura / ($cintura + 14), 2),
                'porcentaje_grasa' => round(24 + max(0, $imc - 21) * .8, 1), 'masa_muscular' => round($peso * .34, 1),
                'nivel_actividad' => $d['actividad'], 'observaciones' => 'Mediciones antropométricas tomadas durante la consulta nutricional inicial.',
                'estado' => true, 'deleted_at' => null]
        );
        HabitoAlimentario::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_consulta_nutricional' => $consultaNutri->getKey()],
            $base + ['comidas_por_dia' => 3 + ($numero % 3), 'horarios_regulares' => $numero % 3 !== 0,
                'consume_desayuno' => $numero % 5 !== 0, 'consumo_agua_litros' => 1.2 + (($numero % 6) * .2),
                'consumo_azucar' => $numero % 4 === 0 ? 'frecuente' : 'ocasional',
                'consumo_ultraprocesados' => $numero % 5 === 0 ? 'frecuente' : 'ocasional',
                'consumo_frituras' => 'ocasional', 'consumo_bebidas_azucaradas' => $numero % 6 === 0 ? 'frecuente' : 'ocasional',
                'frecuencia_frutas_verduras' => $numero % 3 === 0 ? '3_a_4_veces_semana' : 'diario',
                'cena_tardia' => $numero % 4 === 0, 'ansiedad_por_comida' => $numero % 5 === 0,
                'hambre_nocturna' => $numero % 7 === 0, 'observaciones' => 'Patrón alimentario referido en consulta.',
                'estado' => true, 'deleted_at' => null]
        );
        PreferenciaAlimentaria::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_consulta_nutricional' => $consultaNutri->getKey()],
            $base + ['alimentos_preferidos' => $d['preferidos'], 'alimentos_no_preferidos' => $d['no_preferidos'],
                'comidas_preferidas' => $d['comidas'], 'comidas_frecuentes' => $d['comidas'],
                'preparaciones_preferidas' => $d['preparacion'], 'sabores_preferidos' => $numero % 2 ? 'salado' : 'dulce suave',
                'estado' => true, 'deleted_at' => null]
        );
        RestriccionAlimentaria::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_consulta_nutricional' => $consultaNutri->getKey()],
            $base + $d['restricciones'] + ['observaciones' => 'Restricciones verificadas durante anamnesis.',
                'estado' => true, 'deleted_at' => null]
        );
        $objetivo = ObjetivoNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'id_consulta_nutricional' => $consultaNutri->getKey()],
            $base + ['objetivo_principal' => $d['objetivo'], 'objetivo_secundario' => 'Mejorar composición corporal y salud metabólica.',
                'meta_peso' => round(max(48, $peso - ($imc >= 25 ? $peso * .07 : 0)), 2),
                'meta_cintura' => round(max(68, $cintura - ($imc >= 25 ? 5 : 0)), 1),
                'plazo_semanas' => 12 + (($numero % 5) * 2),
                'enfoque_nutricional' => $d['ri'] ? 'bajo_indice_glucemico' : 'alimentacion_equilibrada',
                'prioridad' => ($d['pmos'] && $d['ri']) ? 'alta' : 'media', 'estado' => true, 'deleted_at' => null]
        );
        $tmb = round(10 * $peso + 6.25 * ($talla * 100) - 5 * $d['edad'] - 161, 2);
        $factor = match ($d['actividad']) {'sedentario' => 1.2, 'ligero' => 1.375, 'moderado' => 1.55, default => 1.725};
        $get = round($tmb * $factor, 2);
        $calorias = round(max(1300, $get - ($imc >= 25 ? 300 : 0)), 2);
        RequerimientoNutricional::withTrashed()->updateOrCreate(
            ['id_paciente' => $paciente->getKey(), 'fecha_calculo' => $fecha],
            $base + ['id_evaluacion_nutricional' => $evaluacion->getKey(), 'id_objetivo_nutricional' => $objetivo->getKey(),
                'fecha_calculo' => $fecha, 'peso_referencia' => $peso, 'talla_referencia' => $talla,
                'edad_referencia' => $d['edad'], 'nivel_actividad' => $d['actividad'], 'factor_actividad' => $factor,
                'tmb' => $tmb, 'get' => $get, 'ajuste_calorico' => $imc >= 25 ? -300 : 0,
                'calorias_objetivo' => $calorias, 'proteinas_diarias' => round($calorias * .30 / 4, 2),
                'carbohidratos_diarios' => round($calorias * .35 / 4, 2), 'grasas_diarias' => round($calorias * .35 / 9, 2),
                'fibra_diaria' => 30, 'porcentaje_proteinas' => 30, 'porcentaje_carbohidratos' => 35,
                'porcentaje_grasas' => 35, 'metodo_calculo' => 'mifflin_st_jeor',
                'observaciones' => 'Cálculo individualizado según antropometría, nivel de actividad y objetivo terapéutico.', 'estado' => true, 'deleted_at' => null]
        );
    }

    /** @param array<int, string> $correosAnteriores */
    private function profesional(string $email, string $nombre, string $rol, array $correosAnteriores = []): User
    {
        $modeloRol = Role::withTrashed()->updateOrCreate(['nombre' => $rol], ['descripcion' => ucfirst($rol), 'estado' => 'activo', 'deleted_at' => null]);
        if ($modeloRol->trashed()) $modeloRol->restore();
        $usuario = User::withTrashed()->where('email', $email)->first();
        if (! $usuario && $correosAnteriores !== []) {
            $usuario = User::withTrashed()->whereIn('email', $correosAnteriores)->first();
        }
        $usuario ??= new User();
        $usuario->forceFill([
            'email' => $email,
            'name' => $nombre,
            'password' => $usuario->exists ? $usuario->password : Hash::make('password'),
            'estado' => 'activo',
            'deleted_at' => null,
        ])->save();
        if ($usuario->trashed()) $usuario->restore();
        $usuario->forceFill(['email_verified_at' => now()])->save();
        $asignacion = UserRole::withTrashed()->firstOrNew(['user_id' => $usuario->id, 'id_rol' => $modeloRol->id_rol]);
        $asignacion->forceFill(['estado' => 'activo', 'deleted_at' => null])->save();
        return $usuario;
    }

    private function pacientes(): array
    {
        $nombres = ['María Fernanda','Valentina','Camila Andrea','Daniela','Gabriela','Alejandra','Carolina','Luciana','Natalia','Paola','Andrea','Fernanda','Sofía','Mariana'];
        $paternos = ['Mamani','Quispe','Flores','Condori','Vargas','Rojas','Mendoza','Gutiérrez','Choque','Fernández'];
        $maternos = ['López','Rivera','Torrez','Castro','Romero','Salazar','Paredes'];
        $ciudades = ['La Paz','El Alto','Cochabamba','Santa Cruz','Sucre','Oruro','Tarija'];
        $ocupaciones = ['Estudiante universitaria','Contadora','Docente','Ingeniera comercial','Diseñadora gráfica','Enfermera','Abogada','Emprendedora','Administradora','Arquitecta'];
        $preferencias = [
            ['pollo, quinua, palta, tomate','brócoli','pollo con quinua, ensalada','horno, plancha'],
            ['avena, yogur sin lactosa, frutilla, chía','hígado','avena con fruta, omelette','hervido, plancha'],
            ['pescado, camote, verduras, arroz integral','berenjena','pescado al horno, sopa de verduras','horno, vapor'],
            ['huevo, lentejas, espinaca, manzana','atún','tortilla de verduras, guiso de lentejas','guisado, plancha'],
            ['carne magra, papa, ensalada, papaya','coliflor','carne con verduras, ensalada completa','horno, salteado'],
        ];
        $salida = [];
        $zonas = ['Sopocachi','Miraflores','Calacoto','Achumani','Queru Queru','Sarco','Equipetrol','Los Lotes','San Roque','Zona Central','Norte','Sud'];
        for ($i = 0; $i < self::TOTAL_PACIENTES; $i++) {
            $edad = 21 + ($i % 15);
            $pref = $preferencias[$i % count($preferencias)];
            $pmos = $i % 5 !== 0;
            $ri = $i % 3 !== 0;
            $restriccion = match ($i % 10) {
                1 => ['alergias'=>'maní','intolerancias'=>null,'alimentos_restringidos'=>null,'alimentos_no_tolerados'=>null,'alimentos_rechazados'=>null],
                2 => ['alergias'=>null,'intolerancias'=>'lactosa','alimentos_restringidos'=>null,'alimentos_no_tolerados'=>'leche','alimentos_rechazados'=>null],
                3 => ['alergias'=>'mariscos','intolerancias'=>null,'alimentos_restringidos'=>'camarón','alimentos_no_tolerados'=>null,'alimentos_rechazados'=>null],
                4 => ['alergias'=>null,'intolerancias'=>'gluten','alimentos_restringidos'=>'trigo','alimentos_no_tolerados'=>'pan de trigo','alimentos_rechazados'=>null],
                default => ['alergias'=>null,'intolerancias'=>null,'alimentos_restringidos'=>null,'alimentos_no_tolerados'=>null,'alimentos_rechazados'=>$i % 6 === 0 ? 'pescado' : null],
            };
            $salida[] = [
                'nombres'=>$nombres[$i % count($nombres)], 'paterno'=>$paternos[$i % count($paternos)],
                'materno'=>$maternos[$i % count($maternos)], 'edad'=>$edad,
                'nacimiento'=>Carbon::today('America/La_Paz')->subYears($edad)->subDays(($i * 13) % 330)->toDateString(),
                'direccion'=>$zonas[$i % count($zonas)].', '.$ciudades[$i % count($ciudades)], 'ocupacion'=>$ocupaciones[$i % count($ocupaciones)],
                'estado_civil'=>['soltera','casada','conviviente'][$i % 3], 'pmos'=>$pmos, 'ri'=>$ri,
                'fenotipo'=>['A_clasico_completo','B_clasico_sin_morfologia','C_ovulatorio','D_no_hiperandrogenico'][$i % 4],
                'severidad'=>['leve','moderada','severa'][$i % 3], 'grado_ri'=>['leve','moderada','severa'][$i % 3],
                'motivo'=>$pmos ? 'Irregularidad menstrual y evaluación metabólica.' : 'Control endocrinológico preventivo.',
                'objetivo'=>$ri || $i % 2 === 0 ? 'perdida_peso' : 'mantenimiento',
                'actividad'=>['sedentario','ligero','moderado','alto'][$i % 4],
                'preferidos'=>$pref[0], 'no_preferidos'=>$pref[1], 'comidas'=>$pref[2], 'preparacion'=>$pref[3],
                'restricciones'=>$restriccion,
            ];
        }
        return $salida;
    }
}
