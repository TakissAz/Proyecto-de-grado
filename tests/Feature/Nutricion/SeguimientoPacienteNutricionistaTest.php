<?php

namespace Tests\Feature\Nutricion;

use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\DiaPlanAlimentario;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Role;
use App\Models\SeguimientoComida;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Nutricion\SeguimientoPacienteNutricionistaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeguimientoPacienteNutricionistaTest extends TestCase
{
    use RefreshDatabase;

    public function test_calcula_adherencia_general_y_por_cada_tipo_de_comida(): void
    {
        [$paciente, $plan, $comidas] = $this->escenario();
        $this->seguimiento($paciente, $plan, $comidas['desayuno'], 'completada');
        $this->seguimiento($paciente, $plan, $comidas['almuerzo'], 'parcial', ['porcentaje_consumido' => 50]);
        $this->seguimiento($paciente, $plan, $comidas['merienda'], 'reemplazada');
        $this->seguimiento($paciente, $plan, $comidas['cena'], 'no_realizada');

        $resumen = $this->servicio()->obtenerResumen($paciente);
        $this->assertSame(50.0, $resumen['resumen_adherencia']['porcentaje_adherencia']);
        $this->assertSame(100.0, $resumen['adherencia_por_tipo_comida']['desayuno']['porcentaje_adherencia']);
        $this->assertSame(50.0, $resumen['adherencia_por_tipo_comida']['almuerzo']['porcentaje_adherencia']);
        $this->assertSame(50.0, $resumen['adherencia_por_tipo_comida']['merienda']['porcentaje_adherencia']);
        $this->assertSame(0.0, $resumen['adherencia_por_tipo_comida']['cena']['porcentaje_adherencia']);
    }

    public function test_muestra_pendientes_y_tolera_plan_sin_seguimientos(): void
    {
        [$paciente] = $this->escenario();
        $resumen = $this->servicio()->obtenerResumen($paciente);
        $this->assertSame(4, $resumen['resumen_adherencia']['pendientes']);
        $this->assertSame('pendiente', $resumen['seguimiento_comidas'][0]['comidas'][0]['estado_cumplimiento']);
        $this->assertNull($resumen['seguimiento_comidas'][0]['comidas'][0]['comentario_paciente']);
    }

    public function test_expone_comentarios_aceptacion_y_preparaciones_a_evitar(): void
    {
        [$paciente, $plan, $comidas] = $this->escenario();
        $this->seguimiento($paciente, $plan, $comidas['desayuno'], 'completada', ['nivel_agrado' => 'me_gusto', 'comentario_paciente' => 'Muy rico', 'sugerencia_paciente' => 'Repetir']);
        $this->seguimiento($paciente, $plan, $comidas['cena'], 'no_realizada', ['nivel_agrado' => 'no_me_gusto', 'presento_molestia' => true, 'intensidad_molestia' => 'moderada']);
        $resumen = $this->servicio()->obtenerResumen($paciente);
        $this->assertSame('Muy rico', $resumen['seguimiento_comidas'][0]['comidas'][0]['comentario_paciente']);
        $this->assertContains('Preparación desayuno', $resumen['indicadores_siguiente_plan']['recetas_bien_aceptadas']);
        $this->assertContains('Preparación cena', $resumen['indicadores_siguiente_plan']['recetas_a_evitar']);
    }

    public function test_detecta_ingredientes_no_conseguidos_y_genera_recomendacion(): void
    {
        [$paciente, $plan, $comidas] = $this->escenario();
        $this->seguimiento($paciente, $plan, $comidas['almuerzo'], 'parcial', ['consiguio_ingredientes' => false, 'motivo_no_cumplimiento' => 'no_tenia_ingredientes']);
        $indicadores = $this->servicio()->obtenerResumen($paciente)['indicadores_siguiente_plan'];
        $this->assertContains('Preparación almuerzo', $indicadores['alimentos_o_preparaciones_problematicas']);
        $this->assertContains('Revisar disponibilidad de ingredientes para el siguiente plan.', $indicadores['recomendaciones_para_nutricionista']);
    }

    public function test_incluye_sintomas_e_indicadores_frecuentes(): void
    {
        [$paciente] = $this->escenario();
        $usuario = User::factory()->create();
        foreach (range(1, 3) as $dia) SeguimientoSintomaPaciente::query()->create(['id_paciente' => $paciente->getKey(), 'fecha_registro' => now()->subDays($dia), 'hambre_nocturna' => true, 'ansiedad_por_comida' => 'alta', 'registrado_por' => $usuario->getKey()]);
        $sintomas = $this->servicio()->obtenerResumen($paciente)['seguimiento_sintomas'];
        $this->assertCount(3, $sintomas['ultimos_registros']);
        $this->assertTrue($sintomas['indicadores']['hambre_nocturna_frecuente']);
        $this->assertTrue($sintomas['indicadores']['alerta_general']);
    }

    public function test_sin_plan_devuelve_estructura_vacia_controlada(): void
    {
        $paciente = $this->paciente();
        $resumen = $this->servicio()->obtenerResumen($paciente);
        $this->assertNull($resumen['plan']);
        $this->assertNull($resumen['resumen_adherencia']);
        $this->assertSame([], $resumen['seguimiento_comidas']);
    }

    public function test_perfil_nutricional_entrega_prop_de_seguimiento_a_nutricionista(): void
    {
        $usuario = $this->usuarioConRol('nutricionista');
        [$paciente] = $this->escenario();
        $this->actingAs($usuario)->get(route('nutricionista.pacientes.perfil-nutricional', $paciente))
            ->assertOk()->assertInertia(fn (Assert $pagina) => $pagina->has('seguimientoPaciente')->where('seguimientoPaciente.plan.estado_plan', 'activo'));
    }

    public function test_usuario_sin_rol_nutricionista_no_accede_al_perfil(): void
    {
        $usuario = $this->usuarioConRol('paciente');
        $paciente = Paciente::query()->where('user_id', $usuario->getKey())->first();
        $this->actingAs($usuario)->get(route('nutricionista.pacientes.perfil-nutricional', $paciente))->assertForbidden();
    }

    private function escenario(): array
    {
        $paciente = $this->paciente();
        $plan = PlanAlimentario::query()->create(['id_paciente' => $paciente->getKey(), 'nombre' => 'Plan activo', 'estado_plan' => 'activo', 'fecha_inicio' => today(), 'duracion_dias' => 1, 'estado' => 'activo']);
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario' => $plan->getKey(), 'numero_dia' => 1, 'nombre_dia' => 'Lunes', 'fecha' => today(), 'estado' => 'activo']);
        $comidas = collect(['desayuno', 'almuerzo', 'merienda', 'cena'])->mapWithKeys(function ($tipo, $indice) use ($dia) {
            $comida = ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario' => $dia->getKey(), 'tipo_comida' => $tipo, 'nombre_comida' => ucfirst($tipo), 'orden' => $indice + 1, 'estado' => 'activo']);
            ComponenteComidaPlan::query()->create(['id_comida_plan_alimentario' => $comida->getKey(), 'tipo_componente' => 'manual', 'nombre_manual' => "Preparación {$tipo}", 'orden' => 1, 'estado' => 'activo']);
            return [$tipo => $comida];
        })->all();
        return [$paciente, $plan, $comidas];
    }

    private function seguimiento(Paciente $paciente, PlanAlimentario $plan, ComidaPlanAlimentario $comida, string $estado, array $extra = []): void
    {
        SeguimientoComida::query()->create(array_merge(['id_paciente' => $paciente->getKey(), 'id_plan_alimentario' => $plan->getKey(), 'id_dia_plan_alimentario' => $comida->id_dia_plan_alimentario, 'id_comida_plan_alimentario' => $comida->getKey(), 'fecha_seguimiento' => today(), 'estado_cumplimiento' => $estado, 'porcentaje_consumido' => $estado === 'completada' ? 100 : null, 'nivel_agrado' => null, 'presento_molestia' => false, 'consiguio_ingredientes' => true], $extra));
    }

    private function paciente(): Paciente
    {
        $usuario = User::factory()->create(['estado' => 'activo', 'email_verified_at' => now()]);
        return Paciente::query()->create(['user_id' => $usuario->getKey(), 'nombres' => 'Paciente', 'apellido_paterno' => 'Prueba', 'ci' => fake()->unique()->numerify('########'), 'fecha_nacimiento' => '1995-01-01', 'sexo' => 'femenino', 'estado' => 'activo']);
    }

    private function servicio(): SeguimientoPacienteNutricionistaService { return app(SeguimientoPacienteNutricionistaService::class); }
    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => $nombre], ['descripcion' => ucfirst($nombre), 'estado' => 'activo']);
        $usuario = User::factory()->create(['estado' => 'activo', 'email_verified_at' => now()]);
        UserRole::query()->create(['user_id' => $usuario->getKey(), 'id_rol' => $rol->getKey(), 'estado' => 'activo']);
        if ($nombre === 'paciente') Paciente::query()->create(['user_id' => $usuario->getKey(), 'nombres' => 'Paciente', 'apellido_paterno' => 'Rol', 'ci' => fake()->unique()->numerify('########'), 'fecha_nacimiento' => '1995-01-01', 'sexo' => 'femenino', 'estado' => 'activo']);
        return $usuario;
    }
}
