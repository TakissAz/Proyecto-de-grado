<?php

namespace App\Http\Controllers\SistemaExperto;

use App\Http\Controllers\Controller;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Services\SistemaExperto\OrquestadorSistemaExpertoService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Throwable;

class EjecutarSistemaExpertoController extends Controller
{
    public function __construct(
        private readonly OrquestadorSistemaExpertoService $orquestador
    ) {}

    public function ejecutarPmos(DiagnosticoPmos $diagnostico): JsonResponse
    {
        try {
            $diagnostico = $this->orquestador->evaluarYPersistirPmos($diagnostico);

            return response()->json([
                'success' => true,
                'message' => 'El diagnóstico PMOS fue evaluado y actualizado correctamente.',
                'data' => $this->datosPmos($diagnostico),
            ]);
        } catch (Throwable $exception) {
            return $this->respuestaError($exception, 'PMOS');
        }
    }

    public function ejecutarResistenciaInsulina(
        DiagnosticoResistenciaInsulina $diagnostico
    ): JsonResponse {
        try {
            $diagnostico = $this->orquestador
                ->evaluarYPersistirResistenciaInsulina($diagnostico);

            return response()->json([
                'success' => true,
                'message' => 'El diagnóstico de resistencia a la insulina fue evaluado y actualizado correctamente.',
                'data' => $this->datosRi($diagnostico),
            ]);
        } catch (Throwable $exception) {
            return $this->respuestaError($exception, 'resistencia a la insulina');
        }
    }

    private function datosPmos(DiagnosticoPmos $diagnostico): array
    {
        return $diagnostico->only([
            'id_diagnostico_pmos',
            'diagnostico_confirmado',
            'fenotipo_pmos',
            'total_criterios_rotterdam',
            'conclusion_medica',
            'confianza_experta',
            'estado_validacion_experta',
            'reglas_activadas',
            'explicacion_experta',
        ]);
    }

    private function datosRi(DiagnosticoResistenciaInsulina $diagnostico): array
    {
        return $diagnostico->only([
            'id_diagnostico_ri',
            'resistencia_confirmada',
            'grado_resistencia',
            'riesgo_diabetes',
            'riesgo_cardiometabolico',
            'homa_ir',
            'quicki',
            'conclusion_medica',
            'confianza_experta',
            'estado_validacion_experta',
            'reglas_activadas',
            'explicacion_experta',
        ]);
    }

    private function respuestaError(Throwable $exception, string $modulo): JsonResponse
    {
        $esConexion = $this->contieneExcepcion($exception, ConnectionException::class);

        return response()->json([
            'success' => false,
            'message' => $esConexion
                ? 'El microservicio experto no está disponible. Intente nuevamente más tarde.'
                : "No se pudo ejecutar el sistema experto para {$modulo}: {$exception->getMessage()}",
        ], $esConexion ? 502 : 500);
    }

    private function contieneExcepcion(Throwable $exception, string $clase): bool
    {
        do {
            if ($exception instanceof $clase) {
                return true;
            }
            $exception = $exception->getPrevious();
        } while ($exception !== null);

        return false;
    }
}
