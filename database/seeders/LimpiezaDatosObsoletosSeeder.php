<?php

namespace Database\Seeders;

use App\Models\Paciente;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LimpiezaDatosObsoletosSeeder extends Seeder
{
    public function run(): void
    {
        $retirados = 0;

        DB::transaction(function () use (&$retirados): void {
            Paciente::withTrashed()
                ->where('ci', 'like', 'PRUEBA-PMOS-%')
                ->get()
                ->each(function (Paciente $paciente) use (&$retirados): void {
                    $usuario = User::withTrashed()->find($paciente->user_id);

                    if (! $paciente->trashed()) {
                        $paciente->forceFill(['estado' => 'inactivo'])->saveQuietly();
                        $paciente->delete();
                        $retirados++;
                    }

                    if ($usuario && ! $usuario->trashed()) {
                        $usuario->forceFill(['estado' => 'inactivo'])->saveQuietly();
                        $usuario->delete();
                    }
                });

            User::withTrashed()
                ->whereIn('email', [
                    'nutricionista.prueba@pmos.test',
                    'endocrinologo.prueba@pmos.test',
                ])
                ->get()
                ->each(function (User $usuario): void {
                    if (! $usuario->trashed()) {
                        $usuario->forceFill(['estado' => 'inactivo'])->saveQuietly();
                        $usuario->delete();
                    }
                });
        });

        $this->command?->info("Limpieza inicial: {$retirados} expedientes obsoletos retirados de la vista operativa.");
    }
}
