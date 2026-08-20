<?php

namespace App\Services\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use RuntimeException;
use Throwable;

class OrquestadorSistemaExpertoService
{
    public function __construct(
        private readonly HechosSistemaExpertoService $hechos,
        private readonly SistemaExpertoZenService $zen,
        private readonly PersistenciaDiagnosticoExpertoService $persistencia
    ) {}

    public function evaluarYPersistirPmos(
        DiagnosticoPmos $diagnostico
    ): DiagnosticoPmos {
        try {
            $hechos = $this->hechos->construirHechosPmos($diagnostico);
            $respuesta = $this->zen->evaluarPmos($hechos);

            return $this->persistencia->guardarPmos($diagnostico, $respuesta);
        } catch (Throwable $exception) {
            throw new RuntimeException(
                'No se pudo completar la evaluación experta de PMOS: '.$exception->getMessage(),
                0,
                $exception
            );
        }
    }

    public function evaluarYPersistirResistenciaInsulina(
        DiagnosticoResistenciaInsulina $diagnostico
    ): DiagnosticoResistenciaInsulina {
        try {
            $hechos = $this->hechos->construirHechosResistenciaInsulina($diagnostico);
            $respuesta = $this->zen->evaluarResistenciaInsulina($hechos);

            return $this->persistencia->guardarResistenciaInsulina(
                $diagnostico,
                $respuesta
            );
        } catch (Throwable $exception) {
            throw new RuntimeException(
                'No se pudo completar la evaluación experta de resistencia a la insulina: '
                    .$exception->getMessage(),
                0,
                $exception
            );
        }
    }
}
