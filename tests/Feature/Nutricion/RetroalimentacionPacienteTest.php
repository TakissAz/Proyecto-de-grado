<?php

namespace Tests\Feature\Nutricion;

use App\Models\ComidaPlanAlimentario;
use App\Models\DiaPlanAlimentario;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\RetroalimentacionPaciente;
use App\Models\Role;
use App\Models\SeguimientoComida;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Nutricion\PerfilNutricionalService;
use App\Services\Paciente\PortalPacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RetroalimentacionPacienteTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_crea_retroalimentacion_visible_para_paciente(): void
    {
        [$nutricionista] = $this->usuarioPaciente('nutricionista'); [, $paciente] = $this->usuarioPaciente('paciente');
        $this->actingAs($nutricionista)->postJson(route('nutricionista.pacientes.retroalimentaciones.store', $paciente), $this->datos())
            ->assertCreated()->assertJsonPath('success', true);
        $this->assertDatabaseHas('retroalimentaciones_paciente', ['id_paciente' => $paciente->getKey(), 'id_usuario_emisor' => $nutricionista->getKey(), 'rol_emisor' => 'nutricionista']);
    }

    public function test_puede_asociar_plan_y_seguimiento_del_mismo_paciente(): void
    {
        [$nutricionista] = $this->usuarioPaciente('nutricionista'); [, $paciente, $plan, $seguimiento] = $this->escenarioPaciente();
        $this->actingAs($nutricionista)->postJson(route('nutricionista.pacientes.retroalimentaciones.store', $paciente), $this->datos(['id_plan_alimentario' => $plan->getKey(), 'id_seguimiento_comida' => $seguimiento->getKey()]))->assertCreated();
        $this->assertDatabaseHas('retroalimentaciones_paciente', ['id_plan_alimentario' => $plan->getKey(), 'id_seguimiento_comida' => $seguimiento->getKey()]);
    }

    public function test_no_permite_asociar_plan_o_seguimiento_de_otro_paciente(): void
    {
        [$nutricionista] = $this->usuarioPaciente('nutricionista'); [, $paciente] = $this->usuarioPaciente('paciente'); [, , $planOtro, $seguimientoOtro] = $this->escenarioPaciente();
        $this->actingAs($nutricionista)->postJson(route('nutricionista.pacientes.retroalimentaciones.store', $paciente), $this->datos(['id_plan_alimentario' => $planOtro->getKey()]))->assertUnprocessable()->assertJsonValidationErrors('id_plan_alimentario');
        $this->postJson(route('nutricionista.pacientes.retroalimentaciones.store', $paciente), $this->datos(['id_seguimiento_comida' => $seguimientoOtro->getKey()]))->assertUnprocessable()->assertJsonValidationErrors('id_seguimiento_comida');
    }

    public function test_usuario_sin_rol_nutricionista_no_puede_crear(): void
    {
        [$usuario] = $this->usuarioPaciente('paciente'); [, $paciente] = $this->usuarioPaciente('paciente');
        $this->actingAs($usuario)->postJson(route('nutricionista.pacientes.retroalimentaciones.store', $paciente), $this->datos())->assertForbidden();
    }

    public function test_portal_muestra_solo_mensajes_propios_visibles_y_calcula_no_leidos(): void
    {
        [$usuario, $paciente] = $this->usuarioPaciente('paciente'); [, $otro] = $this->usuarioPaciente('paciente'); [$nutricionista] = $this->usuarioPaciente('nutricionista');
        $this->crear($paciente, $nutricionista); $this->crear($paciente, $nutricionista); $this->crear($paciente, $nutricionista, ['visible_para_paciente' => false]); $this->crear($otro, $nutricionista);
        $resultado = app(PortalPacienteService::class)->obtenerDashboard($usuario);
        $this->assertCount(2, $resultado['retroalimentaciones']['items']);
        $this->assertSame(2, $resultado['retroalimentaciones']['total_no_leidas']);
        $this->actingAs($usuario)->get(route('paciente.dashboard'))->assertInertia(fn (Assert $pagina) => $pagina->has('retroalimentaciones.items', 2)->where('retroalimentaciones.total_no_leidas', 2));
    }

    public function test_paciente_marca_su_retroalimentacion_como_leida(): void
    {
        [$usuario, $paciente] = $this->usuarioPaciente('paciente'); [$nutricionista] = $this->usuarioPaciente('nutricionista'); $retro = $this->crear($paciente, $nutricionista);
        $this->actingAs($usuario)->postJson(route('paciente.retroalimentaciones.marcar-leida', $retro))->assertOk();
        $this->assertDatabaseHas('retroalimentaciones_paciente', ['id_retroalimentacion_paciente' => $retro->getKey(), 'leido_por_paciente' => true]);
        $this->assertNotNull($retro->refresh()->fecha_lectura_paciente);
    }

    public function test_paciente_no_puede_marcar_retroalimentacion_de_otro_paciente(): void
    {
        [$usuario] = $this->usuarioPaciente('paciente'); [, $otro] = $this->usuarioPaciente('paciente'); [$nutricionista] = $this->usuarioPaciente('nutricionista');
        $this->actingAs($usuario)->postJson(route('paciente.retroalimentaciones.marcar-leida', $this->crear($otro, $nutricionista)))->assertForbidden();
    }

    public function test_perfil_nutricional_muestra_historial_y_tolera_historial_vacio(): void
    {
        [, $paciente] = $this->usuarioPaciente('paciente'); [$nutricionista] = $this->usuarioPaciente('nutricionista');
        $this->assertSame([], app(PerfilNutricionalService::class)->historialRetroalimentaciones($paciente));
        $this->crear($paciente, $nutricionista);
        $historial = app(PerfilNutricionalService::class)->historialRetroalimentaciones($paciente);
        $this->assertCount(1, $historial); $this->assertSame('Nutricionista Prueba', $historial[0]['profesional']);
    }

    public function test_valida_tipo_mensaje_y_prioridad(): void
    {
        [$nutricionista] = $this->usuarioPaciente('nutricionista'); [, $paciente] = $this->usuarioPaciente('paciente');
        $this->actingAs($nutricionista)->postJson(route('nutricionista.pacientes.retroalimentaciones.store', $paciente), ['tipo_retroalimentacion' => 'otro', 'prioridad' => 'urgente', 'mensaje' => ''])
            ->assertUnprocessable()->assertJsonValidationErrors(['tipo_retroalimentacion', 'prioridad', 'mensaje']);
    }

    private function datos(array $extra = []): array { return array_merge(['tipo_retroalimentacion' => 'adherencia', 'prioridad' => 'normal', 'mensaje' => 'Continúa registrando tus comidas.', 'visible_para_paciente' => true], $extra); }
    private function crear(Paciente $paciente, User $emisor, array $extra = []): RetroalimentacionPaciente { return RetroalimentacionPaciente::query()->create(array_merge(['id_paciente' => $paciente->getKey(), 'id_usuario_emisor' => $emisor->getKey(), 'rol_emisor' => 'nutricionista', 'tipo_retroalimentacion' => 'adherencia', 'mensaje' => 'Mensaje profesional', 'prioridad' => 'normal', 'visible_para_paciente' => true, 'estado' => 'activo'], $extra)); }
    private function escenarioPaciente(): array
    {
        [$usuario, $paciente] = $this->usuarioPaciente('paciente');
        $plan = PlanAlimentario::query()->create(['id_paciente' => $paciente->getKey(), 'nombre' => 'Plan', 'estado_plan' => 'activo', 'duracion_dias' => 1, 'estado' => 'activo']);
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario' => $plan->getKey(), 'numero_dia' => 1, 'nombre_dia' => 'Lunes', 'estado' => 'activo']);
        $comida = ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario' => $dia->getKey(), 'tipo_comida' => 'desayuno', 'nombre_comida' => 'Desayuno', 'orden' => 1, 'estado' => 'activo']);
        $seguimiento = SeguimientoComida::query()->create(['id_paciente' => $paciente->getKey(), 'id_plan_alimentario' => $plan->getKey(), 'id_dia_plan_alimentario' => $dia->getKey(), 'id_comida_plan_alimentario' => $comida->getKey(), 'fecha_seguimiento' => today(), 'estado_cumplimiento' => 'parcial']);
        return [$usuario, $paciente, $plan, $seguimiento];
    }
    private function usuarioPaciente(string $rol): array
    {
        $role = Role::query()->firstOrCreate(['nombre' => $rol], ['descripcion' => ucfirst($rol), 'estado' => 'activo']);
        $usuario = User::factory()->create(['name' => $rol === 'nutricionista' ? 'Nutricionista Prueba' : 'Paciente Prueba', 'estado' => 'activo', 'email_verified_at' => now()]);
        UserRole::query()->create(['user_id' => $usuario->getKey(), 'id_rol' => $role->getKey(), 'estado' => 'activo']);
        $paciente = $rol === 'paciente' ? Paciente::query()->create(['user_id' => $usuario->getKey(), 'nombres' => 'Paciente', 'apellido_paterno' => 'Prueba', 'ci' => fake()->unique()->numerify('########'), 'fecha_nacimiento' => '1995-01-01', 'sexo' => 'femenino', 'estado' => 'activo']) : null;
        return [$usuario, $paciente];
    }
}
