<?php

namespace App\Services\Nutricion;

use App\Models\Paciente;
use App\Services\Paciente\SeguimientoComidaPacienteService;
use App\Services\Paciente\SeguimientoSintomasPacienteService;

class AnaliticaEvolucionPacienteService
{
    private const TIPOS = ['desayuno', 'almuerzo', 'merienda', 'cena'];

    public function __construct(
        private readonly SeguimientoComidaPacienteService $seguimientosService,
        private readonly SeguimientoSintomasPacienteService $sintomasService,
        private readonly ContextoAjustePlanService $contextoService,
    ) {}

    public function obtenerAnalitica(Paciente $paciente): array
    {
        $evaluaciones = $paciente->evaluacionesNutricionales()->where('estado', true)
            ->orderBy('fecha_evaluacion')->orderBy('id_evaluacion_nutricional')->get();
        $planes = $paciente->planesAlimentarios()->with('dias.comidas')->orderBy('fecha_inicio')->orderBy('id_plan_alimentario')->get();
        $seguimientos = $paciente->seguimientosComidas()->with('comidaPlanAlimentario.componentes.receta', 'comidaPlanAlimentario.componentes.alimento')->get();
        $contexto = $this->contextoService->construirParaPaciente($paciente);
        $adherencia = $this->adherencia($planes, $paciente);
        $porTipo = $this->porTipo($planes, $seguimientos);
        $sintomas = $this->sintomas($paciente);
        [$aceptadas, $problematicas] = $this->recetas($seguimientos);
        $problemas = $this->problemasPracticos($seguimientos, $contexto);
        $alertas = $this->alertas($adherencia, $porTipo, $sintomas, $problemas, $seguimientos);

        return [
            'evolucion_antropometrica' => $this->antropometria($evaluaciones),
            'evolucion_adherencia' => $adherencia,
            'cumplimiento_por_tipo_comida' => $porTipo,
            'analitica_sintomas' => $sintomas,
            'recetas_aceptadas' => $aceptadas,
            'recetas_problematicas' => $problematicas,
            'problemas_practicos' => $problemas,
            'alertas' => $alertas,
            'recomendaciones_siguiente_plan' => $this->recomendaciones($adherencia, $porTipo, $sintomas, $contexto, $aceptadas, $problematicas, $problemas),
        ];
    }

    private function antropometria($evaluaciones): array
    {
        $registros = $evaluaciones->map(fn ($e) => [
            'fecha' => $e->fecha_evaluacion?->toDateString(), 'peso' => $this->numero($e->peso),
            'imc' => $this->numero($e->imc) ?? $e->calcularImc(), 'cintura' => $this->numero($e->circunferencia_cintura),
            'cadera' => $this->numero($e->circunferencia_cadera), 'icc' => $this->numero($e->indice_cintura_cadera) ?? $e->calcularIndiceCinturaCadera(),
            'grasa_corporal' => $this->numero($e->porcentaje_grasa), 'masa_muscular' => $this->numero($e->masa_muscular),
        ])->values();
        $primera = $registros->first(); $ultima = $registros->last();
        return ['registros' => $registros->all(), 'resumen' => [
            'peso_inicial' => $primera['peso'] ?? null, 'peso_actual' => $ultima['peso'] ?? null, 'cambio_peso' => $this->cambio($ultima['peso'] ?? null, $primera['peso'] ?? null),
            'imc_inicial' => $primera['imc'] ?? null, 'imc_actual' => $ultima['imc'] ?? null, 'cambio_imc' => $this->cambio($ultima['imc'] ?? null, $primera['imc'] ?? null),
            'cintura_inicial' => $primera['cintura'] ?? null, 'cintura_actual' => $ultima['cintura'] ?? null, 'cambio_cintura' => $this->cambio($ultima['cintura'] ?? null, $primera['cintura'] ?? null),
            'total_evaluaciones' => $registros->count(), 'fecha_primera_evaluacion' => $primera['fecha'] ?? null, 'fecha_ultima_evaluacion' => $ultima['fecha'] ?? null,
        ]];
    }

