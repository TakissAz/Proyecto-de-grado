<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\DiagnosticoPmos;
use App\Models\Paciente;
use App\Services\Pacientes\DiagnosticoPmosService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DiagnosticoPmosController extends Controller
{
    public function __construct(
        private readonly DiagnosticoPmosService $service
    ) {}

    private function reglas(): array
    {
        return [
            'id_consulta_endocrinologica'           => ['required', 'integer', 'exists:consultas_endocrinologicas,id_consulta_endocrinologica'],
            'fecha_diagnostico'                     => ['required', 'date'],
            'cumple_alteracion_ovulatoria'          => ['boolean'],
            'cumple_hiperandrogenismo_clinico'      => ['boolean'],
            'cumple_hiperandrogenismo_bioquimico'   => ['boolean'],
            'cumple_hiperandrogenismo'              => ['boolean'],
            'tipo_hiperandrogenismo'                => ['nullable', 'string', 'max:50'],
            'cumple_morfologia_ovarica'             => ['boolean'],
            'total_criterios_rotterdam'             => ['nullable', 'integer', 'min:0', 'max:3'],
            'fenotipo_pmos'                         => ['nullable', 'string', Rule::in(['A_clasico_completo', 'B_hiperandrogenico_anovulatorio', 'C_ovulatorio', 'D_no_hiperandrogenico', 'no_clasificado'])],
            'diagnostico_confirmado'                => ['boolean'],
            'diagnosticos_diferenciales_descartados'=> ['boolean'],
            'severidad_clinica'                     => ['nullable', 'string', Rule::in(['leve', 'moderada', 'severa'])],
            'riesgo_metabolico'                     => ['nullable', 'string', Rule::in(['bajo', 'moderado', 'alto'])],
            'conclusion_medica'                     => ['nullable', 'string', 'max:3000'],
            'recomendaciones_medicas'               => ['nullable', 'string', 'max:3000'],
            // IDs de relaciones opcionales
            'id_historia_menstrual'                 => ['nullable', 'integer'],
            'id_historia_hiperandrogenica'          => ['nullable', 'integer'],
            'id_perfil_androgenico'                 => ['nullable', 'integer'],
            'id_perfil_gonadotropo'                 => ['nullable', 'integer'],
            'id_diferencial_endocrino'              => ['nullable', 'integer'],
            'id_ecografia'                          => ['nullable', 'integer'],
        ];
    }

    public function store(Request $request, Paciente $paciente): RedirectResponse
    {
        $validated = $request->validate($this->reglas());
        $this->service->crear($paciente, $validated);

        return back()->with('success', 'Diagnóstico PMOS registrado correctamente.');
    }

    public function update(Request $request, Paciente $paciente, DiagnosticoPmos $diagnostico): RedirectResponse
    {
        $validated = $request->validate($this->reglas());
        $this->service->actualizar($diagnostico, $validated);

        return back()->with('success', 'Diagnóstico PMOS actualizado correctamente.');
    }

    public function actualizarClinico(Request $request, DiagnosticoPmos $diagnostico): JsonResponse
    {
        $datos = $request->validate([
            'diagnostico_confirmado' => ['required', 'boolean'],
            'fenotipo_pmos' => ['nullable', 'string', Rule::in(['A', 'B', 'C', 'D', 'no_clasificado', 'no_aplica'])],
            'severidad_clinica' => ['nullable', 'string', Rule::in(['no_clasificada', 'leve', 'moderada', 'severa'])],
            'riesgo_metabolico' => ['nullable', 'string', Rule::in(['no_evaluado', 'bajo', 'moderado', 'alto'])],
            'tipo_hiperandrogenismo' => ['required', 'string', Rule::in(['clinico', 'bioquimico', 'mixto', 'ninguno'])],
            'conclusion_medica' => ['nullable', 'string', 'max:3000'],
            'recomendaciones_medicas' => ['nullable', 'string', 'max:3000'],
            'estado' => ['required', 'string', Rule::in(['en_estudio', 'registrado'])],
        ]);

        $datos['fenotipo_pmos'] ??= 'no_aplica';
        $datos['severidad_clinica'] ??= 'no_clasificada';
        $datos['riesgo_metabolico'] ??= 'no_evaluado';

        $diagnostico->fill($datos);
        $diagnostico->save();

        return response()->json([
            'success' => true,
            'message' => 'Diagnóstico clínico PMOS actualizado correctamente.',
            'data' => $diagnostico->only(array_merge(
                ['id_diagnostico_pmos'],
                array_keys($datos)
            )),
        ]);
    }
}
