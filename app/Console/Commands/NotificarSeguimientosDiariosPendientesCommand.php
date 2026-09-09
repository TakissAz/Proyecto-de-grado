<?php

namespace App\Console\Commands;

use App\Models\DiaPlanAlimentario;
use App\Services\Notificaciones\NotificacionInternaService;
use Illuminate\Console\Command;

class NotificarSeguimientosDiariosPendientesCommand extends Command
{
    protected $signature = 'nutricion:notificar-seguimientos-pendientes {--fecha=}';
    protected $description = 'Notifica a nutrición los días de planes vigentes que finalizaron con comidas sin marcar.';

    public function handle(NotificacionInternaService $notificaciones): int
    {
        $fecha = $this->option('fecha') ?: now('America/La_Paz')->toDateString();
        $dias = DiaPlanAlimentario::query()->with(['plan.nutricionista', 'plan.paciente', 'comidas'])
            ->whereDate('fecha', $fecha)
            ->whereHas('plan', fn ($q) => $q->whereIn('estado_plan', ['activo', 'aprobado']))->get();
        foreach ($dias as $dia) $notificaciones->notificarDiaSinRegistro($dia->plan, $dia);
        $this->info("Seguimientos diarios revisados: {$dias->count()}.");
        return self::SUCCESS;
    }
}
