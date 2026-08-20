<?php

namespace App\Console\Commands;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Services\SistemaExperto\PersistenciaDiagnosticoExpertoService;
use App\Services\SistemaExperto\SistemaExpertoZenService;
use Illuminate\Console\Command;
use Throwable;

class ProbarPersistenciaSistemaExpertoCommand extends Command
{
    protected $signature = 'experto:probar-persistencia';

    protected $description = 'Prueba de forma controlada la persistencia de resultados expertos';

    public function handle(
        SistemaExpertoZenService $zen,
        PersistenciaDiagnosticoExpertoService $persistencia
    ): int {
        try {
            $this->probarPmos($zen, $persistencia);
            $this->probarRi($zen, $persistencia);

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
    }

    private function probarPmos(
        SistemaExpertoZenService $zen,
        PersistenciaDiagnosticoExpertoService $persistencia
    ): void {
        $diagnostico = DiagnosticoPmos::query()->first();

        if ($diagnostico === null) {
            $this->warn('PMOS: no existe un diagnóstico para realizar la prueba.');
            return;
        }

        $respuesta = $zen->evaluarPmos([
            'cumple_alteracion_ovulatoria' => true,
            'cumple_hiperandrogenismo_clinico' => true,
            'cumple_hiperandrogenismo_bioquimico' => false,
            'cumple_morfologia_ovarica' => true,
            'diagnosticos_diferenciales_descartados' => true,
        ]);
        $diagnostico = $persistencia->guardarPmos($diagnostico, $respuesta);

        $this->line(sprintf(
            'PMOS id=%s, confirmado=%s, fenotipo=%s, confianza=%s, validación=%s',
            $diagnostico->getKey(),
            $this->booleano($diagnostico->diagnostico_confirmado),
            $diagnostico->fenotipo_pmos ?? 'N/A',
            $diagnostico->confianza_experta ?? 'N/A',
            $diagnostico->estado_validacion_experta ?? 'N/A'
        ));
    }

    private function probarRi(
        SistemaExpertoZenService $zen,
        PersistenciaDiagnosticoExpertoService $persistencia
    ): void {
        $diagnostico = DiagnosticoResistenciaInsulina::query()->first();

        if ($diagnostico === null) {
            $this->warn('RI: no existe un diagnóstico para realizar la prueba.');
            return;
        }

        $respuesta = $zen->evaluarResistenciaInsulina([
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
        $diagnostico = $persistencia->guardarResistenciaInsulina($diagnostico, $respuesta);

        $this->line(sprintf(
            'RI id=%s, confirmado=%s, grado=%s, confianza=%s, validación=%s',
            $diagnostico->getKey(),
            $this->booleano($diagnostico->resistencia_confirmada),
            $diagnostico->grado_resistencia ?? 'N/A',
            $diagnostico->confianza_experta ?? 'N/A',
            $diagnostico->estado_validacion_experta ?? 'N/A'
        ));
    }

    private function booleano(mixed $valor): string
    {
        return $valor === true ? 'true' : 'false';
    }
}
