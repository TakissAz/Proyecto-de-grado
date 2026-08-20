<?php

namespace Tests\Feature\Nutricion;

use App\Models\Alimento;
use App\Models\ConsultaNutricional;
use App\Models\EvaluacionNutricional;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\RequerimientoNutricional;
use App\Models\Receta;
use App\Models\User;
use App\Services\Nutricion\GeneradorPlanSemanalService;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeneradorPlanSemanalServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_genera_desde_recomendacion_pendiente(): void
    {
        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('aprobada o validada');

        $this->generador()->generarDesdeRecomendacion($this->recomendacion('pendiente'));
    }

    public function test_no_genera_desde_recomendacion_rechazada(): void
    {
        $this->expectException(DomainException::class);

        $this->generador()->generarDesdeRecomendacion($this->recomendacion('rechazado'));
    }

    public function test_genera_desde_recomendacion_aprobada_o_validada(): void
    {
        $aprobado = $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado'));
        $validado = $this->generador()->generarDesdeRecomendacion($this->recomendacion('validado'));

        $this->assertTrue($aprobado->exists);
        $this->assertTrue($validado->exists);
        $this->assertSame(2, PlanAlimentario::query()->count());
    }

    public function test_crea_siete_dias(): void
    {
        $plan = $this->generar();

        $this->assertCount(7, $plan->dias);
        $this->assertSame(range(1, 7), $plan->dias->pluck('numero_dia')->all());
    }

    public function test_crea_solo_cuatro_comidas_por_dia(): void
    {
        $plan = $this->generar();
        $esperadas = ['desayuno', 'almuerzo', 'merienda', 'cena'];

        foreach ($plan->dias as $dia) {
            $this->assertCount(4, $dia->comidas);
            $this->assertSame($esperadas, $dia->comidas->pluck('tipo_comida')->all());
            $this->assertSame(
                ['08:00', '13:00', '16:30', '19:30'],
                $dia->comidas->pluck('hora_sugerida')->map(
                    fn ($hora) => substr((string) $hora, 0, 5)
                )->all()
            );
            $this->assertContains('merienda', $dia->comidas->pluck('tipo_comida')->all());
            $this->assertNotContains('media_manana', $dia->comidas->pluck('tipo_comida')->all());
            $this->assertNotContains('colacion', $dia->comidas->pluck('tipo_comida')->all());
        }
        $this->assertSame(28, $plan->dias->sum(fn ($dia) => $dia->comidas->count()));
    }

    public function test_crea_componentes_para_cada_comida(): void
    {
        $plan = $this->generar();

        foreach ($plan->dias as $dia) {
            foreach ($dia->comidas as $comida) {
                $this->assertCount(1, $comida->componentes);
                $this->assertContains(
                    $comida->componentes->first()->tipo_componente,
                    ['manual', 'receta']
                );
            }
        }
    }

    public function test_plan_queda_en_estado_sugerido(): void
    {
        $this->assertSame('sugerido', $this->generar()->estado_plan);
    }

    public function test_plan_queda_generado_por_sistema_experto(): void
    {
        $this->assertTrue($this->generar()->generado_por_sistema_experto);
    }

    public function test_calcula_fecha_fin_desde_fecha_inicio(): void
    {
        $plan = $this->generador()->generarDesdeRecomendacion(
            $this->recomendacion('aprobado'),
            null,
            ['fecha_inicio' => '2026-09-01']
        );

        $this->assertSame('2026-09-01', $plan->fecha_inicio?->toDateString());
        $this->assertSame('2026-09-07', $plan->fecha_fin?->toDateString());
        $this->assertSame('2026-09-07', $plan->dias->last()->fecha?->toDateString());
    }

    public function test_recalcula_totales_del_plan_con_cuatro_tiempos(): void
    {
        $plan = $this->generar();

        $this->assertSame('1600.00', $plan->dias->first()->calorias_totales);
        $this->assertSame('11200.00', $plan->calorias_totales);
        $this->assertSame('840.00', $plan->proteinas_totales);
        $this->assertSame('980.00', $plan->carbohidratos_totales);
        $this->assertSame('435.54', $plan->grasas_totales);
        $this->assertSame('210.00', $plan->fibra_total);
    }

    public function test_respeta_relacion_con_recomendacion_y_requerimiento(): void
    {
        $paciente = $this->paciente();
        $nutricionista = User::factory()->create();
        $requerimiento = $this->requerimiento($paciente, $nutricionista);
        $recomendacion = $this->recomendacion(
            'aprobado',
            $paciente,
            ['id_requerimiento_nutricional' => $requerimiento->getKey()]
        );

        $plan = $this->generador()->generarDesdeRecomendacion($recomendacion, $nutricionista);

        $this->assertTrue($plan->recomendacionNutricionalExperta->is($recomendacion));
        $this->assertTrue($plan->requerimientoNutricional->is($requerimiento));
        $this->assertTrue($plan->nutricionista->is($nutricionista));
        $this->assertSame($paciente->getKey(), $plan->id_paciente);
    }

    public function test_usa_recetas_compatibles_cuando_existen(): void
    {
        $receta = $this->receta('Avena proteica', 'desayuno', ['Avena']);

        $plan = $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado'));
        $componentes = $plan->dias->flatMap->comidas->flatMap->componentes;

        $this->assertTrue($componentes->contains(
            fn ($componente): bool => $componente->tipo_componente === 'receta'
                && $componente->id_receta === $receta->getKey()
        ));
        $this->assertTrue($componentes->contains(
            fn ($componente): bool => str_contains(
                (string) $componente->observaciones,
                'Única receta compatible disponible para este tiempo de comida.'
            )
        ));
    }

    public function test_no_usa_receta_descartada_por_alergia_y_aplica_fallback(): void
    {
        $receta = $this->receta('Batido con maní', 'desayuno', ['Mantequilla de maní']);
        $recomendacion = $this->recomendacion('aprobado', null, [
            'hechos_utilizados' => ['alergias' => ['maní']],
        ]);

        $plan = $this->generador()->generarDesdeRecomendacion($recomendacion);
        $desayunos = $plan->dias->flatMap->comidas->where('tipo_comida', 'desayuno');

        $this->assertFalse($desayunos->flatMap->componentes->contains('id_receta', $receta->getKey()));
        $this->assertTrue($desayunos->every(
            fn ($comida): bool => $comida->componentes->first()->tipo_componente === 'manual'
        ));
        $this->assertSame(
            'Comida sugerida pendiente de definir por la nutricionista',
            $desayunos->first()->componentes->first()->nombre_manual
        );
    }

    public function test_usa_receta_real_con_tipo_normalizado_y_no_aplica_fallback(): void
    {
        $receta = $this->receta('Merienda desde tabla', '  MERIENDA  ');
        $plan = $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado'));
        $meriendas = $plan->dias->flatMap->comidas->where('tipo_comida', 'merienda');

        $this->assertTrue($meriendas->every(
            fn ($comida): bool => $comida->componentes->first()->tipo_componente === 'receta'
                && $comida->componentes->first()->id_receta === $receta->getKey()
        ));
        $this->assertFalse($meriendas->flatMap->componentes->contains('tipo_componente', 'manual'));
    }

    public function test_no_repite_receta_mas_de_dos_veces_si_hay_alternativas_suficientes(): void
    {
        foreach (range(1, 4) as $numero) {
            $this->receta("Desayuno {$numero}", 'desayuno', [], 390 + $numero, 25, 30, 12, 6);
        }

        $plan = $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado'));
        $usos = $plan->dias->flatMap->comidas
            ->where('tipo_comida', 'desayuno')
            ->flatMap->componentes
            ->where('tipo_componente', 'receta')
            ->countBy('id_receta');

        $this->assertCount(4, $usos);
        $this->assertLessThanOrEqual(2, $usos->max());
        $this->assertSame(7, $usos->sum());
    }

    public function test_con_siete_desayunos_compatibles_genera_siete_recetas_distintas(): void
    {
        foreach (range(1, 7) as $numero) {
            $this->receta("Desayuno diverso {$numero}", 'desayuno', [], 380 + $numero, 24, 32, 11, 6);
        }

        $ids = $this->idsRecetasPorTipo(
            $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado')),
            'desayuno'
        );

        $this->assertCount(7, $ids);
        $this->assertCount(7, array_unique($ids));
    }

    public function test_con_nueve_desayunos_compatibles_genera_siete_distintos(): void
    {
        $this->crearRecetasPorTipo('desayuno', 9);
        $this->assertSieteRecetasDistintas('desayuno');
    }

    public function test_con_diez_almuerzos_compatibles_genera_siete_distintos(): void
    {
        $this->crearRecetasPorTipo('almuerzo', 10);
        $this->assertSieteRecetasDistintas('almuerzo');
    }

    public function test_con_nueve_meriendas_compatibles_genera_siete_distintas(): void
    {
        $this->crearRecetasPorTipo('merienda', 9);
        $this->assertSieteRecetasDistintas('merienda');
    }

    public function test_con_diez_cenas_compatibles_genera_siete_distintas(): void
    {
        $this->crearRecetasPorTipo('cena', 10);
        $this->assertSieteRecetasDistintas('cena');
    }

    public function test_no_repite_receta_en_dias_consecutivos_si_hay_alternativas(): void
    {
        $this->receta('Desayuno alterno uno', 'desayuno');
        $this->receta('Desayuno alterno dos', 'desayuno');
        $ids = $this->idsRecetasPorTipo(
            $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado')),
            'desayuno'
        );

        foreach (array_slice($ids, 1, null, true) as $indice => $id) {
            $this->assertNotSame($ids[$indice - 1], $id);
        }
    }

    public function test_con_dos_recetas_compatibles_alterna_aunque_deba_repetir(): void
    {
        $primera = $this->receta('Merienda alterna uno', 'merienda');
        $segunda = $this->receta('Merienda alterna dos', 'merienda');
        $ids = $this->idsRecetasPorTipo(
            $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado')),
            'merienda'
        );

        $this->assertSame([$primera->getKey(), $segunda->getKey()], array_values(array_unique($ids)));
        foreach (array_slice($ids, 1, null, true) as $indice => $id) {
            $this->assertNotSame($ids[$indice - 1], $id);
        }
    }

    public function test_con_una_receta_repite_y_registra_falta_de_alternativas(): void
    {
        $receta = $this->receta('Cena única compatible', 'cena');
        $plan = $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado'));
        $componentes = $plan->dias->map(
            fn ($dia) => $dia->comidas->firstWhere('tipo_comida', 'cena')->componentes->first()
        );

        $this->assertTrue($componentes->every(fn ($componente) => $componente->id_receta === $receta->getKey()));
        $this->assertStringNotContainsString('Receta repetida', $componentes->first()->observaciones);
        $this->assertTrue($componentes->skip(1)->every(fn ($componente) => str_contains(
            $componente->observaciones,
            'Única receta compatible disponible para este tiempo de comida.'
        )));
    }

    public function test_no_usa_la_misma_receta_dos_veces_en_un_dia(): void
    {
        foreach (['desayuno', 'almuerzo', 'merienda', 'cena'] as $tipo) {
            $this->receta("Receta exclusiva {$tipo}", $tipo);
        }
        $plan = $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado'));

        foreach ($plan->dias as $dia) {
            $ids = $dia->comidas->flatMap->componentes->pluck('id_receta')->filter()->all();
            $this->assertCount(count($ids), array_unique($ids));
        }
    }

    public function test_componente_receta_guarda_fotografia_nutricional_y_trazabilidad(): void
    {
        $receta = $this->receta('Desayuno completo', 'desayuno', ['Huevo'], 410, 28, 32, 14, 7);
        $plan = $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado'));
        $componente = $plan->dias->first()->comidas
            ->firstWhere('tipo_comida', 'desayuno')->componentes->first();

        $this->assertSame($receta->getKey(), $componente->id_receta);
        $this->assertSame('410.00', $componente->calorias);
        $this->assertSame('28.00', $componente->proteinas);
        $this->assertSame('32.00', $componente->carbohidratos);
        $this->assertSame('14.00', $componente->grasas);
        $this->assertSame('7.00', $componente->fibra);
        $this->assertStringContainsString('Puntaje experto:', $componente->observaciones);
        $this->assertStringContainsString('Coincide con el tipo', $componente->observaciones);
    }

    public function test_recetas_insertadas_recalculan_totales_de_comida_dia_y_plan(): void
    {
        $this->receta('Desayuno medido', 'desayuno', [], 400, 30, 35, 12, 8);
        $plan = $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado'));
        $primerDia = $plan->dias->first();
        $desayuno = $primerDia->comidas->firstWhere('tipo_comida', 'desayuno');

        $this->assertSame('400.00', $desayuno->calorias_totales);
        $this->assertSame('30.00', $desayuno->proteinas_totales);
        $this->assertEquals(
            $primerDia->comidas->sum(fn ($comida) => (float) $comida->calorias_totales),
            (float) $primerDia->calorias_totales
        );
        $this->assertEquals(
            $plan->dias->sum(fn ($dia) => (float) $dia->calorias_totales),
            (float) $plan->calorias_totales
        );
    }

    private function generar(): PlanAlimentario
    {
        return $this->generador()->generarDesdeRecomendacion(
            $this->recomendacion('aprobado')
        );
    }

    private function idsRecetasPorTipo(PlanAlimentario $plan, string $tipo): array
    {
        return $plan->dias->map(
            fn ($dia) => $dia->comidas->firstWhere('tipo_comida', $tipo)->componentes->first()->id_receta
        )->all();
    }

    private function crearRecetasPorTipo(string $tipo, int $cantidad): void
    {
        foreach (range(1, $cantidad) as $numero) {
            $this->receta("{$tipo} compatible {$numero}", $tipo, [], 300 + $numero, 24, 30, 10, 6);
        }
    }

    private function assertSieteRecetasDistintas(string $tipo): void
    {
        $ids = $this->idsRecetasPorTipo(
            $this->generador()->generarDesdeRecomendacion($this->recomendacion('aprobado')),
            $tipo
        );

        $this->assertCount(7, $ids);
        $this->assertCount(7, array_unique($ids));
    }

    private function generador(): GeneradorPlanSemanalService
    {
        return app(GeneradorPlanSemanalService::class);
    }

    private function paciente(): Paciente
    {
        return Paciente::query()->create([
            'user_id' => User::factory()->create()->getKey(),
            'nombres' => 'Paciente', 'apellido_paterno' => 'Semanal',
            'ci' => fake()->unique()->numerify('########'),
            'fecha_nacimiento' => '1992-01-01', 'sexo' => 'femenino', 'estado' => 'activo',
        ]);
    }

    private function recomendacion(
        string $estado,
        ?Paciente $paciente = null,
        array $extra = []
    ): RecomendacionNutricionalExperta {
        $paciente ??= $this->paciente();

        return RecomendacionNutricionalExperta::query()->create($extra + [
            'id_paciente' => $paciente->getKey(),
            'enfoque_nutricional_experto' => 'bajo_indice_glucemico_alto_fibra',
            'prioridad_nutricional' => 'control_glucemico',
            'calorias_sugeridas' => 1600,
            'proteinas_porcentaje' => 30,
            'carbohidratos_porcentaje' => 35,
            'grasas_porcentaje' => 35,
            'fibra_sugerida' => 30,
            'restricciones' => [],
            'estado_validacion_experta' => $estado,
            'estado' => 'pendiente',
        ]);
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
            'tmb' => 1400, 'get' => 1680, 'calorias_objetivo' => 1600,
            'proteinas_diarias' => 120, 'carbohidratos_diarios' => 140,
            'grasas_diarias' => 62, 'fibra_diaria' => 30, 'estado' => true,
        ]);
    }

    private function receta(
        string $nombre,
        string $tipo,
        array $ingredientes = [],
        float $calorias = 400,
        float $proteinas = 25,
        float $carbohidratos = 35,
        float $grasas = 12,
        float $fibra = 6
    ): Receta {
        $receta = Receta::query()->create([
            'nombre' => $nombre, 'tipo_comida' => $tipo, 'porciones' => 1,
            'calorias_totales' => $calorias, 'proteinas_totales' => $proteinas,
            'carbohidratos_totales' => $carbohidratos, 'grasas_totales' => $grasas,
            'fibra_total' => $fibra, 'estado' => 'activo',
        ]);

        foreach ($ingredientes as $nombreAlimento) {
            $alimento = Alimento::query()->create([
                'nombre' => $nombreAlimento, 'grupo_alimentario' => 'otros',
                'unidad_base' => 'g', 'cantidad_base' => 100, 'calorias' => 100,
                'proteinas' => 10, 'carbohidratos' => 10, 'grasas' => 3,
                'fibra' => 2, 'estado' => 'activo',
            ]);
            $receta->alimentos()->attach($alimento->getKey(), [
                'cantidad' => 100, 'unidad' => 'g', 'calorias_aporte' => 100,
                'proteinas_aporte' => 10, 'carbohidratos_aporte' => 10,
                'grasas_aporte' => 3, 'fibra_aporte' => 2,
            ]);
        }

        return $receta;
    }
}
