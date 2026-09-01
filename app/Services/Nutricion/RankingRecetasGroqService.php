<?php

namespace App\Services\Nutricion;

use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;
use Throwable;

class RankingRecetasGroqService
{
    public function estaHabilitado(): bool
    {
        return (bool) config('openai.recipe_ranking.enabled', false)
            && filled(config('openai.api_key'));
    }

    /**
     * Reordena exclusivamente recetas que ya superaron las restricciones
     * deterministas. Si Groq no está disponible, conserva el orden original.
     */
    public function reordenar(
        array $clasificaciones,
        RecomendacionNutricionalExperta $recomendacion,
        string $tipoComida
    ): array {
        if (! $this->estaHabilitado()) {
            return $clasificaciones;
        }

        $compatibles = collect($clasificaciones)
            ->reject(fn (array $item): bool => (bool) ($item['descartada'] ?? true))
            ->take(max(1, (int) config('openai.recipe_ranking.max_candidates', 12)))
            ->values();

        if ($compatibles->count() < 2) {
            return $clasificaciones;
        }

        try {
            $response = OpenAI::chat()->create([
                'model' => (string) config('openai.recipe_ranking.model', 'openai/gpt-oss-20b'),
                'messages' => [
                    ['role' => 'system', 'content' => $this->instrucciones()],
                    ['role' => 'user', 'content' => json_encode([
                        'tipo_comida' => $tipoComida,
                        'contexto' => $this->contextoMinimo($recomendacion),
                        'recetas_compatibles' => $compatibles
                            ->map(fn (array $item): array => $this->serializarCandidata($item))
                            ->all(),
                    ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)],
                ],
                'response_format' => $this->esquemaSalida(),
            ]);

            $ranking = $this->decodificarRanking($response->choices[0]->message->content ?? null);

            return $this->combinar($clasificaciones, $ranking);
        } catch (Throwable $exception) {
            Log::warning('No se pudo aplicar el ranking de recetas con Groq; se conserva el ranking determinista.', [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            return $clasificaciones;
        }
    }

    private function instrucciones(): string
    {
        return <<<'TEXT'
Eres un asistente de ranking nutricional. Recibes únicamente recetas que ya superaron filtros estrictos de alergias, intolerancias y restricciones. No diagnostiques, no prescribas y no agregues recetas. Ordena solo los id_receta recibidos según ajuste al tipo de comida, objetivos nutricionales, preferencias, saciedad y variedad. Devuelve motivos breves basados únicamente en los datos proporcionados.
TEXT;
    }

    private function contextoMinimo(RecomendacionNutricionalExperta $recomendacion): array
    {
        $hechos = $recomendacion->hechos_utilizados ?? [];

        return [
            'enfoque_nutricional' => $recomendacion->enfoque_nutricional_experto,
            'prioridad_nutricional' => $recomendacion->prioridad_nutricional,
            'calorias_sugeridas' => $recomendacion->calorias_sugeridas,
            'proteinas_porcentaje' => $recomendacion->proteinas_porcentaje,
            'carbohidratos_porcentaje' => $recomendacion->carbohidratos_porcentaje,
            'grasas_porcentaje' => $recomendacion->grasas_porcentaje,
            'fibra_sugerida' => $recomendacion->fibra_sugerida,
            'pmos_confirmado' => (bool) data_get($hechos, 'diagnostico_pmos_confirmado', false),
            'resistencia_insulina_confirmada' => (bool) data_get($hechos, 'resistencia_insulina_confirmada', false),
            'objetivo_principal' => data_get($hechos, 'objetivo_principal'),
            'nivel_actividad' => data_get($hechos, 'nivel_actividad'),
            'alimentos_preferidos' => data_get($hechos, 'alimentos_preferidos', []),
            'comidas_preferidas' => data_get($hechos, 'comidas_preferidas', []),
            'preparaciones_preferidas' => data_get($hechos, 'preparaciones_preferidas', []),
        ];
    }

    private function serializarCandidata(array $item): array
    {
        /** @var Receta $receta */
        $receta = $item['receta'];

        return [
            'id_receta' => (int) $receta->getKey(),
            'nombre' => $receta->nombre,
            'tipo_comida' => $receta->tipo_comida,
            'calorias' => (float) $receta->calorias_totales,
            'proteinas' => (float) $receta->proteinas_totales,
            'carbohidratos' => (float) $receta->carbohidratos_totales,
            'grasas' => (float) $receta->grasas_totales,
            'fibra' => (float) $receta->fibra_total,
            'tiempo_preparacion_minutos' => (int) $receta->tiempo_preparacion_minutos,
            'ingredientes' => $receta->alimentos->pluck('nombre')->values()->all(),
            'puntaje_reglas' => (int) ($item['puntaje'] ?? 0),
            'motivos_reglas' => array_slice($item['motivos'] ?? [], 0, 4),
            'advertencias_reglas' => array_slice($item['advertencias'] ?? [], 0, 3),
        ];
    }

    private function esquemaSalida(): array
    {
        return [
            'type' => 'json_schema',
            'json_schema' => [
                'name' => 'ranking_recetas_compatibles',
                'strict' => true,
                'schema' => [
                    'type' => 'object',
                    'properties' => [
                        'ranking' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'id_receta' => ['type' => 'integer'],
                                    'puntaje_ia' => ['type' => 'number', 'minimum' => 0, 'maximum' => 100],
                                    'motivos' => [
                                        'type' => 'array',
                                        'items' => ['type' => 'string'],
                                        'maxItems' => 3,
                                    ],
                                ],
                                'required' => ['id_receta', 'puntaje_ia', 'motivos'],
                                'additionalProperties' => false,
                            ],
                        ],
                    ],
                    'required' => ['ranking'],
                    'additionalProperties' => false,
                ],
            ],
        ];
    }

