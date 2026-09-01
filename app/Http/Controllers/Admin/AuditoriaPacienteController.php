<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PacienteResource;
use App\Services\Pacientes\PacienteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Paciente;

class AuditoriaPacienteController extends Controller
{
    public function __construct(
        private readonly PacienteService $pacienteService
    ) {
    }

    public function pacientes(Request $request): Response
    {
        return Inertia::render('Admin/Auditoria/Pacientes', [
            'pacientes' => PacienteResource::collection(
                $this->pacienteService->auditoriaPacientes($request->only(['buscar', 'estado', 'estado_flujo', 'origen_registro']))
            ),
            'filtros' => [
                'buscar' => $request->input('buscar', ''),
                'estado' => $request->input('estado', ''),
                'estado_flujo' => $request->input('estado_flujo', ''),
                'origen_registro' => $request->input('origen_registro', ''),
            ],
            'estados' => ['activo', 'inactivo'],
            'estados_flujo' => [
                PacienteService::FLUJO_PENDIENTE_NUTRICION,
                PacienteService::FLUJO_PENDIENTE_ENDOCRINO,
                PacienteService::FLUJO_EN_SEGUIMIENTO,
                PacienteService::FLUJO_COMPLETO,
                PacienteService::FLUJO_INACTIVO,
            ],
            'origenes' => [
                PacienteService::ORIGEN_NUTRICIONISTA,
                PacienteService::ORIGEN_ENDOCRINOLOGO,
                PacienteService::ORIGEN_ADMINISTRADOR,
            ],
        ]);
    }

    public function actividad(Request $request): Response
    {
        $paciente = $request->filled('paciente')
            ? Paciente::withTrashed()->with('user:id,name,email')->find($request->integer('paciente'))
            : null;

        return Inertia::render('Admin/Auditoria/Actividad', [
            'actividades' => $this->pacienteService->actividadPacientes($request->only(['buscar', 'paciente'])),
            'filtros' => [
                'buscar' => $request->input('buscar', ''),
                'paciente' => $request->input('paciente', ''),
            ],
            'pacienteSeleccionada' => $paciente ? [
                'id_paciente' => $paciente->getKey(),
                'nombre_completo' => trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' ')),
                'ci' => $paciente->ci,
                'email' => $paciente->user?->email,
                'estado' => $paciente->estado,
                'created_at' => $paciente->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $paciente->updated_at?->format('Y-m-d H:i:s'),
            ] : null,
        ]);
    }
}
