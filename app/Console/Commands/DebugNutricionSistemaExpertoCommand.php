<?php

namespace App\Console\Commands;

use App\Models\Paciente;
use App\Services\SistemaExperto\HechosNutricionalesSistemaExpertoService;
use App\Services\SistemaExperto\SistemaExpertoZenService;
use Illuminate\Console\Command;
use Throwable;

class DebugNutricionSistemaExpertoCommand extends Command
{
    protected $signature = 'experto:debug-nutricion {paciente}';
    protected $description = 'Depura hechos, payload y respuesta nutricional sin guardar registros';

    public function handle(HechosNutricionalesSistemaExpertoService $hechosService, SistemaExpertoZenService $zen): int
    {
        $paciente = Paciente::query()->find($this->argument('paciente'));
        if (! $paciente) {
            $this->error('Paciente no encontrado.');
            return self::FAILURE;
        }
        $hechos = $hechosService->construirHechosNutricionales($paciente);
        $payload = $zen->construirPayloadNutricional($hechos);
        $this->seccion('1. Hechos nutricionales agrupados', $hechos);
        $this->seccion('2. Payload plano enviado a ZEN Engine', $payload);
        $this->seccion('4. Restricciones detectadas', $hechos['restricciones_alimentarias']);
        $this->seccion('5. Preferencias detectadas', $hechos['preferencias_alimentarias']);
        $this->seccion('6. Hábitos detectados', $hechos['habitos_alimentarios']);
        try {
            $this->seccion('3. Respuesta del microservicio', $zen->evaluarRecomendacionNutricional($hechos));
        } catch (Throwable $e) {
            $this->error('3. Respuesta del microservicio: '.$e->getMessage());
            return self::FAILURE;
        }
        $this->info('Depuración finalizada. No se guardaron datos.');
        return self::SUCCESS;
    }

    private function seccion(string $titulo, array $datos): void
    {
        $this->newLine(); $this->info($titulo);
        $this->line((string) json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
}
