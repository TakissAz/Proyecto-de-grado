<?php

namespace App\Services\Nutricion;

use App\Models\PlanAlimentario;
use App\Models\Paciente;
use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\User;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GeneradorPlanSemanalService
{
    private const TIEMPOS = [
        'desayuno' => ['hora' => '08:00', 'proporcion' => 0.25, 'orden' => 1],
        'almuerzo' => ['hora' => '13:00', 'proporcion' => 0.40, 'orden' => 2],
        'merienda' => ['hora' => '16:30', 'proporcion' => 0.15, 'orden' => 3],
        'cena' => ['hora' => '19:30', 'proporcion' => 0.20, 'orden' => 4],
    ];

    public function __construct(
        private readonly CalculadoraTotalesPlanAlimentarioService $calculadora,
        private readonly ClasificadorRecetasSistemaExpertoService $clasificadorRecetas,
        private readonly ContextoAjustePlanService $contextoAjusteService
    ) {}

    public function generarDesdeRecomendacion(
        RecomendacionNutricionalExperta $recomendacion,
        ?User $nutricionista = null,
        ?array $opciones = []
    ): PlanAlimentario {
        if (! in_array($recomendacion->estado_validacion_experta, ['aprobado', 'validado'], true)) {
            throw new DomainException(
                'Solo se puede generar un plan desde una recomendación nutricional aprobada o validada.'
            );
        }

        $opciones ??= [];
        $fechaInicio = isset($opciones['fecha_inicio']) && $opciones['fecha_inicio'] !== ''
            ? CarbonImmutable::parse($opciones['fecha_inicio'])->startOfDay()
            : null;
        $objetivos = $this->objetivosNutricionales($recomendacion);
        $paciente = Paciente::query()->find($recomendacion->id_paciente);
        $contextoAjuste = is_array($opciones['contexto_ajuste'] ?? null)
            ? $opciones['contexto_ajuste']
            : ($paciente ? $this->contextoAjusteService->construirParaPaciente($paciente) : []);
        $recetasPorTipo = collect(self::TIEMPOS)->mapWithKeys(
            fn (array $configuracion, string $tipo): array => [
                $tipo => collect($this->clasificadorRecetas->clasificarParaRecomendacion(
                    $recomendacion, $tipo, $contextoAjuste
                ))->filter(fn (array $resultado): bool => ! $resultado['descartada']
                    && $this->normalizarTipoComida($resultado['receta']->tipo_comida) === $tipo)
                    ->values()
                    ->all(),
            ]
        )->all();

        return DB::transaction(function () use (
            $recomendacion,
            $nutricionista,
            $fechaInicio,
            $objetivos,
            $recetasPorTipo,
            $contextoAjuste
        ): PlanAlimentario {
            $usadasPorTipo = array_fill_keys(array_keys(self::TIEMPOS), []);
            $ultimaRecetaPorTipo = array_fill_keys(array_keys(self::TIEMPOS), null);
            $proteinaAnteriorPorTipo = [];
            $plan = PlanAlimentario::query()->create([
                'id_paciente' => $recomendacion->id_paciente,
                'id_nutricionista' => $nutricionista?->getKey()
                    ?? $recomendacion->id_nutricionista,
                'id_recomendacion_nutricional_experta' => $recomendacion->getKey(),
                'id_requerimiento_nutricional' => $recomendacion->id_requerimiento_nutricional,
                'nombre' => 'Plan semanal sugerido - '.now()->format('Y-m-d'),
                'fecha_inicio' => $fechaInicio?->toDateString(),
                'fecha_fin' => $fechaInicio?->addDays(6)->toDateString(),
                'duracion_dias' => 7,
                'objetivo_plan' => $recomendacion->prioridad_nutricional
                    ?? $recomendacion->enfoque_nutricional_experto,
                ...$objetivos,
                'estado_plan' => 'sugerido',
                'generado_por_sistema_experto' => true,
                'observaciones' => 'Plan sugerido generado desde una recomendación nutricional experta validada.'
                    .(($contextoAjuste['resumen_ajuste'] ?? []) !== [] ? ' Este plan consideró el seguimiento reciente del paciente. '.implode(' ', $contextoAjuste['resumen_ajuste']) : ''),
                'estado' => 'activo',
            ]);

            foreach (range(1, 7) as $numeroDia) {
                $recetasUsadasEnDia = [];
                $dia = $plan->dias()->create([
                    'numero_dia' => $numeroDia,
                    'nombre_dia' => "Día {$numeroDia}",
                    'fecha' => $fechaInicio?->addDays($numeroDia - 1)->toDateString(),
                    'estado' => 'activo',
                ]);

                foreach (self::TIEMPOS as $tipo => $configuracion) {
                    $comida = $dia->comidas()->create([
                        'tipo_comida' => $tipo,
                        'hora_sugerida' => $configuracion['hora'],
                        'nombre_comida' => Str::headline($tipo),
                        'orden' => $configuracion['orden'],
                        'estado' => 'activo',
                    ]);
                    $objetivoCalorico = $objetivos['calorias_objetivo'] * $configuracion['proporcion'];
                    $seleccion = $this->elegirReceta(
                        $recetasPorTipo[$tipo],
                        $tipo,
                        $objetivoCalorico,
                        $usadasPorTipo[$tipo],
                        $ultimaRecetaPorTipo[$tipo],
                        $recetasUsadasEnDia,
                        $proteinaAnteriorPorTipo[$tipo] ?? null
                    );

                    if ($seleccion !== null) {
                        /** @var Receta $receta */
                        $receta = $seleccion['receta'];
                        $idReceta = $receta->getKey();
                        $usadasPorTipo[$tipo][] = $idReceta;
                        $recetasUsadasEnDia[] = $idReceta;
                        $ultimaRecetaPorTipo[$tipo] = $idReceta;
                        $proteinaAnteriorPorTipo[$tipo] = $seleccion['proteina_principal'];
                        $comida->componentes()->create([
                            'tipo_componente' => 'receta',
                            'id_receta' => $receta->getKey(),
                            'cantidad' => 1,
                            'unidad' => 'porcion',
                            'calorias' => $receta->calorias_totales,
                            'proteinas' => $receta->proteinas_totales,
                            'carbohidratos' => $receta->carbohidratos_totales,
                            'grasas' => $receta->grasas_totales,
                            'fibra' => $receta->fibra_total,
                            'observaciones' => $this->observacionClasificacion($seleccion, $contextoAjuste),
                            'orden' => 1,
                            'estado' => 'activo',
                        ]);
                    } else {
                        $proporcion = $configuracion['proporcion'];
                        $comida->componentes()->create([
                            'tipo_componente' => 'manual',
                            'nombre_manual' => 'Comida sugerida pendiente de definir por la nutricionista',
                            'cantidad' => 1,
                            'unidad' => 'porcion',
                            'calorias' => round($objetivos['calorias_objetivo'] * $proporcion, 2),
                            'proteinas' => round($objetivos['proteinas_objetivo'] * $proporcion, 2),
                            'carbohidratos' => round($objetivos['carbohidratos_objetivo'] * $proporcion, 2),
                            'grasas' => round($objetivos['grasas_objetivo'] * $proporcion, 2),
                            'fibra' => round($objetivos['fibra_objetivo'] * $proporcion, 2),
                            'orden' => 1,
                            'estado' => 'activo',
                        ]);
                    }

                    $this->calculadora->recalcularComida($comida);
                }

                $this->calculadora->recalcularDia($dia);
            }

            return $this->calculadora->recalcularPlan($plan)->load('dias.comidas.componentes');
        });
    }

    private function objetivosNutricionales(
        RecomendacionNutricionalExperta $recomendacion
    ): array {
        $calorias = (float) ($recomendacion->calorias_sugeridas ?? 0);
        $requerimiento = $recomendacion->requerimientoNutricional;

        return [
            'calorias_objetivo' => $calorias,
            'proteinas_objetivo' => $this->gramosDesdePorcentaje(
                $calorias,
                $recomendacion->proteinas_porcentaje,
                4,
                $requerimiento?->proteinas_diarias
            ),
            'carbohidratos_objetivo' => $this->gramosDesdePorcentaje(
                $calorias,
                $recomendacion->carbohidratos_porcentaje,
                4,
                $requerimiento?->carbohidratos_diarios
            ),
            'grasas_objetivo' => $this->gramosDesdePorcentaje(
                $calorias,
                $recomendacion->grasas_porcentaje,
                9,
                $requerimiento?->grasas_diarias
            ),
            'fibra_objetivo' => (float) ($recomendacion->fibra_sugerida
                ?? $requerimiento?->fibra_diaria
                ?? 0),
        ];
    }

    private function gramosDesdePorcentaje(
        float $calorias,
        mixed $porcentaje,
        int $caloriasPorGramo,
        mixed $alternativa
    ): float {
        if ($calorias > 0 && is_numeric($porcentaje)) {
            return round(($calorias * (float) $porcentaje / 100) / $caloriasPorGramo, 2);
        }

        return round((float) ($alternativa ?? 0), 2);
    }

    private function elegirReceta(
        array $candidatas,
        string $tipo,
        float $objetivoCalorico,
        array $usadasPorTipo,
        ?int $ultimaRecetaPorTipo,
        array $recetasUsadasEnDia,
        ?string $proteinaAnteriorPorTipo
    ): ?array {
        $candidatas = collect($candidatas)->values();

        if ($candidatas->isEmpty()) {
            return null;
        }

        $cantidadCompatibles = $candidatas->count();
        $viables = $candidatas;
        if ($cantidadCompatibles >= 7) {
            // Regla estricta semanal: con siete o más alternativas nunca se
            // vuelve a incluir un ID ya utilizado para este tipo de comida.
            $viables = $viables->reject(
                fn (array $r): bool => in_array($r['receta']->getKey(), $usadasPorTipo, true)
            )->values();
        }

        $noConsecutivas = $viables->filter(
            fn (array $r): bool => $ultimaRecetaPorTipo !== $r['receta']->getKey()
        );
        if ($noConsecutivas->isNotEmpty()) $viables = $noConsecutivas;

        $noUsadasHoy = $viables->filter(
            fn (array $r): bool => ! in_array($r['receta']->getKey(), $recetasUsadasEnDia, true)
        );
        if ($noUsadasHoy->isNotEmpty()) $viables = $noUsadasHoy;

        // Si todas las alternativas ya se usaron dos veces, se permite repetir
        // la menos utilizada conservando el orden experto y calórico.
        $evaluadas = $viables->map(function (array $resultado) use (
            $tipo, $usadasPorTipo, $ultimaRecetaPorTipo, $cantidadCompatibles,
            $recetasUsadasEnDia, $proteinaAnteriorPorTipo
        ): array {
            /** @var Receta $receta */
            $receta = $resultado['receta'];
            $id = $receta->getKey();
            $usos = count(array_filter($usadasPorTipo, fn (int $usada): bool => $usada === $id));
            $ajustado = (int) $resultado['puntaje'];
            if ($usos === 1) $ajustado -= 15;
            if ($usos >= 2) $ajustado -= 50;
            if ($ultimaRecetaPorTipo === $id) $ajustado -= 100;
            if (in_array($id, $recetasUsadasEnDia, true)) $ajustado -= 100;

            $proteina = $this->proteinaPrincipal($receta);
            if (in_array($tipo, ['almuerzo', 'cena'], true)
                && $proteina !== null
                && $proteina === $proteinaAnteriorPorTipo) {
                $ajustado -= 10;
            }

            return $resultado + [
                'puntaje_ajustado' => $ajustado,
                'proteina_principal' => $proteina,
                'repeticion_forzada' => $usos > 0,
                'cantidad_compatibles' => $cantidadCompatibles,
            ];
        });

        return $evaluadas->sort(function (array $a, array $b) use ($objetivoCalorico): int {
            $porPuntaje = $b['puntaje_ajustado'] <=> $a['puntaje_ajustado'];
            if ($porPuntaje !== 0) return $porPuntaje;
            return abs((float) $a['receta']->calorias_totales - $objetivoCalorico)
                <=> abs((float) $b['receta']->calorias_totales - $objetivoCalorico);
        })->first();
    }

    private function observacionClasificacion(array $seleccion, array $contextoAjuste = []): string
    {
        $motivos = array_slice($seleccion['motivos'] ?? [], 0, 3);
        $detalle = $motivos === [] ? 'Sin motivos adicionales.' : implode(' ', $motivos);

        $repeticion = '';
        if (($seleccion['repeticion_forzada'] ?? false) && ($seleccion['cantidad_compatibles'] ?? 0) === 1) {
            $repeticion = ' Única receta compatible disponible para este tiempo de comida.';
        } elseif ($seleccion['repeticion_forzada'] ?? false) {
            $repeticion = ' Receta repetida porque existen menos de 7 alternativas compatibles para este tiempo de comida.';
        }

        $seguimiento = ($contextoAjuste['resumen_ajuste'] ?? []) !== [] ? ' Ajustado con seguimiento del paciente.' : '';

        return sprintf(
            'Puntaje experto: %d. Puntaje ajustado por diversidad: %d. Motivos: %s%s%s',
            $seleccion['puntaje'],
            $seleccion['puntaje_ajustado'],
            $detalle,
            $repeticion,
            $seguimiento
        );
    }

    private function proteinaPrincipal(Receta $receta): ?string
    {
        $texto = Str::lower(Str::ascii(implode(' ', [
            $receta->nombre,
            ...$receta->alimentos->pluck('nombre')->all(),
        ])));

        foreach (['pollo', 'pescado', 'atun', 'huevo', 'carne', 'lentejas', 'garbanzos', 'queso', 'yogur'] as $proteina) {
            if (str_contains($texto, $proteina)) return $proteina;
        }

        return null;
    }

    private function normalizarTipoComida(mixed $tipo): string
    {
        return Str::of((string) ($tipo ?? ''))
            ->trim()
            ->ascii()
            ->lower()
            ->squish()
            ->value();
    }
}
