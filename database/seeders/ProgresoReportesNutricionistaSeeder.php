<?php

namespace Database\Seeders;

use App\Models\EvaluacionNutricional;
use App\Models\PlanAlimentario;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProgresoReportesNutricionistaSeeder extends Seeder
{
    public function run(): void
    {
        $nutricionistas = User::query()
            ->where('estado', 'activo')
            ->whereHas('roles', fn ($query) => $query->where('roles.nombre', 'nutricionista'))
            ->orderBy('id')
            ->get();

        if ($nutricionistas->isEmpty()) {
            throw new RuntimeException('No existen usuarios activos con rol nutricionista.');
        }

        $planes = PlanAlimentario::query()
            ->with(['recomendacionNutricionalExperta'])
            ->whereHas('paciente', fn ($query) => $query->whereIn(
                'ci',
                DatosClinicosNutricionalesRealistasSeeder::identificacionesPacientes(),
            ))
            ->orderBy('id_plan_alimentario')
            ->get();

        if ($planes->isEmpty()) {
            throw new RuntimeException('Primero ejecuta FlujoOperativoNutricionalRealistaSeeder.');
        }

        DB::transaction(function () use ($planes, $nutricionistas): void {
            foreach ($planes as $indice => $plan) {
                $nutricionista = $nutricionistas[$indice % $nutricionistas->count()];

                $plan->forceFill([
                    'id_nutricionista' => $nutricionista->getKey(),
                    'aprobado_por' => $nutricionista->getKey(),
                ])->saveQuietly();

                RecomendacionNutricionalExperta::query()
                    ->whereKey($plan->id_recomendacion_nutricional_experta)
                    ->update([
                        'id_nutricionista' => $nutricionista->getKey(),
                        'validado_por' => $nutricionista->getKey(),
                    ]);

                EvaluacionNutricional::query()
                    ->where('id_paciente', $plan->id_paciente)
                    ->update(['id_nutricionista' => $nutricionista->getKey()]);
            }
        });

        $this->command?->info(sprintf(
            '%d planes con seguimiento fueron distribuidos entre %d nutricionistas.',
            $planes->count(),
            $nutricionistas->count(),
        ));
    }
}
