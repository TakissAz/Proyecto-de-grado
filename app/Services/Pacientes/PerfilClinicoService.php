<?php

namespace App\Services\Pacientes;

use App\Models\Paciente;
use App\Services\Pacientes\DiagnosticoPmosService;
use App\Services\Pacientes\DiagnosticoResistenciaInsulinaService;
use Illuminate\Support\Facades\Auth;

class PerfilClinicoService
{
    public function __construct(
        private readonly DiagnosticoPmosService $diagnosticoPmosService,
        private readonly DiagnosticoResistenciaInsulinaService $diagnosticoRiService,
    ) {}

    /**
     * Obtiene el perfil clínico completo de una paciente, incluyendo:
     * - Datos de la paciente y usuario
     * - Resumen clínico (estado de cada sección)
     * - Estado del flujo
     * - Alertas de datos pendientes
     * - Auditoría básica
     */
    public function obtener(Paciente $paciente): array
    {
        $paciente->loadMissing([
            'user.roles',
            'consultasEndocrinologicas' => fn ($q) => $q->with('endocrinologo')->oldest('fecha_consulta'),
            'historiaMenstrual' => fn ($q) => $q->latest('id_historia_menstrual'),
            'historiaHiperandrogenica' => fn ($q) => $q->latest('id_historia_hiperandrogenica'),
            'antecedentesEndocrinoMetabolicos' => fn ($q) => $q->latest('id_antecedente'),
            'evaluacionesFisicasEndocrinas' => fn ($q) => $q->latest('id_evaluacion_fisica'),
            'resultadosPerfilAndrogenico' => fn ($q) => $q->latest('id_perfil_androgenico'),
            'resultadosPerfilGonadotropo' => fn ($q) => $q->latest('id_perfil_gonadotropo'),
            'resultadosDiferencialesEndocrinos' => fn ($q) => $q->latest('id_diferencial_endocrino'),
            'resultadosGlucosaInsulina' => fn ($q) => $q->latest('id_glucosa_insulina'),
            'resultadosPerfilLipidico' => fn ($q) => $q->latest('id_perfil_lipidico'),
            'evaluacionesEcograficas' => fn ($q) => $q->latest('id_ecografia'),
            'diagnosticosPmos' => fn ($q) => $q->latest('fecha_diagnostico'),
            'diagnosticosResistenciaInsulina' => fn ($q) => $q->latest('created_at'),
        ]);

        $secciones = $this->evaluarSecciones($paciente);
        $alertas = $this->generarAlertas($paciente, $secciones);
        $estadoFlujo = $this->determinarEstadoFlujo($paciente, $secciones);
        $resumenClinico = $this->construirResumenClinico($paciente, $secciones);
        $auditoria = $this->obtenerAuditoria($paciente);
        $consultaInicial = $this->obtenerConsultaInicial($paciente);
        $historiaMenstrual = $this->obtenerHistoriaMenstrual($paciente);
        $hiperandrogenismo = $this->obtenerHiperandrogenismo($paciente);
        $antecedentes = $this->obtenerAntecedentes($paciente);
        $evaluacionFisica = $this->obtenerEvaluacionFisica($paciente);
        $laboratorios = $this->obtenerLaboratorios($paciente);
        $ecografia = $this->obtenerEcografia($paciente);
        $evaluacionPmos = $this->diagnosticoPmosService->evaluarCriterios($paciente);
        $diagnosticoPmos = $this->obtenerDiagnosticoPmos($paciente);
        $evaluacionRi = $this->diagnosticoRiService->evaluarCriterios($paciente);
        $diagnosticoRi = $this->obtenerDiagnosticoRi($paciente);

        return [
            'paciente' => $paciente,
            'resumen_clinico' => $resumenClinico,
            'estado_flujo' => $estadoFlujo,
            'secciones' => $secciones,
            'alertas' => $alertas,
            'auditoria' => $auditoria,
            'consulta_inicial' => $consultaInicial,
            'historia_menstrual' => $historiaMenstrual,
            'hiperandrogenismo' => $hiperandrogenismo,
            'antecedentes' => $antecedentes,
            'evaluacion_fisica' => $evaluacionFisica,
            'laboratorios' => $laboratorios,
            'ecografia' => $ecografia,
            'evaluacion_pmos' => $evaluacionPmos,
            'diagnostico_pmos' => $diagnosticoPmos,
            'evaluacion_ri' => $evaluacionRi,
            'diagnostico_ri' => $diagnosticoRi,
        ];
    }

