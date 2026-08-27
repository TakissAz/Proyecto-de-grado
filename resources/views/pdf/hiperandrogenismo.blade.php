<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Historial de hiperandrogenismo</title>
<style>
@page{margin:28px 34px}
body{font-family:DejaVu Sans,sans-serif;color:#243632;font-size:9.5px;line-height:1.45}
.brand{color:#176b5b;font-size:9px;font-weight:bold;letter-spacing:1.2px}
.header{border-bottom:3px solid #1f8a70;padding-bottom:12px}
.header h1{font-size:20px;margin:4px 0;color:#123d35}
.meta{color:#657a75}
.hero{margin:14px 0;padding:12px 14px;background:#eaf7f3;border-radius:8px}
.hero .label{font-size:8px;text-transform:uppercase;color:#667b76}
.hero strong{font-size:15px;color:#176b5b}
h2{font-size:12px;color:#176b5b;border-bottom:1px solid #b9d8d0;padding-bottom:4px;margin:15px 0 7px}
table{width:100%;border-collapse:collapse;margin:5px 0}
td,th{border:1px solid #d6e2df;padding:5px 6px;text-align:left;font-size:8.5px}
th{background:#f2f7f5;color:#365d54}
.label{font-size:8px;text-transform:uppercase;color:#667b76}
.stats td{width:25%;text-align:center;background:#f7fbfa}
.stats .num{font-size:16px;font-weight:bold;color:#176b5b}
.chip{display:inline-block;padding:2px 6px;border-radius:8px;font-size:7.5px;font-weight:bold;background:#fff2e0;color:#b45d00;margin:1px}
.chip-green{background:#e3f5e0;color:#1e7a2e}
.filtro{display:inline-block;padding:3px 8px;background:#fff;border:1px solid #80bcae;border-radius:10px;font-size:8px;margin-right:5px}
.footer{position:fixed;bottom:-15px;left:0;right:0;text-align:center;color:#78908a;font-size:8px}
.note{padding:9px;background:#fff8df;border:1px solid #e3cb75;border-radius:6px;margin-top:14px}
</style></head><body>

<div class="header">
    <div class="brand">HISTORIA CLÍNICA · HIPERANDROGENISMO</div>
    <h1>Reporte de hiperandrogenismo clínico</h1>
    <div class="meta">Documento clínico · Generado {{ $fechaGeneracion->format('d/m/Y H:i') }}</div>
</div>

<div class="hero">
    <div class="label">Paciente</div>
    <strong>{{ $nombrePaciente ?: 'Sin nombre' }}</strong>
    <div>CI: {{ $paciente->ci ?: 'N/D' }} · Edad: {{ $paciente->fecha_nacimiento?->age ?? 'N/D' }} años</div>
</div>

@if($filtros['signo'] ?? $filtros['progresion'] ?? $filtros['desde'] ?? $filtros['hasta'] ?? false)
<h2>Filtros aplicados</h2>
<div>
    @if($filtros['signo'] ?? false)<span class="filtro">Signo: {{ str_replace('_', ' ', $filtros['signo']) }}</span>@endif
    @if($filtros['progresion'] ?? false)<span class="filtro">Progresión: {{ ucfirst($filtros['progresion']) }}</span>@endif
    @if($filtros['desde'] ?? false)<span class="filtro">Desde: {{ $filtros['desde'] }}</span>@endif
    @if($filtros['hasta'] ?? false)<span class="filtro">Hasta: {{ $filtros['hasta'] }}</span>@endif
</div>
@endif

<h2>Resumen estadístico</h2>
<table class="stats">
    <tr>
        <td><div class="num">{{ $stats['total'] }}</div><div class="label">Registros</div></td>
        <td><div class="num">{{ $stats['con_acne'] }}</div><div class="label">Con acné</div></td>
        <td><div class="num">{{ $stats['con_hirsutismo'] }}</div><div class="label">Con hirsutismo</div></td>
        <td><div class="num">{{ $stats['ferriman_promedio'] ? round($stats['ferriman_promedio'], 1) : '—' }}</div><div class="label">Ferriman prom.</div></td>
    </tr>
</table>

<h2>Registros cronológicos ({{ $registros->count() }})</h2>
@if($registros->isEmpty())
    <p style="color:#657a75;font-style:italic">No se encontraron registros con los filtros seleccionados.</p>
@else
<table>
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Ferriman-Gallwey</th>
            <th>Zona hirsutismo</th>
            <th>Inicio síntomas</th>
            <th>Progresión</th>
            <th>Signos presentes</th>
        </tr>
    </thead>
    <tbody>
        @foreach($registros as $r)
        <tr>
            <td>{{ $r->created_at?->format('d/m/Y') ?? '—' }}</td>
            <td>{{ $r->puntaje_ferriman_gallwey !== null ? $r->puntaje_ferriman_gallwey.' / 36' : '—' }}</td>
            <td>{{ $r->hirsutismo_zona ?: '—' }}</td>
            <td>{{ $r->inicio_sintomas ?: '—' }}</td>
            <td>{{ ['estable'=>'Estable','progresivo'=>'Progresivo','regresivo'=>'Regresivo'][$r->progresion_sintomas] ?? '—' }}</td>
            <td>
                @if($r->acne)<span class="chip">Acné{{ $r->acne_grado && $r->acne_grado !== 'no_aplica' ? ' ('.$r->acne_grado.')' : '' }}</span>@endif
                @if($r->hirsutismo)<span class="chip">Hirsutismo</span>@endif
                @if($r->alopecia_androgenica)<span class="chip">Alopecia androgénica</span>@endif
                @if($r->seborrea)<span class="chip">Seborrea</span>@endif
                @if(!$r->acne && !$r->hirsutismo && !$r->alopecia_androgenica && !$r->seborrea)
                    <span class="chip chip-green">Sin signos</span>
                @endif
            </td>
        </tr>
        @if($r->observaciones)
        <tr>
            <td colspan="6" style="background:#fdf9f3;color:#8a6a45;font-style:italic">Obs.: {{ $r->observaciones }}</td>
        </tr>
        @endif
        @endforeach
    </tbody>
</table>
@endif

<div class="note">
    <b>Nota clínica:</b> Este reporte refleja los registros de hiperandrogenismo de la paciente según los filtros aplicados. La interpretación clínica es responsabilidad del profesional tratante.
</div>

<div class="footer">Reporte confidencial · Hiperandrogenismo de {{ $nombrePaciente }}</div>
</body></html>
