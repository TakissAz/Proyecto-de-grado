<?php
namespace App\Services\Nutricion;

use App\Models\PlanAlimentario;use App\Models\User;use Carbon\Carbon;use DomainException;use Illuminate\Support\Facades\DB;

class CicloPlanAlimentarioService
{
 public function __construct(private readonly ContextoAjustePlanService $contexto,private readonly GeneradorPlanSemanalService $generador){}
 public function finalizarYGenerarSiguiente(PlanAlimentario $planActual,User $nutricionista,?Carbon $fechaInicioNuevoPlan=null,?string $observacion=null):PlanAlimentario
 {
  if(!in_array($planActual->estado_plan,['aprobado','activo'],true))throw new DomainException('El plan seleccionado no puede finalizarse porque no está aprobado o activo.');
  return DB::transaction(function()use($planActual,$nutricionista,$fechaInicioNuevoPlan,$observacion){
   $planActual->loadMissing('paciente');$paciente=$planActual->paciente;if(!$paciente)throw new DomainException('El plan no está asociado a un paciente válido.');
   $recomendacion=$paciente->recomendacionesNutricionalesExpertas()->whereIn('estado_validacion_experta',['aprobado','validado','aceptado'])->latest('id_recomendacion_nutricional_experta')->first();
   if(!$recomendacion)throw new DomainException('No existe una recomendación nutricional experta aprobada para generar el siguiente plan.');
   $contexto=$this->contexto->construirParaPaciente($paciente);
   $inicio=$fechaInicioNuevoPlan??($planActual->fecha_fin?Carbon::parse($planActual->fecha_fin)->addDay():tomorrow());
   $marca='Plan finalizado por nutricionista para generar siguiente planificación ajustada.';$obs=trim(implode(' ',array_filter([$planActual->observaciones,$marca,$observacion])));
   $planActual->update(['estado_plan'=>'finalizado','observaciones'=>$obs]);
   $nuevo=$this->generador->generarDesdeRecomendacion($recomendacion,$nutricionista,['fecha_inicio'=>$inicio->toDateString(),'contexto_ajuste'=>$contexto]);
   $resumen=implode(' ',array_slice($contexto['resumen_ajuste']??[],0,5));
   $nuevo->update(['estado_plan'=>'sugerido','observaciones'=>trim($nuevo->observaciones.' Plan generado como siguiente planificación ajustada, considerando seguimiento de comidas, síntomas y retroalimentación profesional. Plan generado considerando sugerencias automáticas de ajuste nutricional. '.$resumen)]);
   return $nuevo->refresh()->load('dias.comidas.componentes');
  });
 }
}