    /**
     * Evalúa qué secciones tienen datos y cuáles están pendientes.
     */
    private function evaluarSecciones(Paciente $paciente): array
    {
        return [
            'datos_generales' => [
                'completada' => true, // siempre tiene datos si existe el paciente
                'total_registros' => 1,
            ],
            'consulta_endocrinologica' => [
                'completada' => $paciente->consultasEndocrinologicas->isNotEmpty(),
                'total_registros' => $paciente->consultasEndocrinologicas->count(),
                'ultima_fecha' => $paciente->consultasEndocrinologicas->first()?->fecha_consulta?->format('Y-m-d'),
            ],
            'historia_menstrual' => [
                'completada' => $paciente->historiaMenstrual->isNotEmpty(),
                'total_registros' => $paciente->historiaMenstrual->count(),
            ],
            'hiperandrogenismo' => [
                'completada' => $paciente->historiaHiperandrogenica->isNotEmpty(),
                'total_registros' => $paciente->historiaHiperandrogenica->count(),
            ],
            'antecedentes_endocrino_metabolicos' => [
                'completada' => $paciente->antecedentesEndocrinoMetabolicos->isNotEmpty(),
                'total_registros' => $paciente->antecedentesEndocrinoMetabolicos->count(),
            ],
            'evaluacion_fisica_endocrina' => [
                'completada' => $paciente->evaluacionesFisicasEndocrinas->isNotEmpty(),
                'total_registros' => $paciente->evaluacionesFisicasEndocrinas->count(),
            ],
            'laboratorios' => [
                'completada' => $paciente->resultadosPerfilAndrogenico->isNotEmpty()
                    || $paciente->resultadosPerfilGonadotropo->isNotEmpty()
                    || $paciente->resultadosDiferencialesEndocrinos->isNotEmpty()
                    || $paciente->resultadosGlucosaInsulina->isNotEmpty()
                    || $paciente->resultadosPerfilLipidico->isNotEmpty(),
                'perfil_androgenico' => $paciente->resultadosPerfilAndrogenico->count(),
                'perfil_gonadotropo' => $paciente->resultadosPerfilGonadotropo->count(),
                'diferencial_endocrino' => $paciente->resultadosDiferencialesEndocrinos->count(),
                'glucosa_insulina' => $paciente->resultadosGlucosaInsulina->count(),
                'perfil_lipidico' => $paciente->resultadosPerfilLipidico->count(),
            ],
            'ecografia' => [
                'completada' => $paciente->evaluacionesEcograficas->isNotEmpty(),
                'total_registros' => $paciente->evaluacionesEcograficas->count(),
            ],
            'diagnostico_pmos' => [
                'completada' => $paciente->diagnosticosPmos->isNotEmpty(),
                'total_registros' => $paciente->diagnosticosPmos->count(),
                'confirmado' => $paciente->diagnosticosPmos->first()?->diagnostico_confirmado ?? false,
                'fenotipo' => $paciente->diagnosticosPmos->first()?->fenotipo_pmos,
            ],
            'diagnostico_resistencia_insulina' => [
                'completada' => $paciente->diagnosticosResistenciaInsulina->isNotEmpty(),
                'total_registros' => $paciente->diagnosticosResistenciaInsulina->count(),
            ],
        ];
    }

    /**
     * Genera alertas cuando faltan datos importantes.
     */
    private function generarAlertas(Paciente $paciente, array $secciones): array
    {
        $alertas = [];

        if (! $secciones['consulta_endocrinologica']['completada']) {
            $alertas[] = [
                'tipo' => 'warning',
                'mensaje' => 'No se ha registrado una consulta endocrinológica.',
                'seccion' => 'consulta_endocrinologica',
            ];
        }

        if (! $secciones['historia_menstrual']['completada']) {
            $alertas[] = [
                'tipo' => 'info',
                'mensaje' => 'Historia menstrual pendiente de registro.',
                'seccion' => 'historia_menstrual',
            ];
        }

        if (! $secciones['laboratorios']['completada']) {
            $alertas[] = [
                'tipo' => 'info',
                'mensaje' => 'No se han registrado resultados de laboratorio.',
                'seccion' => 'laboratorios',
            ];
        }

        if (! $secciones['ecografia']['completada']) {
            $alertas[] = [
                'tipo' => 'info',
                'mensaje' => 'Evaluación ecográfica pendiente.',
                'seccion' => 'ecografia',
            ];
        }

        if ($secciones['consulta_endocrinologica']['completada'] && ! $secciones['diagnostico_pmos']['completada']) {
            $alertas[] = [
                'tipo' => 'warning',
                'mensaje' => 'Diagnóstico PMOS pendiente de evaluación.',
                'seccion' => 'diagnostico_pmos',
            ];
        }

        return $alertas;
    }

    /**
     * Determina el estado del flujo clínico.
     */
    private function determinarEstadoFlujo(Paciente $paciente, array $secciones): array
    {
        $seccionesCompletadas = collect($secciones)->filter(fn ($s) => $s['completada'])->count();
        $totalSecciones = count($secciones);

        if ($paciente->estado === 'inactivo') {
            $etapa = 'inactivo';
            $etiqueta = 'Inactivo';
        } elseif ($secciones['diagnostico_pmos']['completada'] && $secciones['diagnostico_pmos']['confirmado']) {
            $etapa = 'diagnostico_completo';
            $etiqueta = 'Diagnóstico completo';
        } elseif ($secciones['consulta_endocrinologica']['completada']) {
            $etapa = 'en_evaluacion';
            $etiqueta = 'En evaluación clínica';
        } else {
            $etapa = 'registro_inicial';
            $etiqueta = 'Registro inicial';
        }

        return [
            'etapa' => $etapa,
            'etiqueta' => $etiqueta,
            'secciones_completadas' => $seccionesCompletadas,
            'total_secciones' => $totalSecciones,
            'porcentaje' => $totalSecciones > 0 ? round(($seccionesCompletadas / $totalSecciones) * 100) : 0,
        ];
    }

    /**
     * Construye el resumen clínico general.
     */
    private function construirResumenClinico(Paciente $paciente, array $secciones): array
    {
        $diagnosticoPmos = $paciente->diagnosticosPmos->first();
        $diagnosticoRI = $paciente->diagnosticosResistenciaInsulina->first();

        return [
            'tiene_consulta' => $secciones['consulta_endocrinologica']['completada'],
            'diagnostico_pmos' => $diagnosticoPmos ? [
                'confirmado' => $diagnosticoPmos->diagnostico_confirmado,
                'fenotipo' => $diagnosticoPmos->fenotipo_pmos,
                'severidad' => $diagnosticoPmos->severidad_clinica,
                'riesgo_metabolico' => $diagnosticoPmos->riesgo_metabolico,
            ] : null,
            'diagnostico_resistencia_insulina' => $diagnosticoRI ? [
                'confirmado' => true,
            ] : null,
            'total_consultas' => $secciones['consulta_endocrinologica']['total_registros'],
            'ultima_consulta' => $secciones['consulta_endocrinologica']['ultima_fecha'] ?? null,
        ];
    }

    /**
     * Obtiene información básica de auditoría.
     */
    private function obtenerAuditoria(Paciente $paciente): array
    {
        return [
            'creado_en' => $paciente->created_at?->format('Y-m-d H:i'),
            'actualizado_en' => $paciente->updated_at?->format('Y-m-d H:i'),
            'fecha_registro' => $paciente->fecha_registro?->format('Y-m-d'),
        ];
    }

    /**
     * Obtiene la primera consulta endocrinológica registrada (consulta inicial).
     */
    private function obtenerConsultaInicial(Paciente $paciente): ?array
    {
        $consulta = $paciente->consultasEndocrinologicas->first();

        if (! $consulta) {
            return null;
        }

        return [
            'id_consulta_endocrinologica' => $consulta->id_consulta_endocrinologica,
            'fecha_consulta' => $consulta->fecha_consulta?->format('Y-m-d'),
            'motivo_consulta' => $consulta->motivo_consulta,
            'sospecha_pmos' => $consulta->sospecha_pmos,
            'sospecha_resistencia_insulina' => $consulta->sospecha_resistencia_insulina,
            'observaciones_generales' => $consulta->observaciones_generales,
            'estado' => $consulta->estado,
            'profesional' => $consulta->endocrinologo ? [
                'id' => $consulta->endocrinologo->id,
                'nombre' => $consulta->endocrinologo->name,
            ] : null,
        ];
    }

