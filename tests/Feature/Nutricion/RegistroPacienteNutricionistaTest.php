<?php

namespace Tests\Feature\Nutricion;

use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistroPacienteNutricionistaTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_registra_una_paciente_con_cuenta_lista_para_ingresar(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $this->crearRol('paciente');

        $response = $this->actingAs($nutricionista)->post(route('nutricionista.pacientes.store'), $this->datosValidos());

        $response->assertRedirect(route('nutricionista.pacientes.index'));

        $user = User::query()->where('email', 'paciente.nueva@example.com')->firstOrFail();
        $paciente = Paciente::query()->where('user_id', $user->getKey())->firstOrFail();

        $this->assertSame('activo', $user->estado);
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue(Hash::check('ClaveSegura8', $user->password));
        $this->assertTrue($user->tieneRol('paciente'));
        $this->assertSame(today()->toDateString(), $paciente->fecha_registro?->toDateString());
        $this->assertSame('MAR-7788', $paciente->ci);
    }

    public function test_rechaza_paciente_fuera_del_rango_de_21_a_35_anos_sin_crear_registros(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $this->crearRol('paciente');

        $response = $this->actingAs($nutricionista)
            ->from(route('nutricionista.pacientes.create'))
            ->post(route('nutricionista.pacientes.store'), $this->datosValidos([
                'fecha_nacimiento' => today()->subYears(20)->toDateString(),
            ]));

        $response->assertRedirect(route('nutricionista.pacientes.create'))
            ->assertSessionHasErrors('fecha_nacimiento');
        $this->assertDatabaseMissing('users', ['email' => 'paciente.nueva@example.com']);
        $this->assertDatabaseCount('pacientes', 0);
    }

    public function test_valida_ci_y_correo_unicos_antes_de_guardar(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $this->crearRol('paciente');
        $existente = User::factory()->create(['email' => 'existente@example.com']);
        Paciente::query()->create([
            'user_id' => $existente->getKey(),
            'nombres' => 'Ana',
            'apellido_paterno' => 'Pérez',
            'ci' => 'CI-1000',
            'fecha_nacimiento' => today()->subYears(28),
            'sexo' => 'femenino',
            'estado' => 'activo',
        ]);

        $response = $this->actingAs($nutricionista)->post(route('nutricionista.pacientes.store'), $this->datosValidos([
            'ci' => 'ci-1000',
            'email' => ' EXISTENTE@example.com ',
        ]));

        $response->assertSessionHasErrors(['ci', 'email']);
        $this->assertDatabaseCount('pacientes', 1);
    }

    public function test_rechaza_formatos_invalidos_y_no_confia_en_fecha_de_registro_enviada(): void
    {
        $nutricionista = $this->usuarioConRol('nutricionista');
        $this->crearRol('paciente');

        $response = $this->actingAs($nutricionista)->post(route('nutricionista.pacientes.store'), $this->datosValidos([
            'nombres' => 'María 123',
            'telefono' => 'teléfono inválido',
            'fecha_registro' => '2001-01-01',
        ]));

        $response->assertSessionHasErrors(['nombres', 'telefono']);
        $this->assertDatabaseCount('pacientes', 0);
    }

    private function datosValidos(array $extra = []): array
    {
        return array_merge([
            'nombres' => 'María Fernanda',
            'apellido_paterno' => 'Rojas',
            'apellido_materno' => 'López',
            'ci' => 'mar-7788',
            'fecha_nacimiento' => today()->subYears(27)->toDateString(),
            'sexo' => 'femenino',
            'telefono' => '+591 76543210',
            'direccion' => 'Av. Principal 123',
            'ocupacion' => 'Contadora',
            'estado_civil' => 'Soltera',
            'fecha_registro' => '2001-01-01',
            'email' => ' Paciente.Nueva@example.com ',
            'password' => 'ClaveSegura8',
        ], $extra);
    }

    private function usuarioConRol(string $nombreRol): User
    {
        $rol = $this->crearRol($nombreRol);
        $user = User::factory()->create(['estado' => 'activo', 'email_verified_at' => now()]);
        UserRole::query()->create(['user_id' => $user->getKey(), 'id_rol' => $rol->getKey(), 'estado' => 'activo']);

        return $user;
    }

    private function crearRol(string $nombre): Role
    {
        return Role::query()->firstOrCreate(
            ['nombre' => $nombre],
            ['descripcion' => ucfirst($nombre), 'estado' => 'activo'],
        );
    }
}
