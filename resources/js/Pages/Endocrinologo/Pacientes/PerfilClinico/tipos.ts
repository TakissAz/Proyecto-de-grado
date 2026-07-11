/**
 * Tipos compartidos para el módulo de Perfil Clínico.
 */

export interface DatosPaciente {
    id_paciente: number;
    nombre_completo: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    ci: string;
    fecha_nacimiento: string;
    edad: number | null;
    sexo: string;
    telefono?: string | null;
    direccion?: string | null;
    ocupacion?: string | null;
    estado_civil?: string | null;
    fecha_registro?: string | null;
    estado: 'activo' | 'inactivo';
    observaciones?: string | null;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

export interface SeccionEstado {
    completada: boolean;
    total_registros?: number;
    ultima_fecha?: string | null;
    // Laboratorios
    perfil_androgenico?: number;
    perfil_gonadotropo?: number;
    diferencial_endocrino?: number;
    glucosa_insulina?: number;
    perfil_lipidico?: number;
    // Diagnóstico PMOS
    confirmado?: boolean;
    fenotipo?: string | null;
}

export interface EstadoFlujo {
    etapa: 'registro_inicial' | 'en_evaluacion' | 'diagnostico_completo' | 'inactivo';
    etiqueta: string;
    secciones_completadas: number;
    total_secciones: number;
    porcentaje: number;
}

export interface ResumenClinico {
    tiene_consulta: boolean;
    diagnostico_pmos: {
        confirmado: boolean;
        fenotipo?: string | null;
        severidad?: string | null;
        riesgo_metabolico?: string | null;
    } | null;
    diagnostico_resistencia_insulina: {
        confirmado: boolean;
    } | null;
    total_consultas: number;
    ultima_consulta?: string | null;
}

export interface Alerta {
    tipo: 'warning' | 'info' | 'error';
    mensaje: string;
    seccion: string;
}

export interface Auditoria {
    creado_en?: string | null;
    actualizado_en?: string | null;
    fecha_registro?: string | null;
}

export interface ConsultaInicial {
    id_consulta_endocrinologica: number;
    fecha_consulta: string;
    motivo_consulta: string;
    sospecha_pmos: boolean;
    sospecha_resistencia_insulina: boolean;
    observaciones_generales?: string | null;
    estado: string;
    profesional?: {
        id: number;
        nombre: string;
    } | null;
}

export interface HistoriaMenstrualData {
    id_historia_menstrual: number;
    id_consulta_endocrinologica: number;
    fecha_ultima_menstruacion?: string | null;
    edad_menarquia?: number | null;
    regularidad_ciclo?: 'regular' | 'irregular' | 'ausente' | null;
    duracion_ciclo_dias?: number | null;
    intervalo_entre_ciclos_dias?: number | null;
    amenorrea: boolean;
    oligomenorrea: boolean;
    sangrado_abundante: boolean;
    dolor_menstrual: boolean;
    sospecha_anovulacion: boolean;
    progesterona_lutea?: number | null;
    confirma_anovulacion_por_progesterona: boolean;
    observaciones?: string | null;
}

export interface HiperandrogenismoData {
    id_historia_hiperandrogenica: number;
    id_consulta_endocrinologica: number;
    acne: boolean;
    acne_grado: 'no_aplica' | 'leve' | 'moderado' | 'severo';
    hirsutismo: boolean;
    hirsutismo_zona?: string | null;
    puntaje_ferriman_gallwey?: number | null;
    alopecia_androgenica: boolean;
    seborrea: boolean;
    inicio_sintomas?: string | null;
    progresion_sintomas?: 'estable' | 'progresivo' | 'regresivo' | null;
    observaciones?: string | null;
}

export interface AntecedentesData {
    id_antecedente: number;
    id_consulta_endocrinologica: number;
    diabetes_familiar: boolean;
    diabetes_personal: boolean;
    hipertension_familiar: boolean;
    hipertension_personal: boolean;
    dislipidemia_familiar: boolean;
    dislipidemia_personal: boolean;
    enfermedad_tiroidea: boolean;
    hiperprolactinemia_previa: boolean;
    uso_anticonceptivos: boolean;
    uso_metformina: boolean;
    uso_corticoides: boolean;
    otros_medicamentos?: string | null;
    observaciones?: string | null;
}

export interface EvaluacionFisicaData {
    id_evaluacion_fisica: number;
    id_consulta_endocrinologica: number;
    peso?: number | null;
    talla?: number | null;
    imc?: number | null;
    circunferencia_cintura?: number | null;
    circunferencia_cadera?: number | null;
    indice_cintura_cadera?: number | null;
    presion_sistolica?: number | null;
    presion_diastolica?: number | null;
    acantosis_nigricans: boolean;
    skin_tags: boolean;
    galactorrea: boolean;
    hirsutismo_visible: boolean;
    puntaje_ferriman_gallwey?: number | null;
    acne_visible: boolean;
    alopecia_visible: boolean;
    observaciones?: string | null;
}

export interface PerfilAndrogenicoData {
    id_perfil_androgenico: number;
    id_consulta_endocrinologica: number;
    fecha_resultado: string;
    testosterona_total?: number | null;
    testosterona_libre?: number | null;
    shbg?: number | null;
    indice_androgenico_libre?: number | null;
    dhea_s?: number | null;
    androstenediona?: number | null;
    hiperandrogenismo_bioquimico: boolean;
    interpretacion?: string | null;
}

export interface PerfilGonadotropoData {
    id_perfil_gonadotropo: number;
    id_consulta_endocrinologica: number;
    fecha_resultado: string;
    lh?: number | null;
    fsh?: number | null;
    relacion_lh_fsh?: number | null;
    estradiol?: number | null;
    progesterona?: number | null;
    progesterona_dia_ciclo?: number | null;
    progesterona_fase_ciclo?: string | null;
    interpretacion?: string | null;
}

export interface DiferencialEndocrinoData {
    id_diferencial_endocrino: number;
    id_consulta_endocrinologica: number;
    fecha_resultado: string;
    tsh?: number | null;
    t3_libre?: number | null;
    t4_libre?: number | null;
    prolactina?: number | null;
    diecisiete_oh_progesterona?: number | null;
    cortisol?: number | null;
    alteracion_tiroidea_descartada: boolean;
    hiperprolactinemia_descartada: boolean;
    hiperplasia_suprarrenal_descartada: boolean;
    cushing_descartado: boolean;
    interpretacion?: string | null;
}

export interface GlucosaInsulinaData {
    id_glucosa_insulina: number;
    id_consulta_endocrinologica: number;
    fecha_resultado: string;
    glucosa_ayunas?: number | null;
    insulina_ayunas?: number | null;
    homa_ir?: number | null;
    hemoglobina_glicosilada?: number | null;
    glucosa_2h_ogtt?: number | null;
    insulina_2h_ogtt?: number | null;
    hiperinsulinemia: boolean;
    resistencia_insulina_sugerida: boolean;
    interpretacion?: string | null;
}

export interface PerfilLipidicoData {
    id_perfil_lipidico: number;
    id_consulta_endocrinologica: number;
    fecha_resultado: string;
    colesterol_total?: number | null;
    hdl?: number | null;
    ldl?: number | null;
    vldl?: number | null;
    trigliceridos?: number | null;
    colesterol_no_hdl?: number | null;
    dislipidemia_sugerida: boolean;
    interpretacion?: string | null;
}

export interface LaboratoriosData {
    perfil_androgenico: PerfilAndrogenicoData | null;
    perfil_gonadotropo: PerfilGonadotropoData | null;
    diferencial_endocrino: DiferencialEndocrinoData | null;
    glucosa_insulina: GlucosaInsulinaData | null;
    perfil_lipidico: PerfilLipidicoData | null;
}

export interface EcografiaData {
    id_ecografia: number;
    id_consulta_endocrinologica: number;
    fecha_ecografia: string;
    tipo_ecografia?: 'transvaginal' | 'abdominal' | 'otra' | null;
    volumen_ovario_derecho?: number | null;
    volumen_ovario_izquierdo?: number | null;
    foliculos_ovario_derecho?: number | null;
    foliculos_ovario_izquierdo?: number | null;
    morfologia_compatible_pmos: boolean;
    distribucion_periferica: boolean;
    observaciones?: string | null;
}

export interface EvaluacionPmosData {
    cumple_alteracion_ovulatoria: boolean;
    cumple_hiperandrogenismo_clinico: boolean;
    cumple_hiperandrogenismo_bioquimico: boolean;
    cumple_hiperandrogenismo: boolean;
    tipo_hiperandrogenismo: string;
    cumple_morfologia_ovarica: boolean;
    diagnosticos_diferenciales_descartados: boolean;
    total_criterios_rotterdam: number;
    diagnostico_sugerido: 'compatible_pmos' | 'pendiente_descartar_diferenciales' | 'datos_insuficientes' | 'no_compatible';
    fenotipo_sugerido?: string | null;
    alertas_datos_faltantes: string[];
    id_historia_menstrual?: number | null;
    id_historia_hiperandrogenica?: number | null;
    id_perfil_androgenico?: number | null;
    id_diferencial_endocrino?: number | null;
    id_ecografia?: number | null;
}

export interface DiagnosticoPmosData {
    id_diagnostico_pmos: number;
    id_consulta_endocrinologica: number;
    fecha_diagnostico: string;
    cumple_alteracion_ovulatoria: boolean;
    cumple_hiperandrogenismo_clinico: boolean;
    cumple_hiperandrogenismo_bioquimico: boolean;
    cumple_hiperandrogenismo: boolean;
    tipo_hiperandrogenismo?: string | null;
    cumple_morfologia_ovarica: boolean;
    total_criterios_rotterdam: number;
    fenotipo_pmos?: string | null;
    diagnostico_confirmado: boolean;
    diagnosticos_diferenciales_descartados: boolean;
    severidad_clinica?: 'leve' | 'moderada' | 'severa' | null;
    riesgo_metabolico?: 'bajo' | 'moderado' | 'alto' | null;
    conclusion_medica?: string | null;
    recomendaciones_medicas?: string | null;
}

export interface EvaluacionRiData {
    homa_ir?: number | null;
    homa_ir_elevado: boolean;
    hiperinsulinemia: boolean;
    alteracion_glucemica: boolean;
    signos_fisicos_asociados: boolean;
    dislipidemia_asociada: boolean;
    antecedentes_relevantes: boolean;
    diagnostico_sugerido: 'compatible_resistencia_insulina' | 'sospecha_clinica_pendiente_confirmacion' | 'datos_insuficientes' | 'no_compatible';
    riesgo_sugerido: 'bajo' | 'moderado' | 'alto';
    alertas_datos_faltantes: string[];
    id_glucosa_insulina?: number | null;
    id_perfil_lipidico?: number | null;
    id_evaluacion_fisica?: number | null;
    glucosa_ayunas?: number | null;
    insulina_ayunas?: number | null;
    hemoglobina_glicosilada?: number | null;
}

export interface DiagnosticoRiData {
    id_diagnostico_ri: number;
    id_consulta_endocrinologica: number;
    fecha_diagnostico: string;
    homa_ir?: number | null;
    glucosa_ayunas?: number | null;
    insulina_ayunas?: number | null;
    hemoglobina_glicosilada?: number | null;
    resistencia_confirmada: boolean;
    grado_resistencia: string;
    riesgo_diabetes: string;
    riesgo_cardiometabolico: string;
    conclusion_medica?: string | null;
    recomendaciones_medicas?: string | null;
}

export interface PerfilClinicoData {
    paciente: DatosPaciente;
    resumen_clinico: ResumenClinico;
    estado_flujo: EstadoFlujo;
    secciones: Record<string, SeccionEstado>;
    alertas: Alerta[];
    auditoria: Auditoria;
    consulta_inicial: ConsultaInicial | null;
    historia_menstrual: HistoriaMenstrualData | null;
    hiperandrogenismo: HiperandrogenismoData | null;
    antecedentes: AntecedentesData | null;
    evaluacion_fisica: EvaluacionFisicaData | null;
    laboratorios: LaboratoriosData;
    ecografia: EcografiaData | null;
    evaluacion_pmos: EvaluacionPmosData;
    diagnostico_pmos: DiagnosticoPmosData | null;
    evaluacion_ri: EvaluacionRiData;
    diagnostico_ri: DiagnosticoRiData | null;
}