    /**
     * Obtiene la historia menstrual más reciente de la paciente.
     */
    private function obtenerHistoriaMenstrual(Paciente $paciente): ?array
    {
        $historia = $paciente->historiaMenstrual->first();

        if (! $historia) {
            return null;
        }

        return [
            'id_historia_menstrual' => $historia->id_historia_menstrual,
            'id_consulta_endocrinologica' => $historia->id_consulta_endocrinologica,
            'fecha_ultima_menstruacion' => $historia->fecha_ultima_menstruacion?->format('Y-m-d'),
            'edad_menarquia' => $historia->edad_menarquia,
            'regularidad_ciclo' => $historia->regularidad_ciclo,
            'duracion_ciclo_dias' => $historia->duracion_ciclo_dias,
            'intervalo_entre_ciclos_dias' => $historia->intervalo_entre_ciclos_dias,
            'amenorrea' => $historia->amenorrea,
            'oligomenorrea' => $historia->oligomenorrea,
            'sangrado_abundante' => $historia->sangrado_abundante,
            'dolor_menstrual' => $historia->dolor_menstrual,
            'sospecha_anovulacion' => $historia->sospecha_anovulacion,
            'progesterona_lutea' => $historia->progesterona_lutea,
            'confirma_anovulacion_por_progesterona' => $historia->confirma_anovulacion_por_progesterona,
            'observaciones' => $historia->observaciones,
            'created_at' => $historia->created_at?->format('Y-m-d'),
            'updated_at' => $historia->updated_at?->format('Y-m-d'),
        ];
    }

    /**
     * Obtiene la historia hiperandrogénica más reciente de la paciente.
     */
    private function obtenerHiperandrogenismo(Paciente $paciente): ?array
    {
        $registro = $paciente->historiaHiperandrogenica->first();

        if (! $registro) {
            return null;
        }

        return [
            'id_historia_hiperandrogenica' => $registro->id_historia_hiperandrogenica,
            'id_consulta_endocrinologica'  => $registro->id_consulta_endocrinologica,
            'acne'                         => $registro->acne,
            'acne_grado'                   => $registro->acne_grado,
            'hirsutismo'                   => $registro->hirsutismo,
            'hirsutismo_zona'              => $registro->hirsutismo_zona,
            'puntaje_ferriman_gallwey'     => $registro->puntaje_ferriman_gallwey,
            'alopecia_androgenica'         => $registro->alopecia_androgenica,
            'seborrea'                     => $registro->seborrea,
            'inicio_sintomas'              => $registro->inicio_sintomas,
            'progresion_sintomas'          => $registro->progresion_sintomas,
            'observaciones'                => $registro->observaciones,
        ];
    }

    /**
     * Obtiene los antecedentes endocrino-metabólicos más recientes.
     */
    private function obtenerAntecedentes(Paciente $paciente): ?array
    {
        $registro = $paciente->antecedentesEndocrinoMetabolicos->first();

        if (! $registro) {
            return null;
        }

        return [
            'id_antecedente'              => $registro->id_antecedente,
            'id_consulta_endocrinologica' => $registro->id_consulta_endocrinologica,
            'diabetes_familiar'           => $registro->diabetes_familiar,
            'diabetes_personal'           => $registro->diabetes_personal,
            'hipertension_familiar'       => $registro->hipertension_familiar,
            'hipertension_personal'       => $registro->hipertension_personal,
            'dislipidemia_familiar'       => $registro->dislipidemia_familiar,
            'dislipidemia_personal'       => $registro->dislipidemia_personal,
            'enfermedad_tiroidea'         => $registro->enfermedad_tiroidea,
            'hiperprolactinemia_previa'   => $registro->hiperprolactinemia_previa,
            'uso_anticonceptivos'         => $registro->uso_anticonceptivos,
            'uso_metformina'              => $registro->uso_metformina,
            'uso_corticoides'             => $registro->uso_corticoides,
            'otros_medicamentos'          => $registro->otros_medicamentos,
            'antecedentes_personales_detalle' => $registro->antecedentes_personales_detalle,
            'antecedentes_familiares_detalle' => $registro->antecedentes_familiares_detalle,
            'medicamentos_detalle'        => $registro->medicamentos_detalle,
            'observaciones'               => $registro->observaciones,
            'created_at'                  => $registro->created_at?->format('Y-m-d'),
            'updated_at'                  => $registro->updated_at?->format('Y-m-d'),
        ];
    }

