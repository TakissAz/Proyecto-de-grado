<?php

namespace Tests\Feature\Nutricion;

use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Nutricion\ExplicacionComponentePlanService;
use App\Services\Nutricion\GeneradorPlanSemanalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportePlanAlimentarioPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_descarga_reporte_pdf_justificativo(): void
    {
        [$nutricionista, $plan] = $this->planDePrueba();

        $response = $this->actingAs($nutricionista)
            ->get(route('nutricionista.planes.reporte-pdf', $plan));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_reporte_requiere_autenticacion(): void
    {
        [, $plan] = $this->planDePrueba();

        $this->get(route('nutricionista.planes.reporte-pdf', $plan))
            ->assertRedirect(route('login'));
    }

    public function test_usuario_sin_rol_nutricionista_no_puede_descargarlo(): void
    {
        [, $plan] = $this->planDePrueba();

        $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->get(route('nutricionista.planes.reporte-pdf', $plan))
            ->assertForbidden();
    }

    public function test_extrae_puntaje_motivos_y_advertencias_de_la_justificacion(): void
    {
        $resultado = app(ExplicacionComponentePlanService::class)->extraer(
            'Puntaje experto: 95. Puntaje ajustado por diversidad: 88. Motivos: Compatible con RI. Aporta fibra. Receta repetida porque existen menos de 7 alternativas compatibles para este tiempo de comida.'
        );

        $this->assertSame(95.0, $resultado['puntaje_experto']);
        $this->assertSame(88.0, $resultado['puntaje_ajustado']);
        $this->assertNotEmpty($resultado['motivos']);
        $this->assertNotEmpty($resultado['advertencias']);
    }

    public function test_parser_tolera_componente_manual_sin_observaciones(): void
    {
        $resultado = app(ExplicacionComponentePlanService::class)->extraer(null);

        $this->assertNull($resultado['puntaje_experto']);
        $this->assertSame([], $resultado['motivos']);
        $this->assertSame([], $resultado['advertencias']);
    }

    private function planDePrueba(): array
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $paciente = Paciente::query()->create([
            'user_id' => User::factory()->create()->getKey(),
            'nombres' => 'Paciente',
            'apellido_paterno' => 'Reporte',
            'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1992-01-01',
            'sexo' => 'femenino',
            'estado' => 'activo',
        ]);
        $recomendacion = RecomendacionNutricionalExperta::query()->create([
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista->getKey(),
            'enfoque_nutricional_experto' => 'antiinflamatorio_bajo_indice_glucemico',
            'prioridad_nutricional' => 'alta',
            'calorias_sugeridas' => 1600,
            'proteinas_porcentaje' => 30,
            'carbohidratos_porcentaje' => 35,
            'grasas_porcentaje' => 35,
            'fibra_sugerida' => 30,
            'restricciones' => ['Mani'],
            'recomendaciones' => ['Priorizar fibra'],
            'alertas' => ['Control metabolico'],
            'hechos_utilizados' => [
                'diagnostico_pmos' => ['diagnostico_confirmado' => true, 'fenotipo_pmos' => 'A'],
                'diagnostico_ri' => ['resistencia_confirmada' => true, 'grado_resistencia' => 'moderada'],
                'preferencias_alimentarias' => ['alimentos_preferidos' => ['pollo']],
                'habitos_alimentarios' => ['comidas_por_dia' => 4],
            ],
            'reglas_activadas' => ['NUT-RI-01'],
            'explicacion_experta' => 'Se priorizo control glucemico.',
            'confianza_experta' => 0.92,
            'estado_validacion_experta' => 'aprobado',
            'validado_por' => $nutricionista->getKey(),
            'fecha_validacion' => now(),
            'estado' => 'activo',
        ]);

        $plan = app(GeneradorPlanSemanalService::class)
            ->generarDesdeRecomendacion($recomendacion, $nutricionista);
        $plan->update([
            'estado_plan' => 'aprobado',
            'aprobado_por' => $nutricionista->getKey(),
            'fecha_aprobacion' => now(),
        ]);

        return [$nutricionista, $plan->fresh()];
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(
            ['nombre' => $nombre],
            ['descripcion' => ucfirst($nombre), 'estado' => 'activo']
        );
        $user = User::factory()->create(['estado' => 'activo']);
        UserRole::query()->create([
            'user_id' => $user->getKey(),
            'id_rol' => $rol->getKey(),
            'estado' => 'activo',
        ]);

        return $user;
    }
}
