<?php

namespace App\Services\Nutricion;

use App\Models\Paciente;
use App\Models\PlanAlimentario;
use App\Services\Paciente\SeguimientoComidaPacienteService;
use Illuminate\Support\Collection;

class HistorialPlanesAlimentariosService
{
    private const VISIBLES_PACIENTE = ['activo', 'aprobado', 'finalizado'];

    public function __construct(private readonly SeguimientoComidaPacienteService $seguimientos, private readonly ReporteCambiosPlanService $reporteCambios) {}

    public function obtenerParaNutricionista(Paciente $paciente): array
    {
        $planes = $this->consulta($paciente)->latest('id_plan_alimentario')->get();
        return $this->respuesta($planes, $paciente, false);
    }

    public function obtenerParaPaciente(Paciente $paciente): array
    {
        $planes = $this->consulta($paciente)->whereIn('estado_plan', self::VISIBLES_PACIENTE)
            ->orderByRaw("CASE WHEN estado_plan = 'activo' THEN 0 WHEN estado_plan = 'aprobado' THEN 1 ELSE 2 END")
            ->latest('id_plan_alimentario')->get();
        return $this->respuesta($planes, $paciente, true);
    }

    public function compararPlanes(?PlanAlimentario $planActual, ?PlanAlimentario $planAnterior): array
    {
        if (! $planActual || ! $planAnterior) return ['tiene_plan_anterior'=>false,'cambios'=>[],'mensaje'=>'Todavía no existe un plan anterior para comparar.'];
        $actual=$this->metricas($planActual);$anterior=$this->metricas($planAnterior);
        $cambios=[];foreach(['calorias_objetivo','calorias','proteinas','carbohidratos','grasas','fibra','recetas','manuales','adherencia'] as $k)$cambios[$k]=round(($actual[$k]??0)-($anterior[$k]??0),1);
        $partes=[];foreach(['fibra'=>'fibra','proteinas'=>'proteína','carbohidratos'=>'carbohidratos','calorias'=>'calorías'] as $k=>$etiqueta)if($cambios[$k]!=0)$partes[]=($cambios[$k]>0?'aumentó ':'redujo ').$etiqueta;
        return ['tiene_plan_anterior'=>true,'cambios'=>$cambios,'estado_actual'=>$planActual->estado_plan,'estado_anterior'=>$planAnterior->estado_plan,
            'fecha_actual'=>$planActual->fecha_inicio?->toDateString(),'fecha_anterior'=>$planAnterior->fecha_inicio?->toDateString(),
            'mensaje'=>$partes?'Este plan '.implode(' y ',array_slice($partes,0,2)).' respecto al plan anterior, considerando el seguimiento registrado.':'El plan mantiene una distribución similar al anterior.'];
    }

    private function respuesta(Collection $planes, Paciente $paciente, bool $pacienteView): array
    {
        $actual=$planes->firstWhere('estado_plan','activo')??$planes->firstWhere('estado_plan','aprobado')??$planes->first();
        $anterior=$planes->first(fn($p)=>!$actual||!$p->is($actual));
        $detallada=$actual?$this->reporteCambios->generarResumenCambios($actual,$anterior):['tiene_plan_anterior'=>false,'resumen'=>'No existe un plan anterior para comparar.','cambios_nutricionales'=>[],'cambios_recetas'=>['recetas_mantenidas'=>[],'recetas_nuevas'=>[],'recetas_retiradas'=>[],'manuales_antes'=>0,'manuales_despues'=>0],'motivos_cambio'=>[],'datos_considerados'=>[]];
        if($pacienteView)$detallada=['tiene_plan_anterior'=>$detallada['tiene_plan_anterior'],'resumen'=>$detallada['resumen'],'cambios_recetas'=>['recetas_mantenidas'=>$detallada['cambios_recetas']['recetas_mantenidas'],'recetas_nuevas'=>$detallada['cambios_recetas']['recetas_nuevas'],'recetas_retiradas'=>$detallada['cambios_recetas']['recetas_retiradas']],'mensajes'=>array_slice($detallada['motivos_cambio'],0,3)];
        return ['planes'=>$planes->map(fn($p)=>$this->transformar($p,$paciente,$pacienteView,$actual?->is($p)??false,$anterior?->is($p)??false))->values()->all(),
            'comparacion'=>$this->compararPlanes($actual,$anterior),'comparacion_detallada'=>$detallada,'total_planes'=>$planes->count()];
    }

