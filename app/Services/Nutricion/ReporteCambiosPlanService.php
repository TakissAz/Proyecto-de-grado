<?php
namespace App\Services\Nutricion;

use App\Models\PlanAlimentario;

class ReporteCambiosPlanService
{
 public function __construct(private readonly SugerenciasAjusteNutricionalService $sugerencias,private readonly AlertasNutricionistaService $alertas,private readonly ContextoAjustePlanService $contexto,private readonly SeguimientoPacienteNutricionistaService $seguimiento){}
 public function generarResumenCambios(PlanAlimentario $planNuevo,?PlanAlimentario $planAnterior=null):array
 {
  $planNuevo->loadMissing(['paciente','dias.comidas.componentes.receta']);$paciente=$planNuevo->paciente;
  $base=['tiene_plan_anterior'=>(bool)$planAnterior,'resumen'=>$planAnterior?'El nuevo plan fue comparado con la planificación anterior.':'No existe un plan anterior para comparar.','cambios_nutricionales'=>[],'cambios_recetas'=>['recetas_mantenidas'=>[],'recetas_nuevas'=>$this->recetas($planNuevo),'recetas_retiradas'=>[],'manuales_antes'=>0,'manuales_despues'=>$this->manuales($planNuevo)],'motivos_cambio'=>[],'datos_considerados'=>[],'sugerencias_consideradas'=>[],'alertas_consideradas'=>[],'adherencia_plan_anterior'=>null];
  if(!$planAnterior||!$paciente)return $base;
  $planAnterior->loadMissing('dias.comidas.componentes.receta');
  foreach(['calorias'=>'calorias_totales','proteinas'=>'proteinas_totales','carbohidratos'=>'carbohidratos_totales','grasas'=>'grasas_totales','fibra'=>'fibra_total'] as $nombre=>$campo){$antes=(float)$planAnterior->{$campo};$despues=(float)$planNuevo->{$campo};$base['cambios_nutricionales'][$nombre]=['antes'=>$antes,'despues'=>$despues,'diferencia'=>round($despues-$antes,2)];}
  $antes=$this->recetas($planAnterior);$despues=$this->recetas($planNuevo);$base['cambios_recetas']=['recetas_mantenidas'=>array_values(array_intersect($despues,$antes)),'recetas_nuevas'=>array_values(array_diff($despues,$antes)),'recetas_retiradas'=>array_values(array_diff($antes,$despues)),'manuales_antes'=>$this->manuales($planAnterior),'manuales_despues'=>$this->manuales($planNuevo)];
  $s=$this->sugerencias->generarParaPaciente($paciente);$a=$this->alertas->generarParaPaciente($paciente);$c=$this->contexto->construirParaPaciente($paciente);$seg=$this->seguimiento->obtenerResumen($paciente);
  $base['sugerencias_consideradas']=collect($s['sugerencias'])->pluck('titulo')->all();$base['alertas_consideradas']=collect($a['alertas'])->pluck('titulo')->all();$base['motivos_cambio']=collect($s['sugerencias'])->pluck('impacto_en_siguiente_plan')->unique()->values()->all();$base['datos_considerados']=array_values(array_filter(['Seguimiento de comidas','Síntomas recientes',count($c['recomendaciones_nutricionista']??[])?'Retroalimentación profesional':null,count($a['alertas'])?'Alertas automáticas':null,'Contexto de ajuste']));$base['adherencia_plan_anterior']=data_get($seg,'resumen_adherencia.porcentaje_adherencia');
  return $base;
 }
 private function componentes(PlanAlimentario $p){return $p->dias->flatMap->comidas->flatMap->componentes;}
 private function recetas(PlanAlimentario $p):array{return $this->componentes($p)->where('tipo_componente','receta')->pluck('receta.nombre')->filter()->unique()->values()->all();}
 private function manuales(PlanAlimentario $p):int{return $this->componentes($p)->where('tipo_componente','manual')->count();}
}
