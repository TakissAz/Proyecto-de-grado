<?php

namespace App\Services\SistemaExperto;

use App\Models\Paciente;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\RequerimientoNutricional;
use App\Models\User;
use InvalidArgumentException;

class PersistenciaRecomendacionNutricionalExpertaService
{
    public function guardar(
        Paciente $paciente,
        array $respuestaExperta,
        ?User $nutricionista = null,
        ?RequerimientoNutricional $requerimiento = null
    ): RecomendacionNutricionalExperta {
        $resultado = $respuestaExperta['resultado'] ?? null;
        $trazabilidad = $respuestaExperta['trazabilidad'] ?? null;

        if (! is_array($resultado) || ! is_array($trazabilidad)) {
            throw new InvalidArgumentException(
                'La respuesta nutricional experta debe contener resultado y trazabilidad válidos.'
            );
        }

        return RecomendacionNutricionalExperta::query()->create([
            'id_paciente' => $paciente->getKey(),
            'id_nutricionista' => $nutricionista?->getKey(),
            'id_requerimiento_nutricional' => $requerimiento?->getKey(),
            'enfoque_nutricional_experto' => $resultado['enfoque_nutricional_experto'] ?? null,
            'prioridad_nutricional' => $resultado['prioridad_nutricional'] ?? null,
            'calorias_sugeridas' => $resultado['calorias_sugeridas'] ?? null,
            'proteinas_porcentaje' => $resultado['proteinas_porcentaje'] ?? null,
            'carbohidratos_porcentaje' => $resultado['carbohidratos_porcentaje'] ?? null,
            'grasas_porcentaje' => $resultado['grasas_porcentaje'] ?? null,
            'fibra_sugerida' => $resultado['fibra_sugerida'] ?? null,
            'recomendaciones' => $resultado['recomendaciones'] ?? [],
            'restricciones' => $resultado['restricciones'] ?? [],
            'alertas' => $resultado['alertas'] ?? [],
            'conclusion' => $resultado['conclusion'] ?? null,
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
            'estado_validacion_experta' => $trazabilidad['estado_validacion_experta'] ?? 'pendiente',
            'estado' => 'pendiente',
        ]);
    }

    private function textoExplicacion(mixed $explicacion): ?string
    {
        if ($explicacion === null || is_string($explicacion)) {
            return $explicacion;
        }

        $json = json_encode(
            $explicacion,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        if ($json === false) {
            throw new InvalidArgumentException(
                'La explicación nutricional experta no es serializable.'
            );
        }

        return $json;
    }
}
