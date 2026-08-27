<?php

namespace Tests\Feature\Nutricion;

use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReporteHistorialPlanesPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_descarga_historial_filtrado_en_pdf(): void
    {
        $paciente = $this->paciente();
        PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan aprobado','estado_plan'=>'aprobado','fecha_inicio'=>'2026-08-20','fecha_fin'=>'2026-08-26','generado_por_sistema_experto'=>true,'estado'=>'activo']);
        PlanAlimentario::query()->create(['id_paciente'=>$paciente->getKey(),'nombre'=>'Plan rechazado','estado_plan'=>'rechazado','fecha_inicio'=>'2026-07-01','fecha_fin'=>'2026-07-07','estado'=>'activo']);

        $respuesta = $this->actingAs($this->usuario('nutricionista'))->get(route('nutricionista.pacientes.planes-alimentarios.historial.reporte-pdf', ['paciente'=>$paciente, 'estado'=>'aprobado', 'origen'=>'experto', 'desde'=>'2026-08-01']));

        $respuesta->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF', $respuesta->getContent());
    }

    public function test_reporte_exige_nutricionista_autenticado(): void
    {
        $paciente = $this->paciente();
        $this->get(route('nutricionista.pacientes.planes-alimentarios.historial.reporte-pdf', $paciente))->assertRedirect(route('login'));
        $this->actingAs($this->usuario('endocrinologo'))->get(route('nutricionista.pacientes.planes-alimentarios.historial.reporte-pdf', $paciente))->assertForbidden();
    }

    private function paciente(): Paciente { return Paciente::query()->create(['user_id'=>User::factory()->create()->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Historial','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1992-01-01','sexo'=>'femenino','estado'=>'activo']); }
    private function usuario(string $rol): User { $r=Role::query()->firstOrCreate(['nombre'=>$rol],['descripcion'=>$rol,'estado'=>'activo']);$u=User::factory()->create(['estado'=>'activo']);UserRole::query()->create(['user_id'=>$u->getKey(),'id_rol'=>$r->getKey(),'estado'=>'activo']);return $u; }
}
