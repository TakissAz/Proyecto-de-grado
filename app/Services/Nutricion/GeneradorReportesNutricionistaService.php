<?php

namespace App\Services\Nutricion;

use App\Models\PlanAlimentario;
use App\Models\User;
use Illuminate\Support\Collection;

class GeneradorReportesNutricionistaService
{
    public const TIPOS = [
        'pacientes' => ['titulo' => 'Cartera de pacientes', 'descripcion' => 'Pacientes atendidos, plan vigente y estado de seguimiento.'],
        'adherencia' => ['titulo' => 'Cumplimiento y adherencia', 'descripcion' => 'Cumplimiento diario, semanal y comidas registradas.'],
        'planes' => ['titulo' => 'Planes alimentarios', 'descripcion' => 'Planes generados, periodos, estados y objetivos nutricionales.'],
        'incidencias' => ['titulo' => 'Incidencias de seguimiento', 'descripcion' => 'Comidas parciales, reemplazadas, omitidas y pacientes que requieren revisión.'],
        'sin_seguimiento' => ['titulo' => 'Pacientes sin seguimiento', 'descripcion' => 'Pacientes con plan vigente que aún no registran cumplimiento.'],
    ];

    public function __construct(private readonly ProgresoPacientesNutricionistaService $progreso) {}

    public function generar(User $nutricionista, string $tipo, array $filtros = []): array
    {
        return $tipo === 'planes'
            ? $this->planes($nutricionista, $filtros)
            : $this->desdeProgreso($nutricionista, $tipo, $filtros);
    }

    private function desdeProgreso(User $nutricionista, string $tipo, array $filtros): array
    {
        $items = collect($this->progreso->obtener($nutricionista)['pacientes'])
            ->filter(fn (array $item): bool => $this->coincideProgreso($item, $filtros));
        if ($tipo === 'sin_seguimiento') $items = $items->where('semana.registradas', 0);
        if ($tipo === 'incidencias') $items = $items->filter(fn ($item) => $item['semana']['parciales'] + $item['semana']['reemplazadas'] + $item['semana']['no_realizadas'] > 0 || in_array($item['estado_seguimiento'], ['requiere_atencion', 'sin_registros'], true));

        [$columnas, $transformar] = match ($tipo) {
            'pacientes' => [[
                'paciente'=>'Paciente','ci'=>'CI','plan'=>'Plan vigente','periodo'=>'Periodo','estado'=>'Seguimiento','adherencia'=>'Adherencia',
            ], fn ($p) => ['paciente'=>$p['paciente']['nombre'],'ci'=>$p['paciente']['ci'] ?: 'Sin registro','plan'=>$p['plan']['nombre'],'periodo'=>($p['plan']['fecha_inicio'] ?: '—').' al '.($p['plan']['fecha_fin'] ?: '—'),'estado'=>str_replace('_',' ',$p['estado_seguimiento']),'adherencia'=>$p['adherencia_semanal'].'%']],
            'incidencias' => [[
                'paciente'=>'Paciente','adherencia'=>'Adherencia','parciales'=>'Parciales','reemplazadas'=>'Reemplazadas','no_realizadas'=>'No realizadas','pendientes'=>'Pendientes','estado'=>'Prioridad',
            ], fn ($p) => ['paciente'=>$p['paciente']['nombre'],'adherencia'=>$p['adherencia_semanal'].'%','parciales'=>$p['semana']['parciales'],'reemplazadas'=>$p['semana']['reemplazadas'],'no_realizadas'=>$p['semana']['no_realizadas'],'pendientes'=>$p['semana']['pendientes'],'estado'=>str_replace('_',' ',$p['estado_seguimiento'])]],
            'sin_seguimiento' => [[
                'paciente'=>'Paciente','ci'=>'CI','plan'=>'Plan vigente','periodo'=>'Periodo','comidas'=>'Comidas planificadas','ultima'=>'Último registro',
            ], fn ($p) => ['paciente'=>$p['paciente']['nombre'],'ci'=>$p['paciente']['ci'] ?: 'Sin registro','plan'=>$p['plan']['nombre'],'periodo'=>($p['plan']['fecha_inicio'] ?: '—').' al '.($p['plan']['fecha_fin'] ?: '—'),'comidas'=>$p['semana']['total'],'ultima'=>$p['ultima_actualizacion'] ?: 'Sin registros']],
            default => [[
                'paciente'=>'Paciente','hoy'=>'Cumplimiento hoy','semana'=>'Adherencia semanal','completadas'=>'Completadas','dias'=>'Días cumplidos','estado'=>'Estado',
            ], fn ($p) => ['paciente'=>$p['paciente']['nombre'],'hoy'=>$p['hoy']['porcentaje'].'%','semana'=>$p['adherencia_semanal'].'%','completadas'=>$p['semana']['completadas'].'/'.$p['semana']['total'],'dias'=>$p['dias_cumplidos'].'/'.$p['dias_transcurridos'],'estado'=>str_replace('_',' ',$p['estado_seguimiento'])]],
        };

        return $this->respuesta($tipo, $columnas, $items->map($transformar)->values(), [
            ['etiqueta'=>'Pacientes incluidos','valor'=>$items->count()],
            ['etiqueta'=>'Adherencia promedio','valor'=>round((float)$items->avg('adherencia_semanal'),1).'%'],
            ['etiqueta'=>'Sin registros','valor'=>$items->where('semana.registradas',0)->count()],
            ['etiqueta'=>'Requieren atención','valor'=>$items->whereIn('estado_seguimiento',['requiere_atencion','sin_registros'])->count()],
        ]);
    }

