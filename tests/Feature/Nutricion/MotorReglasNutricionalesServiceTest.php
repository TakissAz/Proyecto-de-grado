<?php

namespace Tests\Feature\Nutricion;

use App\Models\ReglaNutricional;
use App\Services\Nutricion\MotorReglasNutricionalesService;
use Database\Seeders\ReglasNutricionalesSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class MotorReglasNutricionalesServiceTest extends TestCase
{
    use DatabaseTransactions;

    private MotorReglasNutricionalesService $motor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ReglasNutricionalesSeeder::class);
        $this->motor = app(MotorReglasNutricionalesService::class);
    }

    public function test_regla_de_mayor_prioridad_prevalece_sobre_general(): void
    {
        ReglaNutricional::create([
            'codigo' => 'TEST-PRIORIDAD',
            'nombre' => 'Ajuste prioritario de prueba',
            'tipo_regla' => 'ajuste_calorico',
            'condicion_campo' => 'objetivo_principal',
            'condicion_operador' => '=',
            'condicion_valor' => 'perdida_peso',
            'resultado' => ['ajuste_calorico' => -450],
            'prioridad' => 90,
            'estado' => true,
        ]);

        $resultado = $this->motor->evaluar([
            'objetivo_principal' => 'perdida_peso',
        ]);

        $this->assertSame(-450, $resultado['ajuste_calorico']);
        $this->assertContains(
            'TEST-PRIORIDAD',
            collect($resultado['reglas_aplicadas'])->pluck('codigo')->all(),
        );
        $this->assertNotContains(
            'RN-001',
            collect($resultado['reglas_aplicadas'])->pluck('codigo')->all(),
        );
    }

    public function test_regla_inactiva_no_se_aplica(): void
    {
        ReglaNutricional::create([
            'codigo' => 'TEST-INACTIVA',
            'nombre' => 'Ajuste inactivo de prueba',
            'tipo_regla' => 'ajuste_calorico',
            'condicion_campo' => 'objetivo_principal',
            'condicion_operador' => '=',
            'condicion_valor' => 'perdida_peso',
            'resultado' => ['ajuste_calorico' => -999],
            'prioridad' => 100,
            'estado' => false,
        ]);

        $resultado = $this->motor->evaluar([
            'objetivo_principal' => 'perdida_peso',
        ]);

        $this->assertSame(-300, $resultado['ajuste_calorico']);
        $this->assertNotContains(
            'TEST-INACTIVA',
            collect($resultado['reglas_aplicadas'])->pluck('codigo')->all(),
        );
    }

    public function test_default_solo_aplica_si_no_hay_regla_especifica(): void
    {
        $resultado = $this->motor->evaluar([
            'objetivo_principal' => null,
        ]);
        $codigos = collect($resultado['reglas_aplicadas'])->pluck('codigo')->all();

        $this->assertSame(0, $resultado['ajuste_calorico']);
        $this->assertContains('RN-007', $codigos);
        $this->assertContains('RN-010', $codigos);
    }
}
