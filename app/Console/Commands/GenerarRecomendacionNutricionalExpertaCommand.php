<?php

namespace App\Console\Commands;

use App\Models\Paciente;
use App\Services\SistemaExperto\OrquestadorNutricionalExpertoService;
use Illuminate\Console\Command;
use Throwable;

class GenerarRecomendacionNutricionalExpertaCommand extends Command
{
    protected $signature = 'experto:generar-recomendacion-nutricional {paciente : ID del paciente}';

    protected $description = 'Genera y guarda una recomendación nutricional experta para un paciente';

    public function handle(OrquestadorNutricionalExpertoService $orquestador): int
    {
        $this->warn('Este comando guarda una nueva recomendación nutricional experta.');

        $paciente = Paciente::query()->find($this->argument('paciente'));
        if ($paciente === null) {
            $this->error('No se encontró el paciente indicado.');

            return self::FAILURE;
        }

        try {
            $recomendacion = $orquestador->generarRecomendacionBase($paciente);

            $this->info('Recomendación nutricional experta guardada correctamente.');
            $this->line('ID: '.$recomendacion->getKey());
            $this->line('Enfoque: '.($recomendacion->enfoque_nutricional_experto ?? 'N/D'));
            $this->line('Prioridad: '.($recomendacion->prioridad_nutricional ?? 'N/D'));
            $this->line('Calorías: '.($recomendacion->calorias_sugeridas ?? 'N/D'));
            $this->line(sprintf(
                'Macros: proteínas=%s%%, carbohidratos=%s%%, grasas=%s%%',
                $recomendacion->proteinas_porcentaje ?? 'N/D',
                $recomendacion->carbohidratos_porcentaje ?? 'N/D',
                $recomendacion->grasas_porcentaje ?? 'N/D'
            ));
            $this->line('Confianza: '.($recomendacion->confianza_experta ?? 'N/D'));
            $this->line('Estado de validación: '.$recomendacion->estado_validacion_experta);

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
    }
}
