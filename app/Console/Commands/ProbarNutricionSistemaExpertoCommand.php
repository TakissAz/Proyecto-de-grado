<?php

namespace App\Console\Commands;

use App\Models\Paciente;
use App\Services\SistemaExperto\HechosNutricionalesSistemaExpertoService;
use App\Services\SistemaExperto\SistemaExpertoZenService;
use Illuminate\Console\Command;
use Throwable;

class ProbarNutricionSistemaExpertoCommand extends Command
{
    protected $signature = 'experto:probar-nutricion {paciente : ID del paciente}';

    protected $description = 'Prueba la recomendación nutricional experta sin guardar cambios';

    public function handle(
        HechosNutricionalesSistemaExpertoService $hechosService,
        SistemaExpertoZenService $zenService
    ): int {
        $paciente = Paciente::query()->find($this->argument('paciente'));

        if ($paciente === null) {
            $this->error('No se encontró el paciente indicado.');

            return self::FAILURE;
        }

        try {
            $respuesta = $zenService->evaluarRecomendacionNutricional(
                $hechosService->construirHechosNutricionales($paciente)
            );

            $this->info('Recomendación nutricional experta');
            $this->line('Enfoque: '.data_get(
                $respuesta,
                'resultado.enfoque_nutricional_experto',
                'No determinado'
            ));
            $this->line('Prioridad: '.data_get(
                $respuesta,
                'resultado.prioridad_nutricional',
                'No determinada'
            ));
            $this->line('Calorías sugeridas: '.data_get(
                $respuesta,
                'resultado.calorias_sugeridas',
                'No determinadas'
            ));
            $this->line(sprintf(
                'Macros: proteínas=%s%%, carbohidratos=%s%%, grasas=%s%%',
                data_get($respuesta, 'resultado.proteinas_porcentaje', 'N/D'),
                data_get($respuesta, 'resultado.carbohidratos_porcentaje', 'N/D'),
                data_get($respuesta, 'resultado.grasas_porcentaje', 'N/D')
            ));
            $this->line('Confianza experta: '.data_get(
                $respuesta,
                'trazabilidad.confianza_experta',
                'No determinada'
            ));

            $reglas = data_get($respuesta, 'trazabilidad.reglas_activadas', []);
            $this->line('Reglas activadas: '.(
                is_array($reglas) && $reglas !== []
                    ? implode(', ', $reglas)
                    : 'Ninguna'
            ));

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
    }
}
