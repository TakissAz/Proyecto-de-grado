<?php

namespace Tests\Feature\Nutricion;

use App\Models\Paciente;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\Role;
use App\Models\SeguimientoComida;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Nutricion\GeneradorPlanSemanalService;
use App\Services\Nutricion\ProgresoPacientesNutricionistaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProgresoPacientesNutricionistaTest extends TestCase
{
    use RefreshDatabase;

    public function test_calcula_cumplimiento_diario_y_semanal_del_plan_vigente(): void
    {
        $nutricionista = $this->usuario('nutricionista');
        $paciente = $this->paciente();
        $recomendacion = RecomendacionNutricionalExperta::query()->create([
            'id_paciente'=>$paciente->getKey(), 'id_nutricionista'=>$nutricionista->getKey(),
            'calorias_sugeridas'=>1600, 'proteinas_porcentaje'=>30, 'carbohidratos_porcentaje'=>40,
            'grasas_porcentaje'=>30, 'fibra_sugerida'=>30, 'estado_validacion_experta'=>'aprobado', 'estado'=>'activo',
        ]);
        $plan = app(GeneradorPlanSemanalService::class)->generarDesdeRecomendacion($recomendacion, $nutricionista, ['fecha_inicio'=>today()->toDateString()]);
        $plan->update(['estado_plan'=>'aprobado']);
        $dia = $plan->dias()->first();
        $comidas = $dia->comidas()->get();
        foreach ($comidas->take(2) as $comida) {
            SeguimientoComida::query()->create(['id_paciente'=>$paciente->getKey(),'id_plan_alimentario'=>$plan->getKey(),'id_dia_plan_alimentario'=>$dia->getKey(),'id_comida_plan_alimentario'=>$comida->getKey(),'fecha_seguimiento'=>today(),'estado_cumplimiento'=>'completada','porcentaje_consumido'=>100]);
        }

        $datos = app(ProgresoPacientesNutricionistaService::class)->obtener($nutricionista);

        $this->assertSame(1, $datos['resumen']['pacientes_con_plan']);
        $this->assertSame(2, $datos['pacientes'][0]['hoy']['completadas']);
        $this->assertSame(50.0, $datos['pacientes'][0]['hoy']['porcentaje']);
        $this->assertSame(28, $datos['pacientes'][0]['semana']['total']);
        $this->assertSame('en_progreso', $datos['pacientes'][0]['estado_seguimiento']);
    }

    public function test_ruta_muestra_panel_y_exige_rol_nutricionista(): void
    {
        $nutricionista = $this->usuario('nutricionista');
        $this->actingAs($nutricionista)->get(route('nutricionista.progreso'))->assertOk()->assertInertia(fn (Assert $pagina) => $pagina->component('Nutricionista/Progreso/Index')->has('resumen')->has('pacientes'));
        $this->actingAs($this->usuario('endocrinologo'))->get(route('nutricionista.progreso'))->assertForbidden();
        auth()->logout();
        $this->get(route('nutricionista.progreso'))->assertRedirect(route('login'));
    }

    private function paciente(): Paciente { return Paciente::query()->create(['user_id'=>User::factory()->create()->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Progreso','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1995-01-01','sexo'=>'femenino','estado'=>'activo']); }
    private function usuario(string $rol): User { $r=Role::query()->firstOrCreate(['nombre'=>$rol],['descripcion'=>$rol,'estado'=>'activo']);$u=User::factory()->create(['estado'=>'activo']);UserRole::query()->create(['user_id'=>$u->getKey(),'id_rol'=>$r->getKey(),'estado'=>'activo']);return $u; }
}
