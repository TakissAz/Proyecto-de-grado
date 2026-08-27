<?php

namespace Tests\Feature\Nutricion;

use App\Models\ReglaNutricional;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReglasNutricionalesControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_puede_listar_crear_y_editar_reglas(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $this->actingAs($nutricionista)->get(route('nutricionista.reglas-nutricionales.index'))->assertOk();

        $this->post(route('nutricionista.reglas-nutricionales.store'), $this->datos())
            ->assertRedirect(route('nutricionista.reglas-nutricionales.index'));

        $regla = ReglaNutricional::query()->where('codigo', 'RN-TEST-01')->firstOrFail();
        $this->assertTrue($regla->estado);
        $this->assertSame(-250.0, (float) $regla->resultado['ajuste_calorico']);

        $this->put(route('nutricionista.reglas-nutricionales.update', $regla), $this->datos(['nombre' => 'Regla profesional actualizada']))
            ->assertRedirect(route('nutricionista.reglas-nutricionales.index'));
        $this->assertSame('Regla profesional actualizada', $regla->fresh()->nombre);
    }

    public function test_formulario_no_expone_operaciones_de_activar_o_inactivar(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $this->actingAs($nutricionista)->get(route('nutricionista.reglas-nutricionales.create'))->assertOk();

        $this->assertFalse(app('router')->has('nutricionista.reglas-nutricionales.activar'));
        $this->assertFalse(app('router')->has('nutricionista.reglas-nutricionales.inactivar'));
    }

    public function test_valida_resultado_condicion_y_suma_de_macronutrientes(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');

        $this->actingAs($nutricionista)->post(route('nutricionista.reglas-nutricionales.store'), $this->datos([
            'condicion_valor' => '',
            'ajuste_calorico' => '',
            'porcentaje_proteinas' => 30,
            'porcentaje_carbohidratos' => 30,
            'porcentaje_grasas' => 30,
        ]))->assertSessionHasErrors(['condicion_valor', 'porcentaje_proteinas']);

        $this->assertDatabaseCount('reglas_nutricionales', 0);
    }

    public function test_usuario_sin_rol_no_puede_gestionar_reglas(): void
    {
        $usuario = $this->usuarioConRol('paciente');
        $this->actingAs($usuario)->get(route('nutricionista.reglas-nutricionales.index'))->assertForbidden();
        $this->actingAs($usuario)->post(route('nutricionista.reglas-nutricionales.store'), $this->datos())->assertForbidden();
    }

    private function datos(array $extra = []): array
    {
        return array_merge([
            'codigo' => 'RN-TEST-01',
            'nombre' => 'Ajuste profesional de prueba',
            'tipo_regla' => 'ajuste_calorico',
            'condicion_campo' => 'objetivo_principal',
            'condicion_operador' => '=',
            'condicion_valor' => 'perdida_peso',
            'prioridad' => 40,
            'descripcion' => 'Fundamento clínico de la regla.',
            'fuente' => 'Protocolo nutricional institucional',
            'ajuste_calorico' => -250,
            'porcentaje_proteinas' => '',
            'porcentaje_carbohidratos' => '',
            'porcentaje_grasas' => '',
            'fibra_diaria' => '',
            'calorias_minimas' => '',
            'observacion_resultado' => 'Aplicar ajuste moderado.',
        ], $extra);
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => $nombre], ['descripcion' => ucfirst($nombre), 'estado' => 'activo']);
        $user = User::factory()->create(['estado' => 'activo', 'email_verified_at' => now()]);
        UserRole::query()->create(['user_id' => $user->getKey(), 'id_rol' => $rol->getKey(), 'estado' => 'activo']);
        return $user;
    }
}
