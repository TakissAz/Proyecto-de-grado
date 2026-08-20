<?php

namespace App\Console\Commands;

use App\Models\Paciente;
use App\Services\SistemaExperto\HechosNutricionalesSistemaExpertoService;
use Illuminate\Console\Command;

class ConstruirHechosNutricionalesCommand extends Command
{
    protected $signature = 'experto:hechos-nutricionales {paciente : ID del paciente}';

    protected $description = 'Muestra los hechos integrados para el sistema experto nutricional sin guardar cambios';

    public function handle(HechosNutricionalesSistemaExpertoService $servicio): int
    {
        $paciente = Paciente::query()->find($this->argument('paciente'));

        if ($paciente === null) {
            $this->error('No se encontró el paciente indicado.');

            return self::FAILURE;
        }

        $json = json_encode(
            $servicio->construirHechosNutricionales($paciente),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        if ($json === false) {
            $this->error('No se pudieron serializar los hechos nutricionales.');

            return self::FAILURE;
        }

        $this->line($json);

        return self::SUCCESS;
    }
}
