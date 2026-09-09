<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pacientes\StorePacienteRequest;
use App\Http\Requests\Pacientes\UpdatePacienteRequest;
use App\Http\Resources\PacienteResource;
use App\Models\Paciente;
use App\Services\Pacientes\PacienteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PacienteController extends Controller
{
    public function __construct(
        private readonly PacienteService $pacienteService
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Nutricionista/Pacientes/Index', [
            'pacientes' => PacienteResource::collection(
                $this->pacienteService->listar(
                    $request->only(['buscar', 'estado']),
                    PacienteService::ORIGEN_NUTRICIONISTA
                )
            ),
            'filtros' => [
                'buscar' => $request->input('buscar', ''),
                'estado' => $request->input('estado', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Nutricionista/Pacientes/Create');
    }

    public function store(StorePacienteRequest $request): RedirectResponse
    {
        $this->pacienteService->crear($request->validated());

        return redirect()
            ->route('nutricionista.pacientes.index')
            ->with('success', 'Paciente creado correctamente.');
    }

    public function show(Paciente $paciente): Response
    {
        $paciente = $this->pacienteService->cargar($paciente);
        $consultaEndocrino = $paciente->consultasEndocrinologicas()->latest('fecha_consulta')->first();
        $pmos = $paciente->diagnosticosPmos()->latest('fecha_diagnostico')->first();
        $resistencia = $paciente->diagnosticosResistenciaInsulina()->latest('fecha_diagnostico')->first();
        $fisica = $paciente->evaluacionesFisicasEndocrinas()->latest('id_evaluacion_fisica')->first();

        $diagnosticos = collect([
            $pmos ? [
                'titulo' => 'PMOS',
                'estado' => $pmos->diagnostico_confirmado ? 'Confirmado' : 'No confirmado',
                'detalle' => $pmos->fenotipo_pmos ? 'Fenotipo '.str_replace('_', ' ', $pmos->fenotipo_pmos) : null,
                'riesgo' => $pmos->riesgo_metabolico,
            ] : null,
            $resistencia ? [
                'titulo' => 'Resistencia a la insulina',
                'estado' => $resistencia->resistencia_confirmada ? 'Confirmada' : 'No confirmada',
                'detalle' => $resistencia->grado_resistencia ? 'Grado '.str_replace('_', ' ', $resistencia->grado_resistencia) : null,
                'riesgo' => $resistencia->riesgo_cardiometabolico,
            ] : null,
        ])->filter()->values();

        $indicadores = collect([
            $fisica?->imc !== null ? ['etiqueta' => 'IMC', 'valor' => (string) $fisica->imc] : null,
            $fisica?->circunferencia_cintura !== null ? ['etiqueta' => 'Cintura', 'valor' => $fisica->circunferencia_cintura.' cm'] : null,
            $resistencia?->homa_ir !== null ? ['etiqueta' => 'HOMA-IR', 'valor' => (string) $resistencia->homa_ir] : null,
        ])->filter()->values();

        return Inertia::render('Nutricionista/Pacientes/Show', [
            'paciente' => new PacienteResource($paciente),
            'contextoEndocrinologico' => [
                'hay_registros' => $consultaEndocrino !== null || $diagnosticos->isNotEmpty() || $indicadores->isNotEmpty(),
                'consulta' => $consultaEndocrino ? [
                    'fecha' => $consultaEndocrino->fecha_consulta?->format('Y-m-d'),
                    'motivo' => $consultaEndocrino->motivo_consulta,
                ] : null,
                'diagnosticos' => $diagnosticos,
                'indicadores' => $indicadores,
                'orientacion' => $resistencia?->recomendaciones_medicas ?? $pmos?->recomendaciones_medicas,
            ],
        ]);
    }

    public function edit(Paciente $paciente): Response
    {
        return Inertia::render('Nutricionista/Pacientes/Edit', [
            'paciente' => new PacienteResource($this->pacienteService->cargar($paciente)),
        ]);
    }

    public function update(UpdatePacienteRequest $request, Paciente $paciente): RedirectResponse
    {
        $this->pacienteService->actualizar($paciente, $request->validated());

        return redirect()
            ->route('nutricionista.pacientes.index')
            ->with('success', 'Paciente actualizado correctamente.');
    }

    public function activar(Paciente $paciente): RedirectResponse
    {
        $this->pacienteService->cambiarEstado($paciente, 'activo');

        return back()->with('success', 'Paciente activado correctamente.');
    }

    public function inactivar(Paciente $paciente): RedirectResponse
    {
        $this->pacienteService->cambiarEstado($paciente, 'inactivo');

        return back()->with('success', 'Paciente inactivado correctamente.');
    }
}
