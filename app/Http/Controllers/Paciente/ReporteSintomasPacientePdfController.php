<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Services\Paciente\SeguimientoSintomasPacienteService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReporteSintomasPacientePdfController extends Controller
{
    public function __invoke(Request $request, SeguimientoSintomasPacienteService $sintomas): Response|RedirectResponse
    {
        $paciente = $request->user()->paciente()->first();
        if (! $paciente) return redirect()->route('paciente.dashboard')->with('error', 'No se encontró un perfil de paciente asociado a tu cuenta.');

        $historial = $sintomas->obtenerHistorialCompleto($paciente);
        if ($historial === []) return redirect()->route('paciente.sintomas')->with('error', 'Aún no tienes registros de bienestar para descargar.');

        $total = max(count($historial), 1);
        $porcentaje = static fn (int $cantidad): int => (int) round(($cantidad / $total) * 100);
        $estadisticas = [
            'total' => count($historial),
            'energia_alta' => $porcentaje(collect($historial)->where('nivel_energia', 'alta')->count()),
            'sueno_bueno' => $porcentaje(collect($historial)->where('calidad_sueno', 'buena')->count()),
            'actividad_registrada' => $porcentaje(collect($historial)->filter(fn (array $registro) => filled($registro['actividad_fisica'] ?? null) && $registro['actividad_fisica'] !== 'ninguna')->count()),
            'senales_a_revisar' => collect($historial)->filter(fn (array $registro) =>
                in_array($registro['ansiedad_por_comida'] ?? null, ['moderada', 'alta'], true)
                || in_array($registro['hinchazon_abdominal'] ?? null, ['moderada', 'severa'], true)
                || (bool) ($registro['hambre_nocturna'] ?? false)
            )->count(),
            'agua_promedio' => round((float) collect($historial)->pluck('consumo_agua_litros')->filter(fn ($valor) => $valor !== null)->avg(), 1),
        ];

        return Pdf::loadView('pdf.paciente.sintomas', [
            'paciente' => $paciente,
            'resumen' => $sintomas->obtenerResumen($paciente),
            'historial' => $historial,
            'estadisticas' => $estadisticas,
            'fechaGeneracion' => now('America/La_Paz'),
        ])->setPaper('a4')->stream('mi-historial-de-bienestar.pdf');
    }
}
