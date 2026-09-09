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
            LimpiezaDatosObsoletosSeeder::class,
            PacienteDiagnosticoClinicoSeeder::class,
            PerfilNutricionalPacienteSeeder::class,
            OtrosPerfilesNutricionalesSeeder::class,
            RecetasSeeder::class,
            CatalogoAmpliadoRecetasSeeder::class,
            DatosClinicosNutricionalesRealistasSeeder::class,
            PerfilesEndocrinologicosCompletosSeeder::class,
            ReglasNutricionalesSeeder::class,
            FlujoOperativoNutricionalRealistaSeeder::class,
            ProgresoReportesNutricionistaSeeder::class,
            CompletarTodosLosPacientesSeeder::class,
            CompletarComponentesPlanesSeeder::class,
            FotosPerfilPacientesSeeder::class,
        ]);
    }
}
