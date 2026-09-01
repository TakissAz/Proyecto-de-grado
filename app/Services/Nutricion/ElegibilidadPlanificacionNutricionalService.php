<?php

namespace App\Services\Nutricion;

use App\Models\Paciente;

class ElegibilidadPlanificacionNutricionalService
{
    public function evaluar(Paciente $paciente): array
    {
        $pmos = $paciente->diagnosticosPmos()
            ->latest('fecha_diagnostico')
            ->latest('id_diagnostico_pmos')
            ->first();

        $ri = $paciente->diagnosticosResistenciaInsulina()
            ->latest('fecha_diagnostico')
            ->latest('id_diagnostico_ri')
            ->first();

        $pmosConfirmado = (bool) $pmos?->diagnostico_confirmado;
        $riConfirmada = (bool) $ri?->resistencia_confirmada;
        $elegible = $pmosConfirmado || $riConfirmada;

        return [
            'elegible' => $elegible,
            'pmos_confirmado' => $pmosConfirmado,
            'ri_confirmada' => $riConfirmada,
            'origen' => $pmosConfirmado && $riConfirmada
                ? 'pmos_y_resistencia_insulina'
                : ($pmosConfirmado ? 'pmos' : ($riConfirmada ? 'resistencia_insulina' : null)),
            'motivo' => $elegible
                ? 'La paciente cuenta con un diagnóstico endocrinológico confirmado.'
                : 'La paciente no tiene diagnóstico confirmado de PMOS ni de resistencia a la insulina. Endocrinología debe confirmar al menos uno para habilitar la planificación nutricional.',
        ];
    }
}
