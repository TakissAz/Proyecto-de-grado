<?php

namespace App\Console\Commands;

use App\Models\Paciente;
use App\Services\Nutricion\ContextoAjustePlanService;
use Illuminate\Console\Command;

class DebugAjustePlanCommand extends Command
{
    protected $signature = 'plan:debug-ajuste {paciente}';
    protected $description = 'Muestra el contexto de seguimiento usado para ajustar el siguiente plan';

    public function handle(ContextoAjustePlanService $servicio): int
    {
        $paciente = Paciente::query()->find($this->argument('paciente'));
        if (! $paciente) { $this->error('Paciente no encontrado.'); return self::FAILURE; }
        $contexto = $servicio->construirParaPaciente($paciente);
        $this->line(json_encode($contexto, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return self::SUCCESS;
    }
}
