<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@pmos.test'],
            [
                'name' => 'Administrador del Sistema',
                'password' => Hash::make('password'),
                'estado' => 'activo',
            ]
        );

        $endocrinologo = User::firstOrCreate(
            ['email' => 'endocrino@pmos.test'],
            [
                'name' => 'Dra. Valeria Mendoza',
                'password' => Hash::make('password'),
                'estado' => 'activo',
            ]
        );

        $rolAdmin = Role::query()
            ->where('nombre', '=', 'administrador', 'and')
            ->first();

        $rolEndocrino = Role::query()
            ->where('nombre', '=', 'endocrinologo', 'and')
            ->first();

        if ($rolAdmin !== null) {
            $this->asignarRol((int) $admin->id, (int) $rolAdmin->id_rol);
        }

        if ($rolEndocrino !== null) {
            $this->asignarRol((int) $endocrinologo->id, (int) $rolEndocrino->id_rol);
        }
    }

    private function asignarRol(int $userId, int $rolId): void
    {
        $userRole = UserRole::query()
            ->where('user_id', '=', $userId, 'and')
            ->where('id_rol', '=', $rolId, 'and')
            ->first();

        if ($userRole === null) {
            UserRole::create([
                'user_id' => $userId,
                'id_rol' => $rolId,
                'estado' => 'activo',
            ]);

            return;
        }

        $userRole->update([
            'estado' => 'activo',
        ]); 
    }
}