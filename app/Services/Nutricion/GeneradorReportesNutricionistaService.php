<?php

namespace App\Services\Nutricion;

use App\Models\PlanAlimentario;
use App\Models\User;
use Illuminate\Support\Collection;

class GeneradorReportesNutricionistaService
{
    public const TIPOS = [
        'pacientes' => ['titulo' => 'Cartera de pacientes', 'descripcion' => 'Prioriza pacientes según su plan vigente, seguimiento y adherencia.'],
        'adherencia' => ['titulo' => 'Cumplimiento y adherencia', 'descripcion' => 'Evalúa cuánto se siguió el plan y quién necesita acompañamiento.'],
        'planes' => ['titulo' => 'Planes alimentarios', 'descripcion' => 'Controla la vigencia, estado, energía y origen de cada planificación.'],
        'incidencias' => ['titulo' => 'Incidencias de seguimiento', 'descripcion' => 'Reúne omisiones, reemplazos y comidas parciales para orientar ajustes.'],
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
        if ($tipo === 'incidencias') $items = $items->filter(fn ($item) => $item['semana']['parciales'] + $item['semana']['reemplazadas'] + $item['semana']['no_realizadas'] > 0 || in_array($item['estado_seguimiento'], ['requiere_atencion', 'sin_registros'], true));

        [$columnas, $transformar] = match ($tipo) {
            'pacientes' => [[
                'paciente'=>'Paciente','ci'=>'CI','plan'=>'Plan vigente','periodo'=>'Vigencia','estado_plan'=>'Estado del plan','estado'=>'Seguimiento','adherencia'=>'Adherencia','avance'=>'Registros','accion'=>'Acción sugerida',
            ], fn ($p) => ['paciente'=>$p['paciente']['nombre'],'ci'=>$p['paciente']['ci'] ?: 'Sin registro','plan'=>$p['plan']['nombre'],'periodo'=>($p['plan']['fecha_inicio'] ?: '—').' al '.($p['plan']['fecha_fin'] ?: '—'),'estado_plan'=>str_replace('_',' ',$p['plan']['estado']),'estado'=>str_replace('_',' ',$p['estado_seguimiento']),'adherencia'=>$p['adherencia_semanal'].'%','avance'=>$p['semana']['registradas'].'/'.$p['semana']['total'],'accion'=>$this->accionSugerida($p['estado_seguimiento'])]],
            'incidencias' => [[
                'paciente'=>'Paciente','plan'=>'Plan evaluado','periodo'=>'Periodo','adherencia'=>'Adherencia','incidencias'=>'Total','principal'=>'Señal principal','estado'=>'Prioridad','accion'=>'Acción sugerida',
            ], fn ($p) => ['paciente'=>$p['paciente']['nombre'],'plan'=>$p['plan']['nombre'],'periodo'=>($p['plan']['fecha_inicio'] ?: '—').' al '.($p['plan']['fecha_fin'] ?: '—'),'adherencia'=>$p['adherencia_semanal'].'%','incidencias'=>$p['semana']['parciales']+$p['semana']['reemplazadas']+$p['semana']['no_realizadas'],'principal'=>$this->incidenciaPrincipal($p['semana']),'estado'=>str_replace('_',' ',$p['estado_seguimiento']),'accion'=>$this->accionIncidencia($p)]],
            default => [[
                'paciente'=>'Paciente','plan'=>'Plan evaluado','periodo'=>'Periodo','adherencia'=>'Adherencia','evaluadas'=>'Comidas evaluadas','completadas'=>'Completadas','parciales'=>'Parciales','reemplazadas'=>'Reemplazadas','no_realizadas'=>'No realizadas','dias'=>'Días cumplidos','estado'=>'Estado',
            ], fn ($p) => ['paciente'=>$p['paciente']['nombre'],'plan'=>$p['plan']['nombre'],'periodo'=>($p['plan']['fecha_inicio'] ?: '—').' al '.($p['plan']['fecha_fin'] ?: '—'),'adherencia'=>$p['adherencia_semanal'].'%','evaluadas'=>$p['semana']['registradas'].'/'.$p['semana']['total'],'completadas'=>$p['semana']['completadas'],'parciales'=>$p['semana']['parciales'],'reemplazadas'=>$p['semana']['reemplazadas'],'no_realizadas'=>$p['semana']['no_realizadas'],'dias'=>$p['dias_cumplidos'].'/'.$p['dias_transcurridos'],'estado'=>str_replace('_',' ',$p['estado_seguimiento'])]],
        };

        $filas = $items->map(fn (array $item): array => [
            '_avatar_url' => $item['paciente']['avatar_url'] ?? null,
        ] + $transformar($item))->values();

        $respuesta = $this->respuesta($tipo, $columnas, $filas, [
            ['etiqueta'=>'Pacientes incluidos','valor'=>$items->count()],
            ['etiqueta'=>'Adherencia promedio','valor'=>round((float)$items->avg('adherencia_semanal'),1).'%'],
            ['etiqueta'=>'Sin registros','valor'=>$items->where('semana.registradas',0)->count()],
            ['etiqueta'=>'Requieren atención','valor'=>$items->whereIn('estado_seguimiento',['requiere_atencion','sin_registros'])->count()],
        ]);

        if ($tipo === 'pacientes') {
            $respuesta['graficos'] = [
                'seguimiento' => $this->distribucion($items, fn (array $item): string => $item['estado_seguimiento'], [
                    'al_dia' => 'Al día', 'en_progreso' => 'En progreso', 'requiere_atencion' => 'Requiere atención', 'sin_registros' => 'Sin registros',
                ]),
                'adherencia' => $this->distribucion($items, fn (array $item): string => match (true) {
                    $item['semana']['registradas'] === 0 => 'sin_registros',
                    $item['adherencia_semanal'] >= 85 => 'alta',
                    $item['adherencia_semanal'] >= 50 => 'media',
                    default => 'baja',
                }, ['alta' => 'Alta (85–100%)', 'media' => 'Media (50–84%)', 'baja' => 'Baja (<50%)', 'sin_registros' => 'Sin registros']),
            ];
            $respuesta['interpretacion'] = $this->interpretacionCartera($items);
        }

        if ($tipo === 'adherencia') {
            $respuesta['graficos'] = [
                'niveles' => $this->distribucion($items, fn (array $item): string => match (true) {
                    $item['semana']['registradas'] === 0 => 'sin_registros',
                    $item['adherencia_semanal'] >= 85 => 'alta',
                    $item['adherencia_semanal'] >= 50 => 'media',
                    default => 'baja',
                }, ['alta' => 'Alta (85–100%)', 'media' => 'Media (50–84%)', 'baja' => 'Baja (<50%)', 'sin_registros' => 'Sin registros']),
                'cumplimiento' => $this->composicionCumplimiento($items),
            ];
            $respuesta['interpretacion'] = $this->interpretacionAdherencia($items);
        }

        if ($tipo === 'incidencias') {
            $totales = [
                'Parciales' => (int) $items->sum('semana.parciales'),
                'Reemplazadas' => (int) $items->sum('semana.reemplazadas'),
                'No realizadas' => (int) $items->sum('semana.no_realizadas'),
            ];
            $totalIncidencias = max(1, array_sum($totales));
            $respuesta['graficos'] = [
                'tipos' => collect($totales)->map(fn (int $cantidad, string $etiqueta): array => ['etiqueta'=>$etiqueta,'cantidad'=>$cantidad,'porcentaje'=>round($cantidad/$totalIncidencias*100,1)])->values()->all(),
                'prioridad' => $this->distribucion($items, fn (array $item): string => $item['estado_seguimiento'], [
                    'requiere_atencion'=>'Requiere atención','sin_registros'=>'Sin registros','en_progreso'=>'En progreso','al_dia'=>'Al día',
                ]),
            ];
            $respuesta['interpretacion'] = $this->interpretacionIncidencias($items, array_sum($totales));
        }

        return $respuesta;
    }

