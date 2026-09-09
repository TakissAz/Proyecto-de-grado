<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{{ $titulo }}</title><style>
@page{margin:30px 34px 46px}
body{font-family:DejaVu Sans,sans-serif;color:#242b29;font-size:9px;line-height:1.5}
.head{border-bottom:3px solid #38b826;padding-bottom:10px}
.brand{color:#38b826;font-weight:bold;letter-spacing:1px;text-transform:uppercase}
h1{font-size:19px;margin:4px 0;color:#18221f}
h2{font-size:11.5px;margin:16px 0 7px;color:#26751d;border-bottom:1px solid #cfe4ca;padding-bottom:4px}
.right{float:right;text-align:right}
.muted{color:#65736f}
.clear{clear:both}
.grid{width:100%;border-collapse:collapse;margin:6px 0 11px}
.grid th,.grid td{border:1px solid #d8dfdc;padding:5px;vertical-align:top}
.grid th{background:#edf6eb;color:#245f1d;text-align:left}
.box{background:#f4f8f3;border:1px solid #d7e5d3;padding:8px;margin:7px 0}
.badge{display:inline-block;background:#e8f4e5;color:#26751d;padding:2px 6px;border-radius:3px}
.cambios-bloque{border:1px solid #d8dfdc;margin:10px 0;page-break-inside:avoid}
.cambios-head{background:#edf6eb;padding:6px 8px;border-bottom:1px solid #cfe4ca}
.cambios-head-title{font-size:10px;font-weight:bold;color:#18221f}
.cambios-head-sub{font-size:8px;color:#65736f;margin-top:2px}
.indice-row{padding:5px 8px;border-bottom:1px solid #e8ede6;font-size:8.5px}
.indice-val{font-size:13px;font-weight:bold}
.indice-pos{color:#26751d}
.indice-neg{color:#b66a00}
.indice-neu{color:#65736f}
.diff-table{width:100%;border-collapse:collapse}
.diff-table td{padding:3px 8px;border-bottom:1px solid #f0f4ef;vertical-align:middle}
.diff-mejora-bg{background:#f0faf0}
.diff-retroceso-bg{background:#fff7f0}
.diff-label{font-weight:bold;color:#242b29;width:38%}
.diff-antes{color:#8a9a96;text-decoration:line-through;width:20%;text-align:right}
.diff-flecha{color:#aaa;width:6%;text-align:center}
.diff-despues-pos{color:#26751d;font-weight:bold;width:20%}
.diff-despues-neg{color:#b66a00;font-weight:bold;width:20%}
.diff-icon{font-size:9px;width:8%;text-align:center}
.diff-icon-pos{color:#26751d}
.diff-icon-neg{color:#b66a00}
.sin-cambios{padding:6px 8px;color:#8a9a96;font-style:italic;font-size:8.5px}
.resumen-chips{padding:5px 8px;border-top:1px solid #e8ede6;font-size:8px}
.chip-pos{display:inline-block;background:#e0f5de;color:#26751d;padding:1px 5px;border-radius:3px;margin-right:4px;font-weight:bold}
.chip-neg{display:inline-block;background:#fdeede;color:#b66a00;padding:1px 5px;border-radius:3px;margin-right:4px;font-weight:bold}
.chart{page-break-inside:avoid;border:1px solid #d8dfdc;padding:10px;margin:7px 0}
.chart-title{font-size:11px;font-weight:bold}
.comparison{width:100%;border-collapse:collapse;margin-top:8px}
.comparison td{border:0;padding:3px}
.legend{width:70px;font-size:8px;font-weight:bold}
.track{height:12px;background:#eef1ef}
.before{height:12px;background:#aab5b0}
.current{height:12px;background:#38b826}
.value{width:95px;text-align:right;font-weight:bold}
.change{margin-top:7px;padding:6px;background:#f4f8f3}
.chart-top{width:100%;border-collapse:collapse}.chart-top td{border:0;padding:0}.chart-delta{text-align:right}.delta-pill{display:inline-block;padding:3px 7px;background:#e8f4e5;color:#26751d;font-weight:bold;border-radius:3px}.chart-period{font-size:8px;color:#65736f;margin-top:2px}.scale-wrap{margin:12px 5px 8px;position:relative;height:34px}.scale-line{position:absolute;left:0;right:0;top:15px;height:5px;background:#e5ebe8;border-radius:3px}.scale-fill{position:absolute;top:15px;height:5px;background:#bfe3b8}.marker{position:absolute;top:7px;width:3px;height:20px}.marker-before{background:#8b9893}.marker-current{background:#38b826}.marker-label{position:absolute;top:-8px;white-space:nowrap;font-size:7.5px;font-weight:bold}.marker-date{position:absolute;top:28px;white-space:nowrap;font-size:7px;color:#65736f}.scale-ends{width:100%;font-size:7px;color:#87938f}.scale-ends td{border:0;padding:0}.scale-ends td:last-child{text-align:right}.reading{margin-top:10px;border-left:3px solid #38b826;background:#f4f8f3;padding:7px}.reading-title{color:#26751d;font-weight:bold}.values{width:100%;border-collapse:separate;border-spacing:5px;margin-top:7px}.values td{border:1px solid #dfe6e3;background:#fafcfb;padding:6px;width:33%}.values-label{font-size:7px;text-transform:uppercase;color:#65736f}.values-number{display:block;font-size:12px;font-weight:bold;color:#18221f;margin-top:2px}
.positive{color:#26751d}
.warning{color:#b66a00}
.record{page-break-inside:avoid}
.footer{position:fixed;bottom:-32px;left:0;right:0;border-top:1px solid #bbb;padding-top:6px;color:#71807b;font-size:7px}
</style></head><body>

<header class="head">
  <div class="right">{{ $fechaGeneracion->copy()->timezone('America/La_Paz')->format('d/m/Y H:i') }}<br><span class="muted">Hora de Bolivia</span></div>
  <div class="brand">Almendra Nutrición</div>
  <h1>{{ $titulo }}</h1>
  <div class="muted">Evolución registrada en los controles nutricionales del paciente</div>
  <div class="clear"></div>
</header>

<h2>Paciente y alcance</h2>
<table class="grid">
  <tr><th>Paciente</th><th>CI</th><th>Nutricionista</th><th>Controles incluidos</th></tr>
  <tr>
    <td>{{ trim($paciente->nombres.' '.$paciente->apellido_paterno.' '.$paciente->apellido_materno) }}</td>
    <td>{{ $paciente->ci }}</td>
    <td>{{ $profesional?->name }}</td>
    <td>{{ $registros->count() }}</td>
  </tr>
</table>
<div class="box">
  <b>Periodo analizado:</b>
  <span class="badge">{{ $filtros['desde'] ?? 'Primer registro' }}</span> a
  <span class="badge">{{ $filtros['hasta'] ?? 'Último registro' }}</span>
</div>

{{-- ══ BLOQUE EXCLUSIVO HÁBITOS ═══════════════════════════════ --}}
@if($tipo === 'habitos')
  <h2>Evolución comparativa entre controles</h2>
  @if($cambiosConsecutivos->isEmpty())
    <div class="box">Solo existe un registro en el periodo. Se necesitan al menos dos controles para mostrar la evolución comparativa.</div>
  @else
    <div class="box" style="margin-bottom:10px">
      Cada bloque compara un control con el inmediatamente anterior. Celdas verdes indican mejoría; naranja, un retroceso respecto al hábito ideal.
    </div>
    @foreach($cambiosConsecutivos as $bloque)
    <div class="cambios-bloque">
      <div class="cambios-head">
        <div class="cambios-head-title">Control #{{ $bloque['numero'] }} &mdash; {{ $bloque['fecha_actual'] }}</div>
        <div class="cambios-head-sub">Comparado con el control del {{ $bloque['fecha_antes'] }}</div>
      </div>
      <div class="indice-row">
        Índice de hábitos:
        <span class="indice-val {{ $bloque['delta_indice'] > 0 ? 'indice-pos' : ($bloque['delta_indice'] < 0 ? 'indice-neg' : 'indice-neu') }}">{{ $bloque['indice_actual'] }} pts</span>
        @if($bloque['delta_indice'] != 0)
          <span class="{{ $bloque['delta_indice'] > 0 ? 'indice-pos' : 'indice-neg' }}">({{ $bloque['delta_indice'] > 0 ? '+' : '' }}{{ $bloque['delta_indice'] }} pts vs. control anterior)</span>
        @else
          <span class="indice-neu">(sin variación)</span>
        @endif
        &nbsp;&mdash;&nbsp;
        <span class="{{ $bloque['indice_actual'] >= 80 ? 'indice-pos' : ($bloque['indice_actual'] >= 55 ? '' : 'indice-neg') }}">{{ $bloque['indice_actual'] >= 80 ? 'Favorable' : ($bloque['indice_actual'] >= 55 ? 'Por mejorar' : 'Atención prioritaria') }}</span>
      </div>
      @if(count($bloque['diffs']) > 0)
        <table class="diff-table">
          @foreach($bloque['diffs'] as $diff)
          <tr class="{{ $diff['mejora'] ? 'diff-mejora-bg' : 'diff-retroceso-bg' }}">
            <td class="diff-label">{{ $diff['label'] }}</td>
            <td class="diff-antes">{{ $diff['antes'] }}</td>
            <td class="diff-flecha">&rarr;</td>
            <td class="{{ $diff['mejora'] ? 'diff-despues-pos' : 'diff-despues-neg' }}">{{ $diff['despues'] }}</td>
          </tr>
          @endforeach
        </table>
        @php
          $nMejoras    = collect($bloque['diffs'])->where('mejora', true)->count();
          $nRetrocesos = collect($bloque['diffs'])->where('mejora', false)->count();
        @endphp
        <div class="resumen-chips">
          @if($nMejoras > 0)<span class="chip-pos">{{ $nMejoras }} mejora{{ $nMejoras !== 1 ? 's' : '' }}</span>@endif
          @if($nRetrocesos > 0)<span class="chip-neg">{{ $nRetrocesos }} retroceso{{ $nRetrocesos !== 1 ? 's' : '' }}</span>@endif
        </div>
      @else
        <div class="sin-cambios">Sin cambios respecto al control anterior.</div>
      @endif
    </div>
    @endforeach
  @endif
@endif

{{-- ══ SERIES NUMÉRICAS PARA OTROS TIPOS (evaluaciones, etc.) ─ --}}
@if($tipo !== 'habitos')
  @if(count($series))
    <h2>Cambio observado</h2>
    @foreach($series as $campo => $serie)
      @php
        $porcentajeCambio = $serie['inicial'] != 0 ? ($serie['cambio'] / $serie['inicial']) * 100 : 0;
        $unidad = match($campo) {
          'peso', 'peso_referencia' => 'kg', 'imc' => 'kg/m²', 'circunferencia_cintura' => 'cm',
          'porcentaje_grasa' => '%', 'masa_muscular' => 'kg', 'calorias_objetivo', 'tmb', 'get', 'ajuste_calorico' => 'kcal', default => ''
        };
        $minSerie=min(array_column($serie['puntos'],'valor'));$maxSerie=max(array_column($serie['puntos'],'valor'));
        $amplitud=max(abs($maxSerie-$minSerie),max(abs($maxSerie),1)*0.02);$limiteMin=$minSerie-$amplitud*.25;$limiteMax=$maxSerie+$amplitud*.25;
        $posInicial=max(2,min(98,(($serie['inicial']-$limiteMin)/($limiteMax-$limiteMin))*100));
        $posActual=max(2,min(98,(($serie['ultimo']-$limiteMin)/($limiteMax-$limiteMin))*100));
        $posDesde=min($posInicial,$posActual);$anchoCambio=max(1,abs($posActual-$posInicial));
        $direccion = $serie['cambio'] > 0 ? 'aumentó' : ($serie['cambio'] < 0 ? 'disminuyó' : 'se mantuvo');
        $lectura = match ($campo) {
          'calorias_objetivo' => "La meta energética {$direccion}. Este resultado integra el GET y el ajuste definido por las reglas nutricionales.",
          'tmb' => "La estimación basal {$direccion}. Sus variaciones se explican principalmente por cambios en peso, talla o edad de referencia.",
          'get' => "El gasto diario total {$direccion}. Debe interpretarse junto con la TMB y el factor de actividad aplicado.",
          'peso_referencia' => "El peso utilizado para calcular {$direccion}. No representa por sí solo una mejoría o retroceso clínico.",
          'peso' => "El peso corporal {$direccion} ".number_format(abs($serie['cambio']),2,',','.')." kg. Debe analizarse junto con masa muscular, grasa corporal y objetivo nutricional.",
          'imc' => "El IMC {$direccion} ".number_format(abs($serie['cambio']),2,',','.')." kg/m². Es un indicador de tamizaje y no describe por sí solo la composición corporal.",
          'circunferencia_cintura' => "La cintura {$direccion} ".number_format(abs($serie['cambio']),2,',','.')." cm. Orienta el seguimiento del riesgo cardiometabólico.",
          'porcentaje_grasa' => "La grasa corporal estimada {$direccion} ".number_format(abs($serie['cambio']),2,',','.')." puntos porcentuales. Debe compararse con el mismo método de medición.",
          'masa_muscular' => "La masa muscular estimada {$direccion} ".number_format(abs($serie['cambio']),2,',','.')." kg. Conviene conservarla durante los cambios de peso.",
          default => "El indicador {$direccion} respecto al primer control del periodo.",
        };
      @endphp
      <div class="chart">
        <table class="chart-top"><tr><td><div class="chart-title">{{ $campos[$campo] ?? ucfirst(str_replace('_', ' ', $campo)) }}</div><div class="chart-period">{{ count($serie['puntos']) }} mediciones &middot; {{ $serie['puntos'][0]['fecha'] }} a {{ $serie['puntos'][count($serie['puntos'])-1]['fecha'] }}</div></td><td class="chart-delta"><span class="delta-pill">{{ $serie['cambio'] > 0 ? '+' : '' }}{{ number_format($serie['cambio'],2,',','.') }} {{ $unidad }}</span></td></tr></table>
        <table class="values"><tr><td><span class="values-label">Valor inicial</span><span class="values-number">{{ number_format($serie['inicial'],2,',','.') }} {{ $unidad }}</span></td><td><span class="values-label">Valor actual</span><span class="values-number">{{ number_format($serie['ultimo'],2,',','.') }} {{ $unidad }}</span></td><td><span class="values-label">Variación relativa</span><span class="values-number">{{ $porcentajeCambio>0?'+':'' }}{{ number_format($porcentajeCambio,1,',','.') }}%</span></td></tr></table>
        <div class="scale-wrap"><div class="scale-line"></div><div class="scale-fill" style="left:{{ $posDesde }}%;width:{{ $anchoCambio }}%"></div><div class="marker marker-before" style="left:{{ $posInicial }}%"></div><div class="marker marker-current" style="left:{{ $posActual }}%"></div><div class="marker-label" style="left:{{ max(1,min(82,$posInicial)) }}%">Inicial {{ number_format($serie['inicial'],2,',','.') }}</div><div class="marker-label" style="left:{{ max(1,min(82,$posActual)) }}%;top:20px;color:#26751d">Actual {{ number_format($serie['ultimo'],2,',','.') }}</div></div>
        <table class="scale-ends"><tr><td>Escala observada: {{ number_format($limiteMin,2,',','.') }} {{ $unidad }}</td><td>{{ number_format($limiteMax,2,',','.') }} {{ $unidad }}</td></tr></table>
        <div class="change">
          <b>Cambio del periodo:</b> <span class="{{ $serie['cambio'] == 0 ? 'muted' : 'positive' }}">{{ $serie['cambio'] > 0 ? '+' : '' }}{{ number_format($serie['cambio'], 2, ',', '.') }}</span>
          ({{ $porcentajeCambio > 0 ? '+' : '' }}{{ number_format($porcentajeCambio, 1, ',', '.') }}%).
          <br><span class="muted">Marcador gris: primer control &middot; Marcador verde: control vigente. La escala se ajusta al rango observado.</span>
          <br><b>Interpretación:</b> {{ $lectura }}
        </div>
      </div>
    @endforeach
  @else
    <div class="box"><b>Historial descriptivo:</b> no existe serie numérica suficiente. Se presenta como línea temporal para evitar gráficos sin significado clínico.</div>
  @endif
@endif

{{-- ══ DETALLE CRONOLÓGICO ════════════════════════════════════ --}}
<h2>Detalle de cada control</h2>
@forelse($registros as $i => $registro)
  <div class="record">
    <table class="grid">
      <tr>
        <th colspan="4">
          Control {{ $registros->count() - $i }}
          &nbsp;&middot;&nbsp;
          {{ $registro->{$fecha} ? \Illuminate\Support\Carbon::parse($registro->{$fecha})->timezone('America/La_Paz')->format('d/m/Y') : 'Sin fecha' }}
          @if($tipo === 'habitos')
            &nbsp;&middot;&nbsp; Índice: {{ $registro->indice_habitos }} pts
          @endif
        </th>
      </tr>
      @foreach(collect($campos)->chunk(4) as $grupo)
      <tr>
        @foreach($grupo as $campo => $label)
        <td>
          <b>{{ $label }}</b><br>
          {{ is_bool($registro->{$campo}) ? ($registro->{$campo} ? 'Sí' : 'No') : str_replace('_', ' ', (string)($registro->{$campo} ?? 'Sin registro')) }}
        </td>
        @endforeach
        @php for ($j = $grupo->count(); $j < 4; $j++) { echo '<td></td>'; } @endphp
      </tr>
      @endforeach
      @if($registro->observaciones)
      <tr><td colspan="4"><b>Observación profesional:</b> {{ $registro->observaciones }}</td></tr>
      @endif
    </table>
  </div>
@empty
  <div class="box">No existen registros para los filtros seleccionados.</div>
@endforelse

<footer class="footer">
  <b>Almendra Nutrición</b> &nbsp;&middot;&nbsp; Emitido {{ $fechaGeneracion->copy()->timezone('America/La_Paz')->format('d/m/Y H:i') }} (Bolivia).
  Este documento es un resumen de evolución y no constituye un diagnóstico aislado.
</footer>
</body></html>
