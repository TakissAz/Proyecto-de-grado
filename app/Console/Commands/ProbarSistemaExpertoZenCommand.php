<?php

namespace App\Console\Commands;

use App\Services\SistemaExperto\SistemaExpertoZenService;
use Illuminate\Console\Command;
use Throwable;

class ProbarSistemaExpertoZenCommand extends Command
{
    protected $signature = 'experto:probar-zen';

    protected $description = 'Prueba la comunicación con el microservicio experto ZEN';

    public function handle(SistemaExpertoZenService $servicio): int
    {
        try {
            $health = $servicio->health();
            $pmos = $servicio->evaluarPmos([
                'cumple_alteracion_ovulatoria' => true,
                'cumple_hiperandrogenismo_clinico' => true,
                'cumple_hiperandrogenismo_bioquimico' => false,
                'cumple_morfologia_ovarica' => true,
                'diagnosticos_diferenciales_descartados' => true,
            ]);
            $ri = $servicio->evaluarResistenciaInsulina([
                'glucosa_ayunas' => 92,
                'insulina_ayunas' => 15,
                'homa_ir' => null,
                'quicki' => null,
                'hemoglobina_glicosilada' => null,
                'trigliceridos' => 170,
                'hdl' => 42,
                'acantosis_nigricans' => false,
                'obesidad_abdominal' => false,
            ]);

            $this->line('Health: '.data_get($health, 'status', 'desconocido'));
            $this->line(sprintf(
                'PMOS: confirmado=%s, fenotipo=%s, confianza=%.2f',
                $this->booleano(data_get($pmos, 'resultado.diagnostico_confirmado')),
                data_get($pmos, 'resultado.fenotipo_pmos', 'N/A'),
                (float) data_get($pmos, 'trazabilidad.confianza_experta', 0)
            ));
            $this->line(sprintf(
                'RI: confirmado=%s, grado=%s, confianza=%.2f',
                $this->booleano(data_get($ri, 'resultado.resistencia_confirmada')),
                data_get($ri, 'resultado.grado_resistencia', 'N/A'),
                (float) data_get($ri, 'trazabilidad.confianza_experta', 0)
            ));

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
    }

    private function booleano(mixed $valor): string
    {
        return $valor === true ? 'true' : 'false';
    }
}
