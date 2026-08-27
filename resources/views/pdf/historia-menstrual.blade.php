<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Historial menstrual</title>
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
.value{font-size:11px;font-weight:bold}
.stats td{width:25%;text-align:center;background:#f7fbfa}
.stats .num{font-size:16px;font-weight:bold;color:#176b5b}
.chip{display:inline-block;padding:2px 6px;border-radius:8px;font-size:7.5px;font-weight:bold;background:#fff2e0;color:#b45d00;margin:1px}
.chip-red{background:#fde3e0;color:#c0392b}
.chip-green{background:#e3f5e0;color:#1e7a2e}
.filtro{display:inline-block;padding:3px 8px;background:#fff;border:1px solid #80bcae;border-radius:10px;font-size:8px;margin-right:5px}
.footer{position:fixed;bottom:-15px;left:0;right:0;text-align:center;color:#78908a;font-size:8px}
.note{padding:9px;background:#fff8df;border:1px solid #e3cb75;border-radius:6px;margin-top:14px}
.signature{margin-top:28px;width:45%;border-top:1px solid #667b76;padding-top:5px;text-align:center;font-size:8.5px}
</style></head><body>

<div class="header">
    <div class="brand">HISTORIA CLÍNICA · SALUD ENDOCRINA</div>
    <h1>Reporte de historia menstrual</h1>
    <div class="meta">Documento clínico · Generado {{ $fechaGeneracion->format('d/m/Y H:i') }}</div>
</div>

<div class="hero">
    <div class="label">Paciente</div>
    <strong>{{ $nombrePaciente ?: 'Sin nombre' }}</strong>
    <div>CI: {{ $paciente->ci ?: 'N/D' }} · Edad: {{ $paciente->fecha_nacimiento?->age ?? 'N/D' }} años</div>
</div>

@if($filtros['regularidad'] ?? $filtros['hallazgo'] ?? $filtros['desde'] ?? $filtros['hasta'] ?? false)
<h2>Filtros aplicados</h2>
<div>
    @if($filtros['regularidad'] ?? false)<span class="filtro">Regularidad: {{ ucfirst($filtros['regularidad']) }}</span>@endif
    @if($filtros['hallazgo'] ?? false)<span class="filtro">Hallazgo: {{ str_replace('_', ' ', $filtros['hallazgo']) }}</span>@endif
    @if($filtros['desde'] ?? false)<span class="filtro">Desde: {{ $filtros['desde'] }}</span>@endif
    @if($filtros['hasta'] ?? false)<span class="filtro">Hasta: {{ $filtros['hasta'] }}</span>@endif
</div>
@endif

<h2>Resumen estadístico</h2>
<table class="stats">
    <tr>
        <td><div class="num">{{ $stats['total'] }}</div><div class="label">Registros</div></td>
        <td><div class="num">{{ $stats['promedio_duracion'] ? round($stats['promedio_duracion'], 1) : '—' }}</div><div class="label">Duración prom. (días)</div></td>
        <td><div class="num">{{ $stats['promedio_intervalo'] ? round($stats['promedio_intervalo'], 1) : '—' }}</div><div class="label">Intervalo prom. (días)</div></td>
        <td><div class="num">{{ $stats['con_anovulacion'] }}</div><div class="label">Anovulación confirmada</div></td>
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
            <th>Regularidad</th>
            <th>Duración</th>
            <th>Intervalo</th>
            <th>Menarquía</th>
            <th>Últ. menst.</th>
            <th>Progest.</th>
            <th>Hallazgos</th>
        </tr>
    </thead>
    <tbody>
        @foreach($registros as $r)
        <tr>
            <td>{{ $r->created_at?->format('d/m/Y') ?? '—' }}</td>
            <td>{{ ['regular'=>'Regular','irregular'=>'Irregular','ausente'=>'Ausente'][$r->regularidad_ciclo] ?? '—' }}</td>
            <td>{{ $r->duracion_ciclo_dias ? $r->duracion_ciclo_dias.' días' : '—' }}</td>
            <td>{{ $r->intervalo_entre_ciclos_dias ? $r->intervalo_entre_ciclos_dias.' días' : '—' }}</td>
            <td>{{ $r->edad_menarquia ? $r->edad_menarquia.' años' : '—' }}</td>
            <td>{{ $r->fecha_ultima_menstruacion?->format('d/m/Y') ?? '—' }}</td>
            <td>{{ $r->progesterona_lutea ?? '—' }}</td>
            <td>
                @if($r->amenorrea)<span class="chip">Amenorrea</span>@endif
                @if($r->oligomenorrea)<span class="chip">Oligomenorrea</span>@endif
                @if($r->sangrado_abundante)<span class="chip">Sangrado abund.</span>@endif
                @if($r->dolor_menstrual)<span class="chip">Dolor</span>@endif
                @if($r->sospecha_anovulacion)<span class="chip">Sosp. anovulación</span>@endif
                @if($r->confirma_anovulacion_por_progesterona)<span class="chip chip-red">Anovulación confirmada</span>@endif
                @if(!$r->amenorrea && !$r->oligomenorrea && !$r->sangrado_abundante && !$r->dolor_menstrual && !$r->sospecha_anovulacion && !$r->confirma_anovulacion_por_progesterona)
                    <span class="chip chip-green">Sin hallazgos</span>
                @endif
            </td>
        </tr>
        @if($r->observaciones)
        <tr>
            <td colspan="8" style="background:#fafcfb;color:#657a75;font-style:italic">Obs.: {{ $r->observaciones }}</td>
        </tr>
        @endif
        @endforeach
    </tbody>
</table>
@endif

<div class="note">
    <b>Nota clínica:</b> Este reporte refleja los registros de historia menstrual de la paciente según los filtros aplicados. La interpretación clínica es responsabilidad del profesional tratante.
</div>

<div class="footer">Reporte confidencial · Historia menstrual de {{ $nombrePaciente }}</div>
</body></html>
