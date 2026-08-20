<?php

namespace App\Console\Commands;

use App\Models\Paciente;
use App\Models\PlanAlimentario;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProbarEstructuraPlanAlimentarioCommand extends Command
{
    protected $signature = 'plan:probar-estructura {paciente : ID del paciente}';
    protected $description = 'Crea manualmente un plan borrador de siete días sin comidas';

    public function handle(): int
    {
        $paciente = Paciente::query()->find($this->argument('paciente'));
        if ($paciente === null) {
            $this->error('No se encontró el paciente indicado.');
            return self::FAILURE;
        }

        $recomendacion = $paciente->recomendacionesNutricionalesExpertas()
            ->whereIn('estado_validacion_experta', ['aprobado', 'validado'])
            ->latest('id_recomendacion_nutricional_experta')->first();
        $requerimiento = $paciente->requerimientosNutricionales()
            ->where('estado', true)->latest('id_requerimiento_nutricional')->first();

        $plan = DB::transaction(function () use ($paciente, $recomendacion, $requerimiento) {
            $plan = PlanAlimentario::query()->create([
                'id_paciente' => $paciente->getKey(),
                'id_recomendacion_nutricional_experta' => $recomendacion?->getKey(),
                'id_requerimiento_nutricional' => $requerimiento?->getKey(),
                'nombre' => 'Plan alimentario semanal de prueba',
                'duracion_dias' => 7,
                'objetivo_plan' => $recomendacion?->prioridad_nutricional,
                'calorias_objetivo' => $requerimiento?->calorias_objetivo
                    ?? $recomendacion?->calorias_sugeridas,
                'proteinas_objetivo' => $requerimiento?->proteinas_diarias,
                'carbohidratos_objetivo' => $requerimiento?->carbohidratos_diarios,
                'grasas_objetivo' => $requerimiento?->grasas_diarias,
                'fibra_objetivo' => $requerimiento?->fibra_diaria
                    ?? $recomendacion?->fibra_sugerida,
                'estado_plan' => 'borrador',
                'generado_por_sistema_experto' => false,
                'estado' => 'activo',
            ]);

            for ($numero = 1; $numero <= 7; $numero++) {
                $plan->dias()->create([
                    'numero_dia' => $numero,
                    'nombre_dia' => "Día {$numero}",
                    'estado' => 'activo',
                ]);
            }

            return $plan;
        });

        $this->info('Plan borrador creado para prueba estructural.');
        $this->line('ID plan: '.$plan->getKey());
        $this->line('Días creados: '.$plan->dias()->count());
        $this->line('Usó recomendación experta: '.($recomendacion ? 'sí' : 'no'));
        $this->line('Usó requerimiento nutricional: '.($requerimiento ? 'sí' : 'no'));

        return self::SUCCESS;
    }
}
