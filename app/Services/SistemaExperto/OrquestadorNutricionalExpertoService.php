<?php

namespace App\Services\SistemaExperto;

use App\Models\Paciente;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\User;
use RuntimeException;
use Throwable;

class OrquestadorNutricionalExpertoService
{
    public function __construct(
        private readonly HechosNutricionalesSistemaExpertoService $hechosService,
        private readonly SistemaExpertoZenService $zenService,
        private readonly PersistenciaRecomendacionNutricionalExpertaService $persistenciaService
    ) {}

    public function generarRecomendacionBase(
        Paciente $paciente,
        ?User $nutricionista = null
    ): RecomendacionNutricionalExperta {
        try {
            $hechos = $this->hechosService->construirHechosNutricionales($paciente);
            $respuesta = $this->zenService->evaluarRecomendacionNutricional($hechos);
            $requerimiento = $paciente->requerimientosNutricionales()
                ->where('estado', true)
                ->latest('id_requerimiento_nutricional')
                ->first();

            return $this->persistenciaService->guardar(
                $paciente,
                $respuesta,
                $nutricionista,
                $requerimiento
            );
        } catch (Throwable $exception) {
            throw new RuntimeException(
                'No se pudo generar la recomendación nutricional experta: '.$exception->getMessage(),
                0,
                $exception
            );
        }
    }
}
