<?php

namespace App\Console\Commands;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Services\SistemaExperto\OrquestadorSistemaExpertoService;
use Illuminate\Console\Command;
use Throwable;

class EjecutarDiagnosticoSistemaExpertoCommand extends Command
{
    protected $signature = 'experto:ejecutar-diagnostico
        {--pmos= : ID del diagnóstico PMOS}
        {--ri= : ID del diagnóstico de resistencia a la insulina}';

    protected $description = 'Evalúa con ZEN Engine y persiste el resultado experto';

    public function handle(OrquestadorSistemaExpertoService $orquestador): int
    {
        $idPmos = $this->option('pmos');
        $idRi = $this->option('ri');

        if ($idPmos === null && $idRi === null) {
            $this->error('Debe indicar al menos una opción: --pmos=ID o --ri=ID.');
            return self::FAILURE;
        }

        $this->warn('Este comando modifica el diagnóstico al persistir el resultado experto.');
        $huboError = false;

        if ($idPmos !== null) {
            $huboError = ! $this->ejecutarPmos($orquestador, $idPmos) || $huboError;
        }

        if ($idRi !== null) {
            $huboError = ! $this->ejecutarRi($orquestador, $idRi) || $huboError;
        }

        return $huboError ? self::FAILURE : self::SUCCESS;
    }

    private function ejecutarPmos(
        OrquestadorSistemaExpertoService $orquestador,
        mixed $id
    ): bool {
        $diagnostico = DiagnosticoPmos::query()->find($id);

        if ($diagnostico === null) {
            $this->error("No existe el diagnóstico PMOS con ID {$id}.");
            return false;
        }

        try {
            $diagnostico = $orquestador->evaluarYPersistirPmos($diagnostico);
            $this->line(sprintf(
                'PMOS id=%s, confirmado=%s, fenotipo=%s, confianza=%s, validación=%s',
                $diagnostico->getKey(),
                $this->booleano($diagnostico->diagnostico_confirmado),
                $diagnostico->fenotipo_pmos ?? 'N/A',
                $diagnostico->confianza_experta ?? 'N/A',
                $diagnostico->estado_validacion_experta ?? 'N/A'
            ));

            return true;
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());
            return false;
        }
    }

    private function ejecutarRi(
        OrquestadorSistemaExpertoService $orquestador,
        mixed $id
    ): bool {
        $diagnostico = DiagnosticoResistenciaInsulina::query()->find($id);

        if ($diagnostico === null) {
            $this->error("No existe el diagnóstico RI con ID {$id}.");
            return false;
        }

        try {
            $diagnostico = $orquestador->evaluarYPersistirResistenciaInsulina($diagnostico);
            $this->line(sprintf(
                'RI id=%s, confirmado=%s, grado=%s, confianza=%s, validación=%s',
                $diagnostico->getKey(),
                $this->booleano($diagnostico->resistencia_confirmada),
                $diagnostico->grado_resistencia ?? 'N/A',
                $diagnostico->confianza_experta ?? 'N/A',
                $diagnostico->estado_validacion_experta ?? 'N/A'
            ));

            return true;
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());
            return false;
        }
    }

    private function booleano(mixed $valor): string
    {
        return $valor === true ? 'true' : 'false';
    }
}
