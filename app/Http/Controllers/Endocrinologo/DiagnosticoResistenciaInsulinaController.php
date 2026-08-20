<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\Paciente;
use App\Services\Pacientes\DiagnosticoResistenciaInsulinaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DiagnosticoResistenciaInsulinaController extends Controller
{
    public function __construct(
        private readonly DiagnosticoResistenciaInsulinaService $service
    ) {}

    private function reglas(): array
    {
        return [
            'id_consulta_endocrinologica' => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_diagnostico'           => ['required', 'date'],
            'homa_ir'                     => ['nullable', 'numeric', 'min:0'],
            'glucosa_ayunas'              => ['nullable', 'numeric', 'min:0'],
            'insulina_ayunas'             => ['nullable', 'numeric', 'min:0'],
            'hemoglobina_glicosilada'     => ['nullable', 'numeric', 'min:0'],
            'resistencia_confirmada'      => ['boolean'],
            'grado_resistencia'           => ['nullable', 'string', Rule::in(['no_aplica', 'leve', 'moderada', 'severa'])],
            'riesgo_diabetes'             => ['nullable', 'string', Rule::in(['no_evaluado', 'bajo', 'moderado', 'alto'])],
            'riesgo_cardiometabolico'     => ['nullable', 'string', Rule::in(['no_evaluado', 'bajo', 'moderado', 'alto'])],
            'conclusion_medica'           => ['nullable', 'string', 'max:3000'],
            'recomendaciones_medicas'     => ['nullable', 'string', 'max:3000'],
            'id_glucosa_insulina'         => ['nullable', 'integer'],
            'id_perfil_lipidico'          => ['nullable', 'integer'],
            'id_evaluacion_fisica'        => ['nullable', 'integer'],
        ];
    }

    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());
        $this->service->crear($paciente, $validated);

        return back()->with('success', 'Diagnóstico de resistencia a la insulina registrado correctamente.');
    }

    public function update(Request $request, Paciente $paciente, DiagnosticoResistenciaInsulina $diagnosticoRi): RedirectResponse
    {
        $validated = $request->validate($this->reglas());
        $this->service->actualizar($diagnosticoRi, $validated);

        return back()->with('success', 'Diagnóstico de resistencia a la insulina actualizado correctamente.');
    }

    public function actualizarClinico(
        Request $request,
        DiagnosticoResistenciaInsulina $diagnostico
    ): JsonResponse {
        $datos = $request->validate([
            'resistencia_confirmada' => ['required', 'boolean'],
            'grado_resistencia' => ['nullable', 'string', Rule::in(['leve', 'moderada', 'severa', 'no_confirmada'])],
            'riesgo_diabetes' => ['nullable', 'string', Rule::in(['no_evaluado', 'bajo', 'moderado', 'alto'])],
            'riesgo_cardiometabolico' => ['nullable', 'string', Rule::in(['no_evaluado', 'bajo', 'moderado', 'alto'])],
            'conclusion_medica' => ['nullable', 'string', 'max:3000'],
            'recomendaciones_medicas' => ['nullable', 'string', 'max:3000'],
            'estado' => ['required', 'string', Rule::in(['en_estudio', 'registrado'])],
        ]);

        $diagnostico->fill($datos);
        $diagnostico->save();

        return response()->json([
            'success' => true,
            'message' => 'Diagnóstico clínico de resistencia a la insulina actualizado correctamente.',
            'data' => $diagnostico->only(array_merge(
                ['id_diagnostico_ri'],
                array_keys($datos)
            )),
        ]);
    }
}
