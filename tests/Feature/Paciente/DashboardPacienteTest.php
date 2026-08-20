<?php

namespace Tests\Feature\Paciente;

use App\Models\Alimento;
use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\ConsultaNutricional;
use App\Models\DiaPlanAlimentario;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardPacienteTest extends TestCase
{
    use RefreshDatabase;

    public function test_paciente_autenticado_puede_ver_dashboard_sin_plan(): void
    {
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Paciente/Dashboard')->where('planAlimentario', null));
    }

    public function test_dashboard_carga_plan_aprobado_del_paciente(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $plan = $this->plan($paciente, 'aprobado');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('planAlimentario.id_plan_alimentario', $plan->getKey())
        );
    }

    public function test_plan_activo_tiene_prioridad_sobre_aprobado_mas_reciente(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $activo = $this->plan($paciente, 'activo');
        $this->plan($paciente, 'aprobado');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('planAlimentario.id_plan_alimentario', $activo->getKey())
        );
    }

    public function test_no_muestra_planes_en_estados_no_publicados(): void
    {
        foreach (['sugerido', 'en_revision', 'rechazado', 'finalizado'] as $estado) {
            [$user, $paciente] = $this->pacienteConUsuario();
            $this->plan($paciente, $estado);
            $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
                fn (Assert $page) => $page->where('planAlimentario', null)
            );
            auth()->logout();
        }
    }

    public function test_paciente_no_ve_plan_de_otro_paciente(): void
    {
        [$user] = $this->pacienteConUsuario();
        [, $otro] = $this->pacienteConUsuario();
        $this->plan($otro, 'activo');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('planAlimentario', null)
        );
    }

    public function test_cuenta_sin_perfil_recibe_estado_controlado(): void
    {
        $user = $this->usuarioConRol('paciente');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('paciente', null)->where('planAlimentario', null)
        );
    }

    public function test_usuario_sin_rol_paciente_recibe_403(): void
    {
        $this->actingAs($this->usuarioConRol('nutricionista'))->get(route('paciente.dashboard'))->assertForbidden();
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        $this->get(route('paciente.dashboard'))->assertRedirect(route('login'));
    }

    public function test_portal_incluye_lista_de_compras_con_plan_aprobado(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $plan = $this->plan($paciente, 'aprobado');
        $this->agregarAlimentoAlPlan($plan, 'Avena', 'Carbohidratos', 350, 'g');

        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('listaCompras.resumen.total_items', 1)
        );
    }

    public function test_portal_devuelve_lista_nula_sin_plan_visible(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $this->plan($paciente, 'en_revision');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('listaCompras', null)
        );
    }

    public function test_dashboard_recibe_alimentos_del_plan_propio(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $plan = $this->plan($paciente, 'activo');
        $this->agregarAlimentoAlPlan($plan, 'Yogur natural', 'Lácteos', 2, 'unidad');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('listaCompras.categorias.0.items.0.nombre', 'Yogur natural')
        );
    }

    public function test_paciente_no_recibe_lista_de_compras_de_otro_paciente(): void
    {
        [$user] = $this->pacienteConUsuario();
        [, $otro] = $this->pacienteConUsuario();
        $planAjeno = $this->plan($otro, 'activo');
        $this->agregarAlimentoAlPlan($planAjeno, 'Producto ajeno', 'Otros', 1, 'unidad');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('listaCompras', null)
        );
    }

    public function test_lista_del_dashboard_incluye_referencia_usado_en(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $plan = $this->plan($paciente, 'activo');
        $this->agregarAlimentoAlPlan($plan, 'Quinua', 'Carbohidratos', 150, 'g');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('listaCompras.categorias.0.items.0.usado_en.0', 'Día 1 - Almuerzo')
        );
    }

    public function test_portal_incluye_progreso_aunque_no_haya_plan(): void
    {
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->has('progresoPaciente')->where('progresoPaciente.plan', null)
        );
    }

    public function test_dashboard_recibe_progreso_del_paciente_autenticado(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $this->agregarEvaluacion($paciente, 68.4);
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('progresoPaciente.evaluacion.peso_actual', 68.4)
        );
    }

    public function test_paciente_no_recibe_progreso_de_otro_paciente(): void
    {
        [$user] = $this->pacienteConUsuario();
        [, $otro] = $this->pacienteConUsuario();
        $this->agregarEvaluacion($otro, 99.9);
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(
            fn (Assert $page) => $page->where('progresoPaciente.evaluacion.peso_actual', null)
        );
    }

    private function pacienteConUsuario(): array
    {
        $user = $this->usuarioConRol('paciente');
        $paciente = Paciente::query()->create([
            'user_id' => $user->getKey(), 'nombres' => 'Paciente', 'apellido_paterno' => 'Portal',
            'ci' => fake()->unique()->numerify('########'), 'fecha_nacimiento' => '1995-01-01',
            'sexo' => 'femenino', 'estado' => 'activo',
        ]);
        return [$user, $paciente];
    }

    private function plan(Paciente $paciente, string $estado): PlanAlimentario
    {
        return PlanAlimentario::query()->create([
            'id_paciente' => $paciente->getKey(), 'nombre' => "Plan {$estado}",
            'estado_plan' => $estado, 'fecha_inicio' => '2026-08-18', 'fecha_fin' => '2026-08-24',
            'duracion_dias' => 7, 'calorias_objetivo' => 1600, 'proteinas_objetivo' => 100,
            'carbohidratos_objetivo' => 170, 'grasas_objetivo' => 55, 'fibra_objetivo' => 30,
            'estado' => 'activo',
        ]);
    }

    private function agregarAlimentoAlPlan(PlanAlimentario $plan, string $nombre, string $grupo, float $cantidad, string $unidad): void
    {
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario' => $plan->getKey(), 'numero_dia' => 1, 'nombre_dia' => 'Lunes']);
        $comida = ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario' => $dia->getKey(), 'tipo_comida' => 'almuerzo', 'orden' => 1]);
        $alimento = Alimento::query()->create([
            'nombre' => $nombre, 'grupo_alimentario' => $grupo, 'unidad_base' => $unidad,
            'cantidad_base' => 100, 'calorias' => 100, 'proteinas' => 5,
            'carbohidratos' => 15, 'grasas' => 2, 'fibra' => 3,
        ]);
        ComponenteComidaPlan::query()->create([
            'id_comida_plan_alimentario' => $comida->getKey(), 'tipo_componente' => 'alimento',
            'id_alimento' => $alimento->getKey(), 'cantidad' => $cantidad, 'unidad' => $unidad, 'orden' => 1,
        ]);
    }

    private function agregarEvaluacion(Paciente $paciente, float $peso): void
    {
        $nutricionista = User::factory()->create();
        $consulta = ConsultaNutricional::query()->create(['id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->getKey(), 'fecha_consulta' => '2026-08-18']);
        EvaluacionNutricional::query()->create(['id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->getKey(), 'id_consulta_nutricional' => $consulta->getKey(), 'fecha_evaluacion' => '2026-08-19', 'peso' => $peso, 'talla' => 1.62, 'estado' => true]);
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => $nombre], ['descripcion' => ucfirst($nombre), 'estado' => 'activo']);
        $user = User::factory()->create(['estado' => 'activo']);
        UserRole::query()->create(['user_id' => $user->getKey(), 'id_rol' => $rol->getKey(), 'estado' => 'activo']);
        return $user;
    }
}