    /**
     * Obtiene la evaluación física endocrina más reciente.
     */
    private function obtenerEvaluacionFisica(Paciente $paciente): ?array
    {
        $registro = $paciente->evaluacionesFisicasEndocrinas->first();

        if (! $registro) {
            return null;
        }

        return [
            'id_evaluacion_fisica'        => $registro->id_evaluacion_fisica,
            'id_consulta_endocrinologica' => $registro->id_consulta_endocrinologica,
            'peso'                        => $registro->peso,
            'talla'                       => $registro->talla,
            'imc'                         => $registro->imc,
            'circunferencia_cintura'      => $registro->circunferencia_cintura,
            'circunferencia_cadera'       => $registro->circunferencia_cadera,
            'indice_cintura_cadera'       => $registro->indice_cintura_cadera,
            'presion_sistolica'           => $registro->presion_sistolica,
            'presion_diastolica'          => $registro->presion_diastolica,
            'acantosis_nigricans'         => $registro->acantosis_nigricans,
            'skin_tags'                   => $registro->skin_tags,
            'galactorrea'                 => $registro->galactorrea,
            'hirsutismo_visible'          => $registro->hirsutismo_visible,
            'puntaje_ferriman_gallwey'    => $registro->puntaje_ferriman_gallwey,
            'acne_visible'                => $registro->acne_visible,
            'alopecia_visible'            => $registro->alopecia_visible,
            'observaciones'               => $registro->observaciones,
            'created_at'                  => $registro->created_at?->format('Y-m-d'),
            'updated_at'                  => $registro->updated_at?->format('Y-m-d'),
        ];
    }

    /**
     * Obtiene todos los resultados de laboratorio agrupados por panel.
     */
    private function obtenerLaboratorios(Paciente $paciente): array
    {
        $androgenico = $paciente->resultadosPerfilAndrogenico->first();
        $gonadotropo = $paciente->resultadosPerfilGonadotropo->first();
        $diferencial = $paciente->resultadosDiferencialesEndocrinos->first();
        $glucosa = $paciente->resultadosGlucosaInsulina->first();
        $lipidico = $paciente->resultadosPerfilLipidico->first();

        return [
            'perfil_androgenico' => $androgenico ? [
                'id_perfil_androgenico'       => $androgenico->id_perfil_androgenico,
                'id_consulta_endocrinologica' => $androgenico->id_consulta_endocrinologica,
                'fecha_resultado'             => $androgenico->fecha_resultado?->format('Y-m-d'),
                'testosterona_total'          => $androgenico->testosterona_total,
                'testosterona_libre'          => $androgenico->testosterona_libre,
                'shbg'                        => $androgenico->shbg,
                'indice_androgenico_libre'    => $androgenico->indice_androgenico_libre,
                'dhea_s'                      => $androgenico->dhea_s,
                'androstenediona'             => $androgenico->androstenediona,
                'hiperandrogenismo_bioquimico'=> $androgenico->hiperandrogenismo_bioquimico,
                'interpretacion'              => $androgenico->interpretacion,
            ] : null,
            'perfil_gonadotropo' => $gonadotropo ? [
                'id_perfil_gonadotropo'       => $gonadotropo->id_perfil_gonadotropo,
                'id_consulta_endocrinologica' => $gonadotropo->id_consulta_endocrinologica,
                'fecha_resultado'             => $gonadotropo->fecha_resultado?->format('Y-m-d'),
                'lh'                          => $gonadotropo->lh,
                'fsh'                         => $gonadotropo->fsh,
                'relacion_lh_fsh'             => $gonadotropo->relacion_lh_fsh,
                'estradiol'                   => $gonadotropo->estradiol,
                'progesterona'                => $gonadotropo->progesterona,
                'progesterona_dia_ciclo'      => $gonadotropo->progesterona_dia_ciclo,
                'progesterona_fase_ciclo'     => $gonadotropo->progesterona_fase_ciclo,
                'interpretacion'              => $gonadotropo->interpretacion,
            ] : null,
            'diferencial_endocrino' => $diferencial ? [
                'id_diferencial_endocrino'               => $diferencial->id_diferencial_endocrino,
                'id_consulta_endocrinologica'            => $diferencial->id_consulta_endocrinologica,
                'fecha_resultado'                        => $diferencial->fecha_resultado?->format('Y-m-d'),
                'tsh'                                    => $diferencial->tsh,
                't3_libre'                               => $diferencial->t3_libre,
                't4_libre'                               => $diferencial->t4_libre,
                'prolactina'                             => $diferencial->prolactina,
                'diecisiete_oh_progesterona'             => $diferencial->diecisiete_oh_progesterona,
                'cortisol'                               => $diferencial->cortisol,
                'alteracion_tiroidea_descartada'         => $diferencial->alteracion_tiroidea_descartada,
                'hiperprolactinemia_descartada'          => $diferencial->hiperprolactinemia_descartada,
                'hiperplasia_suprarrenal_descartada'     => $diferencial->hiperplasia_suprarrenal_descartada,
                'cushing_descartado'                     => $diferencial->cushing_descartado,
                'interpretacion'                         => $diferencial->interpretacion,
            ] : null,
            'glucosa_insulina' => $glucosa ? [
                'id_glucosa_insulina'             => $glucosa->id_glucosa_insulina,
                'id_consulta_endocrinologica'     => $glucosa->id_consulta_endocrinologica,
                'fecha_resultado'                 => $glucosa->fecha_resultado?->format('Y-m-d'),
                'glucosa_ayunas'                  => $glucosa->glucosa_ayunas,
                'insulina_ayunas'                 => $glucosa->insulina_ayunas,
                'homa_ir'                         => $glucosa->homa_ir,
                'hemoglobina_glicosilada'         => $glucosa->hemoglobina_glicosilada,
                'glucosa_2h_ogtt'                 => $glucosa->glucosa_2h_ogtt,
                'insulina_2h_ogtt'                => $glucosa->insulina_2h_ogtt,
                'hiperinsulinemia'                => $glucosa->hiperinsulinemia,
                'resistencia_insulina_sugerida'   => $glucosa->resistencia_insulina_sugerida,
                'interpretacion'                  => $glucosa->interpretacion,
            ] : null,
            'perfil_lipidico' => $lipidico ? [
                'id_perfil_lipidico'              => $lipidico->id_perfil_lipidico,
                'id_consulta_endocrinologica'     => $lipidico->id_consulta_endocrinologica,
                'fecha_resultado'                 => $lipidico->fecha_resultado?->format('Y-m-d'),
                'colesterol_total'                => $lipidico->colesterol_total,
                'hdl'                             => $lipidico->hdl,
                'ldl'                             => $lipidico->ldl,
                'vldl'                            => $lipidico->vldl,
                'trigliceridos'                   => $lipidico->trigliceridos,
                'colesterol_no_hdl'               => $lipidico->colesterol_no_hdl,
                'dislipidemia_sugerida'           => $lipidico->dislipidemia_sugerida,
                'interpretacion'                  => $lipidico->interpretacion,
            ] : null,
        ];
    }

