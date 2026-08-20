<?php

namespace Tests\Feature\SistemaExperto;

use App\Models\ConsultaNutricional;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\RequerimientoNutricional;
use App\Models\User;
use App\Services\SistemaExperto\OrquestadorNutricionalExpertoService;
use App\Services\SistemaExperto\PersistenciaRecomendacionNutricionalExpertaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RecomendacionNutricionalExpertaTest extends TestCase
{
    use RefreshDatabase;

    public function test_persistencia_crea_recomendacion_nutricional_experta(): void
    {
        [$paciente, $nutricionista] = $this->contexto();

        $recomendacion = $this->persistencia()->guardar(
            $paciente,
            $this->respuesta(),
            $nutricionista
        );

        $this->assertDatabaseHas('recomendaciones_nutricionales_expertas', [
            'id_recomendacion_nutricional_experta' => $recomendacion->getKey(),
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista->getKey(),
        ]);
    }

    public function test_persistencia_mapea_resultado_correctamente(): void
    {
        [$paciente] = $this->contexto();
        $recomendacion = $this->persistencia()->guardar($paciente, $this->respuesta());

        $this->assertSame('antiinflamatorio_bajo_indice_glucemico', $recomendacion->enfoque_nutricional_experto);
        $this->assertSame('control_glucemico', $recomendacion->prioridad_nutricional);
        $this->assertSame('1600.00', $recomendacion->calorias_sugeridas);
        $this->assertSame('30.00', $recomendacion->proteinas_porcentaje);
        $this->assertSame(['Reducir azúcares simples'], $recomendacion->recomendaciones);
        $this->assertSame(['Maní'], $recomendacion->restricciones);
        $this->assertSame('Recomendación nutricional base.', $recomendacion->conclusion);
    }

    public function test_persistencia_mapea_trazabilidad_correctamente(): void
    {
        [$paciente] = $this->contexto();
        $recomendacion = $this->persistencia()->guardar($paciente, $this->respuesta());

        $this->assertTrue($recomendacion->generado_por_motor_experto);
        $this->assertSame(['imc' => 31.2], $recomendacion->hechos_utilizados);
        $this->assertSame(['NUT-RI-BAJO-IG'], $recomendacion->reglas_activadas);
        $this->assertSame(
            ['Evaluación nutricional integrada'],
            json_decode($recomendacion->explicacion_experta, true)
        );
        $this->assertSame('0.90', $recomendacion->confianza_experta);
        $this->assertSame('nutricion-base-v1', $recomendacion->version_motor_experto);
    }

    public function test_orquestador_construye_hechos_llama_microservicio_y_guarda(): void
    {
        [$paciente, $nutricionista] = $this->contexto();
        Http::fake([
            'http://127.0.0.1:8001/api/v1/nutricion/recomendacion-base' => Http::response(
                $this->respuesta()
            ),
        ]);

        $recomendacion = app(OrquestadorNutricionalExpertoService::class)
            ->generarRecomendacionBase($paciente, $nutricionista);

        $this->assertTrue($recomendacion->exists);
        $this->assertSame($paciente->getKey(), $recomendacion->id_paciente);
        Http::assertSent(fn ($request): bool =>
            $request->url() === 'http://127.0.0.1:8001/api/v1/nutricion/recomendacion-base'
            && $request->method() === 'POST'
            && array_key_exists('hechos', $request->data())
        );
    }

    public function test_recomendacion_queda_en_estado_pendiente(): void
    {
        [$paciente] = $this->contexto();
        $recomendacion = $this->persistencia()->guardar($paciente, $this->respuesta());

        $this->assertSame('pendiente', $recomendacion->estado);
        $this->assertSame('pendiente', $recomendacion->estado_validacion_experta);
        $this->assertTrue($recomendacion->estaPendienteValidacionExperta());
    }

    public function test_persistencia_no_modifica_requerimiento_existente(): void
    {
        [$paciente, $nutricionista] = $this->contexto();
        $requerimiento = $this->requerimiento($paciente, $nutricionista);
        $original = $requerimiento->fresh()->getAttributes();

        $recomendacion = $this->persistencia()->guardar(
            $paciente,
            $this->respuesta(),
            $nutricionista,
            $requerimiento
        );

        $this->assertSame($requerimiento->getKey(), $recomendacion->id_requerimiento_nutricional);
        $this->assertSame($original, $requerimiento->fresh()->getAttributes());
    }

    public function test_comando_existe_y_maneja_paciente_inexistente(): void
    {
        $this->artisan('experto:generar-recomendacion-nutricional', ['paciente' => 999999])
            ->expectsOutput('Este comando guarda una nueva recomendación nutricional experta.')
            ->expectsOutput('No se encontró el paciente indicado.')
            ->assertFailed();
    }

    public function test_persistencia_conserva_restricciones_y_preferencias_en_hechos(): void
    {
        [$paciente] = $this->contexto();
        $respuesta = $this->respuesta();
        $respuesta['trazabilidad']['hechos_utilizados'] = [
            'alergias' => ['maní'], 'intolerancias' => ['lactosa'],
            'alimentos_preferidos' => ['avena'], 'comidas_preferidas' => ['ensalada'],
        ];
        $recomendacion = $this->persistencia()->guardar($paciente, $respuesta);
        $this->assertSame(['maní'], $recomendacion->hechos_utilizados['alergias']);
        $this->assertSame(['avena'], $recomendacion->hechos_utilizados['alimentos_preferidos']);
    }

    public function test_comando_debug_existe_y_tolera_paciente_inexistente(): void
    {
        $this->artisan('experto:debug-nutricion', ['paciente' => 999999])
            ->expectsOutput('Paciente no encontrado.')->assertFailed();
    }

    private function persistencia(): PersistenciaRecomendacionNutricionalExpertaService
    {
        return app(PersistenciaRecomendacionNutricionalExpertaService::class);
    }

    private function contexto(): array
    {
        $usuarioPaciente = User::factory()->create();
        $nutricionista = User::factory()->create();
        $paciente = Paciente::query()->create([
            'user_id' => $usuarioPaciente->getKey(),
            'nombres' => 'Paciente',
            'apellido_paterno' => 'Prueba',
            'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1995-01-01',
            'sexo' => 'femenino',
            'estado' => 'activo',
        ]);

        return [$paciente, $nutricionista];
    }

    private function requerimiento(
        Paciente $paciente,
        User $nutricionista
    ): RequerimientoNutricional {
        $consulta = ConsultaNutricional::query()->create([
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista->getKey(),
            'fecha_consulta' => '2026-08-17',
            'estado' => true,
        ]);
        $evaluacion = EvaluacionNutricional::query()->create([
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista->getKey(),
            'id_consulta_nutricional' => $consulta->getKey(),
            'fecha_evaluacion' => '2026-08-17',
            'peso' => 80,
            'talla' => 1.65,
            'estado' => true,
        ]);

        return RequerimientoNutricional::query()->create([
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista->getKey(),
            'id_evaluacion_nutricional' => $evaluacion->getKey(),
            'fecha_calculo' => '2026-08-17',
            'peso_referencia' => 80,
            'talla_referencia' => 1.65,
            'factor_actividad' => 1.2,
            'tmb' => 1500,
            'get' => 1800,
            'calorias_objetivo' => 1600,
            'proteinas_diarias' => 120,
            'carbohidratos_diarios' => 140,
            'grasas_diarias' => 62,
            'fibra_diaria' => 30,
            'estado' => true,
        ]);
    }

    private function respuesta(): array
    {
        return [
            'resultado' => [
                'enfoque_nutricional_experto' => 'antiinflamatorio_bajo_indice_glucemico',
                'prioridad_nutricional' => 'control_glucemico',
                'calorias_sugeridas' => 1600,
                'proteinas_porcentaje' => 30,
                'carbohidratos_porcentaje' => 35,
                'grasas_porcentaje' => 35,
                'fibra_sugerida' => 30,
                'recomendaciones' => ['Reducir azúcares simples'],
                'restricciones' => ['Maní'],
                'alertas' => [],
                'conclusion' => 'Recomendación nutricional base.',
            ],
            'trazabilidad' => [
                'generado_por_motor_experto' => true,
                'hechos_utilizados' => ['imc' => 31.2],
                'reglas_activadas' => ['NUT-RI-BAJO-IG'],
                'explicacion_experta' => ['Evaluación nutricional integrada'],
                'recomendaciones_expertas' => ['Validar con nutricionista'],
                'confianza_experta' => 0.90,
                'version_motor_experto' => 'nutricion-base-v1',
                'evaluado_por_motor_experto_en' => '2026-08-17T12:00:00+00:00',
                'estado_validacion_experta' => 'pendiente',
            ],
        ];
    }
}
