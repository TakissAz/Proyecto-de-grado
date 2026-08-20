<?php

namespace Tests\Feature\Nutricion;

use App\Models\Alimento;
use App\Models\ComidaPlanAlimentario;
use App\Models\ConsultaNutricional;
use App\Models\DiaPlanAlimentario;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\RequerimientoNutricional;
use App\Models\User;
use App\Services\Nutricion\CalculadoraTotalesPlanAlimentarioService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanAlimentarioStructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_puede_crear_plan_relacionado_a_paciente(): void
    {
        $paciente = $this->paciente();
        $plan = $this->plan($paciente);

        $this->assertTrue($plan->exists);
        $this->assertTrue($plan->paciente->is($paciente));
    }

    public function test_plan_puede_tener_siete_dias(): void
    {
        $plan = $this->plan($this->paciente());
        foreach (range(1, 7) as $numero) {
            $plan->dias()->create(['numero_dia' => $numero, 'nombre_dia' => "Día {$numero}"]);
        }

        $this->assertCount(7, $plan->dias);
    }

    public function test_dia_puede_tener_comidas(): void
    {
        $dia = $this->dia();
        $comida = $dia->comidas()->create(['tipo_comida' => 'desayuno']);

        $this->assertTrue($comida->dia->is($dia));
        $this->assertCount(1, $dia->comidas);
    }

    public function test_comida_puede_tener_componente_tipo_alimento(): void
    {
        $comida = $this->comida();
        $alimento = Alimento::query()->create([
            'nombre' => 'Avena', 'grupo_alimentario' => 'cereales',
            'unidad_base' => 'g', 'cantidad_base' => 100, 'calorias' => 389,
            'proteinas' => 16.9, 'carbohidratos' => 66.3, 'grasas' => 6.9,
        ]);
        $componente = $comida->componentes()->create([
            'tipo_componente' => 'alimento', 'id_alimento' => $alimento->getKey(),
            'cantidad' => 40, 'unidad' => 'g',
        ]);

        $this->assertTrue($componente->alimento->is($alimento));
    }

    public function test_comida_puede_tener_componente_tipo_receta(): void
    {
        $comida = $this->comida();
        $receta = Receta::query()->create([
            'nombre' => 'Ensalada completa', 'tipo_comida' => 'almuerzo', 'porciones' => 1,
        ]);
        $componente = $comida->componentes()->create([
            'tipo_componente' => 'receta', 'id_receta' => $receta->getKey(),
            'cantidad' => 1, 'unidad' => 'porción',
        ]);

        $this->assertTrue($componente->receta->is($receta));
    }

    public function test_comida_puede_tener_componente_tipo_manual(): void
    {
        $componente = $this->comida()->componentes()->create([
            'tipo_componente' => 'manual', 'nombre_manual' => 'Infusión sin azúcar',
            'cantidad' => 1, 'unidad' => 'taza',
        ]);

        $this->assertSame('Infusión sin azúcar', $componente->nombre_manual);
        $this->assertNull($componente->id_alimento);
        $this->assertNull($componente->id_receta);
    }

    public function test_calculadora_recalcula_totales_de_comida(): void
    {
        $comida = $this->comida();
        $comida->componentes()->create($this->aporte(200, 10, 20, 8, 5));
        $comida->componentes()->create($this->aporte(100, 5, 12, 3, 2));
        $comida->componentes()->create(array_merge(
            $this->aporte(999, 99, 99, 99, 99),
            ['estado' => 'inactivo']
        ));

        $resultado = $this->calculadora()->recalcularComida($comida);

        $this->assertSame('300.00', $resultado->calorias_totales);
        $this->assertSame('15.00', $resultado->proteinas_totales);
        $this->assertSame('32.00', $resultado->carbohidratos_totales);
        $this->assertSame('11.00', $resultado->grasas_totales);
        $this->assertSame('7.00', $resultado->fibra_total);
    }

    public function test_calculadora_recalcula_totales_de_dia(): void
    {
        $dia = $this->dia();
        $dia->comidas()->create($this->totales('desayuno', 400, 20, 40, 15, 8));
        $dia->comidas()->create($this->totales('almuerzo', 600, 30, 60, 20, 10));
        $dia->comidas()->create(array_merge(
            $this->totales('cena', 900, 90, 90, 90, 90),
            ['estado' => 'inactivo']
        ));

        $resultado = $this->calculadora()->recalcularDia($dia);

        $this->assertSame('1000.00', $resultado->calorias_totales);
        $this->assertSame('50.00', $resultado->proteinas_totales);
        $this->assertSame('18.00', $resultado->fibra_total);
    }

    public function test_calculadora_recalcula_totales_de_plan(): void
    {
        $plan = $this->plan($this->paciente());
        $plan->dias()->create($this->totalesDia(1, 1500, 100, 140, 55, 28));
        $plan->dias()->create($this->totalesDia(2, 1600, 110, 150, 60, 30));
        $plan->dias()->create(array_merge(
            $this->totalesDia(3, 9999, 999, 999, 999, 999),
            ['estado' => 'inactivo']
        ));

        $resultado = $this->calculadora()->recalcularPlan($plan);

        $this->assertSame('3100.00', $resultado->calorias_totales);
        $this->assertSame('210.00', $resultado->proteinas_totales);
        $this->assertSame('58.00', $resultado->fibra_total);
        $this->assertSame('0.00', $resultado->calorias_objetivo ?? '0.00');
    }

    public function test_plan_se_relaciona_con_recomendacion_experta(): void
    {
        $paciente = $this->paciente();
        $recomendacion = RecomendacionNutricionalExperta::query()->create([
            'id_paciente' => $paciente->getKey(), 'estado_validacion_experta' => 'aprobado',
        ]);
        $plan = $this->plan($paciente, [
            'id_recomendacion_nutricional_experta' => $recomendacion->getKey(),
        ]);

        $this->assertTrue($plan->recomendacionNutricionalExperta->is($recomendacion));
        $this->assertTrue($recomendacion->planesAlimentarios()->first()->is($plan));
    }

    public function test_plan_se_relaciona_con_requerimiento_nutricional(): void
    {
        $paciente = $this->paciente();
        $nutricionista = User::factory()->create();
        $requerimiento = $this->requerimiento($paciente, $nutricionista);
        $plan = $this->plan($paciente, [
            'id_requerimiento_nutricional' => $requerimiento->getKey(),
        ]);

        $this->assertTrue($plan->requerimientoNutricional->is($requerimiento));
        $this->assertTrue($requerimiento->planesAlimentarios()->first()->is($plan));
    }

    private function calculadora(): CalculadoraTotalesPlanAlimentarioService
    {
        return app(CalculadoraTotalesPlanAlimentarioService::class);
    }

    private function paciente(): Paciente
    {
        return Paciente::query()->create([
            'user_id' => User::factory()->create()->getKey(), 'nombres' => 'Paciente',
            'apellido_paterno' => 'Plan', 'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1990-01-01', 'sexo' => 'femenino', 'estado' => 'activo',
        ]);
    }

    private function plan(Paciente $paciente, array $extra = []): PlanAlimentario
    {
        return PlanAlimentario::query()->create($extra + [
            'id_paciente' => $paciente->getKey(), 'nombre' => 'Plan semanal',
            'duracion_dias' => 7, 'estado_plan' => 'borrador', 'estado' => 'activo',
        ]);
    }

    private function dia(): DiaPlanAlimentario
    {
        return $this->plan($this->paciente())->dias()->create(['numero_dia' => 1]);
    }

    private function comida(): ComidaPlanAlimentario
    {
        return $this->dia()->comidas()->create(['tipo_comida' => 'desayuno']);
    }

    private function aporte(float $kcal, float $p, float $c, float $g, float $f): array
    {
        return ['tipo_componente' => 'manual', 'nombre_manual' => 'Componente',
            'calorias' => $kcal, 'proteinas' => $p, 'carbohidratos' => $c,
            'grasas' => $g, 'fibra' => $f, 'estado' => 'activo'];
    }

    private function totales(string $tipo, float $kcal, float $p, float $c, float $g, float $f): array
    {
        return ['tipo_comida' => $tipo, 'calorias_totales' => $kcal,
            'proteinas_totales' => $p, 'carbohidratos_totales' => $c,
            'grasas_totales' => $g, 'fibra_total' => $f, 'estado' => 'activo'];
    }

    private function totalesDia(int $numero, float $kcal, float $p, float $c, float $g, float $f): array
    {
        return ['numero_dia' => $numero, 'calorias_totales' => $kcal,
            'proteinas_totales' => $p, 'carbohidratos_totales' => $c,
            'grasas_totales' => $g, 'fibra_total' => $f, 'estado' => 'activo'];
    }

    private function requerimiento(Paciente $paciente, User $nutricionista): RequerimientoNutricional
    {
        $consulta = ConsultaNutricional::query()->create([
            'id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->getKey(),
            'fecha_consulta' => '2026-08-18', 'estado' => true,
        ]);
        $evaluacion = EvaluacionNutricional::query()->create([
            'id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->getKey(),
            'id_consulta_nutricional' => $consulta->getKey(), 'fecha_evaluacion' => '2026-08-18',
            'peso' => 70, 'talla' => 1.65, 'estado' => true,
        ]);
        return RequerimientoNutricional::query()->create([
            'id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->getKey(),
            'id_evaluacion_nutricional' => $evaluacion->getKey(), 'fecha_calculo' => '2026-08-18',
            'peso_referencia' => 70, 'talla_referencia' => 1.65, 'factor_actividad' => 1.2,
            'tmb' => 1400, 'get' => 1680, 'calorias_objetivo' => 1500,
            'proteinas_diarias' => 110, 'carbohidratos_diarios' => 130,
            'grasas_diarias' => 55, 'fibra_diaria' => 30, 'estado' => true,
        ]);
    }
}