    private function planes(User $nutricionista, array $filtros): array
    {
        $planes = PlanAlimentario::query()->with('paciente.user')
            ->where('id_nutricionista', $nutricionista->getKey())
            ->when($filtros['estado_plan'] ?? null, fn ($q, $estado) => $q->where('estado_plan', $estado))
            ->when($filtros['desde'] ?? null, fn ($q, $fecha) => $q->whereDate('fecha_inicio', '>=', $fecha))
            ->when($filtros['hasta'] ?? null, fn ($q, $fecha) => $q->whereDate('fecha_inicio', '<=', $fecha))
            ->when($filtros['buscar'] ?? null, fn ($q, $buscar) => $q->whereHas('paciente', fn ($p) => $p->whereRaw("LOWER(CONCAT(nombres, ' ', COALESCE(apellido_paterno,''), ' ', COALESCE(apellido_materno,''), ' ', COALESCE(ci,''))) LIKE ?", ['%'.mb_strtolower($buscar).'%'])))
            ->latest('id_plan_alimentario')->get();
        $filas = $planes->map(fn ($p) => ['paciente'=>trim("{$p->paciente?->nombres} {$p->paciente?->apellido_paterno} {$p->paciente?->apellido_materno}"),'_avatar_url'=>$p->paciente?->user?->avatar_url,'plan'=>$p->nombre,'estado'=>str_replace('_',' ',$p->estado_plan),'periodo'=>($p->fecha_inicio?->toDateString() ?: '—').' al '.($p->fecha_fin?->toDateString() ?: '—'),'duracion'=>($p->fecha_inicio&&$p->fecha_fin?$p->fecha_inicio->diffInDays($p->fecha_fin)+1:0).' días','energia'=>number_format((float)$p->calorias_totales,1,',','.').' kcal','origen'=>$p->generado_por_sistema_experto?'Asistencia experta':'Profesional']);
        $respuesta = $this->respuesta('planes', ['paciente'=>'Paciente','plan'=>'Plan','estado'=>'Estado','periodo'=>'Periodo','duracion'=>'Duración','energia'=>'Energía semanal','origen'=>'Origen'], $filas, [
            ['etiqueta'=>'Planes incluidos','valor'=>$planes->count()],
            ['etiqueta'=>'Aprobados/activos','valor'=>$planes->whereIn('estado_plan',['aprobado','activo'])->count()],
            ['etiqueta'=>'Finalizados','valor'=>$planes->where('estado_plan','finalizado')->count()],
            ['etiqueta'=>'Con asistencia experta','valor'=>$planes->where('generado_por_sistema_experto',true)->count()],
        ]);
        $respuesta['graficos'] = [
            'estados' => $this->distribucionModelos($planes, fn ($plan): string => $plan->estado_plan, ['sugerido'=>'Sugeridos','en_revision'=>'En revisión','aprobado'=>'Aprobados','activo'=>'Activos','finalizado'=>'Finalizados','rechazado'=>'Rechazados']),
            'origen' => $this->distribucionModelos($planes, fn ($plan): string => $plan->generado_por_sistema_experto ? 'experto' : 'profesional', ['experto'=>'Asistencia experta','profesional'=>'Elaboración profesional']),
        ];
        $activos = $planes->whereIn('estado_plan', ['aprobado','activo'])->count();
        $respuesta['interpretacion'] = "Se incluyeron {$planes->count()} plan(es). {$activos} se encuentran aprobados o activos y {$planes->where('estado_plan','finalizado')->count()} finalizaron su periodo.";
        return $respuesta;
    }

