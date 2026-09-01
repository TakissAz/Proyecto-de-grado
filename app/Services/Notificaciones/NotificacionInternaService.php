<?php

namespace App\Services\Notificaciones;

use App\Models\DerivacionNutricional;
use App\Models\NotificacionInterna;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Schema;

class NotificacionInternaService
{
    public function crearParaUsuario(User $usuario, array $data): NotificacionInterna
    {
        return $usuario->notificacionesInternas()->create($data);
    }

    public function notificarNutricionistasNuevaDerivacion(DerivacionNutricional $derivacion): void
    {
        $derivacion->loadMissing('paciente');
        $nombre = trim(implode(' ', array_filter([$derivacion->paciente?->nombres, $derivacion->paciente?->apellido_paterno])));
        User::query()->where('estado', 'activo')->whereHas('roles', fn ($q) => $q->where('roles.nombre', 'nutricionista'))
            ->each(function (User $usuario) use ($derivacion, $nombre) {
                $this->crearParaUsuario($usuario, [
                    'tipo' => 'derivacion_nutricional',
                    'titulo' => 'Nueva paciente derivada a nutrición',
                    'mensaje' => "La paciente {$nombre} fue derivada por endocrinología.",
                    'prioridad' => $derivacion->prioridad,
                    'url_destino' => "/nutricionista/pacientes/{$derivacion->id_paciente}/perfil-nutricional?derivacion={$derivacion->getKey()}",
                    'data' => ['id_paciente' => $derivacion->id_paciente, 'id_derivacion_nutricional' => $derivacion->getKey(), 'prioridad' => $derivacion->prioridad, 'motivo' => $derivacion->motivo_derivacion],
                ]);
            });
    }

    public function obtenerResumenParaUsuario(User $usuario): array
    {
        if (! Schema::hasTable('notificaciones_internas')) return ['total_no_leidas' => 0, 'ultimas' => []];
        $base = $usuario->notificacionesInternas()->where('estado', 'activo');
        return [
            'total_no_leidas' => (clone $base)->where('leida', false)->count(),
            'ultimas' => (clone $base)->latest()->limit(5)->get()->map(fn ($n) => [
                'id_notificacion_interna' => $n->getKey(), 'tipo' => $n->tipo, 'titulo' => $n->titulo,
                'mensaje' => $n->mensaje, 'prioridad' => $n->prioridad, 'leida' => $n->leida,
                'url_destino' => $n->url_destino, 'created_at' => $n->created_at?->toIso8601String(),
            ])->all(),
        ];
    }

    public function marcarComoLeida(NotificacionInterna $notificacion, User $usuario): void
    {
        if ((int) $notificacion->id_usuario_destino !== (int) $usuario->getKey()) throw new AuthorizationException('No puedes modificar esta notificación.');
        $notificacion->update(['leida' => true, 'fecha_lectura' => $notificacion->fecha_lectura ?? now()]);
    }

    public function marcarTodasComoLeidas(User $usuario): void
    {
        $usuario->notificacionesInternas()->where('leida', false)->update(['leida' => true, 'fecha_lectura' => now()]);
    }
}
