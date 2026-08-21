<?php

namespace App\Services\Nutricion;

use App\Models\Paciente;
use App\Services\Paciente\SeguimientoSintomasPacienteService;

class SugerenciasAjusteNutricionalService
{
    public function __construct(
        private readonly AlertasNutricionistaService $alertas,
        private readonly ContextoAjustePlanService $contexto,
        private readonly AnaliticaEvolucionPacienteService $analitica,
        private readonly SeguimientoPacienteNutricionistaService $seguimiento,
        private readonly SeguimientoSintomasPacienteService $sintomas,
    ) {}

    public function generarParaPaciente(Paciente $paciente): array
    {
        $seguimiento=$this->seguimiento->obtenerResumen($paciente); $contexto=$this->contexto->construirParaPaciente($paciente);
        $indicadores=$this->sintomas->calcularIndicadores($paciente); $alertas=$this->alertas->generarParaPaciente($paciente);
        $this->analitica->obtenerAnalitica($paciente); $codigosAlerta=collect($alertas['alertas'])->pluck('codigo');
        $s=[]; $adherencia=data_get($seguimiento,'resumen_adherencia.porcentaje_adherencia');
        if($adherencia!==null&&$adherencia<60)$this->add($s,'simplificar_plan','Simplificar el plan','La adherencia general está por debajo del nivel esperado.','alta','adherencia','Priorizar recetas fáciles y reducir preparaciones complejas.','La paciente no está cumpliendo el plan con regularidad.',["Adherencia: {$adherencia}%"],'Favorecer preparaciones sencillas y prácticas.');
        $desayuno=data_get($seguimiento,'adherencia_por_tipo_comida.desayuno');
        if(($desayuno['comidas_totales']??0)>0&&($desayuno['porcentaje_adherencia']??0)<50)$this->add($s,'simplificar_desayunos','Usar desayunos rápidos y prácticos','La adherencia en desayunos es baja.','media','horarios','Priorizar yogur con chía, avena simple u omelette rápido.','Las preparaciones largas pueden dificultar el cumplimiento matutino.',['Adherencia en desayuno: '.$desayuno['porcentaje_adherencia'].'%'],'Elegir desayunos de preparación sencilla.');
        foreach(($contexto['necesita_mas_saciedad']??[]) as $tipo=>$activo)if($activo)$this->add($s,"aumentar_saciedad_$tipo",'Aumentar saciedad en '.str_replace('_',' ',$tipo),'Se reportó hambre o ansiedad posterior frecuente.','media','saciedad','Aumentar proteína y fibra y elegir recetas más saciantes.','Hay dos o más registros problemáticos en este tiempo de comida.',["Tiempo de comida: $tipo"],'Bonificar recetas altas en proteína y fibra.');
        if(($indicadores['ansiedad_comida_frecuente']??false)||($indicadores['antojos_dulces_frecuentes']??false))$this->add($s,'mejorar_distribucion_carbohidratos','Mejorar distribución de carbohidratos','Se detectaron ansiedad o antojos dulces frecuentes.','alta','carbohidratos','Reforzar carbohidratos complejos, fibra y proteína.','Los síntomas recientes sugieren revisar saciedad y calidad de carbohidratos.',['Ansiedad/antojos frecuentes'],'Penalizar preparaciones muy dulces o con baja fibra.');
        $tiposConMolestias=collect($contexto['tipos_comida_problematicos']??[])->contains(fn($v)=>str_contains($v,'molestias'));
        if(($indicadores['hinchazon_frecuente']??false)||count($contexto['alimentos_a_evitar']??[])||$tiposConMolestias)$this->add($s,'revisar_tolerancia_digestiva','Revisar tolerancia digestiva','Se identificaron molestias digestivas o hinchazón frecuente.','alta','sintomas','Evitar temporalmente recetas problemáticas y preferir preparaciones simples.','El seguimiento asocia alimentos o recetas con molestias.',array_values(array_unique(array_merge($this->nombres($contexto['alimentos_a_evitar']??[]),$contexto['preparaciones_problematicas']??[]))),'Penalizar recetas asociadas a molestias.');
        if(count($contexto['ingredientes_no_conseguidos']??[])||$codigosAlerta->contains('ingredientes_no_conseguidos'))$this->add($s,'simplificar_ingredientes','Priorizar ingredientes disponibles','Se reportaron ingredientes que no pudieron conseguirse.','media','ingredientes','Usar ingredientes comunes y proponer sustituciones.','La disponibilidad afectó el cumplimiento.',$this->nombres($contexto['ingredientes_no_conseguidos']),'Penalizar temporalmente ingredientes no conseguidos.');
        if(count($contexto['recetas_a_evitar']??[]))$this->add($s,'evitar_recetas_rechazadas','Evitar recetas con baja aceptación','Existen recetas rechazadas, mal toleradas o que no se desean repetir.','alta','recetas','Priorizar alternativas con ingredientes preferidos.','La aceptación y tolerancia influyen en la adherencia.',$this->nombres($contexto['recetas_a_evitar']),'Penalizar o excluir temporalmente esas recetas.');
        if(count($contexto['recetas_bien_aceptadas']??[]))$this->add($s,'favorecer_recetas_aceptadas','Favorecer recetas bien aceptadas','Hay recetas cumplidas y bien toleradas.','baja','recetas','Mantenerlas de forma moderada y usarlas como base para variaciones.','La paciente reportó buena aceptación.',$this->nombres($contexto['recetas_bien_aceptadas']),'Bonificarlas sin romper la diversidad semanal.');
        if(count($contexto['recomendaciones_nutricionista']??[]))$this->add($s,'considerar_retroalimentacion_profesional','Considerar retroalimentación profesional','Hay indicaciones profesionales recientes aplicables al siguiente plan.','alta','retroalimentacion','Revisar estas indicaciones antes de aprobar el plan.','Se consideró retroalimentación profesional reciente.',$contexto['recomendaciones_nutricionista'],'Mostrar y conservar el criterio profesional en la revisión.');
        if(($indicadores['sueno_deficiente_frecuente']??false)||($indicadores['baja_energia_frecuente']??false))$this->add($s,'reforzar_horarios_descanso','Reforzar horarios y descanso','Se reportó sueño deficiente o baja energía frecuente.','media','horarios','Revisar regularidad de horarios, cenas y seguimiento del descanso.','Los síntomas pueden afectar adherencia y bienestar.',['Sueño/energía reciente'],'Registrar como recomendación sin cambiar calorías automáticamente.');
        $s=collect($s)->unique('codigo')->values()->all();$c=collect($s)->countBy('prioridad');
        return ['resumen'=>['total_sugerencias'=>count($s),'prioridad_alta'=>$c->get('alta',0),'prioridad_media'=>$c->get('media',0),'prioridad_baja'=>$c->get('baja',0),'mensaje_general'=>count($s)?'Revise estas sugerencias antes de aprobar o generar el siguiente plan.':'No se identificaron ajustes automáticos prioritarios.'],'sugerencias'=>$s,'alertas_consideradas'=>$alertas['alertas']];
    }
    private function nombres(array $items):array{return collect($items)->pluck('nombre')->filter()->values()->all();}
    private function add(array &$s,string $codigo,string $titulo,string $descripcion,string $prioridad,string $categoria,string $accion_sugerida,string $justificacion,array $datos_considerados,string $impacto_en_siguiente_plan):void{$s[]=compact('codigo','titulo','descripcion','prioridad','categoria','accion_sugerida','justificacion','datos_considerados','impacto_en_siguiente_plan');}
}
