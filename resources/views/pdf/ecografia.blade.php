<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte ecográfico</title>
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
td,th{border:1px solid #d6e2df;padding:5px 6px;text-align:center;font-size:8.5px}
th{background:#f2f7f5;color:#365d54}
.label{font-size:8px;text-transform:uppercase;color:#667b76}
.stats td{width:20%;text-align:center;background:#f7fbfa}
.stats .num{font-size:16px;font-weight:bold;color:#176b5b}
.stats .num.alto{color:#c0392b}
.chip{display:inline-block;padding:2px 6px;border-radius:8px;font-size:7.5px;font-weight:bold;background:#fff2e0;color:#b45d00;margin:1px}
.chip-red{background:#fde3e0;color:#c0392b}
.chip-green{background:#e3f5e0;color:#1e7a2e}
.alto{color:#c0392b;font-weight:bold}
.filtro{display:inline-block;padding:3px 8px;background:#fff;border:1px solid #80bcae;border-radius:10px;font-size:8px;margin-right:5px}
.footer{position:fixed;bottom:-15px;left:0;right:0;text-align:center;color:#78908a;font-size:8px}
.note{padding:9px;background:#fff8df;border:1px solid #e3cb75;border-radius:6px;margin-top:14px}
.interp{text-align:left;background:#fafcfb;color:#657a75;font-style:italic}
.latest{margin:12px 0;padding:10px 12px;border:1px solid #b9d8d0;border-radius:8px;background:#f7fbfa}
.latest-title{font-size:8px;text-transform:uppercase;font-weight:bold;color:#667b76;letter-spacing:.6px}
.latest-value{font-size:13px;font-weight:bold;color:#176b5b;margin:2px 0 5px}
.latest-grid{width:100%;border:0;margin:0}.latest-grid td{width:25%;border:0;padding:3px 8px 3px 0;text-align:left;background:transparent}
.image-table{border-collapse:separate;border-spacing:8px 8px;margin:0 -8px;width:calc(100% + 16px)}
.image-table td{width:50%;vertical-align:top;text-align:left;border:1px solid #d6e2df;border-radius:7px;padding:7px;background:#fafcfb}
.eco-image{display:block;max-width:100%;width:100%;height:190px;object-fit:contain;background:#edf3f1;border-radius:4px;margin-bottom:6px}
.image-caption{font-size:8px;color:#657a75}.image-caption strong{color:#365d54;font-size:9px}
</style></head><body>

<div class="header">
    <div class="brand">HISTORIA CLÍNICA · EVALUACIÓN ECOGRÁFICA</div>
    <h1>Reporte de evaluaciones ecográficas</h1>
    <div class="meta">Documento clínico · Generado {{ $fechaGeneracion->format('d/m/Y H:i') }}</div>
</div>

<div class="hero">
    <div class="label">Paciente</div>
    <strong>{{ $nombrePaciente ?: 'Sin nombre' }}</strong>
    <div>CI: {{ $paciente->ci ?: 'N/D' }} · Edad: {{ $paciente->fecha_nacimiento?->age ?? 'N/D' }} años</div>
</div>

@if(($filtros['tipo'] ?? false) || ($filtros['morfologia'] ?? false) || ($filtros['desde'] ?? false) || ($filtros['hasta'] ?? false))
<h2>Filtros aplicados</h2>
<div>
    @if($filtros['tipo'] ?? false)<span class="filtro">Tipo: {{ ucfirst($filtros['tipo']) }}</span>@endif
    @if($filtros['morfologia'] ?? false)<span class="filtro">Morfología: {{ $filtros['morfologia'] === 'compatible' ? 'Compatible PMOS' : 'Sin criterios' }}</span>@endif
    @if($filtros['desde'] ?? false)<span class="filtro">Desde: {{ $filtros['desde'] }}</span>@endif
    @if($filtros['hasta'] ?? false)<span class="filtro">Hasta: {{ $filtros['hasta'] }}</span>@endif
</div>
@endif

<h2>Resumen ecográfico</h2>
<table class="stats">
    <tr>
        <td><div class="num">{{ $stats['total'] }}</div><div class="label">Ecografías</div></td>
        <td><div class="num {{ $stats['compatibles'] ? 'alto' : '' }}">{{ $stats['compatibles'] }}</div><div class="label">Compatibles PMOS</div></td>
        <td><div class="num {{ $stats['porcentaje'] >= 50 ? 'alto' : '' }}">{{ $stats['porcentaje'] }}%</div><div class="label">% compatibilidad</div></td>
        <td><div class="num {{ $stats['promedio_vol_od'] && $stats['promedio_vol_od'] >= 10 ? 'alto' : '' }}">{{ $stats['promedio_vol_od'] ? round($stats['promedio_vol_od'], 1) : '—' }}</div><div class="label">Prom. Vol. OD (mL)</div></td>
        <td><div class="num {{ $stats['promedio_vol_oi'] && $stats['promedio_vol_oi'] >= 10 ? 'alto' : '' }}">{{ $stats['promedio_vol_oi'] ? round($stats['promedio_vol_oi'], 1) : '—' }}</div><div class="label">Prom. Vol. OI (mL)</div></td>
    </tr>
</table>

@if($ultimoRegistro)
<div class="latest">
    <div class="latest-title">Lectura del estudio más reciente</div>
    <div class="latest-value">{{ $ultimoRegistro->fecha_ecografia?->format('d/m/Y') ?? 'Sin fecha' }} · {{ $ultimoRegistro->tipo_ecografia ? ucfirst($ultimoRegistro->tipo_ecografia) : 'Tipo no especificado' }}</div>
    <table class="latest-grid"><tr>
        <td><span class="label">Morfología</span><br><b class="{{ $ultimoRegistro->morfologia_compatible_pmos ? 'alto' : '' }}">{{ $ultimoRegistro->morfologia_compatible_pmos ? 'Compatible PMOS' : 'Sin criterios marcados' }}</b></td>
        <td><span class="label">Volumen OD / OI</span><br><b>{{ $ultimoRegistro->volumen_ovario_derecho ?? '—' }} / {{ $ultimoRegistro->volumen_ovario_izquierdo ?? '—' }} mL</b></td>
        <td><span class="label">Folículos OD / OI</span><br><b>{{ $ultimoRegistro->foliculos_ovario_derecho ?? '—' }} / {{ $ultimoRegistro->foliculos_ovario_izquierdo ?? '—' }}</b></td>
        <td><span class="label">Distribución periférica</span><br><b>{{ $ultimoRegistro->distribucion_periferica ? 'Presente' : 'No reportada' }}</b></td>
    </tr></table>
</div>
@endif

@if($registrosConImagen->isNotEmpty())
<h2>Imágenes ecográficas adjuntas <span class="panel-tag">{{ $registrosConImagen->count() }} disponible(s)</span></h2>
<div class="meta" style="margin:-2px 0 5px">Las imágenes corresponden a los archivos cargados en cada evaluación y se incluyen para complementar, no reemplazar, el informe radiológico.</div>
<table class="image-table"><tr>
@foreach($registrosConImagen as $indice => $estudio)
    <td>
        <img class="eco-image" src="{{ $estudio->imagen_pdf }}" alt="Imagen ecográfica del {{ $estudio->fecha_ecografia?->format('d/m/Y') }}">
        <div class="image-caption"><strong>{{ $estudio->fecha_ecografia?->format('d/m/Y') ?? 'Sin fecha' }} · {{ $estudio->tipo_ecografia ? ucfirst($estudio->tipo_ecografia) : 'Ecografía' }}</strong><br>
            {{ $estudio->morfologia_compatible_pmos ? 'Morfología compatible con PMOS.' : 'Sin criterios ecográficos marcados para PMOS.' }}
        </div>
    </td>
    @if($indice % 2 === 1)</tr><tr>@endif
@endforeach
@if($registrosConImagen->count() % 2 === 1)<td style="border:0;background:transparent"></td>@endif
</tr></table>
@endif

<h2>Registros cronológicos ({{ $registros->count() }})</h2>
@if($registros->isEmpty())
    <p style="color:#657a75;font-style:italic">No se encontraron ecografías con los filtros seleccionados.</p>
@else
<table>
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Vol. OD<br>(mL)</th>
            <th>Vol. OI<br>(mL)</th>
            <th>Folículos OD</th>
            <th>Folículos OI</th>
            <th>Distr. perif.</th>
            <th>Morfología</th>
        </tr>
    </thead>
    <tbody>
        @foreach($registros as $r)
        <tr>
            <td>{{ $r->fecha_ecografia?->format('d/m/Y') ?? '—' }}</td>
            <td>{{ $r->tipo_ecografia ? ucfirst($r->tipo_ecografia) : '—' }}</td>
            <td class="{{ $r->volumen_ovario_derecho && $r->volumen_ovario_derecho >= 10 ? 'alto' : '' }}">{{ $r->volumen_ovario_derecho ?? '—' }}</td>
            <td class="{{ $r->volumen_ovario_izquierdo && $r->volumen_ovario_izquierdo >= 10 ? 'alto' : '' }}">{{ $r->volumen_ovario_izquierdo ?? '—' }}</td>
            <td class="{{ $r->foliculos_ovario_derecho !== null && $r->foliculos_ovario_derecho >= 12 ? 'alto' : '' }}">{{ $r->foliculos_ovario_derecho ?? '—' }}</td>
            <td class="{{ $r->foliculos_ovario_izquierdo !== null && $r->foliculos_ovario_izquierdo >= 12 ? 'alto' : '' }}">{{ $r->foliculos_ovario_izquierdo ?? '—' }}</td>
            <td>{{ $r->distribucion_periferica ? 'Sí' : 'No' }}</td>
            <td>@if($r->morfologia_compatible_pmos)<span class="chip chip-red">Compatible PMOS</span>@else<span class="chip chip-green">Sin criterios</span>@endif</td>
        </tr>
        @if($r->observaciones)<tr><td colspan="8" class="interp">Obs.: {{ $r->observaciones }}</td></tr>@endif
        @endforeach
    </tbody>
</table>
@endif

<div class="note">
    <b>Nota clínica:</b> Se consideran criterios de morfología ovárica compatible con PMOS un volumen ovárico ≥ 10 mL o un conteo folicular ≥ 12 en al menos un ovario (criterio de Rotterdam). Los valores destacados en rojo superan dichos umbrales. La interpretación diagnóstica es responsabilidad del profesional tratante.
</div>

<div class="footer">Reporte confidencial · Ecografía de {{ $nombrePaciente }}</div>
</body></html>
