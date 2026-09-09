<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Evaluación física endocrina</title>
<style>
@page{margin:26px 30px}
body{font-family:DejaVu Sans,sans-serif;color:#243632;font-size:9px;line-height:1.4}
.brand{color:#176b5b;font-size:9px;font-weight:bold;letter-spacing:1.2px}
.header{border-bottom:3px solid #1f8a70;padding-bottom:10px}
.header h1{font-size:19px;margin:4px 0;color:#123d35}
.meta{color:#657a75}
.hero{margin:12px 0;padding:11px 14px;background:#eaf7f3;border-radius:8px}
.hero .label{font-size:8px;text-transform:uppercase;color:#667b76}
.hero strong{font-size:15px;color:#176b5b}
h2{font-size:12px;color:#176b5b;border-bottom:1px solid #b9d8d0;padding-bottom:4px;margin:13px 0 6px}
table{width:100%;border-collapse:collapse;margin:5px 0}
td,th{border:1px solid #d6e2df;padding:4px 5px;text-align:center;font-size:8px}
th{background:#f2f7f5;color:#365d54}
.label{font-size:8px;text-transform:uppercase;color:#667b76}
.stats td{width:25%;text-align:center;background:#f7fbfa}
.stats .num{font-size:16px;font-weight:bold;color:#176b5b}
.chip{display:inline-block;padding:2px 5px;border-radius:8px;font-size:7px;font-weight:bold;background:#fff2e0;color:#b45d00;margin:1px}
.chip-green{background:#e3f5e0;color:#1e7a2e}
.alto{color:#c0392b;font-weight:bold}
.filtro{display:inline-block;padding:3px 8px;background:#fff;border:1px solid #80bcae;border-radius:10px;font-size:8px;margin-right:5px}
.footer{position:fixed;bottom:-15px;left:0;right:0;text-align:center;color:#78908a;font-size:8px}
.note{padding:8px;background:#fff8df;border:1px solid #e3cb75;border-radius:6px;margin-top:12px}
.current{width:100%;border-collapse:separate;border-spacing:5px}.current td{width:25%;background:#f7fbfa;text-align:left;padding:8px}.current .num{display:block;margin-top:3px;font-size:14px;font-weight:bold;color:#176b5b}.delta{font-size:7px;color:#657a75}.chart{page-break-inside:avoid;margin:7px 0;padding:8px;border:1px solid #d6e2df}.chart-head{font-weight:bold;color:#176b5b}.line{height:7px;margin:11px 0 4px;background:#edf1ef;border-radius:4px;position:relative}.line-fill{height:7px;background:#3a9860;border-radius:4px}.line-fill.orange{background:#dd8b24}.line-fill.purple{background:#8e55b7}.point{display:inline-block;width:32%;font-size:7px;color:#657a75}.point:last-child{text-align:right}.clinical{background:#fff8ef;color:#a65e0b}.clear{clear:both}
</style></head><body>

<div class="header">
    <div class="brand">HISTORIA CLÍNICA · SALUD ENDOCRINA</div>
    <h1>Reporte de evaluación física endocrina</h1>
    <div class="meta">Documento clínico · Generado {{ $fechaGeneracion->format('d/m/Y H:i') }}</div>
</div>

<div class="hero">
    <div class="label">Paciente</div>
    <strong>{{ $nombrePaciente ?: 'Sin nombre' }}</strong>
    <div>CI: {{ $paciente->ci ?: 'N/D' }} · Edad: {{ $paciente->fecha_nacimiento?->age ?? 'N/D' }} años</div>
</div>

@if(($filtros['signo'] ?? false) || ($filtros['imc'] ?? false) || ($filtros['desde'] ?? false) || ($filtros['hasta'] ?? false))
<h2>Filtros aplicados</h2>
<div>
    @if($filtros['signo'] ?? false)<span class="filtro">Signo: {{ str_replace('_', ' ', $filtros['signo']) }}</span>@endif
    @if($filtros['imc'] ?? false)<span class="filtro">IMC: {{ ucfirst($filtros['imc']) }}</span>@endif
    @if($filtros['desde'] ?? false)<span class="filtro">Desde: {{ $filtros['desde'] }}</span>@endif
    @if($filtros['hasta'] ?? false)<span class="filtro">Hasta: {{ $filtros['hasta'] }}</span>@endif
</div>
@endif

<h2>Resumen estadístico</h2>
<table class="stats">
    <tr>
        <td><div class="num">{{ $stats['total'] }}</div><div class="label">Registros</div></td>
        <td><div class="num">{{ $stats['promedio_peso'] ? round($stats['promedio_peso'], 1) : '—' }}</div><div class="label">Peso prom. (kg)</div></td>
        <td><div class="num">{{ $stats['promedio_imc'] ? round($stats['promedio_imc'], 1) : '—' }}</div><div class="label">IMC prom.</div></td>
        <td><div class="num">{{ $stats['promedio_cintura'] ? round($stats['promedio_cintura'], 1) : '—' }}</div><div class="label">Cintura prom. (cm)</div></td>
    </tr>
</table>

@if($actual)
<h2>Lectura del último control</h2>
@php
    $deltaPeso = $anterior && $actual->peso !== null && $anterior->peso !== null ? round($actual->peso - $anterior->peso, 2) : null;
    $deltaCintura = $anterior && $actual->circunferencia_cintura !== null && $anterior->circunferencia_cintura !== null ? round($actual->circunferencia_cintura - $anterior->circunferencia_cintura, 2) : null;
@endphp
<table class="current"><tr>
<td><span class="label">Peso</span><span class="num">{{ $actual->peso !== null ? $actual->peso.' kg' : '—' }}</span><span class="delta">{{ $deltaPeso !== null ? ($deltaPeso > 0 ? '+' : '').$deltaPeso.' kg vs. previo' : 'Sin comparación previa' }}</span></td>
<td><span class="label">IMC</span><span class="num {{ $actual->imc >= 25 ? 'alto' : '' }}">{{ $actual->imc ?? '—' }}</span><span class="delta">{{ $actual->imc !== null ? ($actual->imc >= 30 ? 'Obesidad' : ($actual->imc >= 25 ? 'Sobrepeso' : 'Rango esperado')) : 'Sin registro' }}</span></td>
<td><span class="label">Cintura</span><span class="num {{ $actual->circunferencia_cintura >= 80 ? 'alto' : '' }}">{{ $actual->circunferencia_cintura !== null ? $actual->circunferencia_cintura.' cm' : '—' }}</span><span class="delta">{{ $deltaCintura !== null ? ($deltaCintura > 0 ? '+' : '').$deltaCintura.' cm vs. previo' : 'Sin comparación previa' }}</span></td>
<td><span class="label">Presión arterial</span><span class="num {{ $actual->presion_sistolica >= 130 ? 'alto' : '' }}">{{ $actual->presion_sistolica && $actual->presion_diastolica ? $actual->presion_sistolica.'/'.$actual->presion_diastolica : '—' }}</span><span class="delta">{{ $actual->presion_sistolica >= 130 ? 'Sistólica elevada' : 'Última medición registrada' }}</span></td>
</tr></table>
@endif

@if($series->isNotEmpty())
<h2>Evolución entre controles</h2>
@foreach($series as $serie)
@php
    $primero = $serie['puntos'][0];
    $ultimo = $serie['puntos'][count($serie['puntos']) - 1];
    $cambio = round($ultimo['valor'] - $primero['valor'], 2);
@endphp
<div class="chart"><div class="chart-head">{{ $serie['nombre'] }} <span style="float:right">{{ $primero['valor'] }} → {{ $ultimo['valor'] }} {{ $serie['unidad'] }} · {{ $cambio > 0 ? '+' : '' }}{{ $cambio }}</span><div class="clear"></div></div><div class="line"><div class="line-fill {{ $serie['color'] === 'orange' ? 'orange' : ($serie['color'] === 'purple' ? 'purple' : '') }}" style="width:100%"></div></div><div><span class="point">{{ $primero['fecha'] }} · {{ $primero['valor'] }}</span><span class="point" style="text-align:center">{{ count($serie['puntos']) }} controles</span><span class="point">{{ $ultimo['fecha'] }} · {{ $ultimo['valor'] }}</span></div></div>
@endforeach
@endif

<h2>Registros cronológicos ({{ $registros->count() }})</h2>
@if($registros->isEmpty())
    <p style="color:#657a75;font-style:italic">No se encontraron registros con los filtros seleccionados.</p>
@else
<table>
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Peso</th>
            <th>Talla</th>
            <th>IMC</th>
            <th>Cintura</th>
            <th>Cadera</th>
            <th>ICC</th>
            <th>P. arterial</th>
            <th>Ferriman</th>
            <th>Signos clínicos</th>
        </tr>
    </thead>
    <tbody>
        @foreach($registros as $r)
        @php
            $signos = collect([
                $r->acantosis_nigricans ? 'Acantosis' : null,
                $r->skin_tags ? 'Acrocordones' : null,
                $r->hirsutismo_visible ? 'Hirsutismo' : null,
                $r->acne_visible ? 'Acné' : null,
                $r->alopecia_visible ? 'Alopecia' : null,
                $r->galactorrea ? 'Galactorrea' : null,
            ])->filter();
        @endphp
        <tr>
            <td>{{ $r->created_at?->format('d/m/Y') ?? '—' }}</td>
            <td>{{ $r->peso ? $r->peso.' kg' : '—' }}</td>
            <td>{{ $r->talla ? $r->talla.' m' : '—' }}</td>
            <td class="{{ $r->imc && $r->imc >= 25 ? 'alto' : '' }}">{{ $r->imc ?? '—' }}</td>
            <td class="{{ $r->circunferencia_cintura && $r->circunferencia_cintura >= 80 ? 'alto' : '' }}">{{ $r->circunferencia_cintura ? $r->circunferencia_cintura.' cm' : '—' }}</td>
            <td>{{ $r->circunferencia_cadera ? $r->circunferencia_cadera.' cm' : '—' }}</td>
            <td class="{{ $r->indice_cintura_cadera && $r->indice_cintura_cadera >= 0.85 ? 'alto' : '' }}">{{ $r->indice_cintura_cadera ?? '—' }}</td>
            <td class="{{ $r->presion_sistolica && $r->presion_sistolica >= 130 ? 'alto' : '' }}">{{ $r->presion_sistolica && $r->presion_diastolica ? $r->presion_sistolica.'/'.$r->presion_diastolica : '—' }}</td>
            <td>{{ $r->puntaje_ferriman_gallwey ?? '—' }}</td>
            <td style="text-align:left">
                @forelse($signos as $s)<span class="chip">{{ $s }}</span>@empty<span class="chip chip-green">Sin signos</span>@endforelse
            </td>
        </tr>
        @if($r->observaciones)
        <tr>
            <td colspan="10" style="background:#fafcfb;color:#657a75;font-style:italic;text-align:left">Obs.: {{ $r->observaciones }}</td>
        </tr>
        @endif
        @endforeach
    </tbody>
</table>
@endif

<div class="note">
    <b>Nota clínica:</b> Los valores destacados en rojo superan los umbrales de referencia (IMC ≥ 25, cintura ≥ 80 cm, ICC ≥ 0.85, PA ≥ 130). La interpretación clínica es responsabilidad del profesional tratante.
</div>

<div class="footer">Reporte confidencial · Evaluación física de {{ $nombrePaciente }}</div>
</body></html>
