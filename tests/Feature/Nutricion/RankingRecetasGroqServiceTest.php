<?php

namespace Tests\Feature\Nutricion;

use App\Models\Alimento;
use App\Models\Paciente;
use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\User;
use App\Services\Nutricion\ClasificadorRecetasSistemaExpertoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use OpenAI\Laravel\Facades\OpenAI;
use OpenAI\Resources\Chat;
use OpenAI\Responses\Chat\CreateResponse;
use RuntimeException;
use Tests\TestCase;

class RankingRecetasGroqServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('openai.api_key', 'gsk_prueba_no_real');
        config()->set('openai.recipe_ranking.enabled', true);
        config()->set('openai.recipe_ranking.model', 'openai/gpt-oss-20b');
        config()->set('openai.recipe_ranking.ai_weight', 0.30);
    }

    public function test_reordena_solamente_recetas_compatibles_con_respuesta_estructurada(): void
    {
        $primera = $this->receta('Omelette vegetal', ['Huevo']);
        $preferidaIa = $this->receta('Avena con frutos rojos', ['Avena']);
        $descartada = $this->receta('Batido con maní', ['Maní']);

        $fake = OpenAI::fake([
            $this->respuesta([
                ['id_receta' => $preferidaIa->getKey(), 'puntaje_ia' => 100, 'motivos' => ['Mejor ajuste al contexto recibido.']],
                ['id_receta' => $primera->getKey(), 'puntaje_ia' => 0, 'motivos' => ['Alternativa compatible secundaria.']],
            ]),
        ]);

        $resultados = app(ClasificadorRecetasSistemaExpertoService::class)
            ->clasificarParaRecomendacion($this->recomendacion(['alergias' => ['maní']]), 'desayuno');

        $this->assertTrue($resultados[0]['receta']->is($preferidaIa));
        $this->assertTrue($resultados[0]['clasificado_con_ia']);
        $this->assertSame(100.0, $resultados[0]['puntaje_ia']);
        $this->assertTrue(collect($resultados)->last()['receta']->is($descartada));
        $this->assertTrue(collect($resultados)->last()['descartada']);

        $fake->assertSent(Chat::class, function (string $method, array $parameters) use ($descartada): bool {
            $entrada = json_decode($parameters['messages'][1]['content'], true);
            $ids = collect($entrada['recetas_compatibles'])->pluck('id_receta');

            return $method === 'create'
                && $parameters['model'] === 'openai/gpt-oss-20b'
                && data_get($parameters, 'response_format.type') === 'json_schema'
                && data_get($parameters, 'response_format.json_schema.strict') === true
                && ! $ids->contains($descartada->getKey());
        });
    }

    public function test_si_groq_falla_conserva_el_ranking_determinista(): void
    {
        $mejor = $this->receta('Omelette alto en proteína', ['Huevo'], 30, 15, 7);
        $menor = $this->receta('Tostada simple', ['Pan'], 5, 60, 1);
        OpenAI::fake([new RuntimeException('API no disponible')]);

        $resultados = app(ClasificadorRecetasSistemaExpertoService::class)
            ->clasificarParaRecomendacion($this->recomendacion(), 'desayuno');

        $this->assertTrue($resultados[0]['receta']->is($mejor));
        $this->assertTrue($resultados[1]['receta']->is($menor));
        $this->assertArrayNotHasKey('clasificado_con_ia', $resultados[0]);
    }

    public function test_no_llama_groq_cuando_la_integracion_esta_deshabilitada(): void
    {
        config()->set('openai.recipe_ranking.enabled', false);
        $fake = OpenAI::fake([]);
        $this->receta('Omelette', ['Huevo']);
        $this->receta('Avena', ['Avena']);

        app(ClasificadorRecetasSistemaExpertoService::class)
            ->clasificarParaRecomendacion($this->recomendacion(), 'desayuno');

        $fake->assertNothingSent();
    }

    private function respuesta(array $ranking): CreateResponse
    {
        return CreateResponse::fake([
            'model' => 'openai/gpt-oss-20b',
            'choices' => [[
                'index' => 0,
                'message' => [
                    'role' => 'assistant',
                    'content' => json_encode(['ranking' => $ranking], JSON_UNESCAPED_UNICODE),
                ],
                'finish_reason' => 'stop',
            ]],
        ]);
    }

    private function recomendacion(array $hechos = []): RecomendacionNutricionalExperta
    {
        $usuario = User::factory()->create();
        $paciente = Paciente::query()->create([
            'user_id' => $usuario->getKey(),
            'nombres' => 'Paciente',
            'apellido_paterno' => 'Ranking',
            'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1992-01-01',
            'sexo' => 'femenino',
            'estado' => 'activo',
        ]);

        return RecomendacionNutricionalExperta::query()->create([
            'id_paciente' => $paciente->getKey(),
            'enfoque_nutricional_experto' => 'bajo_indice_glucemico_alto_fibra',
            'calorias_sugeridas' => 1600,
            'restricciones' => [],
            'hechos_utilizados' => $hechos,
            'estado_validacion_experta' => 'aprobado',
            'estado' => 'activo',
        ]);
    }

    private function receta(
        string $nombre,
        array $ingredientes,
        float $proteinas = 20,
        float $carbohidratos = 30,
        float $fibra = 5
    ): Receta {
        $receta = Receta::query()->create([
            'nombre' => $nombre,
            'tipo_comida' => 'desayuno',
            'porciones' => 1,
            'tiempo_preparacion_minutos' => 15,
            'calorias_totales' => 300,
            'proteinas_totales' => $proteinas,
            'carbohidratos_totales' => $carbohidratos,
            'grasas_totales' => 10,
            'fibra_total' => $fibra,
            'estado' => 'activo',
        ]);

        foreach ($ingredientes as $nombreAlimento) {
            $alimento = Alimento::query()->create([
                'nombre' => $nombreAlimento,
                'grupo_alimentario' => 'otros',
                'unidad_base' => 'g',
                'cantidad_base' => 100,
                'calorias' => 100,
                'proteinas' => 10,
                'carbohidratos' => 10,
                'grasas' => 3,
                'fibra' => 2,
                'estado' => 'activo',
            ]);
            $receta->alimentos()->attach($alimento->getKey(), [
                'cantidad' => 100,
                'unidad' => 'g',
                'calorias_aporte' => 100,
                'proteinas_aporte' => 10,
                'carbohidratos_aporte' => 10,
                'grasas_aporte' => 3,
                'fibra_aporte' => 2,
            ]);
        }

        return $receta;
    }
}
