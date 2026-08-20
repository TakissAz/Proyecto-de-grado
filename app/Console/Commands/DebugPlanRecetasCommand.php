<?php

namespace App\Console\Commands;

use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use App\Services\Nutricion\ClasificadorRecetasSistemaExpertoService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class DebugPlanRecetasCommand extends Command
{
    protected $signature = 'recetas:debug-plan {recomendacion : ID de la recomendación nutricional experta}';

    protected $description = 'Diagnostica, sin guardar datos, las recetas disponibles para un plan semanal';

    private const TIPOS = ['desayuno', 'almuerzo', 'merienda', 'cena'];

    public function handle(ClasificadorRecetasSistemaExpertoService $clasificador): int
    {
        $recomendacion = RecomendacionNutricionalExperta::query()->find($this->argument('recomendacion'));
        if (! $recomendacion) {
            $this->error('No existe la recomendación nutricional indicada.');

            return self::FAILURE;
        }

        $recetas = Receta::query()->withCount('recetaAlimentos')->get();
        $activas = $recetas->filter(fn (Receta $receta): bool => $this->normalizar($receta->estado) === 'activo');

        $this->info("Recomendación: {$recomendacion->getKey()}");
        $this->line("Total de recetas: {$recetas->count()}");
        $this->line("Recetas activas: {$activas->count()}");
        $this->line('Recetas con ingredientes: '.$recetas->where('receta_alimentos_count', '>', 0)->count());
        $this->line('Recetas sin ingredientes: '.$recetas->where('receta_alimentos_count', 0)->count());

        $this->newLine();
        $this->table(
            ['Tipo de comida', 'Total', 'Activas'],
            collect(self::TIPOS)->map(fn (string $tipo): array => [
                $tipo,
                $recetas->filter(fn (Receta $r): bool => $this->normalizar($r->tipo_comida) === $tipo)->count(),
                $activas->filter(fn (Receta $r): bool => $this->normalizar($r->tipo_comida) === $tipo)->count(),
            ])->all()
        );

        $planes = $recomendacion->planesAlimentarios()
            ->with('dias.comidas.componentes')
            ->latest('id_plan_alimentario')
            ->get();
        $this->newLine();
        $this->line('Planes ya generados desde esta recomendación:');
        $this->table(
            ['Plan', 'Estado', 'Componentes receta', 'Componentes manuales'],
            $planes->map(function ($plan): array {
                $componentes = $plan->dias->flatMap->comidas->flatMap->componentes;

                return [
                    $plan->getKey(),
                    $plan->estado_plan,
                    $componentes->where('tipo_componente', 'receta')->count(),
                    $componentes->where('tipo_componente', 'manual')->count(),
                ];
            })->all()
        );

        foreach (self::TIPOS as $tipo) {
            $resultados = collect($clasificador->clasificarParaRecomendacion($recomendacion, $tipo))
                ->filter(fn (array $resultado): bool => $this->normalizar($resultado['receta']->tipo_comida) === $tipo)
                ->values();
            $compatibles = $resultados->where('descartada', false)->values();
            $descartadas = $resultados->where('descartada', true)->values();

            $this->newLine();
            $this->info(Str::headline($tipo));
            $this->line("Evaluadas: {$resultados->count()} | Compatibles: {$compatibles->count()} | Descartadas: {$descartadas->count()}");
            $this->line($compatibles->isEmpty() ? 'Fallback manual: SÍ' : 'Fallback manual: NO');
            $this->line('IDs compatibles: '.$compatibles->pluck('receta.id_receta')->implode(', '));
            $this->line('¿Suficientes para 7 días?: '.($compatibles->count() >= 7 ? 'SÍ' : 'NO'));
            $this->line($compatibles->count() >= 7
                ? 'Resultado esperado: debería generar 7 recetas distintas.'
                : 'Resultado esperado: debería alternar por falta de alternativas.');

            $ultimoPlan = $planes->first();
            if ($ultimoPlan) {
                $selecciones = $ultimoPlan->dias->sortBy('numero_dia')->map(function ($dia) use ($tipo): array {
                    $comida = $dia->comidas->first(
                        fn ($item): bool => $this->normalizar($item->tipo_comida) === $tipo
                    );
                    $id = $comida?->componentes->firstWhere('tipo_componente', 'receta')?->id_receta;

                    return ['día' => $dia->numero_dia, 'id' => $id];
                })->values();
                $idsUsados = $selecciones->pluck('id')->filter()->values();
                $usos = $idsUsados->countBy();
                $consecutivas = $selecciones->pluck('id')->filter()->values()
                    ->sliding(2)
                    ->filter(fn ($par): bool => $par->count() === 2 && $par->first() === $par->last())
                    ->count();
                $repeticionEvitable = $compatibles->count() >= 7
                    && $idsUsados->count() > $idsUsados->unique()->count();

                $this->line("Último plan #{$ultimoPlan->getKey()}: IDs usados ".($idsUsados->implode(', ') ?: 'ninguno'));
                $this->line('Usos por receta: '.($usos->map(fn ($cantidad, $id) => "{$id}={$cantidad}")->implode(', ') ?: 'ninguno'));
                $this->line('Repetición evitable: '.($repeticionEvitable ? 'SÍ' : 'NO'));
                $this->line("Repeticiones consecutivas: {$consecutivas}");
            }

            $this->line('Top 5 compatibles:');
            $this->table(
                ['ID', 'Receta', 'Puntaje'],
                $compatibles->take(5)->map(fn (array $r): array => [
                    $r['receta']->getKey(), $r['receta']->nombre, $r['puntaje'],
                ])->all()
            );

            $this->line('Top 5 descartadas:');
            $this->table(
                ['ID', 'Receta', 'Razón'],
                $descartadas->take(5)->map(fn (array $r): array => [
                    $r['receta']->getKey(),
                    $r['receta']->nombre,
                    implode(' ', $r['razones_descarte']) ?: 'Sin razón registrada',
                ])->all()
            );
        }

        return self::SUCCESS;
    }

    private function normalizar(mixed $valor): string
    {
        return Str::of((string) ($valor ?? ''))->trim()->ascii()->lower()->squish()->value();
    }
}
