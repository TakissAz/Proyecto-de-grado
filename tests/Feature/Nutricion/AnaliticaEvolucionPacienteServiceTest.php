<?php

namespace Tests\Feature\Nutricion;

use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\ConsultaNutricional;
use App\Models\DiaPlanAlimentario;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Receta;
use App\Models\SeguimientoComida;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use App\Services\Nutricion\AnaliticaEvolucionPacienteService;
use App\Services\Nutricion\PerfilNutricionalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnaliticaEvolucionPacienteServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_construye_evolucion_antropometrica_y_calcula_cambios(): void
    {
        [$paciente, $nutricionista, $consulta] = $this->pacienteConConsulta();
        $this->evaluacion($paciente, $nutricionista, $consulta, '2026-07-01', 80, 31.25, 98);
        $this->evaluacion($paciente, $nutricionista, $consulta, '2026-08-01', 76, 29.69, 92);

        $datos = $this->analitica($paciente)['evolucion_antropometrica'];

        $this->assertCount(2, $datos['registros']);
        $this->assertSame(80.0, $datos['resumen']['peso_inicial']);
        $this->assertSame(76.0, $datos['resumen']['peso_actual']);
        $this->assertSame(-4.0, $datos['resumen']['cambio_peso']);
        $this->assertSame(-1.56, $datos['resumen']['cambio_imc']);
        $this->assertSame(-6.0, $datos['resumen']['cambio_cintura']);
    }

    public function test_resume_adherencia_por_plan_y_por_tipo_de_comida(): void
    {
        $paciente = $this->pacienteConConsulta()[0];
        [$plan, $comidas] = $this->planConCuatroComidas($paciente);
        $this->seguimiento($paciente, $plan, $comidas['desayuno'], 'no_realizada');
        $this->seguimiento($paciente, $plan, $comidas['almuerzo'], 'completada');
        $this->seguimiento($paciente, $plan, $comidas['merienda'], 'parcial', ['porcentaje_consumido' => 50]);
        $this->seguimiento($paciente, $plan, $comidas['cena'], 'completada');

        $datos = $this->analitica($paciente);

        $this->assertCount(1, $datos['evolucion_adherencia']['por_plan']);
        $this->assertSame(62.5, $datos['evolucion_adherencia']['resumen']['promedio_adherencia']);
        $this->assertSame(0.0, collect($datos['cumplimiento_por_tipo_comida'])->firstWhere('tipo_comida', 'desayuno')['porcentaje_adherencia']);
        $this->assertSame(100.0, collect($datos['cumplimiento_por_tipo_comida'])->firstWhere('tipo_comida', 'cena')['porcentaje_adherencia']);
    }

    public function test_identifica_recetas_aceptadas_y_problematicas(): void
    {
        $paciente = $this->pacienteConConsulta()[0];
        [$plan, $comidas] = $this->planConCuatroComidas($paciente);
        $this->seguimiento($paciente, $plan, $comidas['almuerzo'], 'completada', ['nivel_agrado' => 'me_gusto', 'desea_repetir' => true]);
        $this->seguimiento($paciente, $plan, $comidas['cena'], 'completada', ['nivel_agrado' => 'no_me_gusto', 'presento_molestia' => true, 'intensidad_molestia' => 'severa']);

        $datos = $this->analitica($paciente);

        $this->assertSame('Receta almuerzo', $datos['recetas_aceptadas'][0]['nombre']);
        $this->assertSame('Receta cena', $datos['recetas_problematicas'][0]['nombre']);
        $this->assertContains('no_me_gusto', $datos['recetas_problematicas'][0]['motivos']);
        $this->assertContains('molestia', $datos['recetas_problematicas'][0]['motivos']);
    }

    public function test_detecta_sintomas_frecuentes_y_genera_recomendaciones(): void
    {
        $paciente = $this->pacienteConConsulta()[0];
        foreach (range(1, 3) as $dia) {
            SeguimientoSintomaPaciente::query()->create([
                'id_paciente' => $paciente->getKey(), 'fecha_registro' => today()->subDays($dia),
                'hambre_nocturna' => true, 'ansiedad_por_comida' => 'alta', 'antojos_dulces' => true,
                'registrado_por' => $paciente->user_id,
            ]);
        }

        $datos = $this->analitica($paciente);

        $this->assertTrue($datos['analitica_sintomas']['hambre_nocturna_frecuente']);
        $this->assertTrue($datos['analitica_sintomas']['ansiedad_comida_frecuente']);
        $this->assertNotEmpty($datos['analitica_sintomas']['recomendaciones_sintomas']);
        $this->assertTrue(collect($datos['alertas'])->contains('tipo', 'sintomas'));
    }

    public function test_genera_alertas_por_baja_adherencia_y_desayuno(): void
    {
        $paciente = $this->pacienteConConsulta()[0];
        [$plan, $comidas] = $this->planConCuatroComidas($paciente);
        foreach ($comidas as $comida) {
            $this->seguimiento($paciente, $plan, $comida, 'no_realizada');
        }

        $alertas = collect($this->analitica($paciente)['alertas']);

        $this->assertTrue($alertas->contains('tipo', 'adherencia'));
        $this->assertTrue($alertas->contains('tipo', 'desayuno'));
    }

    public function test_perfil_nutricional_expone_la_analitica(): void
    {
        $paciente = $this->pacienteConConsulta()[0];

        $datos = app(PerfilNutricionalService::class)->analiticaEvolucion($paciente);

        $this->assertArrayHasKey('evolucion_antropometrica', $datos);
        $this->assertArrayHasKey('evolucion_adherencia', $datos);
        $this->assertArrayHasKey('recomendaciones_siguiente_plan', $datos);
    }

    public function test_tolera_paciente_sin_evaluaciones_ni_planes_ni_seguimientos(): void
    {
        $paciente = $this->pacienteConConsulta()[0];

        $datos = $this->analitica($paciente);

        $this->assertSame(0, $datos['evolucion_antropometrica']['resumen']['total_evaluaciones']);
        $this->assertSame([], $datos['evolucion_adherencia']['por_plan']);
        $this->assertSame(0, $datos['analitica_sintomas']['total_registros']);
        $this->assertSame([], $datos['recetas_aceptadas']);
        $this->assertSame([], $datos['recetas_problematicas']);
    }

    private function analitica(Paciente $paciente): array
    {
        return app(AnaliticaEvolucionPacienteService::class)->obtenerAnalitica($paciente);
    }

    private function pacienteConConsulta(): array
    {
        $nutricionista = User::factory()->create();
        $usuario = User::factory()->create();
        $paciente = Paciente::query()->create([
            'user_id' => $usuario->getKey(), 'nombres' => 'Paciente', 'apellido_paterno' => 'Analitica',
            'ci' => fake()->unique()->numerify('########'), 'fecha_nacimiento' => '1995-01-01',
            'sexo' => 'femenino', 'estado' => 'activo',
        ]);
        $consulta = ConsultaNutricional::query()->create([
            'id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->getKey(),
            'fecha_consulta' => today(), 'estado_consulta' => 'abierta', 'estado' => true,
        ]);

        return [$paciente, $nutricionista, $consulta];
    }

    private function evaluacion(Paciente $paciente, User $nutricionista, ConsultaNutricional $consulta, string $fecha, float $peso, float $imc, float $cintura): void
    {
        EvaluacionNutricional::query()->create([
            'id_paciente' => $paciente->getKey(), 'id_nutricionista' => $nutricionista->getKey(),
            'id_consulta_nutricional' => $consulta->getKey(), 'fecha_evaluacion' => $fecha,
            'peso' => $peso, 'talla' => 1.60, 'imc' => $imc, 'circunferencia_cintura' => $cintura,
            'estado' => true,
        ]);
    }

    private function planConCuatroComidas(Paciente $paciente): array
    {
        $plan = PlanAlimentario::query()->create([
            'id_paciente' => $paciente->getKey(), 'nombre' => 'Plan analizado', 'fecha_inicio' => today(),
            'estado_plan' => 'activo', 'duracion_dias' => 7, 'estado' => 'activo',
        ]);
        $dia = DiaPlanAlimentario::query()->create([
            'id_plan_alimentario' => $plan->getKey(), 'numero_dia' => 1, 'nombre_dia' => 'Dia 1', 'estado' => 'activo',
        ]);
        $comidas = [];
        foreach (['desayuno', 'almuerzo', 'merienda', 'cena'] as $orden => $tipo) {
            $receta = Receta::query()->create([
                'nombre' => 'Receta '.$tipo, 'tipo_comida' => $tipo, 'porciones' => 1,
                'calorias_totales' => 300, 'proteinas_totales' => 20, 'carbohidratos_totales' => 30,
                'grasas_totales' => 10, 'fibra_total' => 5, 'estado' => 'activo',
            ]);
            $comida = ComidaPlanAlimentario::query()->create([
                'id_dia_plan_alimentario' => $dia->getKey(), 'tipo_comida' => $tipo,
                'nombre_comida' => ucfirst($tipo), 'orden' => $orden + 1, 'estado' => 'activo',
            ]);
            ComponenteComidaPlan::query()->create([
                'id_comida_plan_alimentario' => $comida->getKey(), 'tipo_componente' => 'receta',
                'id_receta' => $receta->getKey(), 'cantidad' => 1, 'unidad' => 'porcion', 'orden' => 1, 'estado' => 'activo',
            ]);
            $comidas[$tipo] = $comida;
        }

        return [$plan, $comidas];
    }

    private function seguimiento(Paciente $paciente, PlanAlimentario $plan, ComidaPlanAlimentario $comida, string $estado, array $extra = []): void
    {
        SeguimientoComida::query()->create(array_merge([
            'id_paciente' => $paciente->getKey(), 'id_plan_alimentario' => $plan->getKey(),
            'id_dia_plan_alimentario' => $comida->id_dia_plan_alimentario,
            'id_comida_plan_alimentario' => $comida->getKey(), 'fecha_seguimiento' => today(),
            'estado_cumplimiento' => $estado, 'porcentaje_consumido' => $estado === 'completada' ? 100 : null,
            'presento_molestia' => false, 'ansiedad_posterior' => false, 'consiguio_ingredientes' => true,
        ], $extra));
    }
}
