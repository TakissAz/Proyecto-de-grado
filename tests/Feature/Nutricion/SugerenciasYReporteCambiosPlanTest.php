<?php
namespace Tests\Feature\Nutricion;

use App\Models\ComidaPlanAlimentario;use App\Models\ComponenteComidaPlan;use App\Models\DiaPlanAlimentario;use App\Models\Paciente;use App\Models\PlanAlimentario;use App\Models\Receta;use App\Models\Role;use App\Models\SeguimientoComida;use App\Models\User;use App\Models\UserRole;use App\Services\Nutricion\HistorialPlanesAlimentariosService;use App\Services\Nutricion\ReporteCambiosPlanService;use App\Services\Nutricion\SugerenciasAjusteNutricionalService;use Illuminate\Foundation\Testing\RefreshDatabase;use Tests\TestCase;

class SugerenciasYReporteCambiosPlanTest extends TestCase
{
 use RefreshDatabase;
 public function test_genera_sugerencias_desde_adherencia_saciedad_molestias_ingredientes_y_recetas():void
 {
  [$p,$plan,$comidas]=$this->plan($this->paciente(),'activo','Anterior',['Avena','Sopa','Arroz']);
  foreach($comidas as $c)$this->seguimiento($p,$plan,$c,['nivel_hambre_posterior'=>'alta','ansiedad_posterior'=>true,'presento_molestia'=>true,'tipo_molestia'=>'hinchazon','intensidad_molestia'=>'severa','consiguio_ingredientes'=>false,'motivo_no_cumplimiento'=>'no_tenia_ingredientes','nivel_agrado'=>'no_me_gusto','desea_repetir'=>false]);
  $codigos=collect(app(SugerenciasAjusteNutricionalService::class)->generarParaPaciente($p)['sugerencias'])->pluck('codigo');
  foreach(['simplificar_plan','aumentar_saciedad_almuerzo','revisar_tolerancia_digestiva','simplificar_ingredientes','evitar_recetas_rechazadas'] as $codigo)$this->assertContains($codigo,$codigos);
 }
 public function test_genera_sugerencia_para_receta_bien_aceptada():void
 {
  [$p,$plan,$comidas]=$this->plan($this->paciente(),'activo','Actual',['Avena']);$this->seguimiento($p,$plan,$comidas[0],['estado_cumplimiento'=>'completada','porcentaje_consumido'=>100,'nivel_agrado'=>'me_gusto','desea_repetir'=>true,'presento_molestia'=>false,'consiguio_ingredientes'=>true]);
  $this->assertContains('favorecer_recetas_aceptadas',collect(app(SugerenciasAjusteNutricionalService::class)->generarParaPaciente($p)['sugerencias'])->pluck('codigo'));
 }
 public function test_reporte_compara_macros_recetas_y_tolera_sin_anterior():void
 {
  $p=$this->paciente();[$p,$a]=$this->plan($p,'finalizado','Anterior',['Avena','Sopa'],1400);[$p,$n]=$this->plan($p,'activo','Nuevo',['Avena','Ensalada'],1600);$r=app(ReporteCambiosPlanService::class)->generarResumenCambios($n,$a);
  $this->assertSame(200.0,$r['cambios_nutricionales']['calorias']['diferencia']);$this->assertContains('Ensalada',$r['cambios_recetas']['recetas_nuevas']);$this->assertContains('Sopa',$r['cambios_recetas']['recetas_retiradas']);$this->assertTrue($r['tiene_plan_anterior']);
  $this->assertFalse(app(ReporteCambiosPlanService::class)->generarResumenCambios($n)['tiene_plan_anterior']);
 }
 public function test_historial_entrega_comparacion_detallada():void{$p=$this->paciente();$this->plan($p,'finalizado','Anterior',['Avena']);$this->plan($p,'activo','Nuevo',['Ensalada']);$h=app(HistorialPlanesAlimentariosService::class)->obtenerParaNutricionista($p);$this->assertTrue($h['comparacion_detallada']['tiene_plan_anterior']);$this->assertArrayHasKey('cambios_recetas',$h['comparacion_detallada']);}
 public function test_pdf_esta_protegido_y_contiene_reporte():void
 {
  $p=$this->paciente();$this->plan($p,'finalizado','Anterior',['Avena']);[, $nuevo]=$this->plan($p,'activo','Nuevo',['Ensalada']);$nutri=$this->usuarioRol('nutricionista');
  $this->actingAs($nutri)->get(route('nutricionista.planes.reporte-cambios-pdf',$nuevo))->assertOk()->assertHeader('content-type','application/pdf');
  $otro=$this->usuarioRol('paciente');$this->actingAs($otro)->get(route('nutricionista.planes.reporte-cambios-pdf',$nuevo))->assertForbidden();
 }
 private function plan(Paciente $p,string $estado,string $nombre,array $recetas,float $cal=1400):array{$plan=PlanAlimentario::query()->create(['id_paciente'=>$p->getKey(),'nombre'=>$nombre,'fecha_inicio'=>today(),'estado_plan'=>$estado,'calorias_totales'=>$cal,'proteinas_totales'=>100,'carbohidratos_totales'=>150,'grasas_totales'=>50,'fibra_total'=>25,'estado'=>'activo']);$d=DiaPlanAlimentario::query()->create(['id_plan_alimentario'=>$plan->getKey(),'numero_dia'=>1,'nombre_dia'=>'Día 1','estado'=>'activo']);$comidas=[];foreach($recetas as $i=>$nombreReceta){$tipo=$i===0?'desayuno':'almuerzo';$c=ComidaPlanAlimentario::query()->create(['id_dia_plan_alimentario'=>$d->getKey(),'tipo_comida'=>$tipo,'nombre_comida'=>$tipo,'orden'=>$i+1,'estado'=>'activo']);$r=Receta::query()->create(['nombre'=>$nombreReceta,'tipo_comida'=>$tipo,'porciones'=>1,'estado'=>'activo']);ComponenteComidaPlan::query()->create(['id_comida_plan_alimentario'=>$c->getKey(),'tipo_componente'=>'receta','id_receta'=>$r->getKey(),'cantidad'=>1,'unidad'=>'porción','orden'=>1,'estado'=>'activo']);$comidas[]=$c;}return[$p,$plan->fresh()->load('dias.comidas.componentes.receta'),$comidas];}
 private function seguimiento(Paciente $p,PlanAlimentario $plan,ComidaPlanAlimentario $c,array $x):void{SeguimientoComida::query()->create(array_merge(['id_paciente'=>$p->getKey(),'id_plan_alimentario'=>$plan->getKey(),'id_dia_plan_alimentario'=>$c->id_dia_plan_alimentario,'id_comida_plan_alimentario'=>$c->getKey(),'fecha_seguimiento'=>today(),'estado_cumplimiento'=>'no_realizada'],$x));}
 private function paciente():Paciente{$u=User::factory()->create();return Paciente::query()->create(['user_id'=>$u->getKey(),'nombres'=>'Paciente','apellido_paterno'=>'Cambios','ci'=>fake()->unique()->numerify('########'),'fecha_nacimiento'=>'1994-01-01','sexo'=>'femenino','estado'=>'activo']);}
 private function usuarioRol(string $rol):User{$r=Role::query()->firstOrCreate(['nombre'=>$rol],['descripcion'=>$rol,'estado'=>'activo']);$u=User::factory()->create(['email_verified_at'=>now()]);UserRole::query()->create(['user_id'=>$u->getKey(),'id_rol'=>$r->getKey(),'estado'=>'activo']);return$u;}
}
