<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Models\PlanAlimentario;
use App\Services\Notificaciones\NotificacionInternaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MensajeNutricionistaController extends Controller
{
    public function store(Request $request, NotificacionInternaService $notificaciones): JsonResponse
    {
        $paciente = $request->user()->paciente()->firstOrFail();
        $datos = $request->validate([
            'tipo' => ['required', Rule::in(['malestar', 'consulta', 'ingredientes', 'otro'])],
            'mensaje' => ['required', 'string', 'min:3', 'max:1200'],
        ]);

        $plan = $paciente->planesAlimentarios()
            ->whereIn('estado_plan', ['activo', 'aprobado'])
            // La comunicación sigue disponible aunque el plan esté por iniciar o haya terminado.
            // Así la paciente puede reportar un malestar sin depender de la fecha del menú.
            ->latest('id_plan_alimentario')->first();

        if (! $plan?->nutricionista) {
            return response()->json(['message' => 'No encontramos una nutricionista asignada para recibir tu mensaje.'], 422);
        }

        $mensaje = $paciente->retroalimentacionesPaciente()->create([
            'id_plan_alimentario' => $plan->getKey(),
            'id_usuario_emisor' => $request->user()->getKey(),
            'rol_emisor' => 'paciente',
            'tipo_retroalimentacion' => $datos['tipo'],
            'mensaje' => trim($datos['mensaje']),
            'prioridad' => $datos['tipo'] === 'malestar' ? 'alta' : 'normal',
            'visible_para_paciente' => false,
            'leido_por_paciente' => true,
            'estado' => 'activo',
        ]);

        $notificaciones->notificarNutricionistaMensajePaciente($mensaje, $plan->nutricionista);

        return response()->json(['message' => 'Tu mensaje fue enviado a nutrición.', 'id' => $mensaje->getKey()], 201);
    }
}
