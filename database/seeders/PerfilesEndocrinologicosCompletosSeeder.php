<?php

namespace Database\Seeders;

use App\Models\AntecedenteEndocrinoMetabolico;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\EvaluacionEcografica;
use App\Models\EvaluacionFisicaEndocrina;
use App\Models\HistoriaHiperandrogenica;
use App\Models\HistoriaMenstrual;
use App\Models\Paciente;
use App\Models\ResultadoDiferencialEndocrino;
use App\Models\ResultadoGlucosaInsulina;
use App\Models\ResultadoPerfilAndrogenico;
use App\Models\ResultadoPerfilGonadotropo;
use App\Models\ResultadoPerfilLipidico;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PerfilesEndocrinologicosCompletosSeeder extends Seeder
{
    public function run(): void
    {
        $endocrinologo = User::query()
            ->where('email', DatosClinicosNutricionalesRealistasSeeder::EMAIL_ENDOCRINOLOGIA)
            ->first();
        $pacientes = Paciente::query()->whereIn('ci', DatosClinicosNutricionalesRealistasSeeder::identificacionesPacientes())
            ->with(['consultasEndocrinologicas', 'diagnosticosPmos', 'diagnosticosResistenciaInsulina', 'evaluacionesNutricionales'])
            ->orderBy('ci')->get();

        if (! $endocrinologo || $pacientes->count() !== 70) {
            throw new RuntimeException('Primero ejecuta DatosClinicosNutricionalesRealistasSeeder.');
        }

        DB::transaction(function () use ($pacientes, $endocrinologo): void {
            foreach ($pacientes as $indice => $paciente) {
                $this->completar($indice + 1, $paciente, $endocrinologo);
            }
        });

        $this->command?->info('Perfiles endocrinológicos: 70 expedientes clínicos completos creados o actualizados.');
    }

    public function completar(int $numero, Paciente $paciente, User $endocrinologo): void
    {
        $consulta = $paciente->consultasEndocrinologicas->sortByDesc('fecha_consulta')->firstOrFail();
        $pmos = $paciente->diagnosticosPmos->sortByDesc('fecha_diagnostico')->firstOrFail();
        $ri = $paciente->diagnosticosResistenciaInsulina->sortByDesc('fecha_diagnostico')->firstOrFail();
        $evaluacionNutri = $paciente->evaluacionesNutricionales->sortByDesc('fecha_evaluacion')->firstOrFail();
        $fecha = $consulta->fecha_consulta?->toDateString() ?? $pmos->fecha_diagnostico?->toDateString();
        $tienePmos = (bool) $pmos->diagnostico_confirmado;
        $tieneRi = (bool) $ri->resistencia_confirmada;
        $morfologia = (bool) $pmos->cumple_morfologia_ovarica;
        $bioquimico = (bool) $pmos->cumple_hiperandrogenismo_bioquimico;
        $base = ['id_consulta_endocrinologica'=>$consulta->getKey(), 'id_paciente'=>$paciente->getKey()];
        $laboratorio = $base + ['id_endocrinologo'=>$endocrinologo->id];

        $menstrual = HistoriaMenstrual::withTrashed()->updateOrCreate($base, [
            'fecha_ultima_menstruacion'=>Carbon::parse($fecha)->subDays($tienePmos ? 38 + ($numero % 15) : 24 + ($numero % 7))->toDateString(),
            'edad_menarquia'=>11 + ($numero % 4), 'regularidad_ciclo'=>$tienePmos ? 'irregular' : 'regular',
            'duracion_ciclo_dias'=>4 + ($numero % 3), 'intervalo_entre_ciclos_dias'=>$tienePmos ? 38 + ($numero % 18) : 27 + ($numero % 5),
            'amenorrea'=>$tienePmos && $numero % 6 === 0, 'oligomenorrea'=>$tienePmos && $numero % 6 !== 0,
            'sangrado_abundante'=>$numero % 8 === 0, 'dolor_menstrual'=>$numero % 3 === 0,
            'sospecha_anovulacion'=>$tienePmos, 'progesterona_lutea'=>$tienePmos ? 1.8 + (($numero % 5) * .2) : 7.2 + (($numero % 5) * .3),
            'confirma_anovulacion_por_progesterona'=>$tienePmos,
            'observaciones'=>$tienePmos ? 'Ciclos prolongados compatibles con disfunción ovulatoria.' : 'Patrón menstrual conservado.',
            'estado'=>'activo', 'deleted_at'=>null,
        ]);
        if ($menstrual->trashed()) $menstrual->restore();

        $hiper = HistoriaHiperandrogenica::withTrashed()->updateOrCreate($base, [
            'acne'=>$tienePmos && $numero % 4 !== 0, 'acne_grado'=>$tienePmos ? ['leve','moderado','severo'][$numero % 3] : 'no_aplica',
            'hirsutismo'=>$tienePmos, 'hirsutismo_zona'=>$tienePmos ? ['mentón y cuello','línea alba y tórax','rostro y muslos'][$numero % 3] : null,
            'puntaje_ferriman_gallwey'=>$tienePmos ? 8 + ($numero % 8) : 2 + ($numero % 4),
            'alopecia_androgenica'=>$tienePmos && $numero % 5 === 0, 'seborrea'=>$tienePmos && $numero % 3 === 0,
            'inicio_sintomas'=>$tienePmos ? 'adolescencia' : 'sin_sintomas', 'progresion_sintomas'=>$tienePmos ? 'gradual' : 'estable',
            'observaciones'=>$tienePmos ? 'Manifestaciones clínicas de hiperandrogenismo de evolución gradual.' : 'Sin signos clínicos relevantes.',
            'estado'=>'activo', 'deleted_at'=>null,
        ]);
        if ($hiper->trashed()) $hiper->restore();

        $antecedente = AntecedenteEndocrinoMetabolico::withTrashed()->updateOrCreate($base, [
            'diabetes_familiar'=>$tieneRi || $numero % 4 === 0, 'diabetes_personal'=>false,
            'hipertension_familiar'=>$numero % 3 === 0, 'hipertension_personal'=>$numero % 12 === 0,
            'dislipidemia_familiar'=>$tieneRi && $numero % 2 === 0, 'dislipidemia_personal'=>$tieneRi && $numero % 7 === 0,
            'enfermedad_tiroidea'=>$numero % 14 === 0, 'hiperprolactinemia_previa'=>false,
            'uso_anticonceptivos'=>$numero % 5 === 0, 'uso_metformina'=>$tieneRi && $numero % 4 === 0,
            'uso_corticoides'=>false, 'otros_medicamentos'=>$numero % 6 === 0 ? 'Suplemento de vitamina D indicado por profesional.' : null,
            'antecedentes_personales_detalle'=>$numero % 12 === 0 ? [['antecedente'=>'Hipertensión arterial','fecha_aproximada'=>'2024','observacion'=>'En seguimiento médico.']] : [],
            'antecedentes_familiares_detalle'=>[['parentesco'=>'madre','antecedente'=>$tieneRi ? 'Diabetes mellitus tipo 2' : 'Hipertensión arterial','observacion'=>'Antecedente referido en consulta.']],
            'medicamentos_detalle'=>array_values(array_filter([
                $numero % 5 === 0 ? ['medicamento'=>'Anticonceptivo oral combinado','dosis'=>'según prescripción','frecuencia'=>'diaria'] : null,
                $tieneRi && $numero % 4 === 0 ? ['medicamento'=>'Metformina','dosis'=>'500 mg','frecuencia'=>'cada 12 horas'] : null,
            ])),
            'observaciones'=>'Antecedentes personales, familiares y farmacológicos verificados.', 'estado'=>'activo', 'deleted_at'=>null,
        ]);
        if ($antecedente->trashed()) $antecedente->restore();

        $peso = (float) $evaluacionNutri->peso;
        $talla = (float) $evaluacionNutri->talla;
        $cintura = (float) $evaluacionNutri->circunferencia_cintura;
        $cadera = (float) $evaluacionNutri->circunferencia_cadera;
        $fisica = EvaluacionFisicaEndocrina::withTrashed()->updateOrCreate($base, [
            'peso'=>$peso, 'talla'=>$talla, 'imc'=>round($peso / ($talla ** 2), 2),
            'circunferencia_cintura'=>$cintura, 'circunferencia_cadera'=>$cadera,
            'indice_cintura_cadera'=>round($cintura / max($cadera, 1), 2),
            'presion_sistolica'=>108 + ($numero % 18), 'presion_diastolica'=>68 + ($numero % 12),
            'acantosis_nigricans'=>$tieneRi && $numero % 3 !== 0, 'skin_tags'=>$tieneRi && $numero % 6 === 0,
            'galactorrea'=>false, 'hirsutismo_visible'=>$tienePmos,
            'puntaje_ferriman_gallwey'=>$tienePmos ? 8 + ($numero % 8) : 2 + ($numero % 4),
            'acne_visible'=>$tienePmos && $numero % 4 !== 0, 'alopecia_visible'=>$tienePmos && $numero % 5 === 0,
            'observaciones'=>'Exploración física endocrinológica completa.', 'estado'=>'activo', 'deleted_at'=>null,
        ]);
        if ($fisica->trashed()) $fisica->restore();

        $androgenico = ResultadoPerfilAndrogenico::withTrashed()->updateOrCreate($laboratorio + ['fecha_resultado'=>$fecha], [
            'testosterona_total'=>$bioquimico ? 62 + ($numero % 16) : 28 + ($numero % 15),
            'testosterona_libre'=>$bioquimico ? 4.8 + (($numero % 8) * .2) : 1.8 + (($numero % 6) * .15),
            'shbg'=>$bioquimico ? 24 + ($numero % 12) : 42 + ($numero % 15),
            'indice_androgenico_libre'=>$bioquimico ? 7.2 + (($numero % 7) * .4) : 2.2 + (($numero % 5) * .2),
            'dhea_s'=>$bioquimico ? 310 + ($numero % 70) : 190 + ($numero % 65),
            'androstenediona'=>$bioquimico ? 2.8 + (($numero % 6) * .2) : 1.3 + (($numero % 5) * .1),
            'hiperandrogenismo_bioquimico'=>$bioquimico,
            'interpretacion'=>$bioquimico ? 'Elevación androgénica compatible con hiperandrogenismo bioquímico.' : 'Perfil androgénico dentro de parámetros esperados.',
            'estado'=>'registrado', 'deleted_at'=>null,
        ]);
        if ($androgenico->trashed()) $androgenico->restore();

        $gonadotropo = ResultadoPerfilGonadotropo::withTrashed()->updateOrCreate($laboratorio + ['fecha_resultado'=>$fecha], [
            'lh'=>$tienePmos ? 9.5 + (($numero % 7) * .4) : 5 + (($numero % 5) * .3), 'fsh'=>4.8 + (($numero % 5) * .2),
            'relacion_lh_fsh'=>$tienePmos ? 2 + (($numero % 5) * .1) : 1.1 + (($numero % 4) * .1),
            'estradiol'=>42 + ($numero % 28), 'progesterona'=>$tienePmos ? 2 + (($numero % 4) * .2) : 7 + (($numero % 5) * .4),
            'progesterona_dia_ciclo'=>21, 'progesterona_fase_ciclo'=>'lutea',
            'interpretacion'=>$tienePmos ? 'Relación LH/FSH elevada y progesterona compatible con anovulación.' : 'Perfil gonadotropo sin alteraciones significativas.',
            'estado'=>'registrado', 'deleted_at'=>null,
        ]);
        if ($gonadotropo->trashed()) $gonadotropo->restore();

        $diferencial = ResultadoDiferencialEndocrino::withTrashed()->updateOrCreate($laboratorio + ['fecha_resultado'=>$fecha], [
            'tsh'=>1.5 + (($numero % 9) * .15), 't3_libre'=>2.8 + (($numero % 5) * .1), 't4_libre'=>.9 + (($numero % 4) * .08),
            'prolactina'=>9 + ($numero % 10), 'diecisiete_oh_progesterona'=>.8 + (($numero % 5) * .1), 'cortisol'=>10 + ($numero % 7),
            'alteracion_tiroidea_descartada'=>true, 'hiperprolactinemia_descartada'=>true,
            'hiperplasia_suprarrenal_descartada'=>true, 'cushing_descartado'=>true,
            'interpretacion'=>'Resultados sin evidencia de causas endocrinas alternativas.', 'estado'=>'registrado', 'deleted_at'=>null,
        ]);
        if ($diferencial->trashed()) $diferencial->restore();

        $glucosa = (float) $ri->glucosa_ayunas;
        $insulina = (float) $ri->insulina_ayunas;
        $glucosaInsulina = ResultadoGlucosaInsulina::withTrashed()->updateOrCreate($laboratorio + ['fecha_resultado'=>$fecha], [
            'glucosa_ayunas'=>$glucosa, 'insulina_ayunas'=>$insulina, 'homa_ir'=>$ri->homa_ir,
            'hemoglobina_glicosilada'=>$ri->hemoglobina_glicosilada,
            'glucosa_2h_ogtt'=>$tieneRi ? 132 + ($numero % 30) : 104 + ($numero % 18),
            'insulina_2h_ogtt'=>$tieneRi ? 58 + ($numero % 28) : 28 + ($numero % 15),
            'hiperinsulinemia'=>$tieneRi, 'resistencia_insulina_sugerida'=>$tieneRi,
            'interpretacion'=>$tieneRi ? 'HOMA-IR y respuesta insulínica compatibles con resistencia a la insulina.' : 'Metabolismo glucémico conservado.',
            'estado'=>'registrado', 'deleted_at'=>null,
        ]);
        if ($glucosaInsulina->trashed()) $glucosaInsulina->restore();

        $trigliceridos = $tieneRi ? 155 + ($numero % 60) : 85 + ($numero % 45);
        $hdl = $tieneRi ? 38 + ($numero % 10) : 50 + ($numero % 12);
        $ldl = $tieneRi ? 118 + ($numero % 35) : 88 + ($numero % 28);
        $total = $hdl + $ldl + round($trigliceridos / 5, 1);
        $lipidico = ResultadoPerfilLipidico::withTrashed()->updateOrCreate($laboratorio + ['fecha_resultado'=>$fecha], [
            'colesterol_total'=>$total, 'hdl'=>$hdl, 'ldl'=>$ldl, 'vldl'=>round($trigliceridos / 5, 1),
            'trigliceridos'=>$trigliceridos, 'colesterol_no_hdl'=>$total - $hdl,
            'dislipidemia_sugerida'=>$tieneRi && ($trigliceridos >= 150 || $hdl < 50),
            'interpretacion'=>$tieneRi ? 'Patrón lipídico con riesgo cardiometabólico aumentado.' : 'Perfil lipídico dentro de objetivos.',
            'estado'=>'registrado', 'deleted_at'=>null,
        ]);
        if ($lipidico->trashed()) $lipidico->restore();

        $eco = EvaluacionEcografica::withTrashed()->updateOrCreate($laboratorio + ['fecha_ecografia'=>$fecha], [
            'tipo_ecografia'=>'transvaginal',
            'volumen_ovario_derecho'=>$morfologia ? 10.8 + (($numero % 6) * .4) : 6.8 + (($numero % 5) * .3),
            'volumen_ovario_izquierdo'=>$morfologia ? 10.5 + (($numero % 6) * .35) : 6.6 + (($numero % 5) * .3),
            'foliculos_ovario_derecho'=>$morfologia ? 20 + ($numero % 8) : 8 + ($numero % 7),
            'foliculos_ovario_izquierdo'=>$morfologia ? 20 + (($numero + 3) % 8) : 8 + (($numero + 2) % 7),
            'morfologia_compatible_pmos'=>$morfologia, 'distribucion_periferica'=>$morfologia,
            'archivo_informe'=>null,
            'observaciones'=>$morfologia ? 'Morfología ovárica compatible con PMOS.' : 'Ecografía sin morfología poliquística.',
            'estado'=>'registrada', 'deleted_at'=>null,
        ]);
        if ($eco->trashed()) $eco->restore();

        $pmos->update([
            'id_historia_menstrual'=>$menstrual->getKey(), 'id_historia_hiperandrogenica'=>$hiper->getKey(),
            'id_perfil_androgenico'=>$androgenico->getKey(), 'id_perfil_gonadotropo'=>$gonadotropo->getKey(),
            'id_diferencial_endocrino'=>$diferencial->getKey(), 'id_ecografia'=>$eco->getKey(),
        ]);
        $ri->update([
            'id_glucosa_insulina'=>$glucosaInsulina->getKey(), 'id_perfil_lipidico'=>$lipidico->getKey(),
            'id_evaluacion_fisica'=>$fisica->getKey(),
        ]);
    }
}
