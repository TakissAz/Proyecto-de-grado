<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Diagnóstico Endocrinológico</title>
    <style>
        @page { margin: 30px 34px; }
        body { font-family: DejaVu Sans, sans-serif; color: #263238; font-size: 10px; line-height: 1.45; }
        h1 { margin: 4px 0; font-size: 20px; color: #173f35; }
        h2 { margin: 15px 0 7px; padding: 6px 8px; font-size: 13px; color: #173f35; background: #edf5f2; border-left: 4px solid #3f7f6d; }
        h3 { margin: 10px 0 4px; font-size: 11px; color: #315c50; }
        p { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin: 5px 0 8px; }
        th, td { padding: 5px 6px; border: 1px solid #ccd8d4; vertical-align: top; }
        th { width: 28%; text-align: left; background: #f5f7f6; color: #344e47; }
        .header { border-bottom: 2px solid #3f7f6d; padding-bottom: 10px; margin-bottom: 12px; }
        .system { color: #3f7f6d; font-size: 9px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        .muted { color: #667872; }
        .tag { display: inline-block; padding: 2px 5px; margin: 1px 2px 1px 0; border: 1px solid #8fa9a1; border-radius: 3px; font-size: 8px; }
        .notice { padding: 8px; margin-top: 13px; background: #f5f5f5; border: 1px solid #cfd6d3; font-size: 9px; }
        .page-break { page-break-before: always; }
        ul { margin: 3px 0 5px; padding-left: 16px; }
        .empty { color: #7a8984; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <div class="system">Sistema de apoyo clínico PMOS</div>
        <h1>Informe de Diagnóstico Endocrinológico</h1>
        <div class="muted">Generado: {{ $fechaGeneracion->format('d/m/Y H:i') }}</div>
    </div>

    <h2>Identificación de la paciente</h2>
    <table>
        <tr><th>Paciente</th><td>{{ trim($paciente->nombres.' '.$paciente->apellido_paterno.' '.$paciente->apellido_materno) }}</td><th>CI</th><td>{{ $paciente->ci ?: 'No registrado' }}</td></tr>
        <tr><th>Edad</th><td>{{ $paciente->fecha_nacimiento?->age ?? 'No registrada' }}</td><th>Sexo</th><td>{{ $paciente->sexo ?: 'No registrado' }}</td></tr>
        <tr><th>Endocrinólogo responsable</th><td colspan="3">{{ $endocrinologo?->name ?? 'No registrado' }}</td></tr>
    </table>

    <h2>Resumen clínico</h2>
    @if($consulta)
        <table>
            <tr><th>Fecha de consulta</th><td>{{ $consulta->fecha_consulta?->format('d/m/Y') }}</td></tr>
            <tr><th>Motivo</th><td>{{ $consulta->motivo_consulta ?: 'No registrado' }}</td></tr>
            <tr><th>Observaciones</th><td>{{ $consulta->observaciones_generales ?: 'Sin observaciones' }}</td></tr>
        </table>
    @else <p class="empty">No existe consulta endocrinológica registrada.</p> @endif
    <table>
        <tr><th>Historia menstrual</th><td>{{ $historiaMenstrual ? 'Registrada' : 'No registrada' }}</td><th>Evaluación hiperandrogénica</th><td>{{ $historiaHiperandrogenica ? 'Registrada' : 'No registrada' }}</td></tr>
        <tr><th>Perfil androgénico</th><td>{{ $perfilAndrogenico ? 'Registrado' : 'No registrado' }}</td><th>Ecografía</th><td>{{ $ecografia ? 'Registrada' : 'No registrada' }}</td></tr>
    </table>

    <h2>Diagnóstico PMOS</h2>
    @if($pmos)
        <table>
            <tr><th>Estado</th><td>{{ $pmos->estado }}</td><th>Confirmado</th><td>{{ $pmos->diagnostico_confirmado ? 'Sí' : 'No' }}</td></tr>
            <tr><th>Fenotipo</th><td>{{ $pmos->fenotipo_pmos }}</td><th>Severidad</th><td>{{ $pmos->severidad_clinica }}</td></tr>
            <tr><th>Riesgo metabólico</th><td>{{ $pmos->riesgo_metabolico }}</td><th>Hiperandrogenismo</th><td>{{ $pmos->tipo_hiperandrogenismo }}</td></tr>
            <tr><th>Criterios Rotterdam</th><td>{{ $pmos->total_criterios_rotterdam }}/3</td><th>Diferenciales descartados</th><td>{{ $pmos->diagnosticos_diferenciales_descartados ? 'Sí' : 'No' }}</td></tr>
            <tr><th>Criterios cumplidos</th><td colspan="3">{{ count($criteriosPmos) ? implode(', ', $criteriosPmos) : 'Ninguno registrado' }}</td></tr>
            <tr><th>Conclusión médica</th><td colspan="3">{{ $pmos->conclusion_medica ?: 'Sin conclusión registrada' }}</td></tr>
            <tr><th>Recomendaciones</th><td colspan="3">{{ $pmos->recomendaciones_medicas ?: 'Sin recomendaciones registradas' }}</td></tr>
        </table>
        <h3>Justificación PMOS</h3>
        <p>El diagnóstico se considera {{ $pmos->diagnostico_confirmado ? 'compatible' : 'no confirmado' }} con PMOS porque se cumplen {{ $pmos->total_criterios_rotterdam }} de 3 criterios de Rotterdam. {{ $pmos->diagnosticos_diferenciales_descartados ? 'Los diagnósticos diferenciales constan como descartados.' : 'Los diagnósticos diferenciales no constan como completamente descartados.' }} {{ $pmos->diagnostico_confirmado ? 'El patrón fue clasificado como fenotipo '.$pmos->fenotipo_pmos.'.' : '' }}</p>
    @else <p class="empty">No existe diagnóstico PMOS registrado.</p> @endif

    <h2>Diagnóstico de Resistencia a la Insulina</h2>
    @if($ri)
        <table>
            <tr><th>Confirmada</th><td>{{ $ri->resistencia_confirmada ? 'Sí' : 'No' }}</td><th>Grado</th><td>{{ $ri->grado_resistencia }}</td></tr>
            <tr><th>HOMA-IR</th><td>{{ $ri->homa_ir ?? $glucosa?->homa_ir ?? 'No disponible' }}</td><th>QUICKI</th><td>{{ $ri->quicki ?? 'No disponible' }}</td></tr>
            <tr><th>Glucosa en ayunas</th><td>{{ $ri->glucosa_ayunas ?? $glucosa?->glucosa_ayunas ?? 'No disponible' }}</td><th>Insulina en ayunas</th><td>{{ $ri->insulina_ayunas ?? $glucosa?->insulina_ayunas ?? 'No disponible' }}</td></tr>
            <tr><th>HbA1c</th><td>{{ $ri->hemoglobina_glicosilada ?? $glucosa?->hemoglobina_glicosilada ?? 'No disponible' }}</td><th>Triglicéridos / HDL</th><td>{{ $lipidos?->trigliceridos ?? 'N/D' }} / {{ $lipidos?->hdl ?? 'N/D' }}</td></tr>
            <tr><th>Riesgo diabetes</th><td>{{ $ri->riesgo_diabetes }}</td><th>Riesgo cardiometabólico</th><td>{{ $ri->riesgo_cardiometabolico }}</td></tr>
            <tr><th>Conclusión médica</th><td colspan="3">{{ $ri->conclusion_medica ?: 'Sin conclusión registrada' }}</td></tr>
            <tr><th>Recomendaciones</th><td colspan="3">{{ $ri->recomendaciones_medicas ?: 'Sin recomendaciones registradas' }}</td></tr>
        </table>
        <h3>Justificación RI</h3>
        <p>El valor HOMA-IR {{ $ri->homa_ir !== null ? 'registrado es '.$ri->homa_ir : 'no está disponible' }} y la resistencia a la insulina consta como {{ $ri->resistencia_confirmada ? 'confirmada' : 'no confirmada' }}. El grado clínico es {{ $ri->grado_resistencia }}. Los indicadores de glucosa, insulina, HbA1c, triglicéridos y HDL documentados complementan la valoración del riesgo metabólico.</p>
    @else <p class="empty">No existe diagnóstico de resistencia a la insulina registrado.</p> @endif

    <div class="page-break"></div>
    <h2>Resultado del sistema experto</h2>
    <table>
        <tr><th>Motor utilizado</th><td colspan="3">ZEN Engine</td></tr>
        <tr><th>Confianza PMOS</th><td>{{ $pmos?->confianza_experta ?? 'N/D' }}</td><th>Versión PMOS</th><td>{{ $pmos?->version_motor_experto ?? 'N/D' }}</td></tr>
        <tr><th>Reglas PMOS</th><td colspan="3">@forelse($pmos?->reglas_activadas ?? [] as $regla)<span class="tag">{{ $regla }}</span>@empty N/D @endforelse</td></tr>
        <tr><th>Explicación PMOS</th><td colspan="3">{{ count($explicacionPmos) ? implode(' ', $explicacionPmos) : 'N/D' }}</td></tr>
        <tr><th>Confianza RI</th><td>{{ $ri?->confianza_experta ?? 'N/D' }}</td><th>Versión RI</th><td>{{ $ri?->version_motor_experto ?? 'N/D' }}</td></tr>
        <tr><th>Reglas RI</th><td colspan="3">@forelse($ri?->reglas_activadas ?? [] as $regla)<span class="tag">{{ $regla }}</span>@empty N/D @endforelse</td></tr>
        <tr><th>Explicación RI</th><td colspan="3">{{ count($explicacionRi) ? implode(' ', $explicacionRi) : 'N/D' }}</td></tr>
    </table>

    <h2>Validación médica</h2>
    @foreach(['PMOS' => $pmos, 'Resistencia a la insulina' => $ri] as $nombre => $diagnostico)
        <h3>{{ $nombre }}</h3>
        @if($diagnostico)
            <table>
                <tr><th>Estado</th><td>{{ $diagnostico->estado_validacion_experta }}</td><th>Validado por</th><td>{{ $diagnostico->validadorExperto?->name ?? 'Pendiente' }}</td></tr>
                <tr><th>Fecha</th><td>{{ $diagnostico->fecha_validacion?->format('d/m/Y H:i') ?? 'Pendiente' }}</td><th>Observación</th><td>{{ $diagnostico->observacion_validacion ?: 'Sin observación' }}</td></tr>
            </table>
        @else <p class="empty">Sin diagnóstico registrado.</p> @endif
    @endforeach

    <div class="notice"><strong>Nota clínica:</strong> Este informe corresponde a un apoyo clínico generado por el sistema experto. La confirmación diagnóstica y la decisión médica final corresponden al especialista responsable.</div>
</body>
</html>
