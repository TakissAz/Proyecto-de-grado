<?php

namespace Tests\Feature\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Mockery;
use Tests\TestCase;

class ValidarResultadoExpertoControllerTest extends TestCase
{
    use RefreshDatabase;

    private DiagnosticoPmos $pmos;

    private DiagnosticoResistenciaInsulina $ri;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pmos = Mockery::mock(DiagnosticoPmos::class)->makePartial();
        $this->pmos->forceFill([
            'id_diagnostico_pmos' => 101,
            'estado_validacion_experta' => 'pendiente',
        ]);

        $this->ri = Mockery::mock(DiagnosticoResistenciaInsulina::class)->makePartial();
        $this->ri->forceFill([
            'id_diagnostico_ri' => 202,
            'estado_validacion_experta' => 'pendiente',
        ]);

        Route::bind('diagnostico', function (string $valor, $ruta) {
            return str_contains((string) $ruta->getName(), '.pmos.')
                ? $this->pmos
                : $this->ri;
        });
    }

    public function test_endocrinologo_puede_aprobar_pmos(): void
    {
        $usuario = $this->usuarioConRol('endocrinologo');
        $this->pmos->shouldReceive('save')->once()->andReturnTrue();

        $response = $this->actingAs($usuario)->postJson(
            route('endocrinologo.sistema-experto.pmos.validar', 101),
            ['estado_validacion_experta' => 'aprobado']
        );

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.estado_validacion_experta', 'aprobado')
            ->assertJsonPath('data.validado_por', $usuario->id)
            ->assertJsonPath('data.observacion_validacion', null);
        $this->assertNotNull($this->pmos->fecha_validacion);
    }

    public function test_endocrinologo_puede_rechazar_pmos_con_observacion(): void
    {
        $usuario = $this->usuarioConRol('endocrinologo');
        $this->pmos->shouldReceive('save')->once()->andReturnTrue();

        $response = $this->actingAs($usuario)->postJson(
            route('endocrinologo.sistema-experto.pmos.validar', 101),
            [
                'estado_validacion_experta' => 'rechazado',
                'observacion_validacion' => 'No concuerda con la evaluación clínica.',
            ]
        );

        $response->assertOk()
            ->assertJsonPath('data.estado_validacion_experta', 'rechazado')
            ->assertJsonPath('data.observacion_validacion', 'No concuerda con la evaluación clínica.');
    }

    public function test_endocrinologo_puede_aprobar_ri(): void
    {
        $usuario = $this->usuarioConRol('endocrinologo');
        $this->ri->shouldReceive('save')->once()->andReturnTrue();

        $response = $this->actingAs($usuario)->postJson(
            route('endocrinologo.sistema-experto.ri.validar', 202),
            ['estado_validacion_experta' => 'aprobado']
        );

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.estado_validacion_experta', 'aprobado')
            ->assertJsonPath('data.validado_por', $usuario->id);
        $this->assertNotNull($this->ri->fecha_validacion);
    }

    public function test_endocrinologo_puede_rechazar_ri_con_observacion(): void
    {
        $usuario = $this->usuarioConRol('endocrinologo');
        $this->ri->shouldReceive('save')->once()->andReturnTrue();

        $response = $this->actingAs($usuario)->postJson(
            route('endocrinologo.sistema-experto.ri.validar', 202),
            [
                'estado_validacion_experta' => 'rechazado',
                'observacion_validacion' => 'Requiere repetir laboratorios.',
            ]
        );

        $response->assertOk()
            ->assertJsonPath('data.estado_validacion_experta', 'rechazado')
            ->assertJsonPath('data.observacion_validacion', 'Requiere repetir laboratorios.');
    }

    public function test_usuario_sin_rol_endocrinologo_recibe_403(): void
    {
        $response = $this->actingAs($this->usuarioConRol('nutricionista'))
            ->postJson(
                route('endocrinologo.sistema-experto.pmos.validar', 101),
                ['estado_validacion_experta' => 'aprobado']
            );

        $response->assertForbidden();
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        $response = $this->post(
            route('endocrinologo.sistema-experto.pmos.validar', 101),
            ['estado_validacion_experta' => 'aprobado']
        );

        $response->assertRedirect(route('login'));
    }

    public function test_estado_invalido_devuelve_422(): void
    {
        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->postJson(
                route('endocrinologo.sistema-experto.pmos.validar', 101),
                ['estado_validacion_experta' => 'pendiente']
            );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('estado_validacion_experta');
    }

    public function test_endocrinologo_puede_cambiar_una_validacion_ya_guardada(): void
    {
        $usuario = $this->usuarioConRol('endocrinologo');
        $this->pmos->forceFill(['estado_validacion_experta' => 'aprobado']);
        $this->pmos->shouldReceive('save')->twice()->andReturnTrue();

        $this->actingAs($usuario)->postJson(
            route('endocrinologo.sistema-experto.pmos.validar', 101),
            [
                'estado_validacion_experta' => 'rechazado',
                'observacion_validacion' => 'Se requieren datos clínicos complementarios.',
            ]
        )->assertOk()->assertJsonPath('data.estado_validacion_experta', 'rechazado');

        $this->postJson(
            route('endocrinologo.sistema-experto.pmos.validar', 101),
            [
                'estado_validacion_experta' => 'aprobado',
                'observacion_validacion' => 'Información complementada y revisada.',
            ]
        )->assertOk()->assertJsonPath('data.estado_validacion_experta', 'aprobado');
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
