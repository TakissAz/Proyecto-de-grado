<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Paciente;
use App\Services\Citas\AgendaCitaService;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CitaController extends Controller
{
    public function __construct(
        private readonly AgendaCitaService $agendaService,
        private readonly string $tipoProfesional = 'endocrinologo'
    ) {}

    public function index(Request $request): Response
    {
        $query = Cita::with(['paciente', 'profesional'])
            ->where('tipo_profesional', $this->tipoProfesional)
            ->latest('fecha_cita')
            ->latest('hora_inicio');

        if ($request->filled('fecha')) {
            $query->whereDate('fecha_cita', $request->input('fecha'));
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }
        if ($request->filled('tipo_cita')) {
            $query->where('tipo_cita', $request->input('tipo_cita'));
        }
        if ($request->filled('modalidad')) {
            $query->where('modalidad', $request->input('modalidad'));
        }
        if ($request->filled('paciente')) {
            $buscar = $request->input('paciente');
            $query->whereHas('paciente', fn ($q) => $q
                ->where('nombres', 'like', "%{$buscar}%")
                ->orWhere('apellido_paterno', 'like', "%{$buscar}%")
                ->orWhere('apellido_materno', 'like', "%{$buscar}%")
                ->orWhere('ci', 'like', "%{$buscar}%")
            );
        }

        $citas = $query->paginate(15)->through(fn (Cita $c) => [
            'id_cita' => $c->id_cita,
            'paciente' => $c->paciente ? [
                'id_paciente' => $c->paciente->id_paciente,
                'nombre_completo' => trim("{$c->paciente->nombres} {$c->paciente->apellido_paterno} {$c->paciente->apellido_materno}"),
                'ci' => $c->paciente->ci,
            ] : null,
            'profesional' => $c->profesional ? ['id' => $c->profesional->id, 'name' => $c->profesional->name] : null,
            'tipo_profesional' => $c->tipo_profesional,
            'fecha_cita' => $c->fecha_cita?->format('Y-m-d'),
            'hora_inicio' => substr($c->hora_inicio, 0, 5),
            'hora_fin' => substr($c->hora_fin, 0, 5),
            'duracion_minutos' => $c->duracion_minutos,
            'tipo_cita' => $c->tipo_cita,
            'modalidad' => $c->modalidad,
            'motivo' => $c->motivo,
            'estado' => $c->estado,
            'observaciones' => $c->observaciones,
            'motivo_cancelacion' => $c->motivo_cancelacion,
        ]);

        $folder = $this->tipoProfesional === 'nutricionista' ? 'Nutricionista' : 'Endocrinologo';
        $usuario = Auth::user();

        $pacientes = Paciente::where('estado', 'activo')
            ->orderBy('apellido_paterno')
            ->get()
            ->map(fn (Paciente $p) => [
                'id_paciente' => $p->id_paciente,
                'nombre_completo' => trim("{$p->nombres} {$p->apellido_paterno} {$p->apellido_materno}"),
                'ci' => $p->ci,
            ])
            ->values();

        return Inertia::render("{$folder}/Citas/Index", [
            'citas' => $citas,
            'filtros' => $request->only(['fecha', 'estado', 'tipo_cita', 'modalidad', 'paciente']),
            'pacientes' => $pacientes,
            'profesional' => ['id' => $usuario->id, 'name' => $usuario->name],
            'tipoProfesional' => $this->tipoProfesional,
        ]);
    }

    public function create(): Response
    {
        $pacientes = Paciente::where('estado', 'activo')
            ->orderBy('apellido_paterno')
            ->get()
            ->map(fn (Paciente $p) => [
                'id_paciente' => $p->id_paciente,
                'nombre_completo' => trim("{$p->nombres} {$p->apellido_paterno} {$p->apellido_materno}"),
                'ci' => $p->ci,
            ])
            ->values();

        $usuario = Auth::user();
        $folder = $this->tipoProfesional === 'nutricionista' ? 'Nutricionista' : 'Endocrinologo';

        return Inertia::render("{$folder}/Citas/Create", [
            'pacientes' => $pacientes,
            'profesional' => ['id' => $usuario->id, 'name' => $usuario->name],
            'tipoProfesional' => $this->tipoProfesional,
        ]);
    }

    public function bloques(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'fecha' => ['required', 'date'],
            'id_profesional' => ['required', 'integer', 'exists:users,id'],
        ]);

        $bloques = $this->agendaService->generarBloquesDisponibles(
            $request->input('fecha'),
            (int) $request->input('id_profesional')
        );

        return response()->json($bloques);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_paciente' => ['required', 'integer', 'exists:pacientes,id_paciente'],
            'id_profesional' => ['required', 'integer', 'exists:users,id'],
            'fecha_cita' => ['required', 'date', 'after_or_equal:today'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'tipo_cita' => ['required', 'string', 'max:50'],
            'modalidad' => ['required', Rule::in(['presencial', 'virtual'])],
            'motivo' => ['required', 'string', 'max:500'],
            'observaciones' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $datosAgenda = $this->agendaService->validarOCrearDatosAgenda($validated);
        } catch (DomainException $e) {
            return back()->withErrors(['hora_inicio' => $e->getMessage()])->withInput();
        }

        Cita::create([
            ...$datosAgenda,
            'tipo_profesional' => $this->tipoProfesional,
            'estado' => 'programada',
            'registrada_por' => Auth::id(),
        ]);

        $prefix = $this->tipoProfesional === 'nutricionista' ? 'nutricionista' : 'endocrinologo';

        return redirect()
            ->route("{$prefix}.citas.index")
            ->with('success', 'Cita programada correctamente.');
    }

    public function edit(Cita $cita): Response
    {
        $pacientes = Paciente::where('estado', 'activo')
            ->orderBy('apellido_paterno')
            ->get()
            ->map(fn (Paciente $p) => [
                'id_paciente' => $p->id_paciente,
                'nombre_completo' => trim("{$p->nombres} {$p->apellido_paterno} {$p->apellido_materno}"),
                'ci' => $p->ci,
            ])
            ->values();

        $usuario = Auth::user();
        $folder = $this->tipoProfesional === 'nutricionista' ? 'Nutricionista' : 'Endocrinologo';

        return Inertia::render("{$folder}/Citas/Edit", [
            'cita' => [
                'id_cita' => $cita->id_cita,
                'id_paciente' => $cita->id_paciente,
                'id_profesional' => $cita->id_profesional,
                'fecha_cita' => $cita->fecha_cita?->format('Y-m-d'),
                'hora_inicio' => substr($cita->hora_inicio, 0, 5),
                'hora_fin' => substr($cita->hora_fin, 0, 5),
                'tipo_cita' => $cita->tipo_cita,
                'modalidad' => $cita->modalidad,
                'motivo' => $cita->motivo,
                'observaciones' => $cita->observaciones,
                'estado' => $cita->estado,
            ],
            'pacientes' => $pacientes,
            'profesional' => ['id' => $usuario->id, 'name' => $usuario->name],
            'tipoProfesional' => $this->tipoProfesional,
        ]);
    }

    public function update(Request $request, Cita $cita): RedirectResponse
    {
        $validated = $request->validate([
            'id_paciente' => ['required', 'integer', 'exists:pacientes,id_paciente'],
            'id_profesional' => ['required', 'integer', 'exists:users,id'],
            'fecha_cita' => ['required', 'date'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'tipo_cita' => ['required', 'string', 'max:50'],
            'modalidad' => ['required', Rule::in(['presencial', 'virtual'])],
            'motivo' => ['required', 'string', 'max:500'],
            'observaciones' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $datosAgenda = $this->agendaService->validarOCrearDatosAgenda([
                ...$validated,
                'id_cita' => $cita->id_cita, // Para ignorar la cita actual en la validación
            ]);
        } catch (DomainException $e) {
            return back()->withErrors(['hora_inicio' => $e->getMessage()])->withInput();
        }

        $cita->update([
            'id_paciente' => $datosAgenda['id_paciente'],
            'id_profesional' => $datosAgenda['id_profesional'],
            'fecha_cita' => $datosAgenda['fecha_cita'],
            'hora_inicio' => $datosAgenda['hora_inicio'],
            'hora_fin' => $datosAgenda['hora_fin'],
            'duracion_minutos' => $datosAgenda['duracion_minutos'],
            'tipo_cita' => $datosAgenda['tipo_cita'],
            'modalidad' => $datosAgenda['modalidad'],
            'motivo' => $datosAgenda['motivo'],
            'observaciones' => $datosAgenda['observaciones'] ?? null,
        ]);

        $prefix = $this->tipoProfesional === 'nutricionista' ? 'nutricionista' : 'endocrinologo';

        return redirect()
            ->route("{$prefix}.citas.index")
            ->with('success', 'Cita actualizada correctamente.');
    }

    public function confirmar(Request $request, Cita $cita): RedirectResponse
    {
        $cita->update(['estado' => 'confirmada']);
        return back()->with('success', 'Cita confirmada.');
    }

    public function marcarAtendida(Request $request, Cita $cita): RedirectResponse
    {
        $cita->update(['estado' => 'atendida']);
        return back()->with('success', 'Cita marcada como atendida.');
    }

    public function marcarNoAsistio(Request $request, Cita $cita): RedirectResponse
    {
        $cita->update(['estado' => 'no_asistio']);
        return back()->with('success', 'Cita marcada como no asistió.');
    }

    public function cancelar(Request $request, Cita $cita): RedirectResponse
    {
        $request->validate(['motivo_cancelacion' => ['required', 'string', 'max:500']]);
        $cita->update([
            'estado' => 'cancelada',
            'motivo_cancelacion' => $request->input('motivo_cancelacion'),
        ]);
        return back()->with('success', 'Cita cancelada correctamente.');
    }
}
