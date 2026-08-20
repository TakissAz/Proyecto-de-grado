<?php

namespace Tests\Feature\Nutricion;

use App\Models\Alimento;
use App\Models\ComidaPlanAlimentario;
use App\Models\ComponenteComidaPlan;
use App\Models\DiaPlanAlimentario;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\RetroalimentacionPaciente;
use App\Models\SeguimientoComida;
use App\Models\SeguimientoSintomaPaciente;
use App\Models\User;
use App\Services\Nutricion\ClasificadorRecetasSistemaExpertoService;
use App\Services\Nutricion\ContextoAjustePlanService;
use App\Services\Nutricion\GeneradorPlanSemanalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContextoAjustePlanServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_detecta_receta_bien_aceptada(): void
    {
        [$paciente, $plan, $receta, $comida] = $this->escenario('merienda');
        $this->seguimiento($paciente, $plan, $comida, ['estado_cumplimiento' => 'parcial', 'porcentaje_consumido' => 80, 'nivel_agrado' => 'me_gusto', 'desea_repetir' => true]);
        $contexto = $this->contexto($paciente);
        $this->assertSame($receta->getKey(), $contexto['recetas_bien_aceptadas'][0]['id_receta']);
    }

    public function test_detecta_receta_a_evitar_por_agrado_y_molestia_relevante(): void
    {
        [$paciente, $plan, $receta, $comida] = $this->escenario('cena');
        $this->seguimiento($paciente, $plan, $comida, ['nivel_agrado' => 'no_me_gusto', 'desea_repetir' => false, 'presento_molestia' => true, 'tipo_molestia' => 'hinchazon', 'intensidad_molestia' => 'moderada']);
        $item = $this->contexto($paciente)['recetas_a_evitar'][0];
        $this->assertSame($receta->getKey(), $item['id_receta']); $this->assertTrue($item['descartar_temporalmente']);
    }

    public function test_detecta_ingredientes_no_conseguidos_y_receta_dificil(): void
    {
        [$paciente, $plan, , $comida, $alimento] = $this->escenario('almuerzo');
        $this->seguimiento($paciente, $plan, $comida, ['consiguio_ingredientes' => false, 'motivo_no_cumplimiento' => 'no_tenia_ingredientes', 'dificultad_preparacion' => 'dificil']);
        $contexto = $this->contexto($paciente);
        $this->assertSame($alimento->nombre, $contexto['ingredientes_no_conseguidos'][0]['nombre']);
        $this->assertCount(1, $contexto['recetas_dificiles']); $this->assertNotEmpty($contexto['preparaciones_problematicas']);
    }

    public function test_detecta_merienda_que_necesita_mayor_saciedad(): void
    {
        [$paciente, $plan, , $comida] = $this->escenario('merienda');
        $this->seguimiento($paciente, $plan, $comida, ['nivel_hambre_posterior' => 'alta']);
        $otra = $this->comida($plan->dias->first(), $this->receta('Otra merienda', 'merienda'));
        $this->seguimiento($paciente, $plan, $otra, ['ansiedad_posterior' => true]);
        $this->assertTrue($this->contexto($paciente)['necesita_mas_saciedad']['merienda']);
    }

    public function test_integra_sintomas_y_retroalimentacion_profesional_reciente(): void
    {
        [$paciente] = $this->escenario(); $nutricionista = User::factory()->create();
        foreach (range(1, 3) as $dia) SeguimientoSintomaPaciente::query()->create(['id_paciente' => $paciente->getKey(), 'fecha_registro' => today()->subDays($dia), 'hambre_nocturna' => true, 'ansiedad_por_comida' => 'alta', 'registrado_por' => $paciente->user_id]);
        RetroalimentacionPaciente::query()->create(['id_paciente' => $paciente->getKey(), 'id_usuario_emisor' => $nutricionista->getKey(), 'rol_emisor' => 'nutricionista', 'tipo_retroalimentacion' => 'ajuste_plan', 'mensaje' => 'Aumentar saciedad y más fibra.', 'estado' => 'activo']);
        $contexto = $this->contexto($paciente);
        $this->assertTrue($contexto['hambre_nocturna_frecuente']); $this->assertTrue($contexto['ansiedad_comida_frecuente']);
        $this->assertContains('Aumentar saciedad y más fibra.', $contexto['recomendaciones_nutricionista']); $this->assertTrue($contexto['banderas_profesionales']['mas_fibra']);
    }

    public function test_clasificador_bonifica_y_penaliza_sin_romper_contexto_vacio(): void
    {
        $paciente = $this->paciente(); $recomendacion = $this->recomendacion($paciente); $bien = $this->receta('Buena', 'desayuno'); $mal = $this->receta('Mala', 'desayuno');
        $servicio = app(ClasificadorRecetasSistemaExpertoService::class);
        $base = collect($servicio->clasificarParaRecomendacion($recomendacion, 'desayuno'));
        $ajustado = collect($servicio->clasificarParaRecomendacion($recomendacion, 'desayuno', ['recetas_bien_aceptadas' => [['id_receta' => $bien->getKey()]], 'recetas_a_evitar' => [['id_receta' => $mal->getKey(), 'descartar_temporalmente' => false]]]));
        $puntaje = fn ($lista, $receta) => $lista->first(fn ($r) => $r['receta']->is($receta))['puntaje'];
        $this->assertSame(10, $puntaje($ajustado, $bien) - $puntaje($base, $bien));
        $this->assertSame(-80, $puntaje($ajustado, $mal) - $puntaje($base, $mal));
        $this->assertCount(2, $base);
    }

    public function test_generador_evade_receta_mal_tolerada_y_registra_ajuste(): void
    {
        [$paciente, $plan, $evitada, $comida] = $this->escenario('desayuno');
        $this->seguimiento($paciente, $plan, $comida, ['nivel_agrado' => 'no_me_gusto', 'desea_repetir' => false, 'presento_molestia' => true, 'intensidad_molestia' => 'severa']);
        $alternativa = $this->receta('Alternativa tolerada', 'desayuno');
        $nuevo = app(GeneradorPlanSemanalService::class)->generarDesdeRecomendacion($this->recomendacion($paciente));
        $ids = $nuevo->dias->flatMap->comidas->flatMap->componentes->pluck('id_receta')->filter();
        $this->assertFalse($ids->contains($evitada->getKey())); $this->assertTrue($ids->contains($alternativa->getKey()));
        $this->assertStringContainsString('seguimiento reciente', $nuevo->observaciones);
    }

    public function test_comando_debug_funciona_y_no_guarda(): void
    {
        [$paciente] = $this->escenario(); $cantidad = PlanAlimentario::query()->count();
        $this->artisan('plan:debug-ajuste', ['paciente' => $paciente->getKey()])->assertSuccessful();
        $this->assertSame($cantidad, PlanAlimentario::query()->count());
    }

    private function contexto(Paciente $paciente): array { return app(ContextoAjustePlanService::class)->construirParaPaciente($paciente); }
    private function escenario(string $tipo = 'desayuno'): array
    {
        $paciente = $this->paciente(); $plan = PlanAlimentario::query()->create(['id_paciente' => $paciente->getKey(), 'nombre' => 'Plan previo', 'estado_plan' => 'activo', 'duracion_dias' => 7, 'estado' => 'activo']);
        $dia = DiaPlanAlimentario::query()->create(['id_plan_alimentario' => $plan->getKey(), 'numero_dia' => 1, 'nombre_dia' => 'Día 1', 'estado' => 'activo']);
        $alimento = Alimento::query()->create(['nombre' => 'Ingrediente especial', 'grupo_alimentario' => 'otros', 'unidad_base' => 'g', 'cantidad_base' => 100, 'calorias' => 100, 'proteinas' => 5, 'carbohidratos' => 15, 'grasas' => 2, 'fibra' => 3, 'estado' => 'activo']);
        $receta = $this->receta('Receta previa '.$tipo, $tipo); $receta->alimentos()->attach($alimento->getKey(), ['cantidad' => 100, 'unidad' => 'g']);
        return [$paciente, $plan, $receta, $this->comida($dia, $receta), $alimento];
    }
    private function comida(DiaPlanAlimentario $dia, Receta $receta): ComidaPlanAlimentario
    {
        $comida = ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario' => $dia->getKey(), 'tipo_comida' => $receta->tipo_comida, 'nombre_comida' => $receta->nombre, 'orden' => $dia->comidas()->count() + 1, 'estado' => 'activo']);
        ComponenteComidaPlan::query()->create(['id_comida_plan_alimentario' => $comida->getKey(), 'tipo_componente' => 'receta', 'id_receta' => $receta->getKey(), 'cantidad' => 1, 'unidad' => 'porción', 'orden' => 1, 'estado' => 'activo']); return $comida;
    }
    private function seguimiento(Paciente $p, PlanAlimentario $plan, ComidaPlanAlimentario $c, array $extra): void { SeguimientoComida::query()->create(array_merge(['id_paciente' => $p->getKey(), 'id_plan_alimentario' => $plan->getKey(), 'id_dia_plan_alimentario' => $c->id_dia_plan_alimentario, 'id_comida_plan_alimentario' => $c->getKey(), 'fecha_seguimiento' => today(), 'estado_cumplimiento' => 'completada', 'porcentaje_consumido' => 100, 'presento_molestia' => false, 'ansiedad_posterior' => false, 'consiguio_ingredientes' => true], $extra)); }
    private function paciente(): Paciente { $u=User::factory()->create(); return Paciente::query()->create(['user_id'=>$u->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Ajuste','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1995-01-01','sexo'=>'femenino','estado'=>'activo']); }
    private function receta(string $nombre,string $tipo): Receta { return Receta::query()->create(['nombre'=>$nombre,'tipo_comida'=>$tipo,'porciones'=>1,'tiempo_preparacion_minutos'=>20,'calorias_totales'=>300,'proteinas_totales'=>22,'carbohidratos_totales'=>30,'grasas_totales'=>10,'fibra_total'=>6,'estado'=>'activo']); }
    private function recomendacion(Paciente $p): RecomendacionNutricionalExperta { return RecomendacionNutricionalExperta::query()->create(['id_paciente'=>$p->getKey(),'enfoque_nutricional_experto'=>'alto_fibra','calorias_sugeridas'=>1600,'proteinas_porcentaje'=>30,'carbohidratos_porcentaje'=>40,'grasas_porcentaje'=>30,'fibra_sugerida'=>25,'estado_validacion_experta'=>'aprobado','estado'=>'activo']); }
}
