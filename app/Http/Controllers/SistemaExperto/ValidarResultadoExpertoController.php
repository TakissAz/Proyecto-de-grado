<?php

namespace App\Http\Controllers\SistemaExperto;

use App\Http\Controllers\Controller;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ValidarResultadoExpertoController extends Controller
{
    public function validarPmos(
        Request $request,
        DiagnosticoPmos $diagnostico
    ): JsonResponse {
        $this->validar($request, $diagnostico);

        return $this->respuesta(
            $diagnostico,
            'El resultado experto de PMOS fue validado correctamente.'
        );
    }

    public function validarResistenciaInsulina(
        Request $request,
        DiagnosticoResistenciaInsulina $diagnostico
    ): JsonResponse {
        $this->validar($request, $diagnostico);

        return $this->respuesta(
            $diagnostico,
            'El resultado experto de resistencia a la insulina fue validado correctamente.'
        );
    }

    private function validar(Request $request, Model $diagnostico): void
    {
        $datos = $request->validate([
            'estado_validacion_experta' => [
                'required',
                'string',
                Rule::in(['aprobado', 'rechazado']),
            ],
            'observacion_validacion' => ['nullable', 'string', 'max:1000'],
        ]);

        $diagnostico->fill([
            'estado_validacion_experta' => $datos['estado_validacion_experta'],
            'validado_por' => Auth::id(),
            'fecha_validacion' => now(),
            'observacion_validacion' => $datos['observacion_validacion'] ?? null,
        ]);
        $diagnostico->save();
    }

    private function respuesta(Model $diagnostico, string $message): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $diagnostico->only([
                $diagnostico->getKeyName(),
                'estado_validacion_experta',
                'validado_por',
                'fecha_validacion',
                'observacion_validacion',
            ]),
        ]);
    }
}
