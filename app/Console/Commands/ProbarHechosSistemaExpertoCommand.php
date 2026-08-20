<?php

namespace App\Console\Commands;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Services\SistemaExperto\HechosSistemaExpertoService;
use Illuminate\Console\Command;

class ProbarHechosSistemaExpertoCommand extends Command
{
    protected $signature = 'experto:probar-hechos';

    protected $description = 'Construye y muestra hechos clínicos sin invocar el motor experto';

    public function handle(HechosSistemaExpertoService $servicio): int
    {
        $pmos = DiagnosticoPmos::query()->first();
        if ($pmos === null) {
            $this->warn('PMOS: no existe un diagnóstico para construir hechos.');
        } else {
            $this->line("PMOS (id={$pmos->getKey()}):");
            $this->line($this->json($servicio->construirHechosPmos($pmos)));
        }

        $ri = DiagnosticoResistenciaInsulina::query()->first();
        if ($ri === null) {
            $this->warn('RI: no existe un diagnóstico para construir hechos.');
        } else {
            $this->line("RI (id={$ri->getKey()}):");
            $this->line($this->json($servicio->construirHechosResistenciaInsulina($ri)));
        }

        return self::SUCCESS;
    }

    private function json(array $hechos): string
    {
        return (string) json_encode(
            $hechos,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }
}
