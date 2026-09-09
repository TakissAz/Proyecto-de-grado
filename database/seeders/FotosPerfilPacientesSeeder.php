<?php

namespace Database\Seeders;

use App\Models\Paciente;
use Illuminate\Database\Seeder;

class FotosPerfilPacientesSeeder extends Seeder
{
    /**
     * Distribuye retratos ficticios entre las pacientes sin alterar datos clínicos.
     */
    public function run(): void
    {
        $avatares = collect(range(1, 10))
            ->map(fn (int $numero): string => sprintf(
                'avatars/pacientes-generadas/paciente-%02d.png',
                $numero,
            ));

        $actualizadas = 0;

        Paciente::query()
            ->with('user')
            ->whereRaw('LOWER(sexo) = ?', ['femenino'])
            ->orderBy('id_paciente')
            ->get()
            ->each(function (Paciente $paciente, int $indice) use ($avatares, &$actualizadas): void {
                if (! $paciente->user) {
                    return;
                }

                $paciente->user->forceFill([
                    'avatar' => $avatares[$indice % $avatares->count()],
                ])->save();

                $actualizadas++;
            });

        $this->command?->info(
            "Fotografías ficticias asignadas a {$actualizadas} pacientes femeninas.",
        );
    }
}
