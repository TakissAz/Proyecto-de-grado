<?php

namespace App\Services\Paciente;

use App\Models\Cita;
use App\Models\Paciente;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CitasPacienteService
{
    private const ACTIVAS = ['programada', 'confirmada'];

    public function obtenerResumen(Paciente $paciente): array
    {
        $citas = $paciente->citas()->with('profesional')->orderBy('fecha_cita')->orderBy('hora_inicio')->get();
        $pendientes = $citas->filter(fn (Cita $cita) => in_array($cita->estado, self::ACTIVAS, true) && $this->fechaHora($cita)->greaterThanOrEqualTo(now()))->values();
        $historial = $citas->reject(fn (Cita $cita) => $pendientes->contains(fn (Cita $pendiente) => $pendiente->getKey() === $cita->getKey()))
            ->sortByDesc(fn (Cita $cita) => $this->fechaHora($cita)->timestamp)->values();
        $ultima = $historial->first();

        return [
            'proxima_cita' => $this->transformar($pendientes->first()),
            'citas_pendientes' => $pendientes->take(5)->map(fn (Cita $cita) => $this->transformar($cita))->all(),
            'citas_historial' => $historial->take(10)->map(fn (Cita $cita) => $this->transformar($cita))->all(),
            'resumen' => [
                'total_citas' => $citas->count(),
                'pendientes' => $pendientes->count(),
                'realizadas' => $citas->where('estado', 'atendida')->count(),
                'canceladas' => $citas->where('estado', 'cancelada')->count(),
                'ultima_cita' => $ultima?->fecha_cita?->toDateString(),
                'proxima_fecha' => $pendientes->first()?->fecha_cita?->toDateString(),
            ],
        ];
    }

    private function transformar(?Cita $cita): ?array
    {
        if (! $cita) return null;
        return [
            'id_cita' => $cita->getKey(),
            'fecha' => $cita->fecha_cita?->toDateString(),
            'hora_inicio' => substr((string) $cita->hora_inicio, 0, 5),
            'hora_fin' => substr((string) $cita->hora_fin, 0, 5),
            'profesional' => $cita->profesional?->name ?? 'Profesional por confirmar',
            'area' => match ($cita->tipo_profesional) { 'nutricionista' => 'Nutrición', 'endocrinologo' => 'Endocrinología', default => ucfirst((string) ($cita->tipo_profesional ?: 'Atención clínica')) },
            'motivo' => $cita->motivo,
            'tipo_cita' => $cita->tipo_cita,
            'modalidad' => $cita->modalidad,
            'estado' => $cita->estado,
            'observaciones' => $cita->observaciones,
        ];
    }

    private function fechaHora(Cita $cita): Carbon
    {
        return Carbon::parse($cita->fecha_cita->toDateString().' '.substr((string) $cita->hora_inicio, 0, 8));
    }
}
