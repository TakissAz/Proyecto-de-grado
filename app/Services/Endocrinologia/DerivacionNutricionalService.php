<?php

namespace App\Services\Endocrinologia;

use App\Models\DerivacionNutricional;
use App\Models\Paciente;
use App\Models\User;
use App\Services\Notificaciones\NotificacionInternaService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class DerivacionNutricionalService
{
    public function __construct(private readonly NotificacionInternaService $notificaciones) {}

    public function derivarPaciente(Paciente $paciente, User $endocrinologo, ?string $motivo = null, string $prioridad = 'normal'): DerivacionNutricional
    {
        if (! $endocrinologo->tieneRol('endocrinologo')) throw new AuthorizationException('Solo endocrinología puede derivar pacientes.');
        return DB::transaction(function () use ($paciente, $endocrinologo, $motivo, $prioridad) {
            $existente = $paciente->derivacionesNutricionales()->whereIn('estado', ['pendiente', 'vista', 'en_proceso'])->lockForUpdate()->latest()->first();
            if ($existente) {
                $existente->update(['motivo_derivacion' => $motivo, 'prioridad' => $prioridad]);
                $existente->setAttribute('derivacion_preexistente', true);
                return $existente;
            }
            $derivacion = $paciente->derivacionesNutricionales()->create([
                'id_endocrinologo' => $endocrinologo->getKey(), 'motivo_derivacion' => $motivo,
                'prioridad' => $prioridad, 'origen' => 'endocrinologia', 'estado' => 'pendiente', 'fecha_derivacion' => now(),
            ]);
            $this->notificaciones->notificarNutricionistasNuevaDerivacion($derivacion);
            return $derivacion;
        });
    }

    public function marcarVista(DerivacionNutricional $d, ?User $n = null): DerivacionNutricional
    {
        if ($d->estado === 'pendiente') $d->estado = 'vista';
        $d->fecha_vista ??= now(); $d->id_nutricionista ??= $n?->getKey(); $d->save(); return $d->refresh();
    }
    public function marcarEnProceso(DerivacionNutricional $d, User $n): DerivacionNutricional
    { $d->update(['estado' => 'en_proceso', 'id_nutricionista' => $n->getKey(), 'fecha_vista' => $d->fecha_vista ?? now()]); return $d->refresh(); }
    public function marcarAtendida(DerivacionNutricional $d, User $n): DerivacionNutricional
    { $d->update(['estado' => 'atendida', 'id_nutricionista' => $n->getKey(), 'fecha_atencion' => now()]); return $d->refresh(); }
}
