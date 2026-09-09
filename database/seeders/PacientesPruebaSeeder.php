<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Alias conservado para instalaciones antiguas.
 *
 * La carga ahora utiliza la cohorte clínica canónica y ya no crea pacientes
 * con nombres, correos o identificaciones marcados como datos temporales.
 */
class PacientesPruebaSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(DatosClinicosNutricionalesRealistasSeeder::class);

        $this->command?->info('Se cargó la cohorte clínica canónica de pacientes.');
    }
}
