<?php

namespace Database\Seeders;

use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\Receta;
use Illuminate\Database\Seeder;

class CompletarComponentesPlanesSeeder extends Seeder
{
    public function run(): void
    {
        $recetas = Receta::query()
            ->where('estado', 'activo')
            ->orderBy('id_receta')
            ->get()
            ->groupBy('tipo_comida');
        $completadas = 0;

        ComidaPlanAlimentario::query()
            ->whereDoesntHave('componentes')
            ->orderBy('id_comida_plan_alimentario')
            ->get()
            ->each(function (ComidaPlanAlimentario $comida, int $indice) use ($recetas, &$completadas): void {
                $candidatas = $recetas->get($comida->tipo_comida, collect())->values();

                if ($candidatas->isEmpty()) {
                    ComponenteComidaPlan::query()->create([
                        'id_comida_plan_alimentario'=>$comida->getKey(), 'tipo_componente'=>'manual',
                        'nombre_manual'=>'Preparación saludable por definir', 'cantidad'=>1, 'unidad'=>'porción',
                        'calorias'=>$comida->calorias_totales, 'proteinas'=>$comida->proteinas_totales,
                        'carbohidratos'=>$comida->carbohidratos_totales, 'grasas'=>$comida->grasas_totales,
                        'fibra'=>$comida->fibra_total, 'observaciones'=>'Pendiente de revisión profesional.',
                        'orden'=>1, 'estado'=>'activo',
                    ]);
                } else {
                    $receta = $candidatas[$indice % $candidatas->count()];
                    ComponenteComidaPlan::query()->create([
                        'id_comida_plan_alimentario'=>$comida->getKey(), 'tipo_componente'=>'receta',
                        'id_receta'=>$receta->getKey(), 'cantidad'=>1, 'unidad'=>'porción',
                        'calorias'=>$receta->calorias_totales, 'proteinas'=>$receta->proteinas_totales,
                        'carbohidratos'=>$receta->carbohidratos_totales, 'grasas'=>$receta->grasas_totales,
                        'fibra'=>$receta->fibra_total,
                        'observaciones'=>'Receta compatible con el tiempo de comida, incorporada para completar el plan.',
                        'orden'=>1, 'estado'=>'activo',
                    ]);
                }

                $completadas++;
            });

        $this->command?->info("Componentes completados en {$completadas} comidas que estaban vacías.");
    }
}
