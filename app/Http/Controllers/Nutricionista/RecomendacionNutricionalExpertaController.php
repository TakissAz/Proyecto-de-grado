<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\User;
use App\Services\SistemaExperto\OrquestadorNutricionalExpertoService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Throwable;

class RecomendacionNutricionalExpertaController extends Controller
{
    public function __construct(
        private readonly OrquestadorNutricionalExpertoService $orquestador
    ) {}

    public function generar(Paciente $paciente): JsonResponse
    {
        try {
            /** @var User $nutricionista */
            $nutricionista = Auth::user();
            $recomendacion = $this->orquestador->generarRecomendacionBase(
                $paciente,
                $nutricionista
            );

            return response()->json([
                'success' => true,
                'message' => 'Recomendación nutricional experta generada correctamente.',
                'data' => $this->datos($recomendacion),
            ]);
        } catch (Throwable $exception) {
            $esConexion = $this->contieneExcepcion($exception, ConnectionException::class);

            return response()->json([
                'success' => false,
                'message' => $esConexion
                    ? 'No se pudo conectar con el sistema experto nutricional.'
                    : 'No se pudo generar la recomendación nutricional experta.',
            ], $esConexion ? 502 : 500);
        }
    }

    public function validar(
        Request $request,
        RecomendacionNutricionalExperta $recomendacion
    ): JsonResponse {
        $datos = $request->validate([
            'estado_validacion_experta' => [
                'required',
                Rule::in(['aprobado', 'rechazado']),
            ],
            'observacion_validacion' => ['nullable', 'string', 'max:1000'],
        ]);

        $recomendacion->update([
            'estado_validacion_experta' => $datos['estado_validacion_experta'],
            'validado_por' => Auth::id(),
            'fecha_validacion' => now(),
            'observacion_validacion' => $datos['observacion_validacion'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => $datos['estado_validacion_experta'] === 'aprobado'
                ? 'Recomendación nutricional aprobada correctamente.'
                : 'Recomendación nutricional rechazada correctamente.',
            'data' => $this->datos($recomendacion->refresh()),
        ]);
    }

    private function datos(RecomendacionNutricionalExperta $recomendacion): array
    {
        return $recomendacion->only([
            'id_recomendacion_nutricional_experta',
            'id_paciente',
            'id_nutricionista',
            'id_requerimiento_nutricional',
            'enfoque_nutricional_experto',
            'prioridad_nutricional',
            'calorias_sugeridas',
            'proteinas_porcentaje',
            'carbohidratos_porcentaje',
            'grasas_porcentaje',
            'fibra_sugerida',
            'recomendaciones',
            'restricciones',
            'alertas',
            'conclusion',
            'reglas_activadas',
            'hechos_utilizados',
            'explicacion_experta',
            'confianza_experta',
            'version_motor_experto',
            'estado_validacion_experta',
            'validado_por',
            'fecha_validacion',
            'observacion_validacion',
        ]);
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
