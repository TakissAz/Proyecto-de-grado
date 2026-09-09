<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte de laboratorios</title>
<style>
@page{margin:24px 28px}
body{font-family:DejaVu Sans,sans-serif;color:#243632;font-size:8.5px;line-height:1.4}
.brand{color:#176b5b;font-size:9px;font-weight:bold;letter-spacing:1.2px}
.header{border-bottom:3px solid #1f8a70;padding-bottom:10px}
.header h1{font-size:18px;margin:4px 0;color:#123d35}
.meta{color:#657a75}
.hero{margin:11px 0;padding:10px 13px;background:#eaf7f3;border-radius:8px}
.hero .label{font-size:8px;text-transform:uppercase;color:#667b76}
.hero strong{font-size:14px;color:#176b5b}
h2{font-size:11.5px;color:#176b5b;border-bottom:1px solid #b9d8d0;padding-bottom:3px;margin:13px 0 6px}
table{width:100%;border-collapse:collapse;margin:4px 0}
td,th{border:1px solid #d6e2df;padding:4px 5px;text-align:center;font-size:8px}
th{background:#f2f7f5;color:#365d54;font-size:7.5px}
.label{font-size:8px;text-transform:uppercase;color:#667b76}
.stats td{width:20%;text-align:center;background:#f7fbfa}
.stats .num{font-size:16px;font-weight:bold;color:#176b5b}
.stats .num.alto{color:#c0392b}
.chip{display:inline-block;padding:2px 5px;border-radius:8px;font-size:7px;font-weight:bold;background:#fff2e0;color:#b45d00;margin:1px}
.chip-red{background:#fde3e0;color:#c0392b}
.chip-green{background:#e3f5e0;color:#1e7a2e}
.alto{color:#c0392b;font-weight:bold}
.filtro{display:inline-block;padding:3px 8px;background:#fff;border:1px solid #80bcae;border-radius:10px;font-size:8px;margin-right:5px}
.footer{position:fixed;bottom:-14px;left:0;right:0;text-align:center;color:#78908a;font-size:8px}
.note{padding:8px;background:#fff8df;border:1px solid #e3cb75;border-radius:6px;margin-top:12px}
.interp{text-align:left;background:#fafcfb;color:#657a75;font-style:italic}
.vacio{color:#657a75;font-style:italic;font-size:8.5px;padding:4px 0}
.panel-tag{display:inline-block;font-size:7px;font-weight:bold;color:#176b5b;background:#eaf7f3;border-radius:6px;padding:2px 7px;margin-left:6px}
.panel-summary{width:100%;border-collapse:separate;border-spacing:5px 0;margin:7px -5px 10px}
.panel-summary td{width:20%;vertical-align:top;text-align:left;border:1px solid #d6e2df;background:#f8fbfa;padding:7px;border-radius:6px}
.panel-summary .name{font-size:7.5px;text-transform:uppercase;color:#657a75;font-weight:bold}
.panel-summary .count{font-size:15px;color:#176b5b;font-weight:bold;margin-top:2px}
.panel-summary .status{font-size:7.5px;margin-top:2px}.panel-summary .warning{color:#c0392b}.panel-summary .ok{color:#1e7a2e}
.mini-track{height:4px;background:#dfe9e6;border-radius:4px;margin-top:6px;overflow:hidden}.mini-fill{height:100%;background:#1f8a70;border-radius:4px}
.mini-fill.warning{background:#d18a15}
</style></head><body>

<div class="header">
    <div class="brand">HISTORIA CLÍNICA · LABORATORIOS ENDOCRINOS</div>
    <h1>Reporte de resultados de laboratorio</h1>
    <div class="meta">Documento clínico · Generado {{ $fechaGeneracion->format('d/m/Y H:i') }}</div>
</div>

<div class="hero">
    <div class="label">Paciente</div>
    <strong>{{ $nombrePaciente ?: 'Sin nombre' }}</strong>
    <div>CI: {{ $paciente->ci ?: 'N/D' }} · Edad: {{ $paciente->fecha_nacimiento?->age ?? 'N/D' }} años</div>
</div>

@if(($filtros['panel'] ?? false) || ($filtros['solo_alterados'] ?? false) || ($filtros['desde'] ?? false) || ($filtros['hasta'] ?? false))
<h2>Filtros aplicados</h2>
<div>
    @if($filtros['panel'] ?? false)<span class="filtro">Panel: {{ str_replace('_', ' ', $filtros['panel']) }}</span>@endif
    @if($filtros['solo_alterados'] ?? false)<span class="filtro">Solo resultados con hallazgo</span>@endif
    @if($filtros['desde'] ?? false)<span class="filtro">Desde: {{ $filtros['desde'] }}</span>@endif
    @if($filtros['hasta'] ?? false)<span class="filtro">Hasta: {{ $filtros['hasta'] }}</span>@endif
</div>
@endif

<h2>Resumen de hallazgos</h2>
<table class="stats">
    <tr>
        <td><div class="num">{{ $resumen['total'] }}</div><div class="label">Resultados</div></td>
        <td><div class="num {{ $resumen['hiperandrogenismo'] ? 'alto' : '' }}">{{ $resumen['hiperandrogenismo'] }}</div><div class="label">Hiperandrogenismo bioq.</div></td>
        <td><div class="num {{ $resumen['resistencia_insulina'] ? 'alto' : '' }}">{{ $resumen['resistencia_insulina'] }}</div><div class="label">Resist. insulina</div></td>
        <td><div class="num {{ $resumen['dislipidemia'] ? 'alto' : '' }}">{{ $resumen['dislipidemia'] }}</div><div class="label">Dislipidemia</div></td>
        <td><div class="num {{ $resumen['ultimo_homa'] !== null && $resumen['ultimo_homa'] >= 2.5 ? 'alto' : '' }}">{{ $resumen['ultimo_homa'] ?? '—' }}</div><div class="label">Último HOMA-IR</div></td>
    </tr>
</table>

@if($esReporteGeneral)
<h2>Mapa general de paneles</h2>
<div class="meta" style="margin:-2px 0 5px">Cobertura registrada y hallazgos marcados por panel. La barra representa la cantidad de resultados respecto al panel con más registros.</div>
<table class="panel-summary"><tr>
@foreach($panelesResumen as $panelResumen)
    @php($proporcion = min(100, round(($panelResumen['resultados'] / $maxResultadosPanel) * 100)))
    <td>
        <div class="name">{{ $panelResumen['nombre'] }}</div>
        <div class="count">{{ $panelResumen['resultados'] }}</div>
        <div class="meta">resultado(s)</div>
        <div class="mini-track"><div class="mini-fill {{ $panelResumen['hallazgos'] ? 'warning' : '' }}" style="width: {{ $proporcion }}%"></div></div>
        <div class="status {{ $panelResumen['hallazgos'] ? 'warning' : 'ok' }}">
            {{ $panelResumen['hallazgos'] ? $panelResumen['hallazgos'].' con hallazgo' : ($panelResumen['resultados'] ? 'Sin hallazgo marcado' : 'Sin registro') }}
        </div>
        @if($panelResumen['ultimo'])<div class="meta">Último: {{ $panelResumen['ultimo']->format('d/m/Y') }}</div>@endif
    </td>
@endforeach
</tr></table>
@endif

{{-- ─── Perfil androgénico ─── --}}
@if($androgenico->isNotEmpty())
<h2>Perfil androgénico <span class="panel-tag">{{ $androgenico->count() }} resultado(s)</span></h2>
<table>
    <thead><tr>
        <th>Fecha</th><th>Testost. total<br>(ng/dL)</th><th>Testost. libre<br>(pg/mL)</th><th>SHBG<br>(nmol/L)</th><th>IAL</th><th>DHEA-S<br>(µg/dL)</th><th>Androst.<br>(ng/mL)</th><th>Hiperandrog.</th>
    </tr></thead>
    <tbody>
        @foreach($androgenico as $r)
        <tr>
            <td>{{ $r->fecha_resultado?->format('d/m/Y') ?? '—' }}</td>
            <td class="{{ $r->testosterona_total && $r->testosterona_total > 70 ? 'alto' : '' }}">{{ $r->testosterona_total ?? '—' }}</td>
            <td class="{{ $r->testosterona_libre && $r->testosterona_libre > 4.1 ? 'alto' : '' }}">{{ $r->testosterona_libre ?? '—' }}</td>
            <td>{{ $r->shbg ?? '—' }}</td>
            <td>{{ $r->indice_androgenico_libre ?? '—' }}</td>
            <td class="{{ $r->dhea_s && $r->dhea_s > 430 ? 'alto' : '' }}">{{ $r->dhea_s ?? '—' }}</td>
            <td>{{ $r->androstenediona ?? '—' }}</td>
            <td>@if($r->hiperandrogenismo_bioquimico)<span class="chip chip-red">Sí</span>@else<span class="chip chip-green">No</span>@endif</td>
        </tr>
        @if($r->interpretacion)<tr><td colspan="8" class="interp">Interpretación: {{ $r->interpretacion }}</td></tr>@endif
        @endforeach
    </tbody>
</table>
@endif

{{-- ─── Perfil gonadotropo ─── --}}
@if($gonadotropo->isNotEmpty())
<h2>Perfil gonadotropo <span class="panel-tag">{{ $gonadotropo->count() }} resultado(s)</span></h2>
<table>
    <thead><tr>
        <th>Fecha</th><th>LH<br>(mUI/mL)</th><th>FSH<br>(mUI/mL)</th><th>LH/FSH</th><th>Estradiol<br>(pg/mL)</th><th>Progest.<br>(ng/mL)</th><th>Día ciclo</th><th>Fase</th>
    </tr></thead>
    <tbody>
        @foreach($gonadotropo as $r)
        <tr>
            <td>{{ $r->fecha_resultado?->format('d/m/Y') ?? '—' }}</td>
            <td>{{ $r->lh ?? '—' }}</td>
            <td>{{ $r->fsh ?? '—' }}</td>
            <td class="{{ $r->relacion_lh_fsh && $r->relacion_lh_fsh > 2 ? 'alto' : '' }}">{{ $r->relacion_lh_fsh ?? '—' }}</td>
            <td>{{ $r->estradiol ?? '—' }}</td>
            <td>{{ $r->progesterona ?? '—' }}</td>
            <td>{{ $r->progesterona_dia_ciclo ?? '—' }}</td>
            <td>{{ $r->progesterona_fase_ciclo ?? '—' }}</td>
        </tr>
        @if($r->interpretacion)<tr><td colspan="8" class="interp">Interpretación: {{ $r->interpretacion }}</td></tr>@endif
        @endforeach
    </tbody>
</table>
@endif

{{-- ─── Diferenciales endocrinos ─── --}}
@if($diferencial->isNotEmpty())
<h2>Diferenciales endocrinos <span class="panel-tag">{{ $diferencial->count() }} resultado(s)</span></h2>
<table>
    <thead><tr>
        <th>Fecha</th><th>TSH<br>(mUI/L)</th><th>T3 libre<br>(pg/mL)</th><th>T4 libre<br>(ng/dL)</th><th>Prolactina<br>(ng/mL)</th><th>17-OH Prog<br>(ng/mL)</th><th>Cortisol<br>(µg/dL)</th><th>Descartados</th>
    </tr></thead>
    <tbody>
        @foreach($diferencial as $r)
        <tr>
            <td>{{ $r->fecha_resultado?->format('d/m/Y') ?? '—' }}</td>
            <td class="{{ $r->tsh && ($r->tsh < 0.4 || $r->tsh > 4) ? 'alto' : '' }}">{{ $r->tsh ?? '—' }}</td>
            <td>{{ $r->t3_libre ?? '—' }}</td>
            <td>{{ $r->t4_libre ?? '—' }}</td>
            <td class="{{ $r->prolactina && $r->prolactina > 25 ? 'alto' : '' }}">{{ $r->prolactina ?? '—' }}</td>
            <td>{{ $r->diecisiete_oh_progesterona ?? '—' }}</td>
            <td>{{ $r->cortisol ?? '—' }}</td>
            <td>@if($r->descartados_count === 4)<span class="chip chip-green">4/4</span>@else<span class="chip">{{ $r->descartados_count }}/4</span>@endif</td>
        </tr>
        @if($r->interpretacion)<tr><td colspan="8" class="interp">Interpretación: {{ $r->interpretacion }}</td></tr>@endif
        @endforeach
    </tbody>
</table>
@endif

{{-- ─── Glucosa e insulina ─── --}}
@if($glucosa->isNotEmpty())
<h2>Glucosa e insulina <span class="panel-tag">{{ $glucosa->count() }} resultado(s)</span></h2>
<table>
    <thead><tr>
        <th>Fecha</th><th>Glucosa<br>(mg/dL)</th><th>Insulina<br>(µU/mL)</th><th>HOMA-IR</th><th>HbA1c<br>(%)</th><th>Gluc. 2h<br>(mg/dL)</th><th>Ins. 2h<br>(µU/mL)</th><th>Hallazgos</th>
    </tr></thead>
    <tbody>
        @foreach($glucosa as $r)
        <tr>
            <td>{{ $r->fecha_resultado?->format('d/m/Y') ?? '—' }}</td>
            <td class="{{ $r->glucosa_ayunas && $r->glucosa_ayunas >= 100 ? 'alto' : '' }}">{{ $r->glucosa_ayunas ?? '—' }}</td>
            <td>{{ $r->insulina_ayunas ?? '—' }}</td>
            <td class="{{ $r->homa_ir && $r->homa_ir >= 2.5 ? 'alto' : '' }}">{{ $r->homa_ir ?? '—' }}</td>
            <td class="{{ $r->hemoglobina_glicosilada && $r->hemoglobina_glicosilada >= 5.7 ? 'alto' : '' }}">{{ $r->hemoglobina_glicosilada ?? '—' }}</td>
            <td>{{ $r->glucosa_2h_ogtt ?? '—' }}</td>
            <td>{{ $r->insulina_2h_ogtt ?? '—' }}</td>
            <td>
                @if($r->resistencia_insulina_sugerida)<span class="chip chip-red">RI</span>@endif
                @if($r->hiperinsulinemia)<span class="chip">Hiperins.</span>@endif
                @if(!$r->resistencia_insulina_sugerida && !$r->hiperinsulinemia)<span class="chip chip-green">Normal</span>@endif
            </td>
        </tr>
        @if($r->interpretacion)<tr><td colspan="8" class="interp">Interpretación: {{ $r->interpretacion }}</td></tr>@endif
        @endforeach
    </tbody>
</table>
@endif

{{-- ─── Perfil lipídico ─── --}}
@if($lipidico->isNotEmpty())
<h2>Perfil lipídico <span class="panel-tag">{{ $lipidico->count() }} resultado(s)</span></h2>
<table>
    <thead><tr>
        <th>Fecha</th><th>Col. total<br>(mg/dL)</th><th>HDL<br>(mg/dL)</th><th>LDL<br>(mg/dL)</th><th>VLDL<br>(mg/dL)</th><th>Triglic.<br>(mg/dL)</th><th>Col. no-HDL<br>(mg/dL)</th><th>Dislipidemia</th>
    </tr></thead>
    <tbody>
        @foreach($lipidico as $r)
        <tr>
            <td>{{ $r->fecha_resultado?->format('d/m/Y') ?? '—' }}</td>
            <td class="{{ $r->colesterol_total && $r->colesterol_total >= 200 ? 'alto' : '' }}">{{ $r->colesterol_total ?? '—' }}</td>
            <td class="{{ $r->hdl && $r->hdl < 50 ? 'alto' : '' }}">{{ $r->hdl ?? '—' }}</td>
            <td class="{{ $r->ldl && $r->ldl >= 130 ? 'alto' : '' }}">{{ $r->ldl ?? '—' }}</td>
            <td>{{ $r->vldl ?? '—' }}</td>
            <td class="{{ $r->trigliceridos && $r->trigliceridos >= 150 ? 'alto' : '' }}">{{ $r->trigliceridos ?? '—' }}</td>
            <td>{{ $r->colesterol_no_hdl ?? '—' }}</td>
            <td>@if($r->dislipidemia_sugerida)<span class="chip chip-red">Sí</span>@else<span class="chip chip-green">No</span>@endif</td>
        </tr>
        @if($r->interpretacion)<tr><td colspan="8" class="interp">Interpretación: {{ $r->interpretacion }}</td></tr>@endif
        @endforeach
    </tbody>
</table>
@endif

@if($resumen['total'] === 0)
<p class="vacio">No se encontraron resultados de laboratorio con los filtros seleccionados.</p>
@endif

<div class="note">
    <b>Nota clínica:</b> Los valores destacados en rojo se encuentran fuera de los rangos de referencia habituales (varían según laboratorio y método). Este reporte agrupa los resultados según los filtros aplicados; la interpretación diagnóstica es responsabilidad del profesional tratante.
</div>

<div class="footer">Reporte confidencial · Laboratorios de {{ $nombrePaciente }}</div>
</body></html>
