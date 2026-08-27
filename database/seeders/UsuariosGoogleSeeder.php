<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuariosGoogleSeeder extends Seeder
{
    public function run(): void
    {
        $rolAdministrador = Role::withTrashed()->updateOrCreate(
            ['nombre' => 'administrador'],
            [
                'descripcion' => 'Usuario con acceso a la administración del sistema.',
                'estado' => 'activo',
            ]
        );
        $rolAdministrador->forceFill(['deleted_at' => null])->save();

        $rolSuperadministrador = Role::query()
            ->where('nombre', 'superadministrador')
            ->where('estado', 'activo')
            ->first();

        $rolAsignado = $rolSuperadministrador ?? $rolAdministrador;
        $email = 'azfrithb@gmail.com';
        $passwordActual = User::withTrashed()
            ->where('email', $email)
            ->value('password');

        $usuario = User::withTrashed()->updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Superadministrador',
                'password' => $passwordActual ?: Hash::make('password'),
                'estado' => 'activo',
            ]
        );

        $usuario->forceFill([
            'email_verified_at' => $usuario->email_verified_at ?? now(),
            'deleted_at' => null,
        ])->save();

        $asignacion = UserRole::withTrashed()->updateOrCreate(
            [
                'user_id' => $usuario->getKey(),
                'id_rol' => $rolAsignado->getKey(),
            ],
            ['estado' => 'activo']
        );

        $asignacion->forceFill(['deleted_at' => null])->save();

        $this->command?->info(
            "Usuario {$email} preparado para Google con el rol {$rolAsignado->nombre}."
        );
    }
}
