<?php

namespace App\Console\Commands;

use App\Models\RecomendacionNutricionalExperta;
use App\Services\Nutricion\GeneradorPlanSemanalService;
use Illuminate\Console\Command;
use Throwable;

class GenerarPlanSemanalCommand extends Command
{
    protected $signature = 'plan:generar-semanal
        {recomendacion : ID de la recomendación nutricional experta}
        {--fecha-inicio= : Fecha inicial en formato YYYY-MM-DD}';
    protected $description = 'Genera un plan semanal sugerido de cuatro tiempos diarios';

    public function handle(GeneradorPlanSemanalService $generador): int
    {
        $recomendacion = RecomendacionNutricionalExperta::query()
            ->find($this->argument('recomendacion'));
        if ($recomendacion === null) {
            $this->error('No se encontró la recomendación nutricional experta indicada.');
            return self::FAILURE;
        }

        try {
            $plan = $generador->generarDesdeRecomendacion($recomendacion, null, [
                'fecha_inicio' => $this->option('fecha-inicio'),
            ]);

            $this->info('Plan alimentario semanal sugerido generado correctamente.');
            $this->line('ID plan: '.$plan->getKey());
            $this->line('Paciente: '.$plan->id_paciente);
            $this->line('Estado: '.$plan->estado_plan);
            $this->line('Días creados: '.$plan->dias()->count());
            $this->line('Comidas creadas: '.$plan->dias()->withCount('comidas')->get()->sum('comidas_count'));
            $this->line('Calorías objetivo: '.($plan->calorias_objetivo ?? 'N/D'));
            $this->line('Calorías planificadas: '.($plan->calorias_totales ?? 'N/D'));

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());
            return self::FAILURE;
        }
    }
}
