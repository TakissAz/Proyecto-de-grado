<?php

namespace Tests\Feature\Database;

use Database\Seeders\DatosClinicosNutricionalesRealistasSeeder;
use Database\Seeders\PerfilesEndocrinologicosCompletosSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PerfilesEndocrinologicosCompletosSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_completa_las_diez_secciones_endocrinologicas_sin_duplicar(): void
    {
        $this->seed(DatosClinicosNutricionalesRealistasSeeder::class);
        $this->seed(PerfilesEndocrinologicosCompletosSeeder::class);
        $this->seed(PerfilesEndocrinologicosCompletosSeeder::class);

        $ids = DB::table('pacientes')->where('ci', 'like', 'DEMO-%')->pluck('id_paciente');
        $tablas = [
            'historia_menstrual', 'historia_hiperandrogenica', 'antecedentes_endocrino_metabolicos',
            'evaluaciones_fisicas_endocrinas', 'resultados_perfil_androgenico',
            'resultados_perfil_gonadotropo', 'resultados_diferenciales_endocrinos',
            'resultados_glucosa_insulina', 'resultados_perfil_lipidico', 'evaluaciones_ecograficas',
        ];

        foreach ($tablas as $tabla) {
            $this->assertSame(70, DB::table($tabla)->whereIn('id_paciente', $ids)->whereNull('deleted_at')->count(), $tabla);
        }
    }

    public function test_diagnosticos_quedan_conectados_a_la_evidencia_clinica(): void
    {
        $this->seed(DatosClinicosNutricionalesRealistasSeeder::class);
        $this->seed(PerfilesEndocrinologicosCompletosSeeder::class);
        $ids = DB::table('pacientes')->where('ci', 'like', 'DEMO-%')->pluck('id_paciente');

        $this->assertSame(70, DB::table('diagnosticos_pmos')->whereIn('id_paciente', $ids)
            ->whereNotNull('id_historia_menstrual')->whereNotNull('id_historia_hiperandrogenica')
            ->whereNotNull('id_perfil_androgenico')->whereNotNull('id_perfil_gonadotropo')
            ->whereNotNull('id_diferencial_endocrino')->whereNotNull('id_ecografia')->count());
        $this->assertSame(70, DB::table('diagnosticos_resistencia_insulina')->whereIn('id_paciente', $ids)
            ->whereNotNull('id_glucosa_insulina')->whereNotNull('id_perfil_lipidico')
            ->whereNotNull('id_evaluacion_fisica')->count());
    }
}
