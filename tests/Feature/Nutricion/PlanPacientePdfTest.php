<?php

namespace Tests\Feature\Nutricion;

use App\Models\Alimento;
use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\DiaPlanAlimentario;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Receta;
use App\Models\RecetaAlimento;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Paciente\ListaComprasPacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanPacientePdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_paciente_descarga_su_plan_activo(): void
    {
        [$u,$p] = $this->paciente();
        $this->plan($p, 'activo', 'Plan activo');
        $this->actingAs($u)->get(route('paciente.plan-alimentario.pdf'))->assertOk()->assertHeader('content-type', 'application/pdf');
    }

    public function test_descarga_aprobado_cuando_no_hay_activo(): void
    {
        [$u,$p] = $this->paciente();
        $this->plan($p, 'aprobado', 'Plan aprobado');
        $this->actingAs($u)->get(route('paciente.plan-alimentario.pdf'))->assertOk();
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('estadosNoVisibles')]
    public function test_no_descarga_estados_no_visibles(string $estado): void
    {
        [$u,$p] = $this->paciente();
        $this->plan($p, $estado, 'Plan oculto');
        $this->actingAs($u)->get(route('paciente.plan-alimentario.pdf'))->assertRedirect(route('paciente.dashboard'))->assertSessionHas('error');
    }

    public static function estadosNoVisibles(): array
    {
        return [['sugerido'], ['en_revision'], ['rechazado'], ['finalizado']];
    }

    public function test_sin_plan_o_perfil_recibe_error_controlado(): void
    {
        [$u] = $this->paciente();
        $this->actingAs($u)->get(route('paciente.plan-alimentario.pdf'))->assertRedirect()->assertSessionHas('error');
        $sin = User::factory()->create(['email_verified_at' => now()]);
        $this->rol($sin, 'paciente');
        $this->actingAs($sin)->get(route('paciente.plan-alimentario.pdf'))->assertRedirect()->assertSessionHas('error');
    }

    public function test_ruta_exige_autenticacion_verificacion_y_rol_paciente(): void
    {
        $this->get(route('paciente.plan-alimentario.pdf'))->assertRedirect();
        $otro = User::factory()->create(['email_verified_at' => now()]);
        $this->rol($otro, 'nutricionista');
        $this->actingAs($otro)->get(route('paciente.plan-alimentario.pdf'))->assertForbidden();
    }

    public function test_vista_contiene_plan_receta_preparacion_lista_y_no_trazabilidad(): void
    {
        [$u,$p] = $this->paciente('Lucía');
        $plan = $this->plan($p, 'activo', 'Plan Lucía');
        $plan->load(['paciente', 'nutricionista', 'recomendacionNutricionalExperta', 'requerimientoNutricional', 'dias.comidas.componentes.alimento', 'dias.comidas.componentes.receta.recetaAlimentos.alimento']);
        $lista = app(ListaComprasPacienteService::class)->generarParaPlan($plan);
        $html = view('pdf.paciente.plan-alimentario-practico', ['paciente' => $p, 'plan' => $plan, 'listaCompras' => $lista, 'fechaDescarga' => now()])->render();
        foreach (['Mi plan alimentario semanal', 'Lucía', 'Desayuno', 'Avena práctica', 'Mezclar y servir', 'Lista de compras semanal', 'Avena'] as $texto) {
            $this->assertStringContainsString($texto, $html);
        }
        foreach (['puntaje experto', 'reglas activadas', 'confianza experta', 'hechos utilizados'] as $texto) {
            $this->assertStringNotContainsString($texto, strtolower($html));
        }
    }

    public function test_no_expone_plan_de_otro_paciente(): void
    {
        [$u,$p] = $this->paciente('Propia');
        [, $otro] = $this->paciente('Ajena');
        $this->plan($otro, 'activo', 'Plan secreto ajeno');
        $this->actingAs($u)->get(route('paciente.plan-alimentario.pdf'))->assertRedirect()->assertSessionHas('error');
        $this->assertSame(0, $p->planesAlimentarios()->count());
    }

    private function plan(Paciente $p, string $estado, string $nombre): PlanAlimentario
    {
        $plan = PlanAlimentario::query()->create(['id_paciente' => $p->getKey(), 'nombre' => $nombre, 'estado_plan' => $estado, 'fecha_inicio' => today(), 'fecha_fin' => today()->addDays(6), 'calorias_totales' => 1400, 'proteinas_totales' => 90, 'carbohidratos_totales' => 150, 'grasas_totales' => 45, 'fibra_total' => 25, 'estado' => 'activo']);
        $d = DiaPlanAlimentario::query()->create(['id_plan_alimentario' => $plan->getKey(), 'numero_dia' => 1, 'nombre_dia' => 'lunes', 'fecha' => today(), 'estado' => 'activo']);
        $c = ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario' => $d->getKey(), 'tipo_comida' => 'desayuno', 'nombre_comida' => 'Desayuno', 'orden' => 1, 'calorias_totales' => 300, 'estado' => 'activo']);
        $r = Receta::query()->create(['nombre' => 'Avena práctica', 'descripcion' => 'Desayuno sencillo', 'tipo_comida' => 'desayuno', 'porciones' => 1, 'preparacion' => 'Mezclar y servir', 'estado' => 'activo']);
        $a = Alimento::query()->create(['nombre' => 'Avena', 'grupo_alimentario' => 'carbohidratos', 'unidad_base' => 'g', 'cantidad_base' => 100, 'calorias' => 380, 'proteinas' => 13, 'carbohidratos' => 68, 'grasas' => 7, 'fibra' => 10, 'estado' => 'activo']);
        RecetaAlimento::query()->create(['id_receta' => $r->getKey(), 'id_alimento' => $a->getKey(), 'cantidad' => 50, 'unidad' => 'g']);
        ComponenteComidaPlan::query()->create(['id_comida_plan_alimentario' => $c->getKey(), 'tipo_componente' => 'receta', 'id_receta' => $r->getKey(), 'cantidad' => 1, 'unidad' => 'porción', 'orden' => 1, 'estado' => 'activo']);

        return $plan->fresh();
    }

    private function paciente(string $nombre = 'Paciente'): array
    {
        $u = User::factory()->create(['email_verified_at' => now()]);
        $this->rol($u, 'paciente');
        $p = Paciente::query()->create(['user_id' => $u->getKey(), 'nombres' => $nombre, 'apellido_paterno' => 'PDF', 'ci' => fake()->unique()->numerify('########'), 'fecha_nacimiento' => '1995-01-01', 'sexo' => 'femenino', 'estado' => 'activo']);

        return [$u, $p];
    }

    private function rol(User $u, string $nombre): void
    {
        $r = Role::query()->firstOrCreate(['nombre' => $nombre], ['descripcion' => $nombre, 'estado' => 'activo']);
        UserRole::query()->create(['user_id' => $u->getKey(), 'id_rol' => $r->getKey(), 'estado' => 'activo']);
    }
}