    private function adherencia($planes, Paciente $paciente): array
    {
        $porPlan = $planes->map(function ($plan) use ($paciente) {
            $resumen = $this->seguimientosService->calcularResumenAdherencia($plan, $paciente);
            return ['id_plan_alimentario' => $plan->getKey(), 'nombre_plan' => $plan->nombre, 'estado_plan' => $plan->estado_plan,
                'fecha_inicio' => $plan->fecha_inicio?->toDateString(), 'fecha_fin' => $plan->fecha_fin?->toDateString(), ...$resumen];
        })->values();
        $conDatos = $porPlan->filter(fn ($p) => $p['comidas_totales'] > 0); $primero = $conDatos->first(); $ultimo = $conDatos->last();
        $tendencia = $conDatos->count() < 2 ? 'insuficiente' : (($ultimo['porcentaje_adherencia'] - $primero['porcentaje_adherencia']) > 5 ? 'mejora' : (($ultimo['porcentaje_adherencia'] - $primero['porcentaje_adherencia']) < -5 ? 'baja' : 'estable'));
        return ['por_plan' => $porPlan->all(), 'resumen' => [
            'promedio_adherencia' => $conDatos->isEmpty() ? 0 : round($conDatos->avg('porcentaje_adherencia'), 1),
            'mejor_plan' => $conDatos->sortByDesc('porcentaje_adherencia')->first(), 'peor_plan' => $conDatos->sortBy('porcentaje_adherencia')->first(),
            'tendencia_adherencia' => $tendencia,
        ]];
    }

    private function porTipo($planes, $seguimientos): array
    {
        $comidas = $planes->flatMap->dias->flatMap->comidas;
        return collect(self::TIPOS)->map(function ($tipo) use ($comidas, $seguimientos) {
            $ids = $comidas->where('tipo_comida', $tipo)->pluck('id_comida_plan_alimentario'); $total = $ids->count();
            $registros = $seguimientos->whereIn('id_comida_plan_alimentario', $ids); $puntos = $registros->sum(fn ($s) => match ($s->estado_cumplimiento) {'completada' => 1, 'parcial' => $s->porcentaje_consumido !== null ? $s->porcentaje_consumido / 100 : .5, 'reemplazada' => .5, default => 0});
            $porcentaje = $total ? round($puntos / $total * 100, 1) : 0;
            $problema = $registros->where('presento_molestia', true)->count() >= 2 ? 'Molestias frecuentes'
                : ($registros->filter(fn ($s) => $s->nivel_hambre_posterior === 'alta')->count() >= 2 ? 'Hambre posterior frecuente'
                : ($registros->where('consiguio_ingredientes', false)->count() >= 2 ? 'Ingredientes no conseguidos'
                : ($total && $porcentaje < 50 ? 'Baja adherencia' : 'Sin problemas relevantes')));
            return ['tipo_comida' => $tipo, 'total' => $total, 'registradas' => $registros->where('estado_cumplimiento', '!=', 'pendiente')->count(),
                'completadas' => $registros->where('estado_cumplimiento', 'completada')->count(), 'parciales' => $registros->where('estado_cumplimiento', 'parcial')->count(),
                'reemplazadas' => $registros->where('estado_cumplimiento', 'reemplazada')->count(), 'no_realizadas' => $registros->where('estado_cumplimiento', 'no_realizada')->count(),
                'pendientes' => max(0, $total - $registros->where('estado_cumplimiento', '!=', 'pendiente')->count()), 'porcentaje_adherencia' => $porcentaje, 'principal_problema' => $problema];
        })->all();
    }

