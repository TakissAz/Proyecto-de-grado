<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Services\Paciente\SeguimientoSintomasPacienteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeguimientoSintomasController extends Controller
{
    public function store(Request $request, SeguimientoSintomasPacienteService $service): JsonResponse
    {
        $datos = $request->validate([
            'fecha_registro' => ['nullable', 'date'],
            'nivel_energia' => ['nullable', Rule::in(['baja', 'media', 'alta'])],
            'hambre_durante_dia' => ['nullable', Rule::in(['baja', 'media', 'alta'])],
            'ansiedad_por_comida' => ['nullable', Rule::in(['ninguna', 'leve', 'moderada', 'alta'])],
            'antojos_dulces' => ['nullable', Rule::in(['ninguno', 'leve', 'moderado', 'alto'])],
            'hambre_nocturna' => ['required', 'boolean'],
            'hinchazon_abdominal' => ['nullable', Rule::in(['ninguna', 'leve', 'moderada', 'severa'])],
            'fatiga_post_comida' => ['nullable', Rule::in(['ninguna', 'leve', 'moderada', 'severa'])],
            'mareos_o_debilidad' => ['required', 'boolean'],
            'acne' => ['nullable', Rule::in(['ninguno', 'leve', 'moderado', 'severo'])],
            'dolor_menstrual' => ['nullable', Rule::in(['ninguno', 'leve', 'moderado', 'severo'])],
            'irregularidad_menstrual' => ['nullable', 'boolean'],
            'cambios_estado_animo' => ['nullable', Rule::in(['estable', 'irritable', 'bajo', 'ansioso'])],
            'calidad_sueno' => ['nullable', Rule::in(['mala', 'regular', 'buena'])],
            'horas_sueno' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'actividad_fisica' => ['nullable', Rule::in(['ninguna', 'ligera', 'moderada', 'intensa'])],
            'minutos_actividad' => ['nullable', 'integer', 'min:0', 'max:600'],
            'consumo_agua_litros' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'observaciones' => ['nullable', 'string', 'max:1000'],
        ]);
        $paciente = $request->user()->paciente;
        abort_unless($paciente, 403, 'No existe un paciente vinculado a esta cuenta.');
        $registro = $service->guardar($paciente, $datos, $request->user());
        return response()->json(['success' => true, 'message' => 'Seguimiento de síntomas guardado correctamente.', 'data' => $registro]);
    }
}
