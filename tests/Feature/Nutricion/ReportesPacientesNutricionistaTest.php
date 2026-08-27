<?php

namespace Tests\Feature\Nutricion;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportesPacientesNutricionistaTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_abre_generador_y_descarga_pdf_filtrado(): void
    {
        $usuario = $this->usuario('nutricionista');
        $this->actingAs($usuario)->get(route('nutricionista.reportes.index'))->assertOk()
            ->assertInertia(fn (Assert $pagina) => $pagina->component('Nutricionista/Reportes/Index')->has('catalogo', 5)->has('reporte')->has('filtros'));

        $respuesta = $this->actingAs($usuario)->get(route('nutricionista.reportes.adherencia.pdf', ['nivel'=>'cero','estado'=>'sin_registros']));
        $respuesta->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF', $respuesta->getContent());
    }

    public function test_permite_generar_distintos_tipos_de_reporte(): void
    {
        $usuario = $this->usuario('nutricionista');
        foreach (['pacientes','adherencia','planes','incidencias','sin_seguimiento'] as $tipo) {
            $this->actingAs($usuario)->get(route('nutricionista.reportes.index', ['tipo'=>$tipo]))
                ->assertOk()->assertInertia(fn (Assert $pagina) => $pagina->where('reporte.tipo', $tipo)->has('reporte.columnas')->has('reporte.filas'));
            $this->actingAs($usuario)->get(route('nutricionista.reportes.adherencia.pdf', ['tipo'=>$tipo]))
                ->assertOk()->assertHeader('content-type', 'application/pdf');
        }
    }

    public function test_reportes_no_son_accesibles_para_otro_rol(): void
    {
        $this->actingAs($this->usuario('endocrinologo'))->get(route('nutricionista.reportes.index'))->assertForbidden();
        $this->actingAs($this->usuario('endocrinologo'))->get(route('nutricionista.reportes.adherencia.pdf'))->assertForbidden();
    }

    private function usuario(string $rol): User { $r=Role::query()->firstOrCreate(['nombre'=>$rol],['descripcion'=>$rol,'estado'=>'activo']);$u=User::factory()->create(['estado'=>'activo']);UserRole::query()->create(['user_id'=>$u->getKey(),'id_rol'=>$r->getKey(),'estado'=>'activo']);return $u; }
}
