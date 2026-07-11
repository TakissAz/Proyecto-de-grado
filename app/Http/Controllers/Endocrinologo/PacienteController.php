<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pacientes\StorePacienteRequest;
use App\Http\Requests\Pacientes\UpdatePacienteRequest;
use App\Http\Resources\PacienteResource;
use App\Http\Resources\PerfilClinicoResource;
use App\Models\Paciente;
use App\Services\Pacientes\PacienteService;
use App\Services\Pacientes\PerfilClinicoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PacienteController extends Controller
{
    public function __construct(
        private readonly PacienteService $pacienteService,
        private readonly PerfilClinicoService $perfilClinicoService,
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Endocrinologo/Pacientes/Index', [
            'pacientes' => PacienteResource::collection(
                $this->pacienteService->listar($request->only(['buscar', 'estado']))
            ),
            'filtros' => [
                'buscar' => $request->input('buscar', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Endocrinologo/Pacientes/Create');
    }

    public function store(StorePacienteRequest $request): RedirectResponse
    {
        $paciente = $this->pacienteService->crear($request->validated());

        return redirect()
            ->route('endocrinologo.pacientes.index')
            ->with('nueva_consulta_paciente_id', $paciente->id_paciente)
            ->with('success', 'Paciente registrado. Puedes iniciar la primera consulta desde su perfil.');
    }

    public function show(Paciente $paciente): Response
    {
        return Inertia::render('Endocrinologo/Pacientes/Show', [
            'paciente' => new PacienteResource($this->pacienteService->cargar($paciente)),
        ]);
    }

    public function edit(Paciente $paciente): Response
    {
        return Inertia::render('Endocrinologo/Pacientes/Edit', [
            'paciente' => new PacienteResource($this->pacienteService->cargar($paciente)),
        ]);
    }

    public function update(UpdatePacienteRequest $request, Paciente $paciente): RedirectResponse
    {
        $this->pacienteService->actualizar($paciente, $request->validated());

        return redirect()
            ->route('endocrinologo.pacientes.index')
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

    public function perfilClinico(Paciente $paciente): Response
    {
        $perfil = $this->perfilClinicoService->obtener($paciente);

        return Inertia::render('Endocrinologo/Pacientes/PerfilClinico/Index', [
            'perfil' => new PerfilClinicoResource($perfil),
        ]);
    }
}