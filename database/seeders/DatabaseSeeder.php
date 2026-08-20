<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            PacienteDiagnosticoClinicoSeeder::class,
            PerfilNutricionalPacienteSeeder::class,
            OtrosPerfilesNutricionalesSeeder::class,
            RecetasSeeder::class,
        ]);
    }
}
