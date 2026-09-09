<?php

namespace Tests\Feature\Nutricion;

use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReporteHistorialNutricionalPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_puede_generar_pdf_de_todos_los_historiales(): void
    {
        $paciente = $this->paciente();
        $usuario = $this->usuario('nutricionista');

        foreach (['evaluaciones', 'habitos', 'preferencias', 'restricciones', 'objetivos', 'requerimientos'] as $tipo) {
            $respuesta = $this->actingAs($usuario)->get(route(
                'nutricionista.pacientes.perfil-nutricional.historial.reporte-pdf',
                ['paciente'=>$paciente, 'tipo'=>$tipo, 'desde'=>'2026-01-01', 'hasta'=>'2026-12-31'],
            ));
            $respuesta->assertOk()->assertHeader('content-type', 'application/pdf');
            $this->assertStringStartsWith('%PDF', $respuesta->getContent());
        }
    }

    public function test_reporte_de_historial_exige_nutricionista_autenticado(): void
    {
        $paciente = $this->paciente();
        $url = route('nutricionista.pacientes.perfil-nutricional.historial.reporte-pdf', [
            'paciente'=>$paciente, 'tipo'=>'evaluaciones',
        ]);

        $this->get($url)->assertRedirect(route('login'));
        $this->actingAs($this->usuario('endocrinologo'))->get($url)->assertForbidden();
    }

    private function paciente(): Paciente
    {
        return Paciente::query()->create([
            'user_id'=>User::factory()->create()->getKey(), 'nombres'=>'Paciente',
            'apellido_paterno'=>'Historial', 'ci'=>fake()->unique()->numerify('########'),
            'fecha_nacimiento'=>'1995-01-01', 'sexo'=>'femenino', 'estado'=>'activo',
        ]);
    }

    private function usuario(string $rol): User
    {
        $role = Role::query()->firstOrCreate(['nombre'=>$rol], ['descripcion'=>$rol, 'estado'=>'activo']);
        $user = User::factory()->create(['estado'=>'activo']);
        UserRole::query()->create(['user_id'=>$user->getKey(), 'id_rol'=>$role->getKey(), 'estado'=>'activo']);
        return $user;
    }
}
