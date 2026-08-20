<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\RetroalimentacionPaciente;
use App\Models\SeguimientoComida;
use App\Models\SeguimientoSintomaPaciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RetroalimentacionPacienteController extends Controller
{
    public function store(Request $request, Paciente $paciente): JsonResponse
    {
        $datos = $request->validate([
            'tipo_retroalimentacion' => ['required', Rule::in(['comida', 'sintomas', 'adherencia', 'recomendacion_general', 'ajuste_plan', 'recordatorio'])],
            'mensaje' => ['required', 'string', 'max:1500'],
            'prioridad' => ['nullable', Rule::in(['baja', 'normal', 'alta'])],
            'id_plan_alimentario' => ['nullable', 'integer', 'exists:planes_alimentarios,id_plan_alimentario'],
            'id_seguimiento_comida' => ['nullable', 'integer', 'exists:seguimientos_comidas,id_seguimiento_comida'],
            'id_seguimiento_sintoma_paciente' => ['nullable', 'integer', 'exists:seguimientos_sintomas_paciente,id_seguimiento_sintoma_paciente'],
            'visible_para_paciente' => ['sometimes', 'boolean'],
        ]);

        $this->validarPertenencia($paciente, $datos);
        $retroalimentacion = $paciente->retroalimentacionesPaciente()->create($datos + [
            'id_usuario_emisor' => Auth::id(),
            'rol_emisor' => 'nutricionista',
            'prioridad' => $datos['prioridad'] ?? 'normal',
            'visible_para_paciente' => $datos['visible_para_paciente'] ?? true,
            'estado' => 'activo',
        ]);

        return response()->json(['success' => true, 'message' => 'Retroalimentación enviada al paciente.', 'data' => $retroalimentacion], 201);
    }

    private function validarPertenencia(Paciente $paciente, array $datos): void
    {
        $validaciones = [
            'id_plan_alimentario' => [PlanAlimentario::class, 'id_paciente'],
            'id_seguimiento_comida' => [SeguimientoComida::class, 'id_paciente'],
            'id_seguimiento_sintoma_paciente' => [SeguimientoSintomaPaciente::class, 'id_paciente'],
        ];
        foreach ($validaciones as $campo => [$modelo, $columna]) {
            if (! empty($datos[$campo]) && ! $modelo::query()->whereKey($datos[$campo])->where($columna, $paciente->getKey())->exists()) {
                throw ValidationException::withMessages([$campo => 'El registro seleccionado no pertenece al paciente.']);
            }
        }
    }
}
