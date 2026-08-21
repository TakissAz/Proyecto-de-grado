<?php

namespace App\Console\Commands;

use App\Models\Paciente;
use App\Services\Prediccion\PredictorRiesgoAdherenciaService;
use Illuminate\Console\Command;

class PredecirRiesgoAdherenciaCommand extends Command
{
    protected $signature = 'prediccion:riesgo-adherencia {paciente : ID del paciente}';
    protected $description = 'Calcula en tiempo real el riesgo predictivo de baja adherencia nutricional';

    public function handle(PredictorRiesgoAdherenciaService $predictor): int
    {
        $paciente = Paciente::query()->find($this->argument('paciente'));
        if (! $paciente) { $this->error('No se encontró el paciente indicado.'); return self::FAILURE; }
        $resultado = $predictor->predecir($paciente);
        $this->line(json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return self::SUCCESS;
    }
}
