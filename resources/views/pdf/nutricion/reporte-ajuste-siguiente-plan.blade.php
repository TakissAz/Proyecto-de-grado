<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Reporte para el siguiente plan nutricional</title>
<style>
@page{margin:28px 34px}body{font-family:DejaVu Sans,sans-serif;color:#263238;font-size:9px;line-height:1.45}h1{margin:0;color:#174d3b;font-size:19px}h2{margin:17px 0 7px;border-bottom:1px solid #b8d0c7;padding-bottom:4px;color:#174d3b;font-size:12px;page-break-after:avoid}.head{border-bottom:3px solid #2f8066;padding-bottom:11px}.right{float:right;text-align:right}.clear{clear:both}.muted{color:#6d817a}.box{margin:7px 0;border:1px solid #d7e5df;background:#f5f9f7;padding:9px}.summary{width:100%;border-collapse:separate;border-spacing:5px}.summary td{width:25%;border:1px solid #d7e5df;background:#f8faf9;padding:8px}.summary b{display:block;margin-top:2px;color:#174d3b;font-size:14px}.grid{width:100%;border-collapse:collapse}.grid thead{display:table-header-group}.grid tr{page-break-inside:avoid}.grid th,.grid td{border:1px solid #d9e1de;padding:6px;text-align:left;vertical-align:top}.grid th{background:#e8f1ed;color:#174d3b;font-size:8px}.good td:first-child{border-left:3px solid #2f9a61}.review td:first-child{border-left:3px solid #d99b21}.tag{display:inline-block;margin:2px;padding:2px 6px;border-radius:8px;background:#e8f1ed;color:#174d3b}.footer{margin-top:20px;border-top:1px solid #aebdb8;padding-top:7px}ul{margin:5px 0;padding-left:17px}
</style></head><body>
@php
$nombre = trim(collect([$paciente->nombres, $paciente->apellido_paterno, $paciente->apellido_materno])->filter()->join(' '));
$favorecidas = collect($contexto['recetas_bien_aceptadas'] ?? [])->map(fn ($x) => ['nombre' => $x['nombre'] ?? null, 'motivo' => $x['motivo'] ?? 'Buena aceptación y tolerancia reportadas.'])
    ->concat(collect($analitica['recetas_aceptadas'] ?? [])->map(fn ($x) => ['nombre' => $x['nombre'] ?? null, 'motivo' => 'Aceptación favorable observada en el seguimiento.']))->filter(fn ($x) => $x['nombre'])->unique('nombre')->values();
$revisar = collect($contexto['recetas_a_evitar'] ?? [])->map(fn ($x) => ['nombre' => $x['nombre'] ?? null, 'motivo' => $x['motivo'] ?? 'Requiere revisión antes de repetir.'])
    ->concat(collect($analitica['recetas_problematicas'] ?? [])->map(fn ($x) => ['nombre' => $x['nombre'] ?? null, 'motivo' => ! empty($x['motivos']) ? implode(', ', array_map(fn ($m) => str_replace('_', ' ', $m), $x['motivos'])) : 'Baja aceptación o dificultad reportada.']))->filter(fn ($x) => $x['nombre'])->unique('nombre')->values();
$ingredientes = collect($contexto['ingredientes_no_conseguidos'] ?? [])->concat(collect(data_get($analitica, 'problemas_practicos.ingredientes_no_conseguidos', [])))->pluck('nombre')->filter()->unique()->values();
$dificiles = collect($contexto['recetas_dificiles'] ?? [])->concat(collect(data_get($analitica, 'problemas_practicos.recetas_dificiles', [])))->pluck('nombre')->filter()->unique()->values();
$saciedad = collect(array_keys($contexto['necesita_mas_saciedad'] ?? []))->map(fn ($x) => ucfirst(str_replace('_', ' ', $x)));
$sintomas = collect(['hambre_nocturna_frecuente' => 'Hambre nocturna frecuente', 'ansiedad_comida_frecuente' => 'Ansiedad por comida', 'antojos_dulces_frecuentes' => 'Antojos dulces frecuentes', 'hinchazon_frecuente' => 'Hinchazón frecuente'])->filter(fn ($label, $key) => (bool) ($contexto[$key] ?? false))->values();
$recomendaciones = collect($contexto['recomendaciones_nutricionista'] ?? [])->filter()->unique()->values();
$estado = ucfirst(str_replace('_', ' ', (string) ($contexto['estado_periodo'] ?? 'sin registros')));
@endphp

<div class="head"><div class="right"><b>{{ $fechaGeneracion->copy()->timezone('America/La_Paz')->format('d/m/Y H:i') }}</b><br><span class="muted">Hora de Bolivia</span></div><h1>Reporte de ajustes para el siguiente plan</h1><div class="muted">Síntesis de hallazgos obtenidos del seguimiento nutricional</div><div class="clear"></div></div>

<h2>Paciente y periodo considerado</h2>
<table class="grid"><tr><th>Paciente</th><th>CI / código</th><th>Plan analizado</th><th>Estado del seguimiento</th><th>Nutricionista responsable</th></tr><tr><td>{{ $nombre }}</td><td>{{ $paciente->ci ?: 'Sin registro' }}</td><td>{{ $contexto['nombre_plan_considerado'] ?? 'Sin plan' }}</td><td>{{ $estado }}</td><td>{{ $profesional->name }}</td></tr></table>

@if(in_array($contexto['estado_periodo'] ?? null, ['no_iniciado', 'sin_registros'], true))
<div class="box"><b>Resultado aún no disponible:</b> {{ ($contexto['estado_periodo'] ?? null) === 'no_iniciado' ? 'el plan todavía no comenzó.' : 'el plan está en curso, pero aún no existen respuestas reales suficientes.' }} No se generan conclusiones anticipadas.</div>
@else
<table class="summary"><tr><td>Recetas favorables<b>{{ $favorecidas->count() }}</b></td><td>Recetas a revisar<b>{{ $revisar->count() }}</b></td><td>Barreras prácticas<b>{{ $ingredientes->count() + $dificiles->count() }}</b></td><td>Señales clínicas<b>{{ $sintomas->count() + $saciedad->count() }}</b></td></tr></table>

<div class="box"><b>Cómo interpretar este reporte:</b> “Favorecer” significa conservar opciones aceptadas y toleradas. “Revisar” no implica prohibición; indica que la nutricionista debe adaptar, sustituir o comprobar tolerancia según el motivo registrado.</div>

<div><h2>1. Preparaciones que conviene mantener</h2>
@if($favorecidas->isEmpty())<p class="muted">Todavía no existen recetas con evidencia suficiente para priorizar.</p>@else<table class="grid"><thead><tr><th>Receta</th><th>¿Por qué se favorece?</th><th>Aplicación sugerida</th></tr></thead><tbody>@foreach($favorecidas as $item)<tr class="good"><td><b>{{ $item['nombre'] }}</b></td><td>{{ $item['motivo'] }}</td><td>Mantener como alternativa, verificando que continúe siendo bien tolerada.</td></tr>@endforeach</tbody></table>@endif</div>

<div><h2>2. Preparaciones que requieren revisión</h2>
@if($revisar->isEmpty())<p class="muted">No se identificaron preparaciones que requieran revisión.</p>@else<table class="grid"><thead><tr><th>Receta</th><th>Hallazgo que explica la revisión</th><th>Decisión sugerida</th></tr></thead><tbody>@foreach($revisar as $item)<tr class="review"><td><b>{{ $item['nombre'] }}</b></td><td>{{ $item['motivo'] }}</td><td>Adaptar ingredientes, porción o preparación antes de repetir; sustituirla si el problema persiste.</td></tr>@endforeach</tbody></table>@endif</div>

<h2>3. Barreras y señales consideradas</h2>
<table class="grid"><tr><th>Ingredientes no conseguidos</th><th>Preparaciones difíciles</th><th>Tiempos que necesitan más saciedad</th><th>Síntomas frecuentes</th></tr><tr><td>@forelse($ingredientes as $item)<span class="tag">{{ $item }}</span>@empty Sin registros @endforelse</td><td>@forelse($dificiles as $item)<span class="tag">{{ $item }}</span>@empty Sin registros @endforelse</td><td>@forelse($saciedad as $item)<span class="tag">{{ $item }}</span>@empty Sin registros @endforelse</td><td>@forelse($sintomas as $item)<span class="tag">{{ $item }}</span>@empty Sin registros @endforelse</td></tr></table>

<h2>4. Orientaciones profesionales consideradas</h2>
@if($recomendaciones->isEmpty())<p class="muted">No existen orientaciones profesionales adicionales registradas.</p>@else<ul>@foreach($recomendaciones as $item)<li>{{ $item }}</li>@endforeach</ul>@endif

<h2>Conclusión para la próxima planificación</h2>
<p>El siguiente plan debe priorizar las preparaciones con evidencia favorable, revisar las opciones asociadas a baja aceptación o molestias y proponer sustituciones accesibles cuando existan dificultades para conseguir ingredientes. Estos hallazgos sirven como apoyo a la decisión profesional y deben contrastarse con el objetivo nutricional vigente.</p>
@endif

<div class="footer"><b>Responsable:</b> {{ $profesional->name }} &nbsp;&middot;&nbsp; <b>Emitido:</b> {{ $fechaGeneracion->copy()->timezone('America/La_Paz')->format('d/m/Y H:i') }}<br><span class="muted">Documento de apoyo para la revisión nutricional. No constituye un diagnóstico aislado.</span></div>
</body></html>
