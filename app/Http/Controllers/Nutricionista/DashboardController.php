<?php

namespace App\Http\Controllers\Nutricionista;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\ConsultaNutricional;
use App\Models\PlanAlimentario;
use App\Models\SeguimientoComida;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $nutricionistaId = $request->user()->getKey();
        $planes = PlanAlimentario::query()->where('id_nutricionista', $nutricionistaId);
        $consultas = ConsultaNutricional::query()->where('id_nutricionista', $nutricionistaId);
        $pacientes = (clone $planes)->pluck('id_paciente')->merge((clone $consultas)->pluck('id_paciente'))->unique();
        $seguimientos = SeguimientoComida::query()
            ->whereHas('planAlimentario', fn ($query) => $query->where('id_nutricionista', $nutricionistaId))
            ->where('estado_cumplimiento', '!=', 'pendiente');
        $totalSeguimientos = (clone $seguimientos)->count();
        $puntos = (clone $seguimientos)->get(['estado_cumplimiento', 'porcentaje_consumido'])->sum(fn ($item) => match ($item->estado_cumplimiento) {
            'completada' => 100,
            'parcial' => $item->porcentaje_consumido ?? 50,
            'reemplazada' => 50,
            default => 0,
        });

        $citas = Cita::query()->with('paciente:id_paciente,nombres,apellido_paterno,apellido_materno')
            ->where('id_profesional', $nutricionistaId)->where('tipo_profesional', 'nutricionista')
            ->whereDate('fecha_cita', '>=', today())->whereIn('estado', ['programada', 'confirmada'])
            ->orderBy('fecha_cita')->orderBy('hora_inicio')->limit(6)->get()
            ->map(fn (Cita $cita) => [
                'id_cita' => $cita->getKey(), 'id_paciente' => $cita->id_paciente,
                'paciente' => trim("{$cita->paciente?->nombres} {$cita->paciente?->apellido_paterno} {$cita->paciente?->apellido_materno}"),
                'fecha' => $cita->fecha_cita?->toDateString(), 'hora' => substr((string) $cita->hora_inicio, 0, 5),
                'tipo_cita' => $cita->tipo_cita, 'modalidad' => $cita->modalidad, 'estado' => $cita->estado,
            ]);

        $pendientesRevision = SeguimientoComida::query()->whereHas('planAlimentario', fn ($query) => $query->where('id_nutricionista', $nutricionistaId))
            ->where('revisado_por_nutricionista', false)->where('estado_cumplimiento', '!=', 'pendiente')->count();

        return Inertia::render('Nutricionista/Dashboard', [
            'resumen' => [
                'total_pacientes' => $pacientes->count(),
                'planes_activos' => (clone $planes)->whereIn('estado_plan', ['aprobado', 'activo'])->count(),
                'consultas_mes' => (clone $consultas)->whereBetween('fecha_consulta', [now()->startOfMonth(), now()->endOfMonth()])->count(),
                'adherencia_promedio' => $totalSeguimientos ? round($puntos / $totalSeguimientos) : 0,
                'planes_por_aprobar' => (clone $planes)->where('estado_plan', 'sugerido')->count(),
                'seguimientos_por_revisar' => $pendientesRevision,
                'citas_hoy' => Cita::query()->where('id_profesional', $nutricionistaId)->where('tipo_profesional', 'nutricionista')->whereDate('fecha_cita', today())->whereIn('estado', ['programada', 'confirmada'])->count(),
            ],
            'proximasCitas' => $citas,
        ]);
    }
}