    private function planes(User $nutricionista, array $filtros): array
    {
        $planes = PlanAlimentario::query()->with('paciente:id_paciente,nombres,apellido_paterno,apellido_materno,ci')
            ->where('id_nutricionista', $nutricionista->getKey())
            ->when($filtros['estado_plan'] ?? null, fn ($q, $estado) => $q->where('estado_plan', $estado))
            ->when($filtros['desde'] ?? null, fn ($q, $fecha) => $q->whereDate('fecha_inicio', '>=', $fecha))
            ->when($filtros['hasta'] ?? null, fn ($q, $fecha) => $q->whereDate('fecha_inicio', '<=', $fecha))
            ->when($filtros['buscar'] ?? null, fn ($q, $buscar) => $q->whereHas('paciente', fn ($p) => $p->whereRaw("LOWER(CONCAT(nombres, ' ', COALESCE(apellido_paterno,''), ' ', COALESCE(apellido_materno,''), ' ', COALESCE(ci,''))) LIKE ?", ['%'.mb_strtolower($buscar).'%'])))
            ->latest('id_plan_alimentario')->get();
        $filas = $planes->map(fn ($p) => ['paciente'=>trim("{$p->paciente?->nombres} {$p->paciente?->apellido_paterno} {$p->paciente?->apellido_materno}"),'plan'=>$p->nombre,'estado'=>str_replace('_',' ',$p->estado_plan),'periodo'=>($p->fecha_inicio?->toDateString() ?: '—').' al '.($p->fecha_fin?->toDateString() ?: '—'),'energia'=>number_format((float)$p->calorias_totales,1,',','.').' kcal','origen'=>$p->generado_por_sistema_experto?'Asistencia experta':'Profesional']);
        return $this->respuesta('planes', ['paciente'=>'Paciente','plan'=>'Plan','estado'=>'Estado','periodo'=>'Periodo','energia'=>'Energía semanal','origen'=>'Origen'], $filas, [
            ['etiqueta'=>'Planes incluidos','valor'=>$planes->count()],
            ['etiqueta'=>'Aprobados/activos','valor'=>$planes->whereIn('estado_plan',['aprobado','activo'])->count()],
            ['etiqueta'=>'Finalizados','valor'=>$planes->where('estado_plan','finalizado')->count()],
            ['etiqueta'=>'Con asistencia experta','valor'=>$planes->where('generado_por_sistema_experto',true)->count()],
        ]);
    }

    private function coincideProgreso(array $item, array $filtros): bool
    {
        if (($filtros['estado'] ?? null) && $item['estado_seguimiento'] !== $filtros['estado']) return false;
        if ($buscar = mb_strtolower(trim($filtros['buscar'] ?? ''))) if (! str_contains(mb_strtolower($item['paciente']['nombre'].' '.($item['paciente']['ci'] ?? '')), $buscar)) return false;
        $valor=$item['adherencia_semanal'];$nivel=$filtros['nivel']??null;
        return match($nivel){'alta'=>$valor>=85,'media'=>$valor>=50&&$valor<85,'baja'=>$valor>0&&$valor<50,'cero'=>$valor==0,'sin_registros'=>$item['semana']['registradas']===0,default=>true};
    }

    private function respuesta(string $tipo, array $columnas, Collection $filas, array $resumen): array
    {
        return ['tipo'=>$tipo,'titulo'=>self::TIPOS[$tipo]['titulo'],'descripcion'=>self::TIPOS[$tipo]['descripcion'],'columnas'=>$columnas,'filas'=>$filas->all(),'resumen'=>$resumen];
    }
}