    private function transformar(PlanAlimentario $p, Paciente $paciente, bool $vistaPaciente, bool $actual, bool $anterior): array
    {
        $m=$this->metricas($p,$paciente);$base=['id_plan_alimentario'=>$p->getKey(),'nombre_plan'=>$p->nombre,'estado_plan'=>$p->estado_plan,
            'fecha_inicio'=>$p->fecha_inicio?->toDateString(),'fecha_fin'=>$p->fecha_fin?->toDateString(),'calorias_planificadas'=>$m['calorias'],
            'total_dias'=>$m['dias'],'total_comidas'=>$m['comidas'],'porcentaje_adherencia'=>$m['adherencia'],'es_plan_actual'=>$actual,'es_plan_anterior'=>$anterior,
            'resumen'=>$p->generado_por_sistema_experto?'Plan personalizado validado por nutrición':'Plan elaborado por el equipo de nutrición','dias'=>$this->dias($p,$vistaPaciente)];
        if($vistaPaciente)return $base;
        return $base+['generado_por_sistema_experto'=>$p->generado_por_sistema_experto,'fecha_aprobacion'=>$p->fecha_aprobacion?->toISOString(),'aprobado_por'=>$p->aprobado_por,
            'calorias_objetivo'=>(float)$p->calorias_objetivo,'proteinas_objetivo'=>(float)$p->proteinas_objetivo,'proteinas_planificadas'=>$m['proteinas'],
            'carbohidratos_objetivo'=>(float)$p->carbohidratos_objetivo,'carbohidratos_planificados'=>$m['carbohidratos'],'grasas_objetivo'=>(float)$p->grasas_objetivo,
            'grasas_planificadas'=>$m['grasas'],'fibra_objetivo'=>(float)$p->fibra_objetivo,'fibra_planificada'=>$m['fibra'],'total_componentes'=>$m['componentes'],
            'total_componentes_receta'=>$m['recetas'],'total_componentes_manual'=>$m['manuales'],'recomendacion_origen'=>$p->recomendacionNutricionalExperta?->enfoque_nutricional_experto,
            'observaciones'=>$p->observaciones,'created_at'=>$p->created_at?->toISOString(),'puede_ver_detalle'=>true,'puede_editar'=>in_array($p->estado_plan,['sugerido','en_revision'],true)];
    }

    private function metricas(PlanAlimentario $p, ?Paciente $paciente=null): array
    {
        $componentes=$p->dias->flatMap->comidas->flatMap->componentes;
        $adherencia=$paciente?$this->seguimientos->calcularResumenAdherencia($p,$paciente)['porcentaje_adherencia']:(float)($p->getAttribute('porcentaje_adherencia')??0);
        return ['calorias_objetivo'=>(float)$p->calorias_objetivo,'calorias'=>(float)$p->calorias_totales,'proteinas'=>(float)$p->proteinas_totales,
            'carbohidratos'=>(float)$p->carbohidratos_totales,'grasas'=>(float)$p->grasas_totales,'fibra'=>(float)$p->fibra_total,'dias'=>$p->dias->count(),
            'comidas'=>$p->dias->sum(fn($d)=>$d->comidas->count()),'componentes'=>$componentes->count(),'recetas'=>$componentes->where('tipo_componente','receta')->count(),
            'manuales'=>$componentes->where('tipo_componente','manual')->count(),'adherencia'=>(float)$adherencia];
    }

    private function dias(PlanAlimentario $p,bool $vistaPaciente): array{return $p->dias->map(fn($d)=>['numero_dia'=>$d->numero_dia,'nombre_dia'=>$d->nombre_dia,'fecha'=>$d->fecha?->toDateString(),'comidas'=>$d->comidas->map(fn($c)=>['tipo_comida'=>$c->tipo_comida,'hora_sugerida'=>$c->hora_sugerida,'nombre_comida'=>$c->nombre_comida,'calorias'=>(float)$c->calorias_totales,'componentes'=>$c->componentes->map(fn($x)=>['tipo_componente'=>$x->tipo_componente,'nombre'=>$x->receta?->nombre??$x->alimento?->nombre??$x->nombre_manual,'cantidad'=>(float)$x->cantidad,'unidad'=>$x->unidad])->values()->all()])->values()->all()])->values()->all();}
    private function consulta(Paciente $p){return $p->planesAlimentarios()->with(['recomendacionNutricionalExperta:id_recomendacion_nutricional_experta,enfoque_nutricional_experto','dias.comidas.componentes.receta:id_receta,nombre','dias.comidas.componentes.alimento:id_alimento,nombre']);}
}
