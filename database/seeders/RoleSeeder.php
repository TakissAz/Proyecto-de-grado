<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'nombre' => 'administrador',
                'descripcion' => 'Usuario con acceso a la administración del sistema.',
            ],
            [
                'nombre' => 'endocrinologo',
                'descripcion' => 'Especialista encargado del módulo endocrinológico.',
            ],
            [
                'nombre' => 'nutricionista',
                'descripcion' => 'Especialista encargado de la planificación nutricional.',
            ],
            [
                'nombre' => 'paciente',
                'descripcion' => 'Paciente con acceso a su información y seguimiento.',
            ],
        ];

        foreach ($roles as $rol) {
            Role::updateOrCreate(
                ['nombre' => $rol['nombre']],
                [
                    'descripcion' => $rol['descripcion'],
                    'estado' => 'activo',
                ]
            );
        }
    }
}