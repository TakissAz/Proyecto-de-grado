<?php

namespace App\Console\Commands;

use App\Models\DiagnosticoPmos;
use App\Models\DiagnosticoResistenciaInsulina;
use App\Models\RequerimientoNutricional;
use App\Models\RestriccionAlimentaria;
use App\Models\User;
use Illuminate\Console\Command;

class ResumenPacientesPruebaCommand extends Command
{
    protected $signature = 'pacientes:resumen-prueba';

    protected $description = 'Muestra un resumen de los ocho pacientes PMOS de prueba sin modificar datos';

    public function handle(): int
    {
        $usuarios = User::query()
            ->where('email', 'like', 'paciente.%@pmos.test')
            ->whereHas('paciente', fn ($query) => $query->where('ci', 'like', 'PRUEBA-PMOS-%'))
            ->with('paciente')
            ->orderBy('email')
            ->get();

        $this->info('Pacientes de prueba: '.$usuarios->count());
        $this->table(
            ['ID', 'Email', 'PMOS', 'RI', 'Alergias', 'Rechazados', 'Requerimiento'],
            $usuarios->map(function (User $usuario): array {
                $paciente = $usuario->paciente;
                $restriccion = RestriccionAlimentaria::query()
                    ->where('id_paciente', $paciente->getKey())->latest('id_restriccion_alimentaria')->first();

                return [
                    $paciente->getKey(),
                    $usuario->email,
                    $this->estadoPmos($paciente->getKey()),
                    $this->estadoRi($paciente->getKey()),
                    $restriccion?->alergias ?: 'Sin registro',
                    $restriccion?->alimentos_rechazados ?: 'Sin registro',
                    RequerimientoNutricional::query()->where('id_paciente', $paciente->getKey())->exists() ? 'Sí' : 'No',
                ];
            })->all()
        );

        return self::SUCCESS;
    }

    private function estadoPmos(int $paciente): string
    {
        $diagnostico = DiagnosticoPmos::query()->where('id_paciente', $paciente)
            ->latest('id_diagnostico_pmos')->first();

        return $diagnostico ? ($diagnostico->diagnostico_confirmado ? 'Confirmado' : 'No confirmado') : 'En estudio';
    }

    private function estadoRi(int $paciente): string
    {
        $diagnostico = DiagnosticoResistenciaInsulina::query()->where('id_paciente', $paciente)
            ->latest('id_diagnostico_ri')->first();

        return $diagnostico ? ($diagnostico->resistencia_confirmada ? (string) $diagnostico->grado_resistencia : 'No confirmada') : 'No evaluada';
    }
}