    private function coincideProgreso(array $item, array $filtros): bool
    {
        if (($filtros['estado'] ?? null) && $item['estado_seguimiento'] !== $filtros['estado']) return false;
        if (($filtros['estado_plan'] ?? null) && $item['plan']['estado'] !== $filtros['estado_plan']) return false;
        if ($buscar = mb_strtolower(trim($filtros['buscar'] ?? ''))) if (! str_contains(mb_strtolower($item['paciente']['nombre'].' '.($item['paciente']['ci'] ?? '')), $buscar)) return false;
        $valor=$item['adherencia_semanal'];$nivel=$filtros['nivel']??null;
        return match($nivel){'alta'=>$valor>=85,'media'=>$valor>=50&&$valor<85,'baja'=>$valor>0&&$valor<50,'cero'=>$valor==0,'sin_registros'=>$item['semana']['registradas']===0,default=>true};
    }

    private function accionSugerida(string $estado): string
    {
        return match ($estado) {
            'sin_registros' => 'Verificar inicio o contactar',
            'requiere_atencion' => 'Revisión prioritaria',
            'en_progreso' => 'Mantener acompañamiento',
            default => 'Continuar seguimiento',
        };
    }

    private function distribucion(Collection $items, callable $clasificar, array $etiquetas): array
    {
        $total = max(1, $items->count());
        return collect($etiquetas)->map(function (string $etiqueta, string $clave) use ($items, $clasificar, $total): array {
            $cantidad = $items->filter(fn (array $item): bool => $clasificar($item) === $clave)->count();
            return ['clave' => $clave, 'etiqueta' => $etiqueta, 'cantidad' => $cantidad, 'porcentaje' => round($cantidad / $total * 100, 1)];
        })->values()->all();
    }

