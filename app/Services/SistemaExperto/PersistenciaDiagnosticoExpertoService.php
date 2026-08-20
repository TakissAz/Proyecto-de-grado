<?php

namespace App\Services\SistemaExperto;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use InvalidArgumentException;

class PersistenciaDiagnosticoExpertoService
{
    public function guardarPmos(
        DiagnosticoPmos $diagnostico,
        array $respuestaExperta
    ): DiagnosticoPmos {
        [$resultado, $trazabilidad] = $this->secciones($respuestaExperta);

        $diagnostico->fill(array_merge(
            $this->trazabilidad($diagnostico->estado_validacion_experta, $trazabilidad),
            [
                'diagnostico_confirmado' => $resultado['diagnostico_confirmado'] ?? false,
                'fenotipo_pmos' => $resultado['fenotipo_pmos'] ?? null,
                'total_criterios_rotterdam' => $resultado['total_criterios_rotterdam'] ?? 0,
                'conclusion_medica' => $resultado['conclusion'] ?? null,
            ]
        ));
        $diagnostico->save();

        return $diagnostico;
    }

    public function guardarResistenciaInsulina(
        DiagnosticoResistenciaInsulina $diagnostico,
        array $respuestaExperta
    ): DiagnosticoResistenciaInsulina {
        [$resultado, $trazabilidad] = $this->secciones($respuestaExperta);

        $diagnostico->fill(array_merge(
            $this->trazabilidad($diagnostico->estado_validacion_experta, $trazabilidad),
            [
                'homa_ir' => $resultado['homa_ir'] ?? null,
                'quicki' => $resultado['quicki'] ?? null,
                'resistencia_confirmada' => $resultado['resistencia_confirmada'] ?? false,
                'grado_resistencia' => $resultado['grado_resistencia'] ?? 'no_aplica',
                'riesgo_diabetes' => $resultado['riesgo_diabetes'] ?? 'no_evaluado',
                'riesgo_cardiometabolico' => $resultado['riesgo_cardiometabolico'] ?? 'no_evaluado',
                'conclusion_medica' => $resultado['conclusion'] ?? null,
            ]
        ));
        $diagnostico->save();

        return $diagnostico;
    }

    private function secciones(array $respuestaExperta): array
    {
        $resultado = $respuestaExperta['resultado'] ?? null;
        $trazabilidad = $respuestaExperta['trazabilidad'] ?? null;

        if (! is_array($resultado) || ! is_array($trazabilidad)) {
            throw new InvalidArgumentException(
                'La respuesta experta debe contener resultado y trazabilidad válidos.'
            );
        }

        return [$resultado, $trazabilidad];
    }

    private function trazabilidad(
        ?string $estadoActual,
        array $trazabilidad
    ): array {
        $datos = [
            'generado_por_motor_experto' => $trazabilidad['generado_por_motor_experto'] ?? true,
            'hechos_utilizados' => $trazabilidad['hechos_utilizados'] ?? [],
            'reglas_activadas' => $trazabilidad['reglas_activadas'] ?? [],
            'explicacion_experta' => $this->textoExplicacion(
                $trazabilidad['explicacion_experta'] ?? []
            ),
            'recomendaciones_expertas' => $trazabilidad['recomendaciones_expertas'] ?? [],
            'confianza_experta' => $trazabilidad['confianza_experta'] ?? null,
            'version_motor_experto' => $trazabilidad['version_motor_experto'] ?? null,
            'evaluado_por_motor_experto_en' => $trazabilidad['evaluado_por_motor_experto_en'] ?? now(),
        ];

        if ($estadoActual === null || $estadoActual === 'pendiente') {
            $datos['estado_validacion_experta'] =
                $trazabilidad['estado_validacion_experta'] ?? 'pendiente';
        }

        return $datos;
    }

    private function textoExplicacion(mixed $explicacion): ?string
    {
        if ($explicacion === null || is_string($explicacion)) {
            return $explicacion;
        }

        $json = json_encode(
            $explicacion,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        if ($json === false) {
            throw new InvalidArgumentException('La explicación experta no es serializable.');
        }

        return $json;
    }
}