    /**
     * Obtiene la evaluación ecográfica más reciente.
     */
    private function obtenerEcografia(Paciente $paciente): ?array
    {
        $registro = $paciente->evaluacionesEcograficas->first();

        if (! $registro) {
            return null;
        }

        return [
            'id_ecografia'                => $registro->id_ecografia,
            'id_consulta_endocrinologica' => $registro->id_consulta_endocrinologica,
            'fecha_ecografia'             => $registro->fecha_ecografia?->format('Y-m-d'),
            'tipo_ecografia'              => $registro->tipo_ecografia,
            'volumen_ovario_derecho'      => $registro->volumen_ovario_derecho,
            'volumen_ovario_izquierdo'    => $registro->volumen_ovario_izquierdo,
            'foliculos_ovario_derecho'    => $registro->foliculos_ovario_derecho,
            'foliculos_ovario_izquierdo'  => $registro->foliculos_ovario_izquierdo,
            'morfologia_compatible_pmos'  => $registro->morfologia_compatible_pmos,
            'distribucion_periferica'     => $registro->distribucion_periferica,
            'imagen_url'                  => $registro->archivo_informe ? '/storage/' . $registro->archivo_informe : null,
            'observaciones'               => $registro->observaciones,
        ];
    }

    /**
     * Obtiene el diagnóstico PMOS registrado más reciente (si existe).
     */
    private function obtenerDiagnosticoPmos(Paciente $paciente): ?array
    {
        $registro = $paciente->diagnosticosPmos->first();

        if (! $registro) {
            return null;
        }

        return [
            'id_diagnostico_pmos'                   => $registro->id_diagnostico_pmos,
            'id_consulta_endocrinologica'           => $registro->id_consulta_endocrinologica,
            'fecha_diagnostico'                     => $registro->fecha_diagnostico?->format('Y-m-d'),
            'cumple_alteracion_ovulatoria'          => $registro->cumple_alteracion_ovulatoria,
            'cumple_hiperandrogenismo_clinico'      => $registro->cumple_hiperandrogenismo_clinico,
            'cumple_hiperandrogenismo_bioquimico'   => $registro->cumple_hiperandrogenismo_bioquimico,
            'cumple_hiperandrogenismo'              => $registro->cumple_hiperandrogenismo,
            'tipo_hiperandrogenismo'                => $registro->tipo_hiperandrogenismo,
            'cumple_morfologia_ovarica'             => $registro->cumple_morfologia_ovarica,
            'total_criterios_rotterdam'             => $registro->total_criterios_rotterdam,
            'fenotipo_pmos'                         => $registro->fenotipo_pmos,
            'diagnostico_confirmado'                => $registro->diagnostico_confirmado,
            'diagnosticos_diferenciales_descartados'=> $registro->diagnosticos_diferenciales_descartados,
            'severidad_clinica'                     => $registro->severidad_clinica,
            'riesgo_metabolico'                     => $registro->riesgo_metabolico,
            'conclusion_medica'                     => $registro->conclusion_medica,
            'recomendaciones_medicas'               => $registro->recomendaciones_medicas,
            'estado'                                => $registro->estado,
            'criterios_rotterdam_cumplidos'         => $registro->criterios_rotterdam_cumplidos,
            'generado_por_motor_experto'            => $registro->generado_por_motor_experto,
            'confianza_experta'                     => $registro->confianza_experta,
            'estado_validacion_experta'             => $registro->estado_validacion_experta,
            'version_motor_experto'                 => $registro->version_motor_experto,
            'reglas_activadas'                      => $registro->reglas_activadas,
            'explicacion_experta'                   => $registro->explicacion_experta,
            'recomendaciones_expertas'              => $registro->recomendaciones_expertas,
            'validado_por'                          => $registro->validado_por,
            'fecha_validacion'                      => $registro->fecha_validacion?->toISOString(),
            'observacion_validacion'                => $registro->observacion_validacion,
        ];
    }

