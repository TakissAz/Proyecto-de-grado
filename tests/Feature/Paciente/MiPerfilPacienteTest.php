<?php

namespace Tests\Feature\Paciente;

use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MiPerfilPacienteTest extends TestCase
{
    use RefreshDatabase;

    public function test_paciente_autenticado_puede_ver_su_perfil(): void
    {
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->get(route('paciente.mi-perfil'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Paciente/MiPerfil')->where('perfil.email', $user->email));
    }

    public function test_paciente_actualiza_datos_seguros_pero_no_email_ni_rol(): void
    {
        [$user, $paciente] = $this->pacienteConUsuario();
        $email = $user->email;
        $this->actingAs($user)->put(route('paciente.mi-perfil.actualizar'), [
            'name' => 'María Actualizada', 'telefono' => '70000000', 'direccion' => 'Nueva dirección',
            'email' => 'intruso@example.com', 'roles' => ['administrador'],
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'María Actualizada', 'email' => $email]);
        $this->assertDatabaseHas('pacientes', ['id_paciente' => $paciente->id_paciente, 'telefono' => '70000000']);
        $this->assertFalse($user->fresh()->tieneRol('administrador'));
    }

    public function test_paciente_puede_subir_avatar_valido(): void
    {
        Storage::fake('public');
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->put(route('paciente.mi-perfil.actualizar'), [
            'name' => $user->name, 'avatar' => $this->imagen('perfil.png'),
        ])->assertSessionHasNoErrors();
        Storage::disk('public')->assertExists($user->fresh()->avatar);
    }

    public function test_rechaza_archivo_no_imagen_y_archivo_mayor_a_dos_mb(): void
    {
        [$user] = $this->pacienteConUsuario();
        $this->actingAs($user)->put(route('paciente.mi-perfil.actualizar'), ['name'=>$user->name, 'avatar'=>UploadedFile::fake()->create('malware.pdf', 10, 'application/pdf')])->assertSessionHasErrors('avatar');
        $this->actingAs($user)->put(route('paciente.mi-perfil.actualizar'), ['name'=>$user->name, 'avatar'=>$this->imagen('grande.png', 2049)])->assertSessionHasErrors('avatar');
    }

    public function test_avatar_externo_no_se_elimina_al_reemplazarlo(): void
    {
        Storage::fake('public');
        [$user] = $this->pacienteConUsuario();
        $user->update(['avatar' => 'https://lh3.googleusercontent.com/avatar.jpg']);
        $this->actingAs($user)->put(route('paciente.mi-perfil.actualizar'), ['name'=>$user->name, 'avatar'=>$this->imagen('local.png')])->assertSessionHasNoErrors();
        $this->assertStringStartsWith('avatars/', $user->fresh()->avatar);
    }

    public function test_usuario_sin_rol_paciente_no_accede_y_anonimo_es_redirigido(): void
    {
        $this->get(route('paciente.mi-perfil'))->assertRedirect(route('login'));
        $otro = $this->usuarioConRol('nutricionista');
        $this->actingAs($otro)->get(route('paciente.mi-perfil'))->assertForbidden();
    }

    private function pacienteConUsuario(): array
    {
        $user = $this->usuarioConRol('paciente');
        $paciente = Paciente::query()->create(['user_id'=>$user->id, 'nombres'=>'María', 'apellido_paterno'=>'Paciente', 'ci'=>fake()->unique()->numerify('########'), 'fecha_nacimiento'=>'1995-01-01', 'sexo'=>'femenino', 'estado'=>'activo']);
        return [$user, $paciente];
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(['nombre'=>$nombre], ['descripcion'=>ucfirst($nombre), 'estado'=>'activo']);
        $user = User::factory()->create(['estado'=>'activo']);
        UserRole::query()->create(['user_id'=>$user->id, 'id_rol'=>$rol->id_rol, 'estado'=>'activo']);
        return $user;
    }

    private function imagen(string $nombre, int $kilobytes = 1): UploadedFile
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');
        return UploadedFile::fake()->createWithContent($nombre, $png.str_repeat("\0", max(0, $kilobytes * 1024 - strlen($png))));
    }
}
