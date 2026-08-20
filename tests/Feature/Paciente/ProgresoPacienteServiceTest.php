<?php

namespace Tests\Feature\Paciente;

use App\Models\ComidaPlanAlimentario;
use App\Models\ConsultaNutricional;
use App\Models\DiaPlanAlimentario;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\ObjetivoNutricional;
use App\Models\SeguimientoComida;
use App\Models\User;
use App\Services\Paciente\ProgresoPacienteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgresoPacienteServiceTest extends TestCase
{
    use RefreshDatabase;

    private Paciente $paciente;
    private User $nutricionista;
    private ConsultaNutricional $consulta;

    protected function setUp(): void
    {
        parent::setUp();
        $this->nutricionista = User::factory()->create();
        $usuarioPaciente = User::factory()->create();
        $this->paciente = Paciente::query()->create(['user_id' => $usuarioPaciente->getKey(), 'nombres' => 'Paciente', 'apellido_paterno' => 'Progreso', 'ci' => 'PR-001', 'fecha_nacimiento' => '1990-01-01', 'sexo' => 'femenino', 'estado' => 'activo']);
        $this->consulta = ConsultaNutricional::query()->create(['id_paciente' => $this->paciente->getKey(), 'id_nutricionista' => $this->nutricionista->getKey(), 'fecha_consulta' => '2026-08-01']);
    }

    public function test_devuelve_resumen_controlado_si_no_hay_evaluaciones(): void
    {
        $resumen = $this->servicio()->obtenerResumen($this->paciente);
        $this->assertNull($resumen['evaluacion']['peso_actual']);
        $this->assertSame('Aún no tienes evaluaciones nutricionales registradas.', $resumen['mensaje']);
    }

    public function test_calcula_peso_inicial_y_actual_en_orden_cronologico(): void
    {
        $this->evaluaciones();
        $evaluacion = $this->servicio()->obtenerResumen($this->paciente)['evaluacion'];
        $this->assertSame(72.5, $evaluacion['peso_inicial']);
        $this->assertSame(69.8, $evaluacion['peso_actual']);
    }

    public function test_calcula_cambio_de_peso(): void
    {
        $this->evaluaciones();
        $this->assertSame(-2.7, $this->servicio()->obtenerResumen($this->paciente)['evaluacion']['cambio_peso']);
    }

    public function test_calcula_imc_actual_desde_peso_y_talla_si_no_esta_guardado(): void
    {
        $this->evaluaciones();
        $this->assertSame(26.6, $this->servicio()->obtenerResumen($this->paciente)['evaluacion']['imc_actual']);
    }

    public function test_calcula_cintura_inicial_actual_y_cambio(): void
    {
        $this->evaluaciones();
        $evaluacion = $this->servicio()->obtenerResumen($this->paciente)['evaluacion'];
        $this->assertSame(92.0, $evaluacion['cintura_inicial']);
        $this->assertSame(88.0, $evaluacion['cintura_actual']);
        $this->assertSame(-4.0, $evaluacion['cambio_cintura']);
    }

    public function test_calcula_adherencia_con_seguimientos_del_plan(): void
    {
        $plan = $this->planConComidas(4);
        $comidas = $plan->dias->first()->comidas;
        foreach ([['completada', null], ['parcial', 60], ['reemplazada', null]] as $i => [$estado, $porcentaje]) {
            SeguimientoComida::query()->create(['id_paciente' => $this->paciente->getKey(), 'id_plan_alimentario' => $plan->getKey(), 'id_dia_plan_alimentario' => $plan->dias->first()->getKey(), 'id_comida_plan_alimentario' => $comidas[$i]->getKey(), 'fecha_seguimiento' => '2026-08-19', 'estado_cumplimiento' => $estado, 'porcentaje_consumido' => $porcentaje]);
        }
        $adherencia = $this->servicio()->obtenerResumen($this->paciente, $plan)['adherencia'];
        $this->assertSame(52.5, $adherencia['porcentaje_adherencia']);
        $this->assertSame(1, $adherencia['pendientes']);
    }

    public function test_no_falla_sin_plan_ni_seguimientos(): void
    {
        $resumen = $this->servicio()->obtenerResumen($this->paciente, null);
        $this->assertNull($resumen['plan']);
        $this->assertSame(0.0, $resumen['adherencia']['porcentaje_adherencia']);
    }

    public function test_incluye_objetivo_actual_y_metas_del_plan_como_respaldo(): void
    {
        ObjetivoNutricional::query()->create(['id_paciente' => $this->paciente->getKey(), 'id_nutricionista' => $this->nutricionista->getKey(), 'id_consulta_nutricional' => $this->consulta->getKey(), 'objetivo_principal' => 'perdida_de_peso', 'estado' => true]);
        $plan = $this->planConComidas(1);
        $plan->update(['calorias_objetivo' => 1700, 'proteinas_objetivo' => 120, 'carbohidratos_objetivo' => 150, 'grasas_objetivo' => 60, 'fibra_objetivo' => 25]);
        $objetivo = $this->servicio()->obtenerResumen($this->paciente, $plan->fresh('dias.comidas'))['objetivo'];
        $this->assertSame('perdida_de_peso', $objetivo['objetivo_principal']);
        $this->assertSame(1700.0, $objetivo['calorias_objetivo']);
        $this->assertSame(120.0, $objetivo['proteinas_objetivo']);
    }

    private function evaluaciones(): void
    {
        foreach ([['2026-07-01', 72.5, 1.62, 92, 105], ['2026-08-15', 69.8, 1.62, 88, 104]] as [$fecha, $peso, $talla, $cintura, $cadera]) {
            EvaluacionNutricional::query()->create(['id_paciente' => $this->paciente->getKey(), 'id_nutricionista' => $this->nutricionista->getKey(), 'id_consulta_nutricional' => $this->consulta->getKey(), 'fecha_evaluacion' => $fecha, 'peso' => $peso, 'talla' => $talla, 'circunferencia_cintura' => $cintura, 'circunferencia_cadera' => $cadera, 'estado' => true]);
        }
    }

    private function planConComidas(int $cantidad): PlanAlimentario
    {
        $plan = PlanAlimentario::query()->create(['id_paciente' => $this->paciente->getKey(), 'nombre' => 'Plan progreso', 'estado_plan' => 'activo', 'fecha_inicio' => '2026-08-18', 'fecha_fin' => '2026-08-24', 'estado' => 'activo']);
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario' => $plan->getKey(), 'numero_dia' => 1]);
        foreach (range(1, $cantidad) as $orden) ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario' => $dia->getKey(), 'tipo_comida' => "comida_{$orden}", 'orden' => $orden]);
        return $plan->load('dias.comidas');
    }

    private function servicio(): ProgresoPacienteService { return app(ProgresoPacienteService::class); }
}
