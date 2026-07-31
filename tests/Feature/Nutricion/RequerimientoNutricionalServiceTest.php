<?php

namespace Tests\Feature\Nutricion;

use App\Models\ConsultaNutricional;
use App\Models\EvaluacionNutricional;
use App\Models\ObjetivoNutricional;
use App\Models\Paciente;
use App\Models\User;
use App\Services\Nutricion\RequerimientoNutricionalService;
use Carbon\Carbon;
use Database\Seeders\ReglasNutricionalesSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RequerimientoNutricionalServiceTest extends TestCase
{
    use DatabaseTransactions;

    private RequerimientoNutricionalService $service;
    private User $nutricionista;
    private Paciente $paciente;
    private ConsultaNutricional $consulta;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-07-23 10:00:00');
        $this->seed(ReglasNutricionalesSeeder::class);

        $this->service = app(RequerimientoNutricionalService::class);
        $this->nutricionista = User::factory()->create();
        $usuarioPaciente = User::factory()->create();
        $this->paciente = Paciente::create([
            'user_id' => $usuarioPaciente->id,
            'nombres' => 'Paciente',
            'apellido_paterno' => 'Prueba',
            'ci' => 'QA-RN-'.uniqid(),
            'fecha_nacimiento' => '2001-07-23',
            'sexo' => 'femenino',
            'estado' => 'activo',
        ]);
        $this->consulta = ConsultaNutricional::create([
            'id_paciente' => $this->paciente->id_paciente,
            'id_nutricionista' => $this->nutricionista->id,
            'fecha_consulta' => now()->toDateString(),
            'estado_consulta' => 'abierta',
            'estado' => true,
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_calcula_correctamente_con_datos_completos(): void
    {
        $evaluacion = $this->crearEvaluacion(70, 1.70, 'moderado');
        $objetivo = $this->crearObjetivo('perdida_peso');

        $requerimiento = $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);

        $this->assertSame($evaluacion->id_evaluacion_nutricional, $requerimiento->id_evaluacion_nutricional);
        $this->assertSame($objetivo->id_objetivo_nutricional, $requerimiento->id_objetivo_nutricional);
        $this->assertSame(25, $requerimiento->edad_referencia);
        $this->assertEqualsWithDelta(1.55, (float) $requerimiento->factor_actividad, 0.001);
        $this->assertEqualsWithDelta(1476.50, (float) $requerimiento->tmb, 0.01);
        $this->assertEqualsWithDelta(2288.58, (float) $requerimiento->get, 0.01);
        $this->assertEqualsWithDelta(-300, (float) $requerimiento->ajuste_calorico, 0.01);
        $this->assertEqualsWithDelta(1988.58, (float) $requerimiento->calorias_objetivo, 0.01);
        $this->assertEqualsWithDelta(149.14, (float) $requerimiento->proteinas_diarias, 0.01);
        $this->assertEqualsWithDelta(174.00, (float) $requerimiento->carbohidratos_diarios, 0.01);
        $this->assertEqualsWithDelta(77.33, (float) $requerimiento->grasas_diarias, 0.01);
        $this->assertEqualsWithDelta(25, (float) $requerimiento->fibra_diaria, 0.01);
        $this->assertContains('RN-001', collect($requerimiento->reglas_aplicadas)->pluck('codigo')->all());
        $this->assertContains('RN-008', collect($requerimiento->reglas_aplicadas)->pluck('codigo')->all());
    }

    public function test_usa_factor_sedentario_si_nivel_actividad_es_null(): void
    {
        $this->crearEvaluacion(70, 1.70, null);

        $requerimiento = $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);

        $this->assertNull($requerimiento->nivel_actividad);
        $this->assertEqualsWithDelta(1.20, (float) $requerimiento->factor_actividad, 0.001);
        $this->assertEqualsWithDelta(1771.80, (float) $requerimiento->get, 0.01);
    }

    public function test_lanza_error_si_no_existe_evaluacion_activa(): void
    {
        $this->expectException(ValidationException::class);

        $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);
    }

    #[DataProvider('datosAntropometricosIncompletos')]
    public function test_lanza_error_si_falta_peso_o_talla(?float $peso, ?float $talla): void
    {
        $this->crearEvaluacion($peso, $talla, 'moderado');

        $this->expectException(ValidationException::class);

        $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);
    }

    public static function datosAntropometricosIncompletos(): array
    {
        return [
            'sin peso' => [null, 1.70],
            'sin talla' => [70, null],
        ];
    }

    public function test_lanza_error_si_talla_es_cero(): void
    {
        $this->crearEvaluacion(70, 0, 'moderado');

        $this->expectException(ValidationException::class);

        $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);
    }

    public function test_calcula_ajuste_cero_si_no_existe_objetivo(): void
    {
        $this->crearEvaluacion(70, 1.70, 'moderado');

        $requerimiento = $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);

        $this->assertNull($requerimiento->id_objetivo_nutricional);
        $this->assertEqualsWithDelta(0, (float) $requerimiento->ajuste_calorico, 0.01);
        $this->assertEqualsWithDelta((float) $requerimiento->get, (float) $requerimiento->calorias_objetivo, 0.01);
        $codigos = collect($requerimiento->reglas_aplicadas)->pluck('codigo')->all();
        $this->assertContains('RN-007', $codigos);
        $this->assertContains('RN-010', $codigos);
    }

    public function test_mantenimiento_aplica_sus_reglas_y_distribucion(): void
    {
        $this->crearEvaluacion(70, 1.70, 'moderado');
        $this->crearObjetivo('mantenimiento');

        $requerimiento = $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);
        $codigos = collect($requerimiento->reglas_aplicadas)->pluck('codigo')->all();

        $this->assertContains('RN-005', $codigos);
        $this->assertContains('RN-009', $codigos);
        $this->assertEqualsWithDelta(25, (float) $requerimiento->porcentaje_proteinas, 0.01);
        $this->assertEqualsWithDelta(40, (float) $requerimiento->porcentaje_carbohidratos, 0.01);
    }

    public function test_aplica_y_guarda_limite_minimo_calorico(): void
    {
        $this->crearEvaluacion(35, 1.40, 'sedentario');
        $this->crearObjetivo('perdida_peso');

        $requerimiento = $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);
        $codigos = collect($requerimiento->reglas_aplicadas)->pluck('codigo')->all();

        $this->assertEqualsWithDelta(1200, (float) $requerimiento->calorias_objetivo, 0.01);
        $this->assertContains('RN-011', $codigos);
        $this->assertStringContainsString('límite mínimo calórico', $requerimiento->observaciones);
        $this->assertDatabaseHas('requerimientos_nutricionales', [
            'id_requerimiento_nutricional' => $requerimiento->id_requerimiento_nutricional,
        ]);
    }
    public function test_recalcular_crea_un_registro_nuevo_y_conserva_el_anterior(): void
    {
        $this->crearEvaluacion(70, 1.70, 'moderado');
        $primero = $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);

        Carbon::setTestNow('2026-07-24 10:00:00');
        $segundo = $this->service->calcularYCrear($this->paciente, $this->nutricionista->id);
        $ultimo = $this->paciente->requerimientosNutricionales()
            ->where('estado', true)
            ->whereNull('deleted_at')
            ->latest('fecha_calculo')
            ->latest('created_at')
            ->first();

        $this->assertNotSame($primero->id_requerimiento_nutricional, $segundo->id_requerimiento_nutricional);
        $this->assertSame(2, $this->paciente->requerimientosNutricionales()->count());
        $this->assertDatabaseHas('requerimientos_nutricionales', [
            'id_requerimiento_nutricional' => $primero->id_requerimiento_nutricional,
            'deleted_at' => null,
        ]);
        $this->assertSame($segundo->id_requerimiento_nutricional, $ultimo?->id_requerimiento_nutricional);
    }

    private function crearEvaluacion(?float $peso, ?float $talla, ?string $nivelActividad): EvaluacionNutricional
    {
        return EvaluacionNutricional::create([
            'id_paciente' => $this->paciente->id_paciente,
            'id_nutricionista' => $this->nutricionista->id,
            'id_consulta_nutricional' => $this->consulta->id_consulta_nutricional,
            'fecha_evaluacion' => now()->toDateString(),
            'peso' => $peso,
            'talla' => $talla,
            'nivel_actividad' => $nivelActividad,
            'estado' => true,
        ]);
    }

    private function crearObjetivo(string $objetivoPrincipal): ObjetivoNutricional
    {
        return ObjetivoNutricional::create([
            'id_paciente' => $this->paciente->id_paciente,
            'id_nutricionista' => $this->nutricionista->id,
            'id_consulta_nutricional' => $this->consulta->id_consulta_nutricional,
            'objetivo_principal' => $objetivoPrincipal,
            'prioridad' => 'media',
            'estado' => true,
        ]);
    }
}