    /**
     * Obtiene el diagnóstico de resistencia a la insulina más reciente.
     */
    private function obtenerDiagnosticoRi(Paciente $paciente): ?array
    {
        $registro = $paciente->diagnosticosResistenciaInsulina->first();

        if (! $registro) {
            return null;
        }

        $perfilLipidico = $paciente->resultadosPerfilLipidico->first();

        return [
            'id_diagnostico_ri'           => $registro->id_diagnostico_ri,
            'id_consulta_endocrinologica' => $registro->id_consulta_endocrinologica,
            'fecha_diagnostico'           => $registro->fecha_diagnostico?->format('Y-m-d'),
            'homa_ir'                     => $registro->homa_ir,
            'quicki'                      => $registro->quicki,
            'glucosa_ayunas'              => $registro->glucosa_ayunas,
            'insulina_ayunas'             => $registro->insulina_ayunas,
            'hemoglobina_glicosilada'     => $registro->hemoglobina_glicosilada,
            'trigliceridos'               => $perfilLipidico?->trigliceridos,
            'hdl'                         => $perfilLipidico?->hdl,
            'resistencia_confirmada'      => $registro->resistencia_confirmada,
            'grado_resistencia'           => $registro->grado_resistencia,
            'riesgo_diabetes'             => $registro->riesgo_diabetes,
            'riesgo_cardiometabolico'     => $registro->riesgo_cardiometabolico,
            'conclusion_medica'           => $registro->conclusion_medica,
            'recomendaciones_medicas'     => $registro->recomendaciones_medicas,
            'estado'                      => $registro->estado,
            'generado_por_motor_experto'  => $registro->generado_por_motor_experto,
            'confianza_experta'           => $registro->confianza_experta,
            'estado_validacion_experta'   => $registro->estado_validacion_experta,
            'version_motor_experto'       => $registro->version_motor_experto,
            'reglas_activadas'            => $registro->reglas_activadas,
            'explicacion_experta'         => $registro->explicacion_experta,
            'recomendaciones_expertas'    => $registro->recomendaciones_expertas,
            'validado_por'                => $registro->validado_por,
            'fecha_validacion'            => $registro->fecha_validacion?->toISOString(),
            'observacion_validacion'      => $registro->observacion_validacion,
        ];
    }
}