    private function decodificarRanking(?string $outputText): array
    {
        $data = json_decode((string) $outputText, true, flags: JSON_THROW_ON_ERROR);
        $ranking = $data['ranking'] ?? null;

        if (! is_array($ranking)) {
            throw new \UnexpectedValueException('Groq no devolvió un ranking de recetas válido.');
        }

        return collect($ranking)
            ->filter(fn (mixed $item): bool => is_array($item)
                && isset($item['id_receta'], $item['puntaje_ia'])
                && is_numeric($item['id_receta'])
                && is_numeric($item['puntaje_ia']))
            ->mapWithKeys(fn (array $item): array => [(int) $item['id_receta'] => [
                'puntaje_ia' => max(0, min(100, (float) $item['puntaje_ia'])),
                'motivos_ia' => array_values(array_slice(array_filter(
                    is_array($item['motivos'] ?? null) ? $item['motivos'] : [],
                    'is_string'
                ), 0, 3)),
            ]])
            ->all();
    }

    private function combinar(array $clasificaciones, array $ranking): array
    {
        $compatibles = collect($clasificaciones)->reject(fn (array $item): bool => (bool) ($item['descartada'] ?? true));
        $puntajes = $compatibles->pluck('puntaje')->map(fn (mixed $valor): float => (float) $valor);
        $minimo = (float) ($puntajes->min() ?? 0);
        $maximo = (float) ($puntajes->max() ?? 0);
        $pesoIa = max(0, min(0.5, (float) config('openai.recipe_ranking.ai_weight', 0.30)));

        return collect($clasificaciones)
            ->map(function (array $item) use ($ranking, $minimo, $maximo, $pesoIa): array {
                if ($item['descartada'] ?? true) {
                    return $item;
                }

                $id = (int) $item['receta']->getKey();
                if (! isset($ranking[$id])) {
                    return $item;
                }

                $normalizado = $maximo === $minimo
                    ? 50.0
                    : (((float) $item['puntaje'] - $minimo) / ($maximo - $minimo)) * 100;
                $puntajeIa = $ranking[$id]['puntaje_ia'];

                return $item + [
                    'puntaje_ia' => round($puntajeIa, 2),
                    'motivos_ia' => $ranking[$id]['motivos_ia'],
                    'puntaje_hibrido' => round(($normalizado * (1 - $pesoIa)) + ($puntajeIa * $pesoIa), 2),
                    'clasificado_con_ia' => true,
                ];
            })
            ->sort(function (array $a, array $b): int {
                if (($a['descartada'] ?? false) !== ($b['descartada'] ?? false)) {
                    return ($a['descartada'] ?? false) <=> ($b['descartada'] ?? false);
                }

                return ($b['puntaje_hibrido'] ?? $b['puntaje']) <=> ($a['puntaje_hibrido'] ?? $a['puntaje']);
            })
            ->values()
            ->all();
    }
}
