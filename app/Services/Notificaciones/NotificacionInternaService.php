<?php

namespace App\Services\Notificaciones;

use App\Models\DerivacionNutricional;
use App\Models\NotificacionInterna;
use App\Models\User;
use App\Models\SeguimientoComida;
use App\Models\PlanAlimentario;
use App\Models\DiaPlanAlimentario;
use App\Models\RetroalimentacionPaciente;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Schema;

class NotificacionInternaService
{
    public function notificarAvanceDiario(SeguimientoComida $seguimiento): void
    {
        $seguimiento->loadMissing('paciente', 'planAlimentario.nutricionista', 'diaPlanAlimentario.comidas');
        $plan = $seguimiento->planAlimentario; $dia = $seguimiento->diaPlanAlimentario; $nutricionista = $plan?->nutricionista;
        if (! $plan || ! $dia || ! $nutricionista) return;
        $registros = SeguimientoComida::query()->where('id_paciente', $seguimiento->id_paciente)->where('id_dia_plan_alimentario', $dia->getKey())->where('estado_cumplimiento', '!=', 'pendiente')->get();
        $total = $dia->comidas->count(); $registradas = $registros->count();
        $completadas = $registros->where('estado_cumplimiento', 'completada')->count();
        $parciales = $registros->where('estado_cumplimiento', 'parcial')->count();
        $reemplazadas = $registros->where('estado_cumplimiento', 'reemplazada')->count();
        $noRealizadas = $registros->where('estado_cumplimiento', 'no_realizada')->count();
        $nombre = trim(implode(' ', array_filter([$seguimiento->paciente?->nombres, $seguimiento->paciente?->apellido_paterno, $seguimiento->paciente?->apellido_materno])));
        $estado = $registradas >= $total ? 'Día registrado completo' : "Avance del día: {$registradas}/{$total} comidas respondidas";
        $mensaje = "{$nombre} · {$plan->nombre}. {$estado}. Completadas: {$completadas}, parciales: {$parciales}, reemplazadas: {$reemplazadas}, no realizadas: {$noRealizadas}.";
        $this->actualizarAlertaDiaria($nutricionista, 'seguimiento_diario', $dia, [
            'titulo' => $registradas >= $total ? 'Seguimiento diario completado' : 'Nuevo avance de seguimiento',
            'mensaje' => $mensaje, 'prioridad' => $noRealizadas > 0 ? 'media' : 'baja',
            'url_destino' => "/nutricionista/pacientes/{$seguimiento->id_paciente}/adherencia",
            'data' => ['id_paciente'=>$seguimiento->id_paciente,'id_plan_alimentario'=>$plan->getKey(),'id_dia_plan_alimentario'=>$dia->getKey(),'fecha'=>$dia->fecha?->toDateString(),'registradas'=>$registradas,'total'=>$total,'completadas'=>$completadas,'parciales'=>$parciales,'reemplazadas'=>$reemplazadas,'no_realizadas'=>$noRealizadas],
        ]);
    }

    public function notificarDiaSinRegistro(PlanAlimentario $plan, DiaPlanAlimentario $dia): void
    {
        $plan->loadMissing('nutricionista', 'paciente'); $dia->loadMissing('comidas');
        if (! $plan->nutricionista) return;
        $registradas = SeguimientoComida::query()->where('id_paciente', $plan->id_paciente)->where('id_dia_plan_alimentario', $dia->getKey())->where('estado_cumplimiento', '!=', 'pendiente')->count();
        $total = $dia->comidas->count(); $faltantes = max(0, $total - $registradas);
        if ($faltantes === 0) return;
        $nombre = trim(implode(' ', array_filter([$plan->paciente?->nombres, $plan->paciente?->apellido_paterno, $plan->paciente?->apellido_materno])));
        $this->actualizarAlertaDiaria($plan->nutricionista, 'seguimiento_diario_incompleto', $dia, [
            'titulo' => $registradas === 0 ? 'Día sin seguimiento registrado' : 'Seguimiento diario incompleto',
            'mensaje' => "{$nombre} · {$plan->nombre}. Finalizó el día con {$faltantes} de {$total} comida(s) sin marcar.",
            'prioridad' => $registradas === 0 ? 'alta' : 'media',
            'url_destino' => "/nutricionista/pacientes/{$plan->id_paciente}/adherencia",
            'data' => ['id_paciente'=>$plan->id_paciente,'id_plan_alimentario'=>$plan->getKey(),'id_dia_plan_alimentario'=>$dia->getKey(),'fecha'=>$dia->fecha?->toDateString(),'registradas'=>$registradas,'total'=>$total,'sin_marcar'=>$faltantes],
        ]);
    }

