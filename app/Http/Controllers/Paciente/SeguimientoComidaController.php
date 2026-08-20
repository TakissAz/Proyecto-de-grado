<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Models\ComidaPlanAlimentario;
use App\Services\Paciente\SeguimientoComidaPacienteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeguimientoComidaController extends Controller
{
    public function guardar(Request $request, ComidaPlanAlimentario $comida, SeguimientoComidaPacienteService $service): JsonResponse
    {
        $datos = $request->validate([
            'estado_cumplimiento' => ['required', Rule::in(['pendiente', 'completada', 'parcial', 'no_realizada', 'reemplazada'])],
            'porcentaje_consumido' => ['nullable', 'integer', 'min:0', 'max:100'],
            'nivel_agrado' => ['nullable', Rule::in(['me_gusto', 'neutral', 'no_me_gusto'])], 'desea_repetir' => ['nullable', 'boolean'],
            'nivel_saciedad' => ['nullable', Rule::in(['baja', 'media', 'alta'])], 'nivel_hambre_posterior' => ['nullable', Rule::in(['baja', 'media', 'alta'])],
            'ansiedad_posterior' => ['required', 'boolean'], 'presento_molestia' => ['required', 'boolean'],
            'tipo_molestia' => ['nullable', Rule::in(['ninguna', 'hinchazon', 'nausea', 'dolor_estomacal', 'acidez', 'diarrea', 'estreñimiento', 'hambre', 'ansiedad', 'otro'])],
            'intensidad_molestia' => ['nullable', Rule::in(['leve', 'moderada', 'severa'])],
            'dificultad_preparacion' => ['nullable', Rule::in(['facil', 'media', 'dificil'])], 'consiguio_ingredientes' => ['nullable', 'boolean'],
            'motivo_no_cumplimiento' => ['nullable', Rule::in(['falta_tiempo', 'no_tenia_ingredientes', 'no_me_gusto', 'me_cayo_mal', 'no_tenia_hambre', 'comi_fuera', 'olvido', 'otro'])],
            'comida_reemplazo' => ['nullable', 'string', 'max:500'], 'motivo_reemplazo' => ['nullable', 'string', 'max:500'],
            'comentario_paciente' => ['nullable', 'string', 'max:1000'], 'sugerencia_paciente' => ['nullable', 'string', 'max:1000'],
            'observacion_para_siguiente_plan' => ['nullable', 'string', 'max:1000'],
        ]);
        $paciente = $request->user()->paciente;
        abort_unless($paciente, 403, 'No existe un paciente vinculado a esta cuenta.');
        $seguimiento = $service->guardarSeguimiento($paciente, $comida, $datos);

        return response()->json(['success' => true, 'message' => 'Seguimiento guardado correctamente.', 'data' => $seguimiento]);
    }
}
