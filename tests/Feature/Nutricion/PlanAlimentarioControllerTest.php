<?php

namespace Tests\Feature\Nutricion;

use App\Models\Alimento;
use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Models\Receta;
use App\Models\RecomendacionNutricionalExperta;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\Nutricion\GeneradorPlanSemanalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PlanAlimentarioControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_nutricionista_puede_generar_plan_desde_recomendacion_aprobada(): void
    {
        $rec = $this->recomendacion('aprobado');
        $this->actingAs($this->usuarioConRol('nutricionista'))->postJson(route('nutricionista.planes.generar-desde-recomendacion', $rec))->assertCreated()->assertJsonPath('data.estado_plan', 'sugerido');
        $this->assertDatabaseCount('comidas_plan_alimentario', 28);
    }

    #[DataProvider('estadosNoPermitidos')]
    public function test_no_genera_desde_recomendacion_no_aprobada(string $estado): void
    {
        $this->actingAs($this->usuarioConRol('nutricionista'))->postJson(route('nutricionista.planes.generar-desde-recomendacion', $this->recomendacion($estado)))->assertUnprocessable();
        $this->assertDatabaseCount('planes_alimentarios', 0);
    }
    public static function estadosNoPermitidos(): array { return [['pendiente'], ['rechazado']]; }

    public function test_usuario_sin_rol_recibe_403(): void
    {
        $this->actingAs($this->usuarioConRol('endocrinologo'))->postJson(route('nutricionista.planes.generar-desde-recomendacion', $this->recomendacion()))->assertForbidden();
    }

    public function test_usuario_no_autenticado_es_redirigido(): void
    {
        $this->post(route('nutricionista.planes.generar-desde-recomendacion', $this->recomendacion()))->assertRedirect(route('login'));
    }

    public function test_nutricionista_puede_aprobar_plan_con_componentes(): void
    {
        [$user,$plan]=$this->planAutenticado();
        $this->actingAs($user)->patchJson(route('nutricionista.planes.estado',$plan),['estado_plan'=>'aprobado'])->assertOk();
        $this->assertSame('aprobado',$plan->fresh()->estado_plan); $this->assertNotNull($plan->fresh()->fecha_aprobacion);
    }

    public function test_no_puede_aprobar_plan_vacio(): void
    {
        $user=$this->usuarioConRol('nutricionista'); $plan=PlanAlimentario::query()->create(['id_paciente'=>$this->paciente()->getKey(),'nombre'=>'Plan vacío','estado_plan'=>'sugerido','estado'=>'activo']);
        $this->actingAs($user)->patchJson(route('nutricionista.planes.estado',$plan),['estado_plan'=>'aprobado'])->assertUnprocessable();
    }

    public function test_nutricionista_puede_rechazar_plan(): void
    {
        [$user,$plan]=$this->planAutenticado(); $this->actingAs($user)->patchJson(route('nutricionista.planes.estado',$plan),['estado_plan'=>'rechazado','observaciones'=>'Revisar'])->assertOk();
        $this->assertSame('rechazado',$plan->fresh()->estado_plan);
    }

    public function test_nutricionista_puede_editar_comida(): void
    {
        [$user,$plan]=$this->planAutenticado(); $comida=$plan->dias()->first()->comidas()->first();
        $this->actingAs($user)->patchJson(route('nutricionista.planes.comidas.update',$comida),['nombre_comida'=>'Desayuno ajustado','hora_sugerida'=>'08:30'])->assertOk();
        $this->assertSame('Desayuno ajustado',$comida->fresh()->nombre_comida);
    }

    public function test_puede_agregar_componente_manual(): void
    {
        [$user,$plan]=$this->planAutenticado(); $comida=$plan->dias()->first()->comidas()->first();
        $this->actingAs($user)->postJson(route('nutricionista.planes.componentes.store',$comida),$this->manual())->assertCreated();
        $this->assertDatabaseHas('componentes_comida_plan',['nombre_manual'=>'Yogur natural']);
    }

    public function test_puede_agregar_componente_alimento(): void
    {
        [$user,$plan]=$this->planAutenticado(); $comida=$plan->dias()->first()->comidas()->first(); $alimento=$this->alimento();
        $this->actingAs($user)->postJson(route('nutricionista.planes.componentes.store',$comida),['tipo_componente'=>'alimento','id_alimento'=>$alimento->getKey(),'cantidad'=>200,'unidad'=>'g'])->assertCreated()->assertJsonPath('data.calorias','200.00');
    }

    public function test_puede_agregar_componente_receta(): void
    {
        [$user,$plan]=$this->planAutenticado(); $comida=$plan->dias()->first()->comidas()->first(); $receta=$this->receta();
        $this->actingAs($user)->postJson(route('nutricionista.planes.componentes.store',$comida),['tipo_componente'=>'receta','id_receta'=>$receta->getKey(),'cantidad'=>1,'unidad'=>'porción'])->assertCreated()->assertJsonPath('data.calorias','300.00');
    }

    public function test_puede_editar_componente_manual(): void
    {
        [$user,$plan]=$this->planAutenticado(); $componente=$plan->dias()->first()->comidas()->first()->componentes()->first();
        $this->actingAs($user)->patchJson(route('nutricionista.planes.componentes.update',$componente),['nombre_manual'=>'Ajustado','calorias'=>250])->assertOk();
        $this->assertSame('Ajustado',$componente->fresh()->nombre_manual);
    }

    public function test_puede_eliminar_componente_con_soft_delete(): void
    {
        [$user,$plan]=$this->planAutenticado(); $componente=$plan->dias()->first()->comidas()->first()->componentes()->first();
        $this->actingAs($user)->deleteJson(route('nutricionista.planes.componentes.destroy',$componente))->assertOk();
        $this->assertSoftDeleted($componente);
    }

    public function test_modificar_componente_recalcula_totales(): void
    {
        [$user,$plan]=$this->planAutenticado(); $comida=$plan->dias()->first()->comidas()->first(); $componente=$comida->componentes()->first();
        $this->actingAs($user)->patchJson(route('nutricionista.planes.componentes.update',$componente),['calorias'=>999])->assertOk();
        $this->assertSame('999.00',$comida->fresh()->calorias_totales); $this->assertGreaterThan(0,(float)$plan->fresh()->calorias_totales);
    }

    public function test_no_permite_modificar_plan_finalizado(): void
    {
        [$user,$plan]=$this->planAutenticado(); $plan->update(['estado_plan'=>'finalizado']); $comida=$plan->dias()->first()->comidas()->first();
        $this->actingAs($user)->patchJson(route('nutricionista.planes.comidas.update',$comida),['nombre_comida'=>'No permitido'])->assertUnprocessable();
    }

    public function test_puede_cambiar_componente_manual_a_receta_y_deja_trazabilidad(): void
    {
        [$user,$plan]=$this->planAutenticado(); $componente=$plan->dias()->first()->comidas()->first()->componentes()->first(); $receta=$this->receta();
        $this->actingAs($user)->patchJson(route('nutricionista.planes.componentes.update',$componente),[
            'tipo_componente'=>'receta','id_receta'=>$receta->getKey(),'cantidad'=>1,'unidad'=>'porción',
        ])->assertOk();
        $actual=$componente->fresh();
        $this->assertSame('receta',$actual->tipo_componente); $this->assertSame($receta->getKey(),$actual->id_receta);
        $this->assertStringContainsString('Modificado manualmente por nutricionista.',$actual->observaciones);
    }

    public function test_puede_cambiar_receta_por_otra(): void
    {
        [$user,$plan]=$this->planAutenticado(); $comida=$plan->dias()->first()->comidas()->first(); $componente=$comida->componentes()->first();
        $primera=$this->receta(); $segunda=Receta::query()->create(['nombre'=>'Sopa de quinua','tipo_comida'=>'almuerzo','porciones'=>1,'calorias_totales'=>250,'proteinas_totales'=>15,'carbohidratos_totales'=>35,'grasas_totales'=>6,'fibra_total'=>8,'estado'=>'activo']);
        $componente->update(['tipo_componente'=>'receta','id_receta'=>$primera->getKey()]);
        $this->actingAs($user)->patchJson(route('nutricionista.planes.componentes.update',$componente),[
            'tipo_componente'=>'receta','id_receta'=>$segunda->getKey(),'cantidad'=>1,'unidad'=>'porción',
        ])->assertOk();
        $this->assertSame($segunda->getKey(),$componente->fresh()->id_receta);
    }

    public function test_no_permite_editar_plan_aprobado(): void
    {
        [$user,$plan]=$this->planAutenticado(); $plan->update(['estado_plan'=>'aprobado']); $comida=$plan->dias()->first()->comidas()->first();
        $this->actingAs($user)->patchJson(route('nutricionista.planes.comidas.update',$comida),['nombre_comida'=>'No permitido'])->assertUnprocessable();
    }

    private function planAutenticado(): array
    {
        $user=$this->usuarioConRol('nutricionista'); $plan=app(GeneradorPlanSemanalService::class)->generarDesdeRecomendacion($this->recomendacion('aprobado'),$user); return [$user,$plan];
    }
    private function manual(): array { return ['tipo_componente'=>'manual','nombre_manual'=>'Yogur natural','cantidad'=>1,'unidad'=>'porción','calorias'=>120,'proteinas'=>8,'carbohidratos'=>12,'grasas'=>4,'fibra'=>0]; }
    private function recomendacion(string $estado='aprobado'): RecomendacionNutricionalExperta { $p=$this->paciente(); return RecomendacionNutricionalExperta::query()->create(['id_paciente'=>$p->getKey(),'calorias_sugeridas'=>1600,'proteinas_porcentaje'=>30,'carbohidratos_porcentaje'=>35,'grasas_porcentaje'=>35,'fibra_sugerida'=>30,'restricciones'=>[],'estado_validacion_experta'=>$estado,'estado'=>'pendiente']); }
    private function paciente(): Paciente { return Paciente::query()->create(['user_id'=>User::factory()->create()->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Plan','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1992-01-01','sexo'=>'femenino','estado'=>'activo']); }
    private function usuarioConRol(string $nombre): User { $rol=Role::query()->firstOrCreate(['nombre'=>$nombre],['descripcion'=>ucfirst($nombre),'estado'=>'activo']);$user=User::factory()->create(['estado'=>'activo']);UserRole::query()->create(['user_id'=>$user->getKey(),'id_rol'=>$rol->getKey(),'estado'=>'activo']);return $user; }
    private function alimento(): Alimento { return Alimento::query()->create(['nombre'=>'Avena','grupo_alimentario'=>'cereales','unidad_base'=>'g','cantidad_base'=>100,'calorias'=>100,'proteinas'=>10,'carbohidratos'=>20,'grasas'=>3,'fibra'=>5,'estado'=>'activo']); }
    private function receta(): Receta { return Receta::query()->create(['nombre'=>'Ensalada','tipo_comida'=>'almuerzo','porciones'=>1,'calorias_totales'=>300,'proteinas_totales'=>20,'carbohidratos_totales'=>30,'grasas_totales'=>10,'fibra_total'=>7,'estado'=>'activo']); }
}