    private function actualizarAlertaDiaria(User $usuario, string $tipo, DiaPlanAlimentario $dia, array $datos): void
    {
        $notificacion = $usuario->notificacionesInternas()->where('tipo', $tipo)->where('data->id_dia_plan_alimentario', $dia->getKey())->first();
        $valores = $datos + ['tipo'=>$tipo,'leida'=>false,'fecha_lectura'=>null,'estado'=>'activo'];
        $notificacion ? $notificacion->update($valores) : $this->crearParaUsuario($usuario, $valores);
    }

    public function crearParaUsuario(User $usuario, array $data): NotificacionInterna
    {
        return $usuario->notificacionesInternas()->create($data);
    }

    public function notificarNutricionistaMensajePaciente(RetroalimentacionPaciente $mensaje, User $nutricionista): void
    {
        $mensaje->loadMissing('paciente');
        $nombre = trim(implode(' ', array_filter([$mensaje->paciente?->nombres, $mensaje->paciente?->apellido_paterno])));
        $esMalestar = $mensaje->tipo_retroalimentacion === 'malestar';
        $this->crearParaUsuario($nutricionista, [
            'tipo' => 'mensaje_paciente_nutricion',
            'titulo' => $esMalestar ? 'Paciente reportó un malestar' : 'Nuevo mensaje de paciente',
            'mensaje' => "{$nombre}: {$mensaje->mensaje}",
            'prioridad' => $esMalestar ? 'media' : 'baja',
            'url_destino' => "/nutricionista/pacientes/{$mensaje->id_paciente}/perfil-nutricional",
            'data' => ['id_paciente' => $mensaje->id_paciente, 'id_retroalimentacion_paciente' => $mensaje->getKey(), 'tipo_mensaje' => $mensaje->tipo_retroalimentacion],
            'leida' => false, 'fecha_lectura' => null, 'estado' => 'activo',
        ]);
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
                    'mensaje' => "{$nombre} fue derivada por endocrinología. Revisa el motivo e inicia su planificación nutricional.",
                    'prioridad' => $derivacion->prioridad,
                    'url_destino' => "/nutricionista/pacientes/{$derivacion->id_paciente}/perfil-nutricional?derivacion={$derivacion->getKey()}",
                    'data' => ['id_paciente' => $derivacion->id_paciente, 'id_derivacion_nutricional' => $derivacion->getKey(), 'prioridad' => $derivacion->prioridad, 'motivo' => $derivacion->motivo_derivacion],
                ]);
            });
    }

    public function notificarEndocrinologiaEstadoDerivacion(DerivacionNutricional $derivacion, string $evento): void
    {
        $derivacion->loadMissing(['paciente', 'endocrinologo', 'nutricionista']);
        $destino = $derivacion->endocrinologo;
        if (! $destino) return;

        $nombre = trim(implode(' ', array_filter([
            $derivacion->paciente?->nombres,
            $derivacion->paciente?->apellido_paterno,
        ])));
        $nutricionista = $derivacion->nutricionista?->name ?? 'Nutrición';
        $esInicio = $evento === 'inicio';

        $this->crearParaUsuario($destino, [
            'tipo' => 'actualizacion_derivacion_nutricional',
            'titulo' => $esInicio ? 'Nutrición inició la atención' : 'Nutrición completó la atención',
            'mensaje' => $esInicio
                ? "{$nutricionista} inició la planificación nutricional de {$nombre}."
                : "{$nutricionista} marcó como atendida la derivación nutricional de {$nombre}.",
            'prioridad' => 'baja',
            'url_destino' => "/endocrinologo/pacientes/{$derivacion->id_paciente}/perfil-clinico#seguimiento",
            'data' => [
                'id_paciente' => $derivacion->id_paciente,
                'id_derivacion_nutricional' => $derivacion->getKey(),
                'evento' => $evento,
            ],
        ]);
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
