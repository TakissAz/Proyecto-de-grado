<?php

namespace Tests\Feature\Nutricion;

use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use GuzzleHttp\Psr7\Response;
use OpenAI\Exceptions\RateLimitException;
use OpenAI\Laravel\Facades\OpenAI;
use OpenAI\Resources\Chat;
use OpenAI\Responses\Chat\CreateResponse;
use RuntimeException;
use Tests\TestCase;

class CopilotoNutricionalGroqTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('openai.api_key', 'gsk_prueba_no_real');
        config()->set('openai.recipe_ranking.enabled', true);
        config()->set('openai.recipe_ranking.model', 'openai/gpt-oss-20b');
    }

    public function test_nutricionista_obtiene_analisis_estructurado_sin_modificar_plan(): void
    {
        $fake = OpenAI::fake([$this->respuesta()]);
        $plan = $this->plan();
        $actualizado = $plan->updated_at;

        $this->actingAs($this->usuarioConRol('nutricionista'))
            ->postJson(route('nutricionista.planes.copiloto', $plan), ['accion' => 'auditar'])
            ->assertOk()
            ->assertJsonPath('data.proveedor', 'groq')
            ->assertJsonPath('data.requiere_validacion_profesional', true)
            ->assertJsonPath('data.titulo', 'Auditoría del plan');

        $this->assertTrue($plan->fresh()->updated_at->equalTo($actualizado));
        $fake->assertSent(Chat::class, fn (string $metodo, array $parametros): bool =>
            $metodo === 'create'
            && data_get($parametros, 'model') === 'openai/gpt-oss-20b'
            && ! array_key_exists('response_format', $parametros)
        );
    }

    public function test_valida_accion_y_protege_ruta_por_rol(): void
    {
        $plan = $this->plan();
        $this->actingAs($this->usuarioConRol('endocrinologo'))
            ->postJson(route('nutricionista.planes.copiloto', $plan), ['accion' => 'auditar'])
            ->assertForbidden();
        $this->actingAs($this->usuarioConRol('nutricionista'))
            ->postJson(route('nutricionista.planes.copiloto', $plan), ['accion' => 'inventada'])
            ->assertUnprocessable();
    }

    public function test_error_de_groq_es_controlado_y_no_modifica_plan(): void
    {
        OpenAI::fake([new RuntimeException('Groq no disponible')]);
        $plan = $this->plan();

        $this->actingAs($this->usuarioConRol('nutricionista'))
            ->postJson(route('nutricionista.planes.copiloto', $plan), ['accion' => 'explicar_plan'])
            ->assertStatus(502)
            ->assertJsonPath('success', false);

        $this->assertSame('sugerido', $plan->fresh()->estado_plan);
    }

    public function test_limite_de_groq_devuelve_429_y_mensaje_claro(): void
    {
        OpenAI::fake([new RateLimitException(new Response(429))]);
        $plan = $this->plan();

        $this->actingAs($this->usuarioConRol('nutricionista'))
            ->postJson(route('nutricionista.planes.copiloto', $plan), ['accion' => 'consulta', 'pregunta' => '¿Cómo puedo mejorar la fibra del plan?'])
            ->assertStatus(429)
            ->assertJsonPath('success', false)
            ->assertJsonPath('retry_after', 30)
            ->assertJsonFragment(['message' => 'Groq alcanzó temporalmente el límite de solicitudes o tokens. Espera un momento y vuelve a intentarlo; el plan no fue modificado.']);

        $this->assertSame('sugerido', $plan->fresh()->estado_plan);
    }

    public function test_pregunta_profesional_vacia_devuelve_validacion_clara(): void
    {
        $plan = $this->plan();

        $this->actingAs($this->usuarioConRol('nutricionista'))
            ->postJson(route('nutricionista.planes.copiloto', $plan), ['accion' => 'consulta', 'pregunta' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('pregunta');
    }

    private function respuesta(): CreateResponse
    {
        return CreateResponse::fake([
            'model' => 'openai/gpt-oss-20b',
            'choices' => [[
                'index' => 0,
                'message' => ['role' => 'assistant', 'content' => json_encode([
                    'titulo' => 'Auditoría del plan',
                    'resumen' => 'Plan revisado sin aplicar cambios.',
                    'hallazgos' => ['Distribución revisable.'],
                    'recomendaciones' => ['Validar con la nutricionista.'],
                    'alertas' => [],
                    'alternativas' => [],
                ])],
                'finish_reason' => 'stop',
            ]],
        ]);
    }

    private function plan(): PlanAlimentario
    {
        $paciente = Paciente::query()->create([
            'user_id' => User::factory()->create()->getKey(),
            'nombres' => 'Paciente', 'apellido_paterno' => 'Copiloto',
            'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1992-01-01', 'sexo' => 'femenino', 'estado' => 'activo',
        ]);

        return PlanAlimentario::query()->create([
            'id_paciente' => $paciente->getKey(),
            'nombre' => 'Plan de prueba', 'duracion_dias' => 7,
            'estado_plan' => 'sugerido', 'estado' => 'activo',
        ]);
    }

    private function usuarioConRol(string $nombre): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => $nombre], ['descripcion' => ucfirst($nombre), 'estado' => 'activo']);
        $usuario = User::factory()->create(['estado' => 'activo']);
        UserRole::query()->create(['user_id' => $usuario->getKey(), 'id_rol' => $rol->getKey(), 'estado' => 'activo']);

        return $usuario;
    }
}
