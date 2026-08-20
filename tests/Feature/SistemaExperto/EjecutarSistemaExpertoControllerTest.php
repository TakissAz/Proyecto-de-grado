<?php

namespace Tests\Feature\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\SistemaExperto\OrquestadorSistemaExpertoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class EjecutarSistemaExpertoControllerTest extends TestCase
{
    use RefreshDatabase;

    private DiagnosticoPmos $pmos;

    private DiagnosticoResistenciaInsulina $ri;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake();

        $this->pmos = new DiagnosticoPmos();
        $this->pmos->forceFill([
            'id_diagnostico_pmos' => 101,
            'diagnostico_confirmado' => true,
            'fenotipo_pmos' => 'A',
            'total_criterios_rotterdam' => 3,
            'conclusion_medica' => 'Compatible con PMOS fenotipo A',
            'confianza_experta' => 0.95,
            'estado_validacion_experta' => 'pendiente',
            'reglas_activadas' => ['PMOS-ROTTERDAM-CONFIRMADO'],
            'explicacion_experta' => '["Cumple criterios"]',
        ]);

        $this->ri = new DiagnosticoResistenciaInsulina();
        $this->ri->forceFill([
            'id_diagnostico_ri' => 202,
            'resistencia_confirmada' => true,
            'grado_resistencia' => 'moderada',
            'riesgo_diabetes' => 'moderado',
            'riesgo_cardiometabolico' => 'alto',
            'homa_ir' => 3.41,
            'quicki' => 0.32,
            'conclusion_medica' => 'Compatible con resistencia a la insulina',
            'confianza_experta' => 0.90,
            'estado_validacion_experta' => 'pendiente',
            'reglas_activadas' => ['RI-GRADO-MODERADA'],
            'explicacion_experta' => '["HOMA-IR elevado"]',
        ]);

        Route::bind('diagnostico', function (string $valor, $ruta) {
            return str_contains((string) $ruta->getName(), '.pmos.')
                ? $this->pmos
                : $this->ri;
        });
    }

    public function test_endocrinologo_autenticado_puede_ejecutar_pmos(): void
    {
        $orquestador = Mockery::mock(OrquestadorSistemaExpertoService::class);
        $orquestador->shouldReceive('evaluarYPersistirPmos')
            ->once()->with($this->pmos)->andReturn($this->pmos);
        $this->app->instance(OrquestadorSistemaExpertoService::class, $orquestador);

        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->postJson(route('endocrinologo.sistema-experto.pmos.ejecutar', 101));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id_diagnostico_pmos', 101)
            ->assertJsonPath('data.diagnostico_confirmado', true)
            ->assertJsonPath('data.fenotipo_pmos', 'A')
            ->assertJsonMissingPath('data.id_paciente');
    }

    public function test_endocrinologo_autenticado_puede_ejecutar_ri(): void
    {
        $orquestador = Mockery::mock(OrquestadorSistemaExpertoService::class);
        $orquestador->shouldReceive('evaluarYPersistirResistenciaInsulina')
            ->once()->with($this->ri)->andReturn($this->ri);
        $this->app->instance(OrquestadorSistemaExpertoService::class, $orquestador);

        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->postJson(route('endocrinologo.sistema-experto.ri.ejecutar', 202));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id_diagnostico_ri', 202)
            ->assertJsonPath('data.resistencia_confirmada', true)
            ->assertJsonPath('data.grado_resistencia', 'moderada')
            ->assertJsonMissingPath('data.id_paciente');
    }

    public function test_usuario_sin_rol_endocrinologo_recibe_403(): void
    {
        $response = $this->actingAs($this->usuarioConRol('nutricionista'))
            ->postJson(route('endocrinologo.sistema-experto.pmos.ejecutar', 101));

        $response->assertForbidden();
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        $response = $this->post(
            route('endocrinologo.sistema-experto.pmos.ejecutar', 101)
        );

        $response->assertRedirect(route('login'));
    }

    public function test_fallo_del_microservicio_devuelve_error_controlado(): void
    {
        $orquestador = Mockery::mock(OrquestadorSistemaExpertoService::class);
        $orquestador->shouldReceive('evaluarYPersistirPmos')
            ->once()
            ->andThrow(new RuntimeException(
                'No se pudo completar la evaluación experta de PMOS.',
                0,
                new ConnectionException('Microservicio no disponible')
            ));
        $this->app->instance(OrquestadorSistemaExpertoService::class, $orquestador);

        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->postJson(route('endocrinologo.sistema-experto.pmos.ejecutar', 101));

        $response->assertStatus(502)
            ->assertJson([
                'success' => false,
                'message' => 'El microservicio experto no está disponible. Intente nuevamente más tarde.',
            ]);
    }

    private function usuarioConRol(string $nombreRol): User
    {
        $rol = Role::create([
            'nombre' => $nombreRol,
            'descripcion' => ucfirst($nombreRol),
            'estado' => 'activo',
        ]);
        $usuario = User::factory()->create(['estado' => 'activo']);
        UserRole::create([
            'user_id' => $usuario->id,
            'id_rol' => $rol->id_rol,
            'estado' => 'activo',
        ]);

        return $usuario;
    }
}