    private function distribucionModelos(Collection $items, callable $clasificar, array $etiquetas): array
    {
        $total = max(1, $items->count());
        return collect($etiquetas)->map(function (string $etiqueta, string $clave) use ($items, $clasificar, $total): array {
            $cantidad = $items->filter(fn ($item): bool => $clasificar($item) === $clave)->count();
            return ['clave'=>$clave,'etiqueta'=>$etiqueta,'cantidad'=>$cantidad,'porcentaje'=>round($cantidad/$total*100,1)];
        })->values()->all();
    }

    private function interpretacionCartera(Collection $items): string
    {
        if ($items->isEmpty()) return 'No existen pacientes que coincidan con los filtros seleccionados.';
        $prioritarios = $items->whereIn('estado_seguimiento', ['requiere_atencion', 'sin_registros'])->count();
        $promedio = round((float) $items->avg('adherencia_semanal'), 1);
        return "La cartera incluye {$items->count()} paciente(s), con una adherencia promedio de {$promedio}%. {$prioritarios} caso(s) requieren revisión o verificación de seguimiento.";
    }

    private function composicionCumplimiento(Collection $items): array
    {
        $campos = [
            'completadas' => 'Completadas',
            'parciales' => 'Parciales',
            'reemplazadas' => 'Reemplazadas',
            'no_realizadas' => 'No realizadas',
        ];
        $total = max(1, $items->sum(fn (array $item): int => (int) $item['semana']['registradas']));
        return collect($campos)->map(function (string $etiqueta, string $campo) use ($items, $total): array {
            $cantidad = (int) $items->sum(fn (array $item): int => (int) $item['semana'][$campo]);
            return ['clave' => $campo, 'etiqueta' => $etiqueta, 'cantidad' => $cantidad, 'porcentaje' => round($cantidad / $total * 100, 1)];
        })->values()->all();
    }

    private function interpretacionAdherencia(Collection $items): string
    {
        if ($items->isEmpty()) return 'No existen pacientes que coincidan con los filtros seleccionados.';
        $promedio = round((float) $items->avg('adherencia_semanal'), 1);
        $conRegistros = $items->where('semana.registradas', '>', 0)->count();
        $bajo = $items->filter(fn (array $item): bool => $item['semana']['registradas'] > 0 && $item['adherencia_semanal'] < 50)->count();
        return "La adherencia promedio es {$promedio}%. {$conRegistros} de {$items->count()} paciente(s) presentan registros evaluables y {$bajo} muestran adherencia inferior al 50%, por lo que pueden requerir revisión prioritaria.";
    }

    private function incidenciaPrincipal(array $semana): string
    {
        $tipos = ['Comidas parciales'=>(int)$semana['parciales'],'Reemplazos'=>(int)$semana['reemplazadas'],'No realizadas'=>(int)$semana['no_realizadas']];
        arsort($tipos);
        $principal = array_key_first($tipos);
        return ($tipos[$principal] ?? 0) > 0 ? $principal : 'Sin señal dominante';
    }

    private function accionIncidencia(array $item): string
    {
        if ($item['semana']['no_realizadas'] > 0) return 'Revisar motivo de omisión';
        if ($item['semana']['reemplazadas'] > 0) return 'Validar reemplazos realizados';
        if ($item['semana']['parciales'] > 0) return 'Revisar porción o saciedad';
        return 'Verificar ausencia de registros';
    }

    private function interpretacionIncidencias(Collection $items, int $total): string
    {
        if ($items->isEmpty()) return 'No existen incidencias que coincidan con los filtros seleccionados.';
        $noRealizadas = (int) $items->sum('semana.no_realizadas');
        return "Se identificaron {$total} incidencia(s) en {$items->count()} paciente(s). {$noRealizadas} corresponden a comidas no realizadas; estos casos deben revisarse junto con comentarios, síntomas y disponibilidad de alimentos.";
    }

    private function respuesta(string $tipo, array $columnas, Collection $filas, array $resumen): array
    {
        return ['tipo'=>$tipo,'titulo'=>self::TIPOS[$tipo]['titulo'],'descripcion'=>self::TIPOS[$tipo]['descripcion'],'columnas'=>$columnas,'filas'=>$filas->all(),'resumen'=>$resumen];
    }
}
