<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte justificativo del plan alimentario semanal</title>
    <style>
        @page { margin: 28px 32px; }
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #243047; font-size: 9px; line-height: 1.42; }
        h1 { font-size: 21px; color: #173b57; margin: 5px 0; }
        h2 { font-size: 13px; color: #075985; border-bottom: 2px solid #bae6fd; padding-bottom: 4px; margin: 18px 0 8px; }
        h3 { font-size: 11px; color: #155e75; margin: 11px 0 5px; }
        p { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin: 5px 0 9px; }
        th { background: #e0f2fe; color: #164e63; text-align: left; }
        th, td { border: 1px solid #cbd5e1; padding: 4px 5px; vertical-align: top; }
        .header { background: #0f4664; color: white; padding: 15px 18px; border-radius: 5px; }
        .header h1 { color: white; }
        .subtitle { color: #bae6fd; font-size: 11px; }
        .grid { width: 100%; }
        .grid td { width: 50%; border: 0; padding: 2px 8px 2px 0; }
        .label { color: #64748b; font-size: 7px; text-transform: uppercase; font-weight: bold; }
        .value { font-weight: bold; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 8px; background: #e0f2fe; color: #075985; margin: 1px; }
        .ok { color: #166534; font-weight: bold; }
        .warn { color: #9a3412; font-weight: bold; }
        .alert { background: #fff7ed; border-left: 4px solid #f97316; padding: 7px 9px; margin: 5px 0; }
        .note { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 7px 9px; margin: 6px 0; }
        .day { page-break-inside: avoid; margin-top: 12px; }
        .meal { page-break-inside: avoid; }
        .small { font-size: 7.5px; color: #475569; }
        .right { text-align: right; }
        .center { text-align: center; }
        .footer { margin-top: 20px; border-top: 1px solid #94a3b8; padding-top: 8px; color: #64748b; }
        ul { margin: 3px 0 5px 16px; padding: 0; }
    </style>
</head>
<body>
@php
    $sin = fn ($v) => filled($v) ? str_replace('_', ' ', (string) $v) : 'Sin registros';
    $lista = fn ($v) => is_array($v) ? $v : (filled($v) ? [$v] : []);
    $nombrePaciente = trim(implode(' ', array_filter([$paciente?->nombres, $paciente?->apellido_paterno, $paciente?->apellido_materno])));
@endphp

<header class="header">
    <div class="subtitle">PLATAFORMA CLÍNICA Y NUTRICIONAL PMOS</div>
    <h1>Reporte justificativo del plan alimentario semanal</h1>
    <div class="subtitle">Sistema experto nutricional PMOS/RI · Evidencia de trazabilidad y explicabilidad</div>
    <table class="grid" style="color:white;margin-top:9px">
        <tr><td><span class="label" style="color:#bae6fd">Paciente</span><br><b>{{ $nombrePaciente ?: 'Sin registro' }}</b></td><td><span class="label" style="color:#bae6fd">Nutricionista</span><br><b>{{ $nutricionista?->name ?? 'Sin registro' }}</b></td></tr>
        <tr><td><span class="label" style="color:#bae6fd">Estado y periodo</span><br>{{ $sin($plan->estado_plan) }} · {{ $plan->fecha_inicio?->format('d/m/Y') ?? 'Sin fecha' }} a {{ $plan->fecha_fin?->format('d/m/Y') ?? 'Sin fecha' }}</td><td><span class="label" style="color:#bae6fd">Generado</span><br>{{ $fechaGeneracion->format('d/m/Y H:i') }}</td></tr>
    </table>
</header>

<h2>A. Datos generales del paciente</h2>
<table class="grid">
    <tr><td><span class="label">Nombre completo</span><br><span class="value">{{ $nombrePaciente ?: 'Sin registros' }}</span></td><td><span class="label">Edad / sexo</span><br><span class="value">{{ $paciente?->fecha_nacimiento?->age ?? 'Sin registro' }} años · {{ $sin($paciente?->sexo) }}</span></td></tr>
    <tr><td><span class="label">Fecha de nacimiento</span><br>{{ $paciente?->fecha_nacimiento?->format('d/m/Y') ?? 'Sin registros' }}</td><td><span class="label">Teléfono</span><br>{{ $paciente?->telefono ?: 'Sin registros' }}</td></tr>
    <tr><td><span class="label">Fecha de registro</span><br>{{ $paciente?->fecha_registro?->format('d/m/Y') ?? 'Sin registros' }}</td><td><span class="label">Identificador del plan</span><br>#{{ $plan->getKey() }}</td></tr>
</table>

<h2>B. Diagnóstico clínico considerado</h2>
<table><tbody>
@foreach($datosClinicos as $etiqueta => $valor)
    <tr><th style="width:34%">{{ $etiqueta }}</th><td>{{ $sin($valor) }}</td></tr>
@endforeach
</tbody></table>

<h2>C. Datos nutricionales considerados</h2>
<table><tbody>
@foreach($datosNutricionales as $etiqueta => $valor)
    <tr><th style="width:34%">{{ $etiqueta }}</th><td>{{ $sin($valor) }}</td></tr>
@endforeach
</tbody></table>

<h2>D. Restricciones, preferencias y hábitos considerados</h2>
<table><tbody>
@foreach($contextoAlimentario as $etiqueta => $valores)
    <tr><th style="width:34%">{{ $etiqueta }}</th><td>
        @forelse($valores as $valor)<span class="badge">{{ $valor }}</span>@empty Sin registros @endforelse
    </td></tr>
@endforeach
</tbody></table>

<h2>E. Recomendación nutricional experta base</h2>
@if($recomendacion)
<table class="grid">
    <tr><td><span class="label">Enfoque nutricional experto</span><br><span class="value">{{ $sin($recomendacion->enfoque_nutricional_experto) }}</span></td><td><span class="label">Prioridad nutricional</span><br><span class="value">{{ $sin($recomendacion->prioridad_nutricional) }}</span></td></tr>
    <tr><td><span class="label">Confianza experta</span><br>{{ $recomendacion->confianza_experta !== null ? number_format((float)$recomendacion->confianza_experta * 100, 0).'%' : 'Sin registros' }}</td><td><span class="label">Validación</span><br>{{ $sin($recomendacion->estado_validacion_experta) }} · {{ $recomendacion->validadorExperto?->name ?? 'Sin validador' }} · {{ $recomendacion->fecha_validacion?->format('d/m/Y H:i') ?? 'Sin fecha' }}</td></tr>
</table>
<p><b>Conclusión:</b> {{ $recomendacion->conclusion ?: 'Sin registros' }}</p>
@foreach(['Recomendaciones'=>$recomendacion->recomendaciones,'Alertas'=>$recomendacion->alertas,'Reglas activadas'=>$recomendacion->reglas_activadas,'Explicación experta'=>$recomendacion->explicacion_experta] as $titulo=>$elementos)
    <h3>{{ $titulo }}</h3><ul>@forelse($lista($elementos) as $item)<li>{{ is_scalar($item) ? $item : json_encode($item, JSON_UNESCAPED_UNICODE) }}</li>@empty<li>Sin registros</li>@endforelse</ul>
@endforeach
@else
<div class="alert">El plan no tiene una recomendación nutricional experta asociada.</div>
@endif

<h2>F. Criterios expertos de selección de recetas</h2>
<div class="note">El sistema seleccionó y ordenó recetas considerando compatibilidad con el tipo de comida, alergias y restricciones, preferencias del paciente, resistencia a la insulina, bajo índice glucémico, aporte de proteína y fibra, cercanía a las calorías objetivo y diversidad semanal. Cuando existían siete o más alternativas compatibles, evitó la repetición durante la semana.</div>
<ul>
    <li>Las restricciones clínicas se aplicaron como criterio de descarte.</li>
    <li>Las preferencias se utilizaron para aumentar la afinidad, sin reemplazar la seguridad alimentaria.</li>
    <li>La cercanía calórica ordenó las opciones, pero no descartó recetas compatibles.</li>
    <li>El puntaje ajustado incorpora diversidad y alternancia de fuentes proteicas.</li>
</ul>

<h2>G. Resumen nutricional semanal</h2>
<table>
    <thead><tr><th>Métrica</th><th class="right">Objetivo semanal</th><th class="right">Planificado</th><th class="right">Diferencia</th><th class="right">Diferencia %</th><th>Evaluación</th></tr></thead>
    <tbody>@foreach($resumen as $fila)<tr>
        <td><b>{{ $fila['nombre'] }}</b></td><td class="right">{{ number_format($fila['objetivo'],2) }} {{ $fila['unidad'] }}</td><td class="right">{{ number_format($fila['planificado'],2) }} {{ $fila['unidad'] }}</td><td class="right">{{ number_format($fila['diferencia'],2) }}</td><td class="right">{{ number_format($fila['porcentaje'],1) }}%</td><td class="{{ $fila['alerta']?'warn':'ok' }}">{{ $fila['alerta']?'Revisar (>15%)':'Dentro del margen' }}</td>
    </tr>@endforeach</tbody>
</table>

<h2>H. Plan semanal detallado y justificación</h2>
@foreach($plan->dias as $dia)
<section class="day">
    <h3>{{ $dia->nombre_dia }} {{ $dia->fecha ? '· '.$dia->fecha->format('d/m/Y') : '' }}</h3>
    <p class="small"><b>Resumen diario:</b> {{ $dia->calorias_totales }} kcal · P {{ $dia->proteinas_totales }} g · C {{ $dia->carbohidratos_totales }} g · G {{ $dia->grasas_totales }} g · Fibra {{ $dia->fibra_total }} g</p>
    @foreach($dia->comidas as $comida)
    <div class="meal">
        <table>
            <thead><tr><th colspan="7">{{ ucfirst(str_replace('_',' ',$comida->tipo_comida)) }} · {{ substr((string)$comida->hora_sugerida,0,5) }} · {{ $comida->calorias_totales }} kcal</th></tr><tr><th>Componente</th><th>Cantidad</th><th>kcal</th><th>P</th><th>C</th><th>G</th><th>Fibra</th></tr></thead>
            <tbody>
            @foreach($comida->componentes as $componente)
                @php($exp = $componente->explicacion_pdf ?? [])
                <tr><td><b>{{ $componente->receta?->nombre ?? $componente->alimento?->nombre ?? $componente->nombre_manual ?? 'Sin nombre' }}</b><br><span class="small">Tipo: {{ $componente->tipo_componente }}</span></td><td>{{ $componente->cantidad }} {{ $componente->unidad }}</td><td>{{ $componente->calorias }}</td><td>{{ $componente->proteinas }}</td><td>{{ $componente->carbohidratos }}</td><td>{{ $componente->grasas }}</td><td>{{ $componente->fibra }}</td></tr>
                <tr><td colspan="7"><b>Justificación:</b>
                    @if($componente->tipo_componente === 'manual') <span class="warn">Componente manual/fallback pendiente de revisión profesional.</span>
                    @elseif(($exp['puntaje_experto'] ?? null) !== null)
                        Puntaje experto: <b>{{ $exp['puntaje_experto'] }}</b> · Puntaje ajustado: <b>{{ $exp['puntaje_ajustado'] ?? 'Sin registro' }}</b>.
                        Motivos: {{ ($exp['motivos'] ?? []) ? implode('; ', $exp['motivos']) : 'Sin motivos registrados' }}.
                        @foreach($exp['advertencias'] ?? [] as $advertencia)<span class="warn">{{ $advertencia }}</span>@endforeach
                    @else {{ $componente->observaciones ?: 'Componente incorporado por criterio profesional.' }} @endif
                </td></tr>
            @endforeach
            </tbody>
        </table>
    </div>
    @endforeach
</section>
@endforeach

<h2>I. Advertencias y revisión profesional</h2>
<ul>
    <li>Comidas/componentes manuales pendientes: <b>{{ $componentesManuales }}</b>.</li>
    <li>Recetas repetidas por disponibilidad limitada: <b>{{ $repeticiones }}</b>.</li>
    <li>Desviaciones nutricionales superiores a ±15%: <b>{{ $desviaciones->count() }}</b>@if($desviaciones->isNotEmpty()) ({{ $desviaciones->pluck('nombre')->implode(', ') }})@endif.</li>
    @forelse($lista($recomendacion?->alertas) as $alerta)<li class="warn">{{ $alerta }}</li>@empty<li>Alertas expertas adicionales: sin registros.</li>@endforelse
</ul>

<h2>J. Conclusión del sistema experto</h2>
<div class="note">El plan alimentario semanal fue generado a partir de la recomendación nutricional experta aprobada, considerando los diagnósticos clínicos, requerimientos nutricionales, restricciones alimentarias, preferencias y hábitos registrados. Las recetas fueron seleccionadas priorizando compatibilidad clínica, aporte nutricional y diversidad semanal.</div>

<h2>K. Validación profesional</h2>
<table class="grid">
    <tr><td><span class="label">Estado del plan</span><br><span class="value">{{ $sin($plan->estado_plan) }}</span></td><td><span class="label">Responsable de aprobación</span><br>{{ $plan->aprobador?->name ?? 'Sin registro' }}</td></tr>
    <tr><td><span class="label">Fecha de aprobación</span><br>{{ $plan->fecha_aprobacion?->format('d/m/Y H:i') ?? 'Sin registros' }}</td><td><span class="label">Observaciones</span><br>{{ $plan->observaciones ?: 'Sin registros' }}</td></tr>
</table>
<p class="center value">{{ in_array($plan->estado_plan, ['aprobado','finalizado']) ? 'Validado por nutricionista responsable' : 'Pendiente de validación profesional' }}</p>

<footer class="footer">Documento generado por el Sistema Experto Nutricional PMOS/RI. Este reporte conserva la trazabilidad de la recomendación y requiere interpretación profesional.</footer>
</body>
</html>
