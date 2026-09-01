<?php

namespace App\Services\Nutricion;

use App\Models\PlanAlimentario;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;
use Throwable;

class CopilotoNutricionalGroqService
{
    public const ACCIONES = [
        'explicar_plan',
        'ajustar_siguiente',
        'alternativas',
        'auditar',
        'resumen_paciente',
        'redactar_reporte',
        'consulta',
    ];

    public function __construct(
        private readonly ContextoAjustePlanService $contextoAjuste,
        private readonly ClasificadorRecetasSistemaExpertoService $clasificador,
    ) {}

    public function analizar(
        PlanAlimentario $plan,
        string $accion,
        ?string $pregunta = null,
        ?string $tipoComida = null,
    ): array {
        if (! in_array($accion, self::ACCIONES, true)) {
            throw new RuntimeException('La acción solicitada no está habilitada en el copiloto nutricional.');
        }

        if (! (bool) config('openai.recipe_ranking.enabled') || blank(config('openai.api_key'))) {
            throw new RuntimeException('El copiloto Groq no está configurado o se encuentra deshabilitado.');
        }

        $plan->loadMissing([
            'paciente',
            'recomendacionNutricionalExperta',
            'dias.comidas.componentes.receta.alimentos',
        ]);

        $contexto = $this->contextoSeguro($plan, $accion, $tipoComida);

        try {
            $respuesta = OpenAI::chat()->create([
                'model' => (string) config('openai.recipe_ranking.model', 'openai/gpt-oss-20b'),
                'messages' => [
                    ['role' => 'system', 'content' => $this->instrucciones($accion)],
                    ['role' => 'user', 'content' => json_encode([
                        'accion' => $accion,
                        'pregunta_profesional' => $pregunta,
                        'contexto' => $contexto,
                    ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)],
                ],
            ]);

            $contenido = $respuesta->choices[0]->message->content ?? null;
            $datos = $this->decodificarRespuesta((string) $contenido);

            return $this->normalizarRespuesta($datos, $accion);
        } catch (Throwable $exception) {
            report($exception);

            throw new RuntimeException(
                'No se pudo obtener el análisis de Groq en este momento. El plan no fue modificado.',
                previous: $exception,
            );
        }
    }

    private function contextoSeguro(PlanAlimentario $plan, string $accion, ?string $tipoComida): array
    {
        $recomendacion = $plan->recomendacionNutricionalExperta;
        $contexto = [
            'plan' => [
                'estado' => $plan->estado_plan,
                'duracion_dias' => $plan->duracion_dias,
                'objetivos' => $plan->only(['calorias_objetivo', 'proteinas_objetivo', 'carbohidratos_objetivo', 'grasas_objetivo', 'fibra_objetivo']),
                'totales' => $plan->only(['calorias_totales', 'proteinas_totales', 'carbohidratos_totales', 'grasas_totales', 'fibra_total']),
                'dias' => $plan->dias->map(fn ($dia): array => [
                    'numero' => $dia->numero_dia,
                    'comidas' => $dia->comidas->map(fn ($comida): array => [
                        'tipo' => $comida->tipo_comida,
                        'hora' => $comida->hora_sugerida,
                        'totales' => $comida->only(['calorias_totales', 'proteinas_totales', 'carbohidratos_totales', 'grasas_totales', 'fibra_total']),
                        'componentes' => $comida->componentes->map(fn ($componente): array => [
                            'nombre' => $componente->receta?->nombre ?? $componente->nombre_manual,
                            'tipo' => $componente->tipo_componente,
                            'nutrientes' => $componente->only(['calorias', 'proteinas', 'carbohidratos', 'grasas', 'fibra']),
                        ])->values()->all(),
                    ])->values()->all(),
                ])->values()->all(),
            ],
            'recomendacion_experta' => $recomendacion ? [
                'enfoque' => $recomendacion->enfoque_nutricional_experto,
                'prioridad' => $recomendacion->prioridad_nutricional,
                'restricciones' => $recomendacion->restricciones,
                'recomendaciones' => $recomendacion->recomendaciones_expertas,
                'alertas' => $recomendacion->alertas,
                'hechos_nutricionales' => $this->hechosSeguros($recomendacion->hechos_utilizados ?? []),
            ] : null,
            'seguimiento' => $plan->paciente
                ? $this->contextoAjuste->construirParaPaciente($plan->paciente)
                : [],
        ];

        if ($accion === 'alternativas' && $recomendacion) {
            $tipo = $tipoComida ?: 'almuerzo';
            $contexto['tipo_comida_solicitado'] = $tipo;
            $contexto['alternativas_compatibles'] = collect(
                $this->clasificador->clasificarParaRecomendacion($recomendacion, $tipo, [], false)
            )->reject(fn (array $item): bool => (bool) $item['descartada'])
                ->filter(fn (array $item): bool => $item['receta']->tipo_comida === $tipo)
                ->take(8)
                ->map(fn (array $item): array => [
                    'id_receta' => $item['receta']->getKey(),
                    'nombre' => $item['receta']->nombre,
                    'puntaje_reglas' => $item['puntaje'],
                    'calorias' => $item['receta']->calorias_totales,
                    'proteinas' => $item['receta']->proteinas_totales,
                    'carbohidratos' => $item['receta']->carbohidratos_totales,
                    'grasas' => $item['receta']->grasas_totales,
                    'fibra' => $item['receta']->fibra_total,
                ])->values()->all();
        }

        return $contexto;
    }

    private function instrucciones(string $accion): string
    {
        $objetivo = match ($accion) {
            'explicar_plan' => 'Explica por qué el plan y sus recetas responden a los objetivos, preferencias y restricciones.',
            'ajustar_siguiente' => 'Propón ajustes para el siguiente plan usando adherencia, síntomas, aceptación y retroalimentación.',
            'alternativas' => 'Compara exclusivamente las alternativas compatibles recibidas. Nunca inventes recetas ni identificadores.',
            'auditar' => 'Audita diversidad, repetición, distribución nutricional, fibra, viabilidad e información incompleta.',
            'resumen_paciente' => 'Redacta una orientación sencilla para la paciente, sin diagnósticos sensibles ni jerga innecesaria.',
            'redactar_reporte' => 'Redacta un resumen profesional con fundamento, evolución, cambios y puntos para revisión.',
            default => 'Responde la pregunta profesional usando exclusivamente el contexto autorizado.',
        };

        return "Eres un copiloto para nutricionistas. {$objetivo} No diagnostiques, no prescribas, no sustituyas el criterio profesional y no afirmes datos ausentes. Las alergias, intolerancias y restricciones son barreras obligatorias. No propongas aplicar cambios automáticamente. Devuelve únicamente un objeto JSON en español con esta estructura exacta: {\"titulo\":\"texto\",\"resumen\":\"texto\",\"hallazgos\":[\"texto\"],\"recomendaciones\":[\"texto\"],\"alertas\":[\"texto\"],\"alternativas\":[{\"id_receta\":1,\"nombre\":\"texto\",\"motivo\":\"texto\"}]}. Incluye siempre las seis propiedades; usa arreglos vacíos cuando no correspondan. En alternativas utiliza solo identificadores recibidos.";
    }

    private function normalizarRespuesta(array $datos, string $accion): array
    {
        return [
            'accion' => $accion,
            'titulo' => (string) ($datos['titulo'] ?? 'Análisis nutricional'),
            'resumen' => (string) ($datos['resumen'] ?? ''),
            'hallazgos' => array_values(array_filter($datos['hallazgos'] ?? [], 'is_string')),
            'recomendaciones' => array_values(array_filter($datos['recomendaciones'] ?? [], 'is_string')),
            'alertas' => array_values(array_filter($datos['alertas'] ?? [], 'is_string')),
            'alternativas' => array_values(array_filter($datos['alternativas'] ?? [], 'is_array')),
            'proveedor' => 'groq',
            'modelo' => (string) config('openai.recipe_ranking.model'),
            'requiere_validacion_profesional' => true,
        ];
    }

    private function decodificarRespuesta(string $contenido): array
    {
        $contenido = trim($contenido);
        $contenido = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $contenido) ?? $contenido;

        $inicio = strpos($contenido, '{');
        $fin = strrpos($contenido, '}');

        if ($inicio === false || $fin === false || $fin < $inicio) {
            throw new RuntimeException('Groq no devolvió una respuesta JSON válida.');
        }

        $datos = json_decode(substr($contenido, $inicio, $fin - $inicio + 1), true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($datos)) {
            throw new RuntimeException('Groq devolvió una estructura inesperada.');
        }

        return $datos;
    }

    private function hechosSeguros(array $hechos): array
    {
        return collect([
            'edad', 'sexo', 'diagnostico_pmos_confirmado', 'fenotipo_pmos',
            'severidad_clinica', 'riesgo_metabolico', 'resistencia_insulina_confirmada',
            'grado_resistencia', 'homa_ir', 'quicki', 'imc', 'nivel_actividad',
            'objetivo_principal', 'alimentos_preferidos', 'comidas_preferidas',
            'preparaciones_preferidas', 'alergias', 'intolerancias',
            'alimentos_restringidos', 'alimentos_no_tolerados', 'alimentos_rechazados',
        ])->mapWithKeys(fn (string $campo): array => [$campo => data_get($hechos, $campo)])
            ->filter(fn (mixed $valor): bool => $valor !== null)
            ->all();
    }
}