    private function sintomas(Paciente $paciente): array
    {
        $indicadores = $this->sintomasService->calcularIndicadores($paciente);
        $recientes = $paciente->seguimientosSintomas()->latest('fecha_registro')->limit(10)->get();
        return [
            'total_registros' => $paciente->seguimientosSintomas()->count(),
            'ultimos_7' => $paciente->seguimientosSintomas()->where('fecha_registro', '>=', today()->subDays(6))->count(),
            'ultimos_30' => $paciente->seguimientosSintomas()->where('fecha_registro', '>=', today()->subDays(29))->count(),
            ...collect($indicadores)->only(['hambre_nocturna_frecuente','ansiedad_comida_frecuente','antojos_dulces_frecuentes','hinchazon_frecuente','baja_energia_frecuente','sueno_deficiente_frecuente','actividad_fisica_baja'])->all(),
            'registros_recientes' => $recientes->map(fn ($r) => ['fecha'=>$r->fecha_registro?->toDateString(),'energia'=>$r->nivel_energia,'ansiedad'=>$r->ansiedad_por_comida,'antojos'=>$r->antojos_dulces,'hambre_nocturna'=>$r->hambre_nocturna,'hinchazon'=>$r->hinchazon_abdominal,'sueno'=>$r->calidad_sueno,'actividad'=>$r->actividad_fisica])->all(),
            'recomendaciones_sintomas' => $indicadores['recomendaciones_para_nutricionista'] ?? [],
        ];
    }

    private function recetas($seguimientos): array
    {
        $datos = [];
        foreach ($seguimientos as $s) foreach ($s->comidaPlanAlimentario?->componentes ?? [] as $c) if ($c->receta) {
            $id=$c->receta->getKey(); $d=$datos[$id]??=['id_receta'=>$id,'nombre'=>$c->receta->nombre,'tipo_comida'=>$c->receta->tipo_comida,'veces_consumida'=>0,'veces_me_gusto'=>0,'sin_molestias'=>0,'desea_repetir'=>0,'puntaje_aceptacion'=>0,'motivos'=>[]];
            if(in_array($s->estado_cumplimiento,['completada','parcial'],true))$d['veces_consumida']++; if($s->nivel_agrado==='me_gusto'){$d['veces_me_gusto']++;$d['puntaje_aceptacion']+=2;} if(!$s->presento_molestia)$d['sin_molestias']++; if($s->desea_repetir){$d['desea_repetir']++;$d['puntaje_aceptacion']++;}
            $d['puntaje_aceptacion'] += $s->estado_cumplimiento==='completada'?2:($s->estado_cumplimiento==='parcial'?1:0);
            foreach (['no_me_gusto'=>$s->nivel_agrado==='no_me_gusto','molestia'=>$s->presento_molestia&&in_array($s->intensidad_molestia,['moderada','severa'],true),'hambre_posterior'=>$s->nivel_hambre_posterior==='alta','no_realizada'=>$s->estado_cumplimiento==='no_realizada','ingrediente_no_conseguido'=>$s->consiguio_ingredientes===false,'dificultad_alta'=>$s->dificultad_preparacion==='dificil'] as $motivo=>$aplica)if($aplica){$d['motivos'][]=$motivo;$d['puntaje_aceptacion']-=in_array($motivo,['no_me_gusto','molestia'],true)?2:1;}
            $datos[$id]=$d;
        }
        $coleccion=collect($datos)->map(function($d){$d['motivos']=array_values(array_unique($d['motivos']));$d['frecuencia']=count($d['motivos']);return $d;});
        return [$coleccion->filter(fn($d)=>$d['puntaje_aceptacion']>0)->sortByDesc('puntaje_aceptacion')->values()->all(),$coleccion->filter(fn($d)=>$d['motivos']!==[])->sortByDesc('frecuencia')->values()->all()];
    }

    private function problemasPracticos($seguimientos, array $contexto): array
    {
        return ['ingredientes_no_conseguidos'=>$contexto['ingredientes_no_conseguidos']??[],'recetas_dificiles'=>$contexto['recetas_dificiles']??[],
            'comidas_reemplazadas'=>$seguimientos->where('estado_cumplimiento','reemplazada')->count(),
            'motivos_no_cumplimiento_frecuentes'=>$seguimientos->pluck('motivo_no_cumplimiento')->filter()->countBy()->sortDesc()->all(),
            'horarios_problematicos'=>$seguimientos->filter(fn($s)=>in_array($s->motivo_no_cumplimiento,['falta_tiempo','olvido','comi_fuera'],true))->map(fn($s)=>$s->comidaPlanAlimentario?->tipo_comida)->filter()->countBy()->all()];
    }

