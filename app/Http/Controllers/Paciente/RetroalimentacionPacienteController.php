<?php

namespace App\Http\Controllers\Paciente;

use App\Http\Controllers\Controller;
use App\Models\RetroalimentacionPaciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RetroalimentacionPacienteController extends Controller
{
    public function marcarLeida(Request $request, RetroalimentacionPaciente $retroalimentacion): JsonResponse
    {
        $paciente = $request->user()->paciente()->firstOrFail();
        abort_unless((int) $retroalimentacion->id_paciente === (int) $paciente->getKey(), 403);
        abort_unless($retroalimentacion->visible_para_paciente && $retroalimentacion->estado === 'activo', 404);

        $retroalimentacion->update(['leido_por_paciente' => true, 'fecha_lectura_paciente' => now()]);

        return response()->json(['success' => true, 'message' => 'Mensaje marcado como leído.']);
    }
}
