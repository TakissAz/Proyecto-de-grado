<?php

namespace Tests\Feature\Paciente;

use App\Models\Paciente;
use App\Models\Role;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Paciente\SeguimientoSintomasPacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeguimientoSintomasPacienteTest extends TestCase
{
    use RefreshDatabase;

    public function test_paciente_puede_registrar_sintomas_del_dia(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $this->actingAs($user)->postJson(route('paciente.seguimiento-sintomas.guardar'), $this->datos())->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseHas('seguimientos_sintomas_paciente', ['id_paciente' => $paciente->getKey(), 'nivel_energia' => 'media', 'registrado_por' => $user->getKey()]);
    }

    public function test_actualiza_el_mismo_dia_sin_duplicar(): void
    {
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->postJson(route('paciente.seguimiento-sintomas.guardar'), $this->datos(['nivel_energia' => 'baja']))->assertOk();
        $this->postJson(route('paciente.seguimiento-sintomas.guardar'), $this->datos(['nivel_energia' => 'alta']))->assertOk();
        $this->assertSame(1, SeguimientoSintomaPaciente::query()->count());
        $this->assertSame('alta', SeguimientoSintomaPaciente::query()->first()->nivel_energia);
    }

    public function test_rechaza_estado_invalido(): void
    {
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->postJson(route('paciente.seguimiento-sintomas.guardar'), $this->datos(['nivel_energia' => 'extrema']))->assertUnprocessable()->assertJsonValidationErrors('nivel_energia');
    }

    public function test_usuario_sin_rol_paciente_recibe_403(): void
    {
        $this->actingAs($this->usuarioConRol('nutricionista'))->postJson(route('paciente.seguimiento-sintomas.guardar'), $this->datos())->assertForbidden();
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        $this->post(route('paciente.seguimiento-sintomas.guardar'), $this->datos())->assertRedirect(route('login'));
    }

    public function test_portal_incluye_seguimiento_sintomas_controlado(): void
    {
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(fn (Assert $page) => $page->has('seguimientoSintomas')->where('seguimientoSintomas.registro_hoy', null));
    }

    public function test_dashboard_recibe_registro_de_hoy_propio(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        app(SeguimientoSintomasPacienteService::class)->guardar($paciente, $this->datos(['nivel_energia' => 'alta']), $user);
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(fn (Assert $page) => $page->where('seguimientoSintomas.registro_hoy.nivel_energia', 'alta'));
    }

    public function test_dashboard_recibe_solo_los_ultimos_siete_registros(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        for ($i = 0; $i < 9; $i++) app(SeguimientoSintomasPacienteService::class)->guardar($paciente, $this->datos(['fecha_registro' => today()->subDays($i)->toDateString()]), $user);
        $this->actingAs($user)->get(route('paciente.dashboard'))->assertInertia(fn (Assert $page) => $page->has('seguimientoSintomas.ultimos_registros', 7));
    }

    public function test_activa_indicador_hambre_nocturna_con_tres_registros(): void
    {
        $this->assertTrue($this->indicadoresCon(['hambre_nocturna' => true])['hambre_nocturna_frecuente']);
    }

    public function test_activa_indicador_ansiedad_con_tres_registros_moderados(): void
    {
        $this->assertTrue($this->indicadoresCon(['ansiedad_por_comida' => 'moderada'])['ansiedad_comida_frecuente']);
    }

    public function test_activa_indicador_antojos_con_tres_registros_altos(): void
    {
        $this->assertTrue($this->indicadoresCon(['antojos_dulces' => 'alto'])['antojos_dulces_frecuentes']);
    }

    public function test_activa_indicador_hinchazon_con_tres_registros_moderados(): void
    {
        $this->assertTrue($this->indicadoresCon(['hinchazon_abdominal' => 'moderada'])['hinchazon_frecuente']);
    }

    public function test_resumen_no_falla_si_no_hay_registros(): void
    {
        [, $paciente] = $this->pacienteConUsuario();
        $resumen = app(SeguimientoSintomasPacienteService::class)->obtenerResumen($paciente);
        $this->assertNull($resumen['registro_hoy']);
        $this->assertSame([], $resumen['ultimos_registros']);
        $this->assertFalse($resumen['indicadores']['alerta_general']);
    }

    private function indicadoresCon(array $cambios): array
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $service = app(SeguimientoSintomasPacienteService::class);
        for ($i = 0; $i < 3; $i++) $service->guardar($paciente, $this->datos([...$cambios, 'fecha_registro' => today()->subDays($i)->toDateString()]), $user);
        return $service->calcularIndicadores($paciente);
    }

    private function datos(array $cambios = []): array
    {
        return array_merge(['nivel_energia' => 'media', 'hambre_durante_dia' => 'media', 'ansiedad_por_comida' => 'leve', 'antojos_dulces' => 'leve', 'hambre_nocturna' => false, 'hinchazon_abdominal' => 'leve', 'fatiga_post_comida' => 'ninguna', 'mareos_o_debilidad' => false, 'acne' => 'leve', 'dolor_menstrual' => 'leve', 'irregularidad_menstrual' => false, 'cambios_estado_animo' => 'estable', 'calidad_sueno' => 'buena', 'horas_sueno' => 8, 'actividad_fisica' => 'ligera', 'minutos_actividad' => 30, 'consumo_agua_litros' => 2, 'observaciones' => 'Registro controlado'], $cambios);
    }

    private function pacienteConUsuario(): array
    {
        $user = $this->usuarioConRol('paciente');
        $paciente = Paciente::query()->create(['user_id' => $user->getKey(), 'nombres' => 'Paciente', 'apellido_paterno' => 'Síntomas', 'ci' => fake()->unique()->numerify('########'), 'fecha_nacimiento' => '1995-01-01', 'sexo' => 'femenino', 'estado' => 'activo']);
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
