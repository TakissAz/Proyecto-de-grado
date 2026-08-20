<?php

namespace Database\Seeders;

use App\Models\AntecedenteEndocrinoMetabolico;
use App\Models\ConsultaEndocrinologica;
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
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PacienteDiagnosticoClinicoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $endocrinologo = User::query()
                ->where('email', 'endocrino@pmos.test')
                ->firstOrFail();

            $usuarioPaciente = User::withTrashed()->updateOrCreate(
                ['email' => 'paciente.clinica@pmos.test'],
                [
                    'name' => 'María Fernanda Quispe Flores',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'estado' => 'activo',
                ]
            );
            if ($usuarioPaciente->trashed()) {
                $usuarioPaciente->restore();
            }
            $this->asignarRolPaciente($usuarioPaciente);

            $paciente = Paciente::withTrashed()->updateOrCreate(
                ['ci' => 'CLINICA-PMOS-001'],
                [
                    'user_id' => $usuarioPaciente->id,
                    'nombres' => 'María Fernanda',
                    'apellido_paterno' => 'Quispe',
                    'apellido_materno' => 'Flores',
                    'fecha_nacimiento' => '1998-04-18',
                    'sexo' => 'femenino',
                    'telefono' => '70000001',
                    'direccion' => 'La Paz, Bolivia',
                    'ocupacion' => 'Estudiante universitaria',
                    'estado_civil' => 'soltera',
                    'fecha_registro' => now()->toDateString(),
                    'estado' => 'activo',
                    'observaciones' => 'Caso demostrativo completo para evaluación PMOS y resistencia a la insulina.',
                ]
            );
            if ($paciente->trashed()) {
                $paciente->restore();
            }

            $consulta = ConsultaEndocrinologica::withTrashed()->updateOrCreate(
                [
                    'id_paciente' => $paciente->id_paciente,
                    'fecha_consulta' => '2026-08-17',
                ],
                [
                    'id_endocrinologo' => $endocrinologo->id,
                    'motivo_consulta' => 'Ciclos menstruales irregulares, hirsutismo y dificultad para controlar el peso.',
                    'sospecha_pmos' => true,
                    'sospecha_resistencia_insulina' => true,
                    'observaciones_generales' => 'Evaluación integral compatible con PMOS fenotipo A y riesgo metabólico elevado.',
                    'estado' => 'abierta',
                ]
            );
            if ($consulta->trashed()) {
                $consulta->restore();
            }

            $base = [
                'id_consulta_endocrinologica' => $consulta->id_consulta_endocrinologica,
                'id_paciente' => $paciente->id_paciente,
            ];
            $baseLaboratorio = $base + ['id_endocrinologo' => $endocrinologo->id];

            HistoriaMenstrual::withTrashed()->updateOrCreate($base, [
                'fecha_ultima_menstruacion' => '2026-07-02',
                'edad_menarquia' => 12,
                'regularidad_ciclo' => 'irregular',
                'duracion_ciclo_dias' => 6,
                'intervalo_entre_ciclos_dias' => 48,
                'amenorrea' => false,
                'oligomenorrea' => true,
                'sangrado_abundante' => false,
                'dolor_menstrual' => true,
                'sospecha_anovulacion' => true,
                'progesterona_lutea' => 2.10,
                'confirma_anovulacion_por_progesterona' => true,
                'observaciones' => 'Oligomenorrea y evidencia bioquímica compatible con anovulación.',
                'estado' => 'activo',
                'deleted_at' => null,
            ]);

            HistoriaHiperandrogenica::withTrashed()->updateOrCreate($base, [
                'acne' => true,
                'acne_grado' => 'moderado',
                'hirsutismo' => true,
                'hirsutismo_zona' => 'Mentón, labio superior y línea alba',
                'puntaje_ferriman_gallwey' => 12,
                'alopecia_androgenica' => false,
                'seborrea' => true,
                'inicio_sintomas' => 'progresivo_desde_adolescencia',
                'progresion_sintomas' => 'progresiva',
                'observaciones' => 'Hiperandrogenismo clínico con Ferriman-Gallwey mayor a 8.',
                'estado' => 'activo',
                'deleted_at' => null,
            ]);

            AntecedenteEndocrinoMetabolico::withTrashed()->updateOrCreate($base, [
                'diabetes_familiar' => true,
                'diabetes_personal' => false,
                'hipertension_familiar' => true,
                'hipertension_personal' => false,
                'dislipidemia_familiar' => true,
                'dislipidemia_personal' => false,
                'enfermedad_tiroidea' => false,
                'hiperprolactinemia_previa' => false,
                'uso_anticonceptivos' => false,
                'uso_metformina' => false,
                'uso_corticoides' => false,
                'otros_medicamentos' => null,
                'observaciones' => 'Antecedente materno de diabetes mellitus tipo 2.',
                'estado' => 'activo',
                'deleted_at' => null,
            ]);

            EvaluacionFisicaEndocrina::withTrashed()->updateOrCreate($base, [
                'peso' => 78.00,
                'talla' => 1.62,
                'imc' => 29.72,
                'circunferencia_cintura' => 92.00,
                'circunferencia_cadera' => 104.00,
                'indice_cintura_cadera' => 0.88,
                'presion_sistolica' => 124,
                'presion_diastolica' => 82,
                'acantosis_nigricans' => true,
                'skin_tags' => true,
                'galactorrea' => false,
                'hirsutismo_visible' => true,
                'puntaje_ferriman_gallwey' => 12,
                'acne_visible' => true,
                'alopecia_visible' => false,
                'observaciones' => 'Adiposidad abdominal y acantosis nigricans cervical.',
                'estado' => 'activo',
                'deleted_at' => null,
            ]);

            ResultadoPerfilAndrogenico::withTrashed()->updateOrCreate($baseLaboratorio, [
                'fecha_resultado' => '2026-08-15',
                'testosterona_total' => 72.00,
                'testosterona_libre' => 5.80,
                'shbg' => 24.00,
                'indice_androgenico_libre' => 10.40,
                'dhea_s' => 365.00,
                'androstenediona' => 3.20,
                'hiperandrogenismo_bioquimico' => true,
                'interpretacion' => 'Perfil compatible con hiperandrogenismo bioquímico.',
                'estado' => 'registrado',
                'deleted_at' => null,
            ]);

            ResultadoPerfilGonadotropo::withTrashed()->updateOrCreate($baseLaboratorio, [
                'fecha_resultado' => '2026-08-15',
                'lh' => 12.00,
                'fsh' => 5.20,
                'relacion_lh_fsh' => 2.31,
                'estradiol' => 58.00,
                'progesterona' => 2.10,
                'progesterona_dia_ciclo' => 21,
                'progesterona_fase_ciclo' => 'lutea',
                'interpretacion' => 'Relación LH/FSH elevada y progesterona lútea baja.',
                'estado' => 'registrado',
                'deleted_at' => null,
            ]);

            ResultadoDiferencialEndocrino::withTrashed()->updateOrCreate($baseLaboratorio, [
                'fecha_resultado' => '2026-08-15',
                'tsh' => 2.10,
                't3_libre' => 3.20,
                't4_libre' => 1.15,
                'prolactina' => 14.00,
                'diecisiete_oh_progesterona' => 1.20,
                'cortisol' => 13.50,
                'alteracion_tiroidea_descartada' => true,
                'hiperprolactinemia_descartada' => true,
                'hiperplasia_suprarrenal_descartada' => true,
                'cushing_descartado' => true,
                'interpretacion' => 'Principales diagnósticos diferenciales endocrinos descartados.',
                'estado' => 'registrado',
                'deleted_at' => null,
            ]);

            ResultadoGlucosaInsulina::withTrashed()->updateOrCreate($baseLaboratorio, [
                'fecha_resultado' => '2026-08-15',
                'glucosa_ayunas' => 92.00,
                'insulina_ayunas' => 15.00,
                'homa_ir' => 3.41,
                'hemoglobina_glicosilada' => 5.60,
                'glucosa_2h_ogtt' => 128.00,
                'insulina_2h_ogtt' => 78.00,
                'hiperinsulinemia' => true,
                'resistencia_insulina_sugerida' => true,
                'interpretacion' => 'HOMA-IR elevado compatible con resistencia a la insulina moderada.',
                'estado' => 'registrado',
                'deleted_at' => null,
            ]);

            ResultadoPerfilLipidico::withTrashed()->updateOrCreate($baseLaboratorio, [
                'fecha_resultado' => '2026-08-15',
                'colesterol_total' => 218.00,
                'hdl' => 42.00,
                'ldl' => 142.00,
                'vldl' => 34.00,
                'trigliceridos' => 170.00,
                'colesterol_no_hdl' => 176.00,
                'dislipidemia_sugerida' => true,
                'interpretacion' => 'Triglicéridos elevados y HDL bajo.',
                'estado' => 'registrado',
                'deleted_at' => null,
            ]);

            EvaluacionEcografica::withTrashed()->updateOrCreate($baseLaboratorio, [
                'fecha_ecografia' => '2026-08-16',
                'tipo_ecografia' => 'transvaginal',
                'volumen_ovario_derecho' => 12.40,
                'volumen_ovario_izquierdo' => 11.80,
                'foliculos_ovario_derecho' => 24,
                'foliculos_ovario_izquierdo' => 22,
                'morfologia_compatible_pmos' => true,
                'distribucion_periferica' => true,
                'archivo_informe' => null,
                'observaciones' => 'Morfología ovárica compatible con PMOS.',
                'estado' => 'registrada',
                'deleted_at' => null,
            ]);

            $this->command?->info(
                "Paciente clínico listo: {$paciente->id_paciente} - {$usuarioPaciente->email}"
            );
        });
    }

    private function asignarRolPaciente(User $usuario): void
    {
        $rol = Role::query()->where('nombre', 'paciente')->firstOrFail();
        $asignacion = UserRole::withTrashed()->firstOrNew([
            'user_id' => $usuario->id,
            'id_rol' => $rol->id_rol,
        ]);
        $asignacion->estado = 'activo';
        $asignacion->deleted_at = null;
        $asignacion->save();
    }
}
