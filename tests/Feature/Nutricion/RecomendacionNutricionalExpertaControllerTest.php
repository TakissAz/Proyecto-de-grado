<?php

namespace Tests\Feature\Nutricion;

use App\Models\ConsultaNutricional;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\RequerimientoNutricional;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Nutricion\PerfilNutricionalService;
use App\Services\SistemaExperto\PersistenciaRecomendacionNutricionalExpertaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RecomendacionNutricionalExpertaControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.pmos_experto.url' => 'http://127.0.0.1:8001']);
    }

    public function test_nutricionista_puede_generar_recomendacion_experta(): void
    {
        $paciente = $this->paciente();
        $nutricionista = $this->usuarioConRol('nutricionista');
        Http::fake($this->respuestaFake());

        $ruta = route('nutricionista.recomendacion-experta.generar', $paciente);
        $this->actingAs($nutricionista)->postJson($ruta)->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.enfoque_nutricional_experto', 'bajo_indice_glucemico_alto_fibra');
        $this->postJson($ruta)->assertOk();

        $this->assertSame(2, RecomendacionNutricionalExperta::query()->count());
    }

    public function test_usuario_sin_rol_nutricionista_recibe_403(): void
    {
        $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->postJson(route('nutricionista.recomendacion-experta.generar', $this->paciente()))
            ->assertForbidden();
    }

    public function test_usuario_no_autenticado_redirige(): void
    {
        $this->post(route('nutricionista.recomendacion-experta.generar', 999999))
            ->assertRedirect(route('login'));
    }

    public function test_nutricionista_puede_aprobar_recomendacion(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $recomendacion = $this->recomendacion($this->paciente());

        $this->actingAs($nutricionista)->postJson(
            route('nutricionista.recomendacion-experta.validar', $recomendacion),
            ['estado_validacion_experta' => 'aprobado']
        )->assertOk()
            ->assertJsonPath('data.estado_validacion_experta', 'aprobado')
            ->assertJsonPath('data.validado_por', $nutricionista->getKey());

        $this->assertNotNull($recomendacion->fresh()->fecha_validacion);
    }

    public function test_nutricionista_puede_rechazar_con_observacion(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $recomendacion = $this->recomendacion($this->paciente());

        $this->actingAs($nutricionista)->postJson(
            route('nutricionista.recomendacion-experta.validar', $recomendacion),
            [
                'estado_validacion_experta' => 'rechazado',
                'observacion_validacion' => 'Se requiere ajustar la distribución.',
            ]
        )->assertOk()
            ->assertJsonPath('data.estado_validacion_experta', 'rechazado')
            ->assertJsonPath('data.observacion_validacion', 'Se requiere ajustar la distribución.');
    }

    public function test_estado_invalido_devuelve_422(): void
    {
        $this->actingAs($this->usuarioConRol('nutricionista'))->postJson(
            route('nutricionista.recomendacion-experta.validar', $this->recomendacion($this->paciente())),
            ['estado_validacion_experta' => 'pendiente']
        )->assertUnprocessable()->assertJsonValidationErrors('estado_validacion_experta');
    }

    public function test_generar_usa_http_fake_y_no_requiere_fastapi_real(): void
    {
        Http::fake($this->respuestaFake());

        $this->actingAs($this->usuarioConRol('nutricionista'))->postJson(
            route('nutricionista.recomendacion-experta.generar', $this->paciente())
        )->assertOk();

        Http::assertSent(fn ($request): bool =>
            $request->method() === 'POST'
            && $request->url() === 'http://127.0.0.1:8001/api/v1/nutricion/recomendacion-base'
            && isset($request->data()['hechos'])
        );
    }

    public function test_generar_crea_registro_sin_modificar_requerimiento(): void
    {
        $paciente = $this->paciente();
        $nutricionista = $this->usuarioConRol('nutricionista');
        $requerimiento = $this->requerimiento($paciente, $nutricionista);
        $atributosOriginales = $requerimiento->fresh()->getAttributes();
        Http::fake($this->respuestaFake());

        $this->actingAs($nutricionista)->postJson(
            route('nutricionista.recomendacion-experta.generar', $paciente)
        )->assertOk();

        $this->assertDatabaseHas('recomendaciones_nutricionales_expertas', [
            'id_paciente' => $paciente->getKey(),
            'id_requerimiento_nutricional' => $requerimiento->getKey(),
        ]);
        $this->assertSame($atributosOriginales, $requerimiento->fresh()->getAttributes());
    }

    public function test_rechazadas_no_se_devuelven_como_recomendacion_principal(): void
    {
        $paciente = $this->paciente();
        $pendiente = $this->recomendacion($paciente);
        $rechazada = $this->recomendacion($paciente, 'rechazado');

        $principal = app(PerfilNutricionalService::class)
            ->recomendacionExpertaPrincipal($paciente);

        $this->assertSame($pendiente->getKey(), $principal?->getKey());
        $this->assertNotSame($rechazada->getKey(), $principal?->getKey());
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(
            ['nombre' => $nombre],
            ['descripcion' => ucfirst($nombre), 'estado' => 'activo']
        );
        $usuario = User::factory()->create(['estado' => 'activo']);
        UserRole::query()->create([
            'user_id' => $usuario->getKey(),
            'id_rol' => $rol->getKey(),
            'estado' => 'activo',
        ]);

        return $usuario;
    }

    private function paciente(): Paciente
    {
        $usuario = User::factory()->create();

        return Paciente::query()->create([
            'user_id' => $usuario->getKey(),
            'nombres' => 'Paciente',
            'apellido_paterno' => 'Nutrición',
            'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1994-01-01',
            'sexo' => 'femenino',
            'estado' => 'activo',
        ]);
    }

    private function recomendacion(
        Paciente $paciente,
        string $estado = 'pendiente'
    ): RecomendacionNutricionalExperta {
        $respuesta = $this->respuesta();
        $respuesta['trazabilidad']['estado_validacion_experta'] = $estado;

        return app(PersistenciaRecomendacionNutricionalExpertaService::class)
            ->guardar($paciente, $respuesta);
    }

    private function respuestaFake(): array
    {
        return [
            'http://127.0.0.1:8001/api/v1/nutricion/recomendacion-base' => Http::response(
                $this->respuesta()
            ),
        ];
    }

    private function respuesta(): array
    {
        return [
            'resultado' => [
                'enfoque_nutricional_experto' => 'bajo_indice_glucemico_alto_fibra',
                'prioridad_nutricional' => 'control_glucemico',
                'calorias_sugeridas' => 1600,
                'proteinas_porcentaje' => 30,
                'carbohidratos_porcentaje' => 35,
                'grasas_porcentaje' => 35,
                'fibra_sugerida' => 30,
                'recomendaciones' => ['Reducir azúcares simples'],
                'restricciones' => [],
                'alertas' => [],
                'conclusion' => 'Recomendación nutricional base.',
            ],
            'trazabilidad' => [
                'generado_por_motor_experto' => true,
                'hechos_utilizados' => ['imc' => null],
                'reglas_activadas' => ['NUT-RI-BAJO-IG'],
                'explicacion_experta' => ['Evaluación integrada'],
                'recomendaciones_expertas' => [],
                'confianza_experta' => 0.8,
                'version_motor_experto' => 'nutricion-base-v1',
                'evaluado_por_motor_experto_en' => '2026-08-18T12:00:00+00:00',
                'estado_validacion_experta' => 'pendiente',
            ],
        ];
    }

    private function requerimiento(Paciente $paciente, User $nutricionista): RequerimientoNutricional
    {
        $consulta = ConsultaNutricional::query()->create([
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista->getKey(),
            'fecha_consulta' => '2026-08-18',
            'estado' => true,
        ]);
        $evaluacion = EvaluacionNutricional::query()->create([
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista->getKey(),
            'id_consulta_nutricional' => $consulta->getKey(),
            'fecha_evaluacion' => '2026-08-18',
            'peso' => 80,
            'talla' => 1.65,
            'estado' => true,
        ]);

        return RequerimientoNutricional::query()->create([
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista->getKey(),
            'id_evaluacion_nutricional' => $evaluacion->getKey(),
            'fecha_calculo' => '2026-08-18',
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
}
