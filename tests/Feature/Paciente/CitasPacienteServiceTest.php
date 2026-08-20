<?php

namespace Tests\Feature\Paciente;

use App\Models\Cita;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Paciente\CitasPacienteService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CitasPacienteServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-08-19 10:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_obtiene_la_proxima_cita_futura(): void
    {
        [, $paciente] = $this->pacienteConUsuario();
        $this->cita($paciente, '2026-08-22', 'programada');
        $proxima = app(CitasPacienteService::class)->obtenerResumen($paciente)['proxima_cita'];
        $this->assertSame('2026-08-22', $proxima['fecha']);
        $this->assertSame('09:00', $proxima['hora_inicio']);
    }

    public function test_no_muestra_citas_de_otro_paciente(): void
    {
        [, $paciente] = $this->pacienteConUsuario();
        [, $otro] = $this->pacienteConUsuario();
        $this->cita($otro, '2026-08-22', 'programada');
        $this->assertSame(0, app(CitasPacienteService::class)->obtenerResumen($paciente)['resumen']['total_citas']);
    }

    public function test_separa_pendientes_e_historial(): void
    {
        [, $paciente] = $this->pacienteConUsuario();
        $this->cita($paciente, '2026-08-22', 'confirmada');
        $this->cita($paciente, '2026-08-10', 'atendida');
        $this->cita($paciente, '2026-08-25', 'cancelada');
        $resumen = app(CitasPacienteService::class)->obtenerResumen($paciente);
        $this->assertCount(1, $resumen['citas_pendientes']);
        $this->assertCount(2, $resumen['citas_historial']);
    }

    public function test_calcula_resumen_por_estado(): void
    {
        [, $paciente] = $this->pacienteConUsuario();
        $this->cita($paciente, '2026-08-22', 'programada');
        $this->cita($paciente, '2026-08-10', 'atendida');
        $this->cita($paciente, '2026-08-11', 'cancelada');
        $r = app(CitasPacienteService::class)->obtenerResumen($paciente)['resumen'];
        $this->assertSame(3, $r['total_citas']); $this->assertSame(1, $r['pendientes']);
        $this->assertSame(1, $r['realizadas']); $this->assertSame(1, $r['canceladas']);
    }

    public function test_portal_incluye_citas_paciente(): void
    {
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(fn (Assert $page) => $page->has('citasPaciente')->where('citasPaciente.resumen.total_citas', 0));
    }

    public function test_dashboard_recibe_citas_propias(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $this->cita($paciente, '2026-08-22', 'programada');
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(fn (Assert $page) => $page->where('citasPaciente.proxima_cita.fecha', '2026-08-22'));
    }

    public function test_paciente_sin_citas_recibe_estructura_vacia(): void
    {
        [, $paciente] = $this->pacienteConUsuario();
        $r = app(CitasPacienteService::class)->obtenerResumen($paciente);
        $this->assertNull($r['proxima_cita']); $this->assertSame([], $r['citas_pendientes']); $this->assertSame([], $r['citas_historial']);
    }

    public function test_tolera_profesional_eliminado_sin_romper(): void
    {
        [, $paciente] = $this->pacienteConUsuario();
        $cita = $this->cita($paciente, '2026-08-22', 'programada');
        $cita->profesional->delete();
        $r = app(CitasPacienteService::class)->obtenerResumen($paciente);
        $this->assertSame('Profesional por confirmar', $r['proxima_cita']['profesional']);
    }

    public function test_no_existen_rutas_de_citas_paciente_con_ids(): void
    {
        $rutas = collect(Route::getRoutes())->filter(fn ($ruta) => str_starts_with($ruta->uri(), 'paciente/') && str_contains($ruta->uri(), 'cita'));
        $this->assertCount(0, $rutas);
    }

    public function test_usuario_sin_rol_paciente_no_accede_al_dashboard(): void
    {
        $this->actingAs($this->usuarioConRol('nutricionista'))->get(route('paciente.dashboard'))->assertForbidden();
    }

    private function cita(Paciente $paciente, string $fecha, string $estado): Cita
    {
        $profesional = User::factory()->create(['name' => 'Profesional Prueba']);
        return Cita::query()->create(['id_paciente' => $paciente->getKey(), 'id_profesional' => $profesional->getKey(), 'tipo_profesional' => 'nutricionista', 'fecha_cita' => $fecha, 'hora_inicio' => '09:00', 'hora_fin' => '10:00', 'tipo_cita' => 'control', 'modalidad' => 'presencial', 'motivo' => 'Control nutricional', 'estado' => $estado, 'registrada_por' => $profesional->getKey()]);
    }

    private function pacienteConUsuario(): array
    {
        $user = $this->usuarioConRol('paciente');
        $paciente = Paciente::query()->create(['user_id' => $user->getKey(), 'nombres' => 'Paciente', 'apellido_paterno' => 'Citas', 'ci' => fake()->unique()->numerify('########'), 'fecha_nacimiento' => '1995-01-01', 'sexo' => 'femenino', 'estado' => 'activo']);
        return [$user, $paciente];
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => $nombre], ['descripcion' => ucfirst($nombre), 'estado' => 'activo']);
        $user = User::factory()->create(['estado' => 'activo']);
        UserRole::query()->create(['user_id' => $user->getKey(), 'id_rol' => $rol->getKey(), 'estado' => 'activo']);
        return $user;
    }
}
