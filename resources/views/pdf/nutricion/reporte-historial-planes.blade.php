<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Historial de planes alimentarios</title><style>
@page{margin:28px 32px 42px}body{font-family:DejaVu Sans,sans-serif;color:#263238;font-size:9px;line-height:1.4}h1{font-size:21px;color:#174d3b;margin:4px 0}h2{font-size:12px;color:#174d3b;border-bottom:1px solid #a9c7bc;padding-bottom:4px;margin:16px 0 7px}h3{font-size:10.5px;color:#174d3b;margin:10px 0 4px}.head{border-bottom:3px solid #2f8066;padding-bottom:11px}.brand{color:#2f8066;font-size:9px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase}.right{float:right;text-align:right}.clear{clear:both}.muted{color:#607d75}.box{background:#f2f7f5;border:1px solid #d7e5df;padding:8px;margin:7px 0}.grid{width:100%;border-collapse:collapse;margin:6px 0 10px}.grid th,.grid td{border:1px solid #d9e1de;padding:5px;vertical-align:top}.grid th{background:#e8f1ed;color:#174d3b;text-align:left}.badge{display:inline-block;background:#e8f1ed;color:#174d3b;border-radius:8px;padding:2px 6px;margin:1px}.plan{margin-top:12px}.metricas td{width:20%;text-align:center}.metricas b{display:block;color:#174d3b;font-size:11px}.dia{page-break-inside:avoid;margin:8px 0}.motivo{color:#3f6559;font-size:8px}.warn{color:#a76713}.empty{padding:20px;text-align:center;border:1px dashed #a9c7bc;color:#607d75}.footer{position:fixed;bottom:-28px;left:0;right:0;border-top:1px solid #aaa;padding-top:6px;color:#78908a;font-size:7px}.footer b{color:#2f8066}
</style></head><body>
<header class="head"><div class="right"><b>{{ $fechaGeneracion->format('d/m/Y H:i') }}</b><br><span class="muted">Reporte profesional filtrado</span></div><div class="brand">● Almendra Nutrición</div><h1>Historial de planes alimentarios</h1><div class="muted">Seguimiento longitudinal de planificación nutricional</div><div class="clear"></div></header>

<h2>Paciente y responsable</h2>
<table class="grid"><tr><th>Paciente</th><th>CI</th><th>Nutricionista</th><th>Planes incluidos</th></tr><tr><td>{{ $nombrePaciente ?: 'Sin registro' }}</td><td>{{ $paciente->ci ?: 'Sin registro' }}</td><td>{{ $nutricionista?->name ?? 'Sin registro' }}</td><td><b>{{ $planes->count() }}</b></td></tr></table>

<div class="box"><b>Filtros aplicados:</b>
    <span class="badge">Estado: {{ isset($filtros['estado']) ? str_replace('_', ' ', $filtros['estado']) : 'Todos' }}</span>
    <span class="badge">Origen: {{ isset($filtros['origen']) ? ucfirst($filtros['origen']) : 'Todos' }}</span>
    <span class="badge">Desde: {{ $filtros['desde'] ?? 'Sin límite' }}</span>
    <span class="badge">Hasta: {{ $filtros['hasta'] ?? 'Sin límite' }}</span>
</div>

@forelse($planes as $indice => $plan)
<section class="plan">
    <h2>{{ $indice + 1 }}. {{ $plan['nombre_plan'] }}</h2>
    <table class="grid"><tr><th>Estado</th><th>Periodo</th><th>Origen</th><th>Estructura</th></tr><tr><td>{{ ucfirst(str_replace('_',' ',$plan['estado_plan'])) }}</td><td>{{ $plan['fecha_inicio'] ?? 'Sin fecha' }} al {{ $plan['fecha_fin'] ?? 'Sin fecha' }}</td><td>{{ ($plan['generado_por_sistema_experto'] ?? false) ? 'Asistencia experta' : 'Elaboración profesional' }}</td><td>{{ $plan['total_dias'] }} días · {{ $plan['total_comidas'] }} comidas</td></tr></table>
    <table class="grid metricas"><tr><td><b>{{ number_format($plan['calorias_planificadas'],1,',','.') }}</b>kcal</td><td><b>{{ number_format($plan['proteinas_planificadas'] ?? 0,1,',','.') }}</b>g proteínas</td><td><b>{{ number_format($plan['carbohidratos_planificados'] ?? 0,1,',','.') }}</b>g carbohidratos</td><td><b>{{ number_format($plan['grasas_planificadas'] ?? 0,1,',','.') }}</b>g grasas</td><td><b>{{ number_format($plan['porcentaje_adherencia'],1,',','.') }}%</b>adherencia</td></tr></table>
    @php($origen = is_array($plan['recomendacion_origen'] ?? null) ? $plan['recomendacion_origen'] : null)
    @if($origen)
        <div class="box"><b>Fundamento nutricional:</b> {{ $origen['conclusion'] ?: 'Plan derivado de una recomendación nutricional experta validada.' }}
            @if(!empty($origen['explicacion']))<br><span class="motivo">{{ implode(' · ', $origen['explicacion']) }}</span>@endif
        </div>
    @endif
    <h3>Comidas recomendadas durante la semana</h3>
    @foreach($plan['dias'] as $dia)
    <div class="dia"><table class="grid"><thead><tr><th colspan="4">Día {{ $dia['numero_dia'] }} · {{ $dia['nombre_dia'] }} {{ !empty($dia['fecha']) ? '· '.$dia['fecha'] : '' }}</th></tr><tr><th style="width:17%">Tiempo</th><th style="width:18%">Hora</th><th>Receta o componente recomendado</th><th style="width:18%">Aporte</th></tr></thead><tbody>
        @foreach($dia['comidas'] as $comida)
            @foreach($comida['componentes'] as $componente)
            @php($explicacion = $componente['explicacion_seleccion'] ?? [])
            <tr><td>{{ ucfirst(str_replace('_',' ',$comida['tipo_comida'])) }}</td><td>{{ substr((string)($comida['hora_sugerida'] ?? ''),0,5) ?: 'Sin hora' }}</td><td><b>{{ $componente['nombre'] ?? 'Sin nombre' }}</b> · {{ number_format($componente['cantidad'],1,',','.') }} {{ $componente['unidad'] ?? '' }}
                @if(!empty($explicacion['motivos']))<br><span class="motivo"><b>¿Por qué?</b> {{ implode('; ', $explicacion['motivos']) }}</span>@elseif(($componente['tipo_componente'] ?? '') === 'manual')<br><span class="motivo">Indicación definida directamente por la nutricionista.</span>@endif
                @if(($explicacion['puntaje_experto'] ?? null) !== null)<br><span class="motivo">Puntaje experto: {{ number_format($explicacion['puntaje_experto'],0) }}</span>@endif
                @if(!empty($explicacion['advertencias']))<br><span class="warn">{{ implode(' ', $explicacion['advertencias']) }}</span>@endif
            </td><td>{{ number_format($componente['calorias'] ?? 0,1,',','.') }} kcal<br><span class="muted">P {{ number_format($componente['proteinas'] ?? 0,1,',','.') }} g · C {{ number_format($componente['carbohidratos'] ?? 0,1,',','.') }} g</span></td></tr>
            @endforeach
        @endforeach
    </tbody></table></div>
    @endforeach
    @if(!empty($plan['observaciones']))<p><b>Observación profesional:</b> {{ $plan['observaciones'] }}</p>@endif
</section>
@empty
<div class="empty">No existen planes que coincidan con los filtros seleccionados.</div>
@endforelse

<footer class="footer"><b>Almendra Nutrición</b> · Historial nutricional generado según los filtros indicados. Documento para interpretación profesional.</footer>
</body></html>
