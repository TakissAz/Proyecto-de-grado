<?php

namespace Tests\Feature\Endocrinologo;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Mockery;
use Tests\TestCase;

class EditarDiagnosticoClinicoTest extends TestCase
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
            'reglas_activadas' => ['PMOS-ORIGINAL'],
            'confianza_experta' => 0.95,
            'version_motor_experto' => 'pmos-v1',
        ]);
        $this->ri = Mockery::mock(DiagnosticoResistenciaInsulina::class)->makePartial();
        $this->ri->forceFill([
            'id_diagnostico_ri' => 202,
            'reglas_activadas' => ['RI-ORIGINAL'],
            'confianza_experta' => 0.90,
            'version_motor_experto' => 'ri-v1',
        ]);
        Route::bind('diagnostico', function (string $valor, $ruta) {
            return str_contains((string) $ruta->getName(), '.pmos.') ? $this->pmos : $this->ri;
        });
    }

    public function test_endocrinologo_puede_actualizar_diagnostico_pmos(): void
    {
        $this->pmos->shouldReceive('save')->once()->andReturnTrue();
        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))->putJson(
            route('endocrinologo.diagnosticos.pmos.update', 101),
            $this->datosPmos()
        );

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.fenotipo_pmos', 'A')
            ->assertJsonPath('data.diagnostico_confirmado', true);
        $this->assertSame('Conclusión clínica PMOS', $this->pmos->conclusion_medica);
    }

    public function test_endocrinologo_puede_actualizar_diagnostico_ri(): void
    {
        $this->ri->shouldReceive('save')->once()->andReturnTrue();
        $response = $this->actingAs($this->usuarioConRol('endocrinologo'))->putJson(
            route('endocrinologo.diagnosticos.ri.update', 202),
            $this->datosRi()
        );

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.grado_resistencia', 'moderada')
            ->assertJsonPath('data.resistencia_confirmada', true);
        $this->assertSame('Conclusión clínica RI', $this->ri->conclusion_medica);
    }

    public function test_usuario_sin_rol_endocrinologo_recibe_403(): void
    {
        $this->actingAs($this->usuarioConRol('nutricionista'))
            ->putJson(route('endocrinologo.diagnosticos.pmos.update', 101), $this->datosPmos())
            ->assertForbidden();
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        $this->put(route('endocrinologo.diagnosticos.pmos.update', 101), $this->datosPmos())
            ->assertRedirect(route('login'));
    }

    public function test_request_no_puede_modificar_trazabilidad_experta(): void
    {
        $this->pmos->shouldReceive('save')->once()->andReturnTrue();
        $datos = array_merge($this->datosPmos(), [
            'reglas_activadas' => ['REGLA-MANIPULADA'],
            'confianza_experta' => 0.01,
            'version_motor_experto' => 'manipulada',
            'estado_validacion_experta' => 'aprobado',
            'validado_por' => 999,
        ]);

        $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->putJson(route('endocrinologo.diagnosticos.pmos.update', 101), $datos)
            ->assertOk()
            ->assertJsonMissingPath('data.reglas_activadas');

        $this->assertSame(['PMOS-ORIGINAL'], $this->pmos->reglas_activadas);
        $this->assertSame('0.95', $this->pmos->confianza_experta);
        $this->assertSame('pmos-v1', $this->pmos->version_motor_experto);
        $this->assertNull($this->pmos->estado_validacion_experta);
        $this->assertNull($this->pmos->validado_por);
    }

    public function test_edicion_medica_conserva_reglas_y_confianza_experta(): void
    {
        $this->ri->shouldReceive('save')->once()->andReturnTrue();

        $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->putJson(route('endocrinologo.diagnosticos.ri.update', 202), $this->datosRi())
            ->assertOk();

        $this->assertSame(['RI-ORIGINAL'], $this->ri->reglas_activadas);
        $this->assertSame('0.90', $this->ri->confianza_experta);
        $this->assertSame('ri-v1', $this->ri->version_motor_experto);
    }

    private function datosPmos(): array
    {
        return [
            'diagnostico_confirmado' => true,
            'fenotipo_pmos' => 'A',
            'severidad_clinica' => 'moderada',
            'riesgo_metabolico' => 'alto',
            'tipo_hiperandrogenismo' => 'mixto',
            'conclusion_medica' => 'Conclusión clínica PMOS',
            'recomendaciones_medicas' => 'Seguimiento endocrinológico',
            'estado' => 'registrado',
        ];
    }

    private function datosRi(): array
    {
        return [
            'resistencia_confirmada' => true,
            'grado_resistencia' => 'moderada',
            'riesgo_diabetes' => 'moderado',
            'riesgo_cardiometabolico' => 'alto',
            'conclusion_medica' => 'Conclusión clínica RI',
            'recomendaciones_medicas' => 'Control metabólico',
            'estado' => 'registrado',
        ];
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::create(['nombre' => $nombre, 'descripcion' => ucfirst($nombre), 'estado' => 'activo']);
        $usuario = User::factory()->create(['estado' => 'activo']);
        UserRole::create(['user_id' => $usuario->id, 'id_rol' => $rol->id_rol, 'estado' => 'activo']);
        return $usuario;
    }
}
