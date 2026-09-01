<?php

namespace Tests\Feature\Database;

use App\Models\Paciente;
use Database\Seeders\CompletarTodosLosPacientesSeeder;
use Database\Seeders\DatosClinicosNutricionalesRealistasSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompletarTodosLosPacientesSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_completa_todos_los_pacientes_activos_sin_duplicar_sus_perfiles(): void
    {
        $this->seed(DatosClinicosNutricionalesRealistasSeeder::class);
        $this->seed(CompletarTodosLosPacientesSeeder::class);

        $totalesIniciales = $this->totales();

        $this->seed(CompletarTodosLosPacientesSeeder::class);

        $pacientes = Paciente::query()->where('estado', 'activo');

        $this->assertSame(70, $pacientes->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('consultasEndocrinologicas')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('diagnosticosPmos')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('diagnosticosResistenciaInsulina')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('evaluacionesNutricionales')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('habitosAlimentarios')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('preferenciasAlimentarias')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('restriccionesAlimentarias')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('objetivosNutricionales')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('requerimientosNutricionales')->count());
        $this->assertSame(0, (clone $pacientes)->whereDoesntHave('planesAlimentarios')->count());
        $this->assertGreaterThan(5, \DB::table('evaluaciones_nutricionales')->distinct()->count('imc'));
        $this->assertGreaterThan(1, \DB::table('preferencias_alimentarias')->distinct()->count('alimentos_preferidos'));
        $this->assertGreaterThan(1, \DB::table('objetivos_nutricionales')->distinct()->count('objetivo_principal'));
        $this->assertSame($totalesIniciales, $this->totales());
    }

    private function totales(): array
    {
        return [
            'consultas' => \DB::table('consultas_endocrinologicas')->count(),
            'pmos' => \DB::table('diagnosticos_pmos')->count(),
            'ri' => \DB::table('diagnosticos_resistencia_insulina')->count(),
            'evaluaciones' => \DB::table('evaluaciones_nutricionales')->count(),
            'habitos' => \DB::table('habitos_alimentarios')->count(),
            'preferencias' => \DB::table('preferencias_alimentarias')->count(),
            'restricciones' => \DB::table('restricciones_alimentarias')->count(),
            'objetivos' => \DB::table('objetivos_nutricionales')->count(),
            'requerimientos' => \DB::table('requerimientos_nutricionales')->count(),
            'planes' => \DB::table('planes_alimentarios')->count(),
        ];
    }
}
