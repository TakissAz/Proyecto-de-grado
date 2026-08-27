<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Antecedentes endocrino-metabólicos</title>
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
td,th{border:1px solid #d6e2df;padding:5px 6px;text-align:left;font-size:8.5px;vertical-align:top}
th{background:#f2f7f5;color:#365d54}
.label{font-size:8px;text-transform:uppercase;color:#667b76}
.stats td{width:25%;text-align:center;background:#f7fbfa}
.stats .num{font-size:16px;font-weight:bold;color:#176b5b}
.chip{display:inline-block;padding:2px 6px;border-radius:8px;font-size:7.5px;font-weight:bold;background:#fff2e0;color:#b45d00;margin:1px}
.chip-red{background:#fde3e0;color:#c0392b}
.chip-purple{background:#f3e3fa;color:#8e2fbf}
.chip-blue{background:#e3eefa;color:#2f66bf}
.chip-green{background:#e3f5e0;color:#1e7a2e}
.filtro{display:inline-block;padding:3px 8px;background:#fff;border:1px solid #80bcae;border-radius:10px;font-size:8px;margin-right:5px}
.footer{position:fixed;bottom:-15px;left:0;right:0;text-align:center;color:#78908a;font-size:8px}
.note{padding:9px;background:#fff8df;border:1px solid #e3cb75;border-radius:6px;margin-top:14px}
.sub{color:#657a75;font-size:8px}
</style></head><body>

<div class="header">
    <div class="brand">HISTORIA CLÍNICA · SALUD ENDOCRINA</div>
    <h1>Reporte de antecedentes endocrino-metabólicos</h1>
    <div class="meta">Documento clínico · Generado {{ $fechaGeneracion->format('d/m/Y H:i') }}</div>
</div>

<div class="hero">
    <div class="label">Paciente</div>
    <strong>{{ $nombrePaciente ?: 'Sin nombre' }}</strong>
    <div>CI: {{ $paciente->ci ?: 'N/D' }} · Edad: {{ $paciente->fecha_nacimiento?->age ?? 'N/D' }} años</div>
</div>

@if(($filtros['condicion'] ?? false) || ($filtros['desde'] ?? false) || ($filtros['hasta'] ?? false))
<h2>Filtros aplicados</h2>
<div>
    @if($filtros['condicion'] ?? false)<span class="filtro">Condición: {{ str_replace('_', ' ', $filtros['condicion']) }}</span>@endif
    @if($filtros['desde'] ?? false)<span class="filtro">Desde: {{ $filtros['desde'] }}</span>@endif
    @if($filtros['hasta'] ?? false)<span class="filtro">Hasta: {{ $filtros['hasta'] }}</span>@endif
</div>
@endif

<h2>Resumen estadístico</h2>
<table class="stats">
    <tr>
        <td><div class="num">{{ $stats['total'] }}</div><div class="label">Registros</div></td>
        <td><div class="num">{{ $stats['con_personales'] }}</div><div class="label">Con antec. personales</div></td>
        <td><div class="num">{{ $stats['con_familiares'] }}</div><div class="label">Con antec. familiares</div></td>
        <td><div class="num">{{ $stats['con_medicacion'] }}</div><div class="label">Con medicación</div></td>
    </tr>
</table>

<h2>Registros cronológicos ({{ $registros->count() }})</h2>
@if($registros->isEmpty())
    <p style="color:#657a75;font-style:italic">No se encontraron registros con los filtros seleccionados.</p>
@else
<table>
    <thead>
        <tr>
            <th style="width:70px">Fecha</th>
            <th>Antecedentes personales</th>
            <th>Antecedentes familiares</th>
            <th>Medicación</th>
        </tr>
    </thead>
    <tbody>
        @foreach($registros as $r)
        @php
            $personales = collect([
                $r->diabetes_personal ? 'Diabetes' : null,
                $r->hipertension_personal ? 'Hipertensión' : null,
                $r->dislipidemia_personal ? 'Dislipidemia' : null,
                $r->enfermedad_tiroidea ? 'Enf. tiroidea' : null,
                $r->hiperprolactinemia_previa ? 'Hiperprolactinemia' : null,
            ])->filter();
            $familiares = collect([
                $r->diabetes_familiar ? 'Diabetes' : null,
                $r->hipertension_familiar ? 'Hipertensión' : null,
                $r->dislipidemia_familiar ? 'Dislipidemia' : null,
            ])->filter();
            $meds = collect([
                $r->uso_metformina ? 'Metformina' : null,
                $r->uso_anticonceptivos ? 'Anticonceptivos' : null,
                $r->uso_corticoides ? 'Corticoides' : null,
            ])->filter();
        @endphp
        <tr>
            <td>{{ $r->created_at?->format('d/m/Y') ?? '—' }}</td>
            <td>
                @forelse($personales as $p)<span class="chip chip-red">{{ $p }}</span>@empty<span class="chip chip-green">Sin datos</span>@endforelse
                @if(is_array($r->antecedentes_personales_detalle))
                    @foreach($r->antecedentes_personales_detalle as $d)
                        <div class="sub">• {{ $d['antecedente'] ?? '' }}@if(!empty($d['estado'])) ({{ $d['estado'] }})@endif</div>
                    @endforeach
                @endif
            </td>
            <td>
                @forelse($familiares as $f)<span class="chip chip-purple">{{ $f }}</span>@empty<span class="chip chip-green">Sin datos</span>@endforelse
                @if(is_array($r->antecedentes_familiares_detalle))
                    @foreach($r->antecedentes_familiares_detalle as $d)
                        <div class="sub">• {{ $d['antecedente'] ?? '' }}@if(!empty($d['parentesco'])) ({{ $d['parentesco'] }})@endif</div>
                    @endforeach
                @endif
            </td>
            <td>
                @forelse($meds as $m)<span class="chip chip-blue">{{ $m }}</span>@empty<span class="chip chip-green">Sin datos</span>@endforelse
                @if(is_array($r->medicamentos_detalle))
                    @foreach($r->medicamentos_detalle as $d)
                        <div class="sub">• {{ $d['nombre'] ?? '' }}@if(!empty($d['dosis'])) — {{ $d['dosis'] }}@endif</div>
                    @endforeach
                @endif
                @if($r->otros_medicamentos)<div class="sub">Otros: {{ $r->otros_medicamentos }}</div>@endif
            </td>
        </tr>
        @if($r->observaciones)
        <tr>
            <td colspan="4" style="background:#fafcfb;color:#657a75;font-style:italic">Obs.: {{ $r->observaciones }}</td>
        </tr>
        @endif
        @endforeach
    </tbody>
</table>
@endif

<div class="note">
    <b>Nota clínica:</b> Este reporte refleja los antecedentes endocrino-metabólicos registrados según los filtros aplicados. La interpretación clínica es responsabilidad del profesional tratante.
</div>

<div class="footer">Reporte confidencial · Antecedentes de {{ $nombrePaciente }}</div>
</body></html>
