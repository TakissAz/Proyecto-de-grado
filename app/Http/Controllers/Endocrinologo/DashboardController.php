<?php

namespace App\Http\Controllers\Endocrinologo;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\ConsultaEndocrinologica;
use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $endocrinologoId = $request->user()->getKey();
        $consultas = ConsultaEndocrinologica::query()->where('id_endocrinologo', $endocrinologoId);
        $pmos = DiagnosticoPmos::query()->where('id_endocrinologo', $endocrinologoId);
        $ri = DiagnosticoResistenciaInsulina::query()->where('id_endocrinologo', $endocrinologoId);
        $pacientes = (clone $consultas)->pluck('id_paciente')->merge((clone $pmos)->pluck('id_paciente'))->merge((clone $ri)->pluck('id_paciente'))->unique();

        $citas = Cita::query()->with('paciente:id_paciente,nombres,apellido_paterno,apellido_materno')
            ->where('id_profesional', $endocrinologoId)->where('tipo_profesional', 'endocrinologo')
            ->whereDate('fecha_cita', '>=', today())->whereIn('estado', ['programada', 'confirmada'])
            ->orderBy('fecha_cita')->orderBy('hora_inicio')->limit(6)->get()
            ->map(fn (Cita $cita) => [
                'id_cita' => $cita->getKey(), 'id_paciente' => $cita->id_paciente,
                'paciente' => trim("{$cita->paciente?->nombres} {$cita->paciente?->apellido_paterno} {$cita->paciente?->apellido_materno}"),
                'fecha' => $cita->fecha_cita?->toDateString(), 'hora' => substr((string) $cita->hora_inicio, 0, 5),
                'motivo' => $cita->motivo, 'tipo_cita' => $cita->tipo_cita, 'modalidad' => $cita->modalidad, 'estado' => $cita->estado,
            ]);

        return Inertia::render('Endocrinologo/Dashboard', [
            'resumen' => [
                'total_pacientes' => $pacientes->count(),
                'consultas_mes' => (clone $consultas)->whereBetween('fecha_consulta', [now()->startOfMonth(), now()->endOfMonth()])->count(),
                'pmos_confirmados' => (clone $pmos)->where('diagnostico_confirmado', true)->count(),
                'ri_confirmados' => (clone $ri)->where('resistencia_confirmada', true)->count(),
                'validaciones_pendientes_pmos' => (clone $pmos)->where('generado_por_motor_experto', true)->where('estado_validacion_experta', 'pendiente')->count(),
                'validaciones_pendientes_ri' => (clone $ri)->where('generado_por_motor_experto', true)->where('estado_validacion_experta', 'pendiente')->count(),
                'citas_hoy' => Cita::query()->where('id_profesional', $endocrinologoId)->where('tipo_profesional', 'endocrinologo')->whereDate('fecha_cita', today())->whereIn('estado', ['programada', 'confirmada'])->count(),
            ],
            'proximasCitas' => $citas,
        ]);
    }
}
