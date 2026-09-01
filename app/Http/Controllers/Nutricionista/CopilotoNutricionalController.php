<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\PlanAlimentario;
use App\Services\Nutricion\CopilotoNutricionalGroqService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenAI\Exceptions\RateLimitException;
use RuntimeException;

class CopilotoNutricionalController extends Controller
{
    public function __invoke(
        Request $request,
        PlanAlimentario $plan,
        CopilotoNutricionalGroqService $copiloto,
    ): JsonResponse {
        $datos = $request->validate([
            'accion' => ['required', Rule::in(CopilotoNutricionalGroqService::ACCIONES)],
            'pregunta' => ['nullable', 'required_if:accion,consulta', 'string', 'min:5', 'max:1000'],
            'tipo_comida' => ['nullable', Rule::in(['desayuno', 'almuerzo', 'merienda', 'cena'])],
        ]);

        try {
            $resultado = $copiloto->analizar(
                $plan,
                $datos['accion'],
                $datos['pregunta'] ?? null,
                $datos['tipo_comida'] ?? null,
            );

            return response()->json([
                'success' => true,
                'message' => 'Análisis generado. Debe ser revisado por la nutricionista.',
                'data' => $resultado,
            ]);
        } catch (RuntimeException $exception) {
            $limiteExcedido = $exception->getPrevious() instanceof RateLimitException;

            return response()->json([
                'success' => false,
                'message' => $limiteExcedido
                    ? 'Groq alcanzó temporalmente el límite de solicitudes o tokens. Espera un momento y vuelve a intentarlo; el plan no fue modificado.'
                    : $exception->getMessage(),
                'retry_after' => $limiteExcedido ? 30 : null,
            ], $limiteExcedido ? 429 : 502);
        }
    }
}
