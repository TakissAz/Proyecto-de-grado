<?php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\ComidaPlanAlimentario;
use App\Models\DerivacionNutricional;
use App\Models\DiaPlanAlimentario;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\RequerimientoNutricional;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\RetroalimentacionPaciente;
use App\Models\SeguimientoComida;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class FlujoOperativoNutricionalRealistaSeeder extends Seeder
{
    private const HOY = '2026-08-31';

    public function run(): void
    {
        $endocrinologo = User::query()->where('email', 'endocrinologia.datos@nutrigo.test')->first();
        $nutricionista = User::query()->where('email', 'nutricion.datos@nutrigo.test')->first();
        $pacientes = Paciente::query()->with('user')->where('ci', 'like', 'DEMO-%')->orderBy('ci')->get();

        if (! $endocrinologo || ! $nutricionista || $pacientes->count() !== 70) {
            throw new RuntimeException('Primero ejecuta DatosClinicosNutricionalesRealistasSeeder.');
        }

        DB::transaction(function () use ($pacientes, $endocrinologo, $nutricionista): void {
            foreach ($pacientes as $indice => $paciente) {
                $this->crearFlujo($indice + 1, $paciente, $endocrinologo, $nutricionista);
            }
        });

        $this->command?->info('Flujo operativo: 70 derivaciones, 140 citas, 70 planes y seguimientos semanales creados o actualizados.');
    }

    public function crearFlujo(int $numero, Paciente $paciente, User $endocrinologo, User $nutricionista): void
    {
        $inicio = Carbon::parse(self::HOY)->subDays(6);
        $estadoDerivacion = ['pendiente', 'vista', 'aceptada', 'atendida'][$numero % 4];
        DerivacionNutricional::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'origen'=>'diagnostico_endocrinologico'],
            ['id_endocrinologo'=>$endocrinologo->id, 'id_nutricionista'=>$nutricionista->id,
                'motivo_derivacion'=>$numero % 3 === 0
                    ? 'Resistencia a la insulina confirmada; requiere intervención nutricional individualizada.'
                    : 'PMOS confirmado; requiere acompañamiento nutricional y seguimiento metabólico.',
                'prioridad'=>$numero % 5 === 0 ? 'alta' : 'normal', 'estado'=>$estadoDerivacion,
                'fecha_derivacion'=>$inicio->copy()->subDays(10),
                'fecha_vista'=>$estadoDerivacion === 'pendiente' ? null : $inicio->copy()->subDays(9),
                'fecha_atencion'=>$estadoDerivacion === 'atendida' ? $inicio->copy()->subDays(7) : null,
                'observaciones'=>'Derivación coordinada entre endocrinología y nutrición.', 'deleted_at'=>null]
        );

        $this->cita($paciente, $endocrinologo, $inicio->copy()->subDays(14), 'endocrinologo', 'control_endocrinologico', 'atendida', $numero);
        $estadoCitaNutri = ['programada','confirmada','atendida','cancelada'][$numero % 4];
        $fechaNutri = in_array($estadoCitaNutri, ['programada','confirmada'], true)
            ? Carbon::parse(self::HOY)->addDays(1 + ($numero % 21))
            : $inicio->copy()->subDays(7);
        $this->cita($paciente, $nutricionista, $fechaNutri, 'nutricionista', 'seguimiento_nutricional', $estadoCitaNutri, $numero);

        $requerimiento = RequerimientoNutricional::query()->where('id_paciente', $paciente->getKey())->latest('fecha_calculo')->firstOrFail();
        $this->crearEvaluacionSeguimiento($numero, $paciente, $requerimiento, $nutricionista);
        $recomendacion = RecomendacionNutricionalExperta::withTrashed()->updateOrCreate(
            [
                'id_paciente' => $paciente->getKey(),
                'id_requerimiento_nutricional' => $requerimiento->getKey(),
            ],
            [
                'id_nutricionista' => $nutricionista->id,
                'enfoque_nutricional_experto' => $numero % 3 === 0
                    ? 'Control glucémico y alto aporte de fibra'
                    : 'Antiinflamatorio de bajo índice glucémico',
                'prioridad_nutricional' => $numero % 5 === 0 ? 'alta' : 'media',
                'calorias_sugeridas' => $requerimiento->calorias_objetivo,
                'proteinas_porcentaje' => $requerimiento->porcentaje_proteinas,
                'carbohidratos_porcentaje' => $requerimiento->porcentaje_carbohidratos,
                'grasas_porcentaje' => $requerimiento->porcentaje_grasas,
                'fibra_sugerida' => $requerimiento->fibra_diaria,
                'recomendaciones' => [
                    'Priorizar alimentos frescos, fibra y proteínas de buena calidad.',
                    'Mantener cuatro tiempos de comida con horarios regulares.',
                ],
                'restricciones' => [],
                'alertas' => [],
                'conclusion' => 'Orientación nutricional individualizada según perfil clínico y metabólico.',
                'generado_por_motor_experto' => true,
                'reglas_activadas' => ['NUTRICION-PERFIL-METABOLICO', 'NUTRICION-DISTRIBUCION-4-TIEMPOS'],
                'explicacion_experta' => 'La recomendación considera el requerimiento energético, los hábitos y el perfil endocrinológico disponible.',
                'confianza_experta' => 90,
                'version_motor_experto' => 'nutricion-seed-v1',
                'evaluado_por_motor_experto_en' => $inicio->copy()->subDays(2),
                'estado_validacion_experta' => 'aprobado',
                'validado_por' => $nutricionista->id,
                'fecha_validacion' => $inicio->copy()->subDay(),
                'observacion_validacion' => 'Recomendación revisada para escenario de seguimiento.',
                'estado' => 'pendiente',
                'deleted_at' => null,
            ]
        );
        if ($recomendacion->trashed()) $recomendacion->restore();
        $estadoPlan = $numero % 5 === 0 ? 'finalizado' : 'activo';
        $plan = PlanAlimentario::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'nombre'=>'Plan semanal de seguimiento'],
            ['id_nutricionista'=>$nutricionista->id,
                'id_recomendacion_nutricional_experta'=>$recomendacion->getKey(),
                'id_requerimiento_nutricional'=>$requerimiento->getKey(),
                'fecha_inicio'=>$inicio->toDateString(), 'fecha_fin'=>$inicio->copy()->addDays(6)->toDateString(),
                'duracion_dias'=>7, 'objetivo_plan'=>'Mejorar adherencia, composición corporal y control metabólico.',
                'calorias_objetivo'=>$requerimiento->calorias_objetivo,
                'proteinas_objetivo'=>$requerimiento->proteinas_diarias,
                'carbohidratos_objetivo'=>$requerimiento->carbohidratos_diarios,
                'grasas_objetivo'=>$requerimiento->grasas_diarias, 'fibra_objetivo'=>$requerimiento->fibra_diaria,
                'calorias_totales'=>round($requerimiento->calorias_objetivo * 7 * (.88 + (($numero % 8) / 100)), 2),
                'proteinas_totales'=>round($requerimiento->proteinas_diarias * 7 * .92, 2),
                'carbohidratos_totales'=>round($requerimiento->carbohidratos_diarios * 7 * .9, 2),
                'grasas_totales'=>round($requerimiento->grasas_diarias * 7 * .9, 2),
                'fibra_total'=>round($requerimiento->fibra_diaria * 7 * .94, 2),
                'estado_plan'=>$estadoPlan, 'generado_por_sistema_experto'=>true,
                'observaciones'=>'Plan semanal de demostración revisado por nutrición.',
                'fecha_aprobacion'=>$inicio->copy()->subDay(), 'aprobado_por'=>$nutricionista->id,
                'estado'=>'activo', 'deleted_at'=>null]
        );
        if ($plan->trashed()) $plan->restore();

        foreach (range(1, 7) as $diaNumero) {
            $fechaDia = $inicio->copy()->addDays($diaNumero - 1);
            $dia = DiaPlanAlimentario::withTrashed()->updateOrCreate(
                ['id_plan_alimentario'=>$plan->getKey(), 'numero_dia'=>$diaNumero],
                ['nombre_dia'=>$fechaDia->locale('es')->isoFormat('dddd'), 'fecha'=>$fechaDia->toDateString(),
                    'calorias_totales'=>round($requerimiento->calorias_objetivo * (.88 + (($diaNumero + $numero) % 8) / 100), 2),
                    'proteinas_totales'=>round($requerimiento->proteinas_diarias * .92, 2),
                    'carbohidratos_totales'=>round($requerimiento->carbohidratos_diarios * .9, 2),
                    'grasas_totales'=>round($requerimiento->grasas_diarias * .9, 2),
                    'fibra_total'=>round($requerimiento->fibra_diaria * .94, 2),
                    'estado'=>'activo', 'deleted_at'=>null]
            );
            if ($dia->trashed()) $dia->restore();

            foreach ($this->tiempos() as $orden => $tiempo) {
                [$tipo, $hora, $nombre, $porcentaje] = $tiempo;
                $comida = ComidaPlanAlimentario::withTrashed()->updateOrCreate(
                    ['id_dia_plan_alimentario'=>$dia->getKey(), 'tipo_comida'=>$tipo],
                    ['hora_sugerida'=>$hora, 'nombre_comida'=>$nombre,
                        'calorias_totales'=>round($requerimiento->calorias_objetivo * $porcentaje, 2),
                        'proteinas_totales'=>round($requerimiento->proteinas_diarias * $porcentaje, 2),
                        'carbohidratos_totales'=>round($requerimiento->carbohidratos_diarios * $porcentaje, 2),
                        'grasas_totales'=>round($requerimiento->grasas_diarias * $porcentaje, 2),
                        'fibra_total'=>round($requerimiento->fibra_diaria * $porcentaje, 2),
                        'observaciones'=>'Comida estructurada según requerimiento individual.', 'orden'=>$orden + 1,
                        'estado'=>'activo', 'deleted_at'=>null]
                );
                if ($comida->trashed()) $comida->restore();
                $this->seguimientoComida($numero, $diaNumero, $orden, $paciente, $plan, $dia, $comida, $nutricionista);
            }

            $sintoma = SeguimientoSintomaPaciente::withTrashed()->updateOrCreate(
                ['id_paciente'=>$paciente->getKey(), 'fecha_registro'=>$fechaDia->toDateString()],
                ['nivel_energia'=>['baja','media','alta'][($numero + $diaNumero) % 3],
                    'hambre_durante_dia'=>['baja','moderada','alta'][($numero + $diaNumero) % 3],
                    'ansiedad_por_comida'=>['ninguna','leve','moderada'][($numero + $diaNumero) % 3],
                    'antojos_dulces'=>['ninguno','leve','moderado'][($numero + $diaNumero) % 3],
                    'hambre_nocturna'=>($numero + $diaNumero) % 6 === 0,
                    'hinchazon_abdominal'=>['ninguna','leve','moderada'][($numero + $diaNumero) % 3],
                    'fatiga_post_comida'=>['ninguna','leve','moderada'][($numero + $diaNumero + 1) % 3],
                    'mareos_o_debilidad'=>false, 'acne'=>['ninguno','leve','moderado'][($numero + $diaNumero) % 3],
                    'dolor_menstrual'=>$diaNumero === 1 && $numero % 4 === 0 ? 'moderado' : 'ninguno',
                    'irregularidad_menstrual'=>$numero % 5 !== 0, 'cambios_estado_animo'=>'leve',
                    'calidad_sueno'=>['regular','buena','buena'][($numero + $diaNumero) % 3],
                    'horas_sueno'=>6.5 + (($diaNumero + $numero) % 4) * .5,
                    'actividad_fisica'=>$numero % 3 === 0 ? 'caminata' : 'entrenamiento ligero',
                    'minutos_actividad'=>20 + (($numero + $diaNumero) % 4) * 10,
                    'consumo_agua_litros'=>1.4 + (($numero + $diaNumero) % 5) * .2,
                    'observaciones'=>'Registro diario de síntomas y bienestar.', 'registrado_por'=>$paciente->user_id,
                    'deleted_at'=>null]
            );
            if ($sintoma->trashed()) $sintoma->restore();
        }

        RetroalimentacionPaciente::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'id_plan_alimentario'=>$plan->getKey(), 'tipo_retroalimentacion'=>'seguimiento_semanal'],
            ['id_usuario_emisor'=>$nutricionista->id, 'rol_emisor'=>'nutricionista',
                'mensaje'=>$numero % 4 === 0
                    ? 'Revisaremos horarios y saciedad para mejorar la adherencia de la siguiente semana.'
                    : 'Buen avance semanal. Mantén el registro de comidas, agua y síntomas.',
                'prioridad'=>$numero % 4 === 0 ? 'alta' : 'normal', 'visible_para_paciente'=>true,
                'leido_por_paciente'=>$numero % 3 !== 0,
                'fecha_lectura_paciente'=>$numero % 3 !== 0 ? $inicio->copy()->addDays(7) : null,
                'estado'=>'activo', 'deleted_at'=>null]
        );
    }

    private function cita(Paciente $paciente, User $profesional, Carbon $fecha, string $tipoProfesional, string $tipoCita, string $estado, int $numero): void
    {
        $hora = sprintf('%02d:00:00', 8 + ($numero % 9));
        Cita::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'id_profesional'=>$profesional->id, 'tipo_cita'=>$tipoCita],
            ['fecha_cita'=>$fecha->toDateString(), 'tipo_profesional'=>$tipoProfesional, 'hora_inicio'=>$hora,
                'hora_fin'=>Carbon::createFromFormat('H:i:s', $hora)->addHour()->format('H:i:s'), 'duracion_minutos'=>60,
                'modalidad'=>$numero % 4 === 0 ? 'virtual' : 'presencial',
                'motivo'=>$tipoProfesional === 'endocrinologo' ? 'Control clínico y metabólico.' : 'Seguimiento de plan alimentario.',
                'estado'=>$estado, 'observaciones'=>'Cita de seguimiento programada.',
                'motivo_cancelacion'=>$estado === 'cancelada' ? 'Imprevisto personal informado por la paciente.' : null,
                'registrada_por'=>$profesional->id, 'deleted_at'=>null]
        );
    }

    private function seguimientoComida(int $numero, int $diaNumero, int $orden, Paciente $paciente, PlanAlimentario $plan, DiaPlanAlimentario $dia, ComidaPlanAlimentario $comida, User $nutricionista): void
    {
        $indice = ($numero + $diaNumero + $orden) % 10;
        $estado = $indice < 6 ? 'completada' : ($indice < 8 ? 'parcial' : ($indice === 8 ? 'reemplazada' : 'no_realizada'));
        $porcentaje = match ($estado) { 'completada' => 100, 'parcial' => 65, 'reemplazada' => 80, default => 0 };
        SeguimientoComida::withTrashed()->updateOrCreate(
            ['id_comida_plan_alimentario'=>$comida->getKey(), 'fecha_seguimiento'=>$dia->fecha],
            ['id_paciente'=>$paciente->getKey(), 'id_plan_alimentario'=>$plan->getKey(),
                'id_dia_plan_alimentario'=>$dia->getKey(), 'estado_cumplimiento'=>$estado,
                'porcentaje_consumido'=>$porcentaje,
                'nivel_agrado'=>match ($estado) { 'completada' => 'me_gusto', 'no_realizada' => 'no_me_gusto', default => 'neutral' },
                'desea_repetir'=>$estado === 'completada', 'nivel_saciedad'=>$estado === 'no_realizada' ? 'baja' : 'alta',
                'nivel_hambre_posterior'=>$estado === 'completada' ? 'baja' : 'media',
                'ansiedad_posterior'=>$indice === 9, 'presento_molestia'=>$indice === 8,
                'tipo_molestia'=>$indice === 8 ? 'hinchazon' : 'ninguna',
                'intensidad_molestia'=>$indice === 8 ? 'leve' : null,
                'dificultad_preparacion'=>$orden === 1 ? 'media' : 'baja',
                'consiguio_ingredientes'=>$indice !== 9,
                'motivo_no_cumplimiento'=>$estado === 'no_realizada' ? 'falta_tiempo' : null,
                'comida_reemplazo'=>$estado === 'reemplazada' ? 'Alternativa casera equivalente.' : null,
                'motivo_reemplazo'=>$estado === 'reemplazada' ? 'Disponibilidad de ingredientes.' : null,
                'comentario_paciente'=>$estado === 'completada' ? 'La comida fue práctica y agradable.' : 'Necesito una alternativa más fácil.',
                'sugerencia_paciente'=>$estado === 'no_realizada' ? 'Incluir una preparación rápida.' : null,
                'observacion_para_siguiente_plan'=>$estado !== 'completada' ? 'Revisar practicidad y horario.' : null,
                'registrado_por'=>$paciente->user_id, 'revisado_por_nutricionista'=>$diaNumero <= 5,
                'fecha_revision_nutricionista'=>$diaNumero <= 5 ? Carbon::parse($dia->fecha)->addDay() : null,
                'deleted_at'=>null]
        );
    }

    private function crearEvaluacionSeguimiento(int $numero, Paciente $paciente, RequerimientoNutricional $requerimiento, User $nutricionista): void
    {
        $inicial = EvaluacionNutricional::query()
            ->where('id_paciente', $paciente->getKey())
            ->oldest('fecha_evaluacion')
            ->firstOrFail();
        if ($inicial->fecha_evaluacion?->toDateString() === self::HOY) {
            $datosBase = $inicial->only([
                'id_nutricionista','id_consulta_nutricional','peso','talla','imc',
                'circunferencia_cintura','circunferencia_cadera','indice_cintura_cadera',
                'porcentaje_grasa','masa_muscular','nivel_actividad','estado',
            ]);
            $inicial = EvaluacionNutricional::withTrashed()->updateOrCreate(
                ['id_paciente'=>$paciente->getKey(), 'fecha_evaluacion'=>Carbon::parse(self::HOY)->subDays(30)->toDateString()],
                $datosBase + ['observaciones'=>'Medición antropométrica inicial de referencia.', 'deleted_at'=>null]
            );
        }
        $cambioPeso = match ($numero % 5) { 0 => .4, 1 => -2.8, 2 => -1.9, 3 => -1.1, default => -.5 };
        $peso = round((float) $inicial->peso + $cambioPeso, 2);
        $talla = (float) $inicial->talla;
        $cintura = round((float) $inicial->circunferencia_cintura + min(0, $cambioPeso * 1.2), 2);

        EvaluacionNutricional::withTrashed()->updateOrCreate(
            ['id_paciente'=>$paciente->getKey(), 'fecha_evaluacion'=>self::HOY],
            ['id_nutricionista'=>$nutricionista->id,
                'id_consulta_nutricional'=>$requerimiento->id_consulta_nutricional,
                'peso'=>$peso, 'talla'=>$talla, 'imc'=>round($peso / ($talla ** 2), 2),
                'circunferencia_cintura'=>$cintura,
                'circunferencia_cadera'=>$inicial->circunferencia_cadera,
                'indice_cintura_cadera'=>round($cintura / max((float) $inicial->circunferencia_cadera, 1), 2),
                'porcentaje_grasa'=>max(18, round((float) $inicial->porcentaje_grasa + $cambioPeso * .35, 2)),
                'masa_muscular'=>$inicial->masa_muscular, 'nivel_actividad'=>$inicial->nivel_actividad,
                'observaciones'=>'Control antropométrico semanal para visualizar evolución.',
                'estado'=>true, 'deleted_at'=>null]
        );
    }

    private function tiempos(): array
    {
        return [
            ['desayuno','08:00:00','Desayuno equilibrado',.25],
            ['almuerzo','13:00:00','Almuerzo completo',.40],
            ['merienda','16:30:00','Merienda saludable',.15],
            ['cena','19:30:00','Cena ligera',.20],
        ];
    }
}