    private function alertas(array $a,array $tipos,array $s,array $p,$seguimientos): array
    {
        $r=collect(); if($a['resumen']['promedio_adherencia']<60&&$a['por_plan']!==[])$r->push($this->alerta('adherencia','alta','Adherencia baja al plan.','Revisar barreras y simplificar el próximo plan.'));
        $des=collect($tipos)->firstWhere('tipo_comida','desayuno'); if(($des['total']??0)>0&&$des['porcentaje_adherencia']<50)$r->push($this->alerta('desayuno','media','Baja adherencia en desayunos.','Proponer desayunos simples y accesibles.'));
        if(collect($tipos)->contains(fn($t)=>$t['principal_problema']==='Hambre posterior frecuente'))$r->push($this->alerta('saciedad','media','Hambre posterior alta frecuente.','Considerar comidas más saciantes.'));
        if(collect($tipos)->contains(fn($t)=>$t['principal_problema']==='Molestias frecuentes'))$r->push($this->alerta('tolerancia','media','Se reportan molestias digestivas frecuentes.','Revisar recetas e ingredientes asociados.'));
        if(($s['ansiedad_comida_frecuente']??false)||($s['antojos_dulces_frecuentes']??false))$r->push($this->alerta('sintomas','media','Ansiedad o antojos frecuentes.','Considerar estrategias de saciedad y control de carbohidratos simples.'));
        if(count($p['ingredientes_no_conseguidos'])>=2)$r->push($this->alerta('acceso','media','Hay ingredientes no conseguidos con frecuencia.','Simplificar la lista de compras o proponer sustituciones.'));
        if(!$seguimientos->contains(fn($x)=>$x->created_at?->gte(now()->subDays(7))))$r->push($this->alerta('seguimiento','baja','La paciente no registra seguimiento recientemente.','Recordar el registro periódico de comidas.'));
        return $r->all();
    }

    private function recomendaciones(array $a,array $tipos,array $s,array $contexto,array $aceptadas,array $problematicas,array $problemas): array
    {
        $r=collect(); if($aceptadas!==[])$r->push(['texto'=>'Priorizar recetas que la paciente desea repetir y toleró bien.','origen'=>'recetas']); if($problematicas!==[])$r->push(['texto'=>'Evitar temporalmente recetas con molestias o baja aceptación reportadas.','origen'=>'recetas']);
        if(collect($tipos)->contains(fn($t)=>$t['principal_problema']==='Hambre posterior frecuente'))$r->push(['texto'=>'Aumentar proteína o fibra en comidas con hambre posterior.','origen'=>'adherencia']);
        if(collect($tipos)->contains(fn($t)=>$t['tipo_comida']==='desayuno'&&$t['total']>0&&$t['porcentaje_adherencia']<50))$r->push(['texto'=>'Simplificar desayunos por baja adherencia.','origen'=>'adherencia']);
        if($problemas['ingredientes_no_conseguidos']!==[])$r->push(['texto'=>'Evitar ingredientes que la paciente no consigue con facilidad.','origen'=>'problemas_prácticos']);
        foreach($s['recomendaciones_sintomas'] as $x)$r->push(['texto'=>$x,'origen'=>'síntomas']); foreach($contexto['recomendaciones_nutricionista']??[] as $x)$r->push(['texto'=>$x,'origen'=>'retroalimentación']);
        return $r->unique('texto')->values()->all();
    }

    private function alerta(string $tipo,string $severidad,string $mensaje,string $recomendacion):array{return compact('tipo','severidad','mensaje','recomendacion');}
    private function numero($v):?float{return $v===null?null:round((float)$v,2);} private function cambio($a,$i):?float{return $a===null||$i===null?null:round($a-$i,2);}
}
