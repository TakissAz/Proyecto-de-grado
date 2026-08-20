export type Registro = Record<string, string | number | boolean | null> & { estado?: boolean };
export interface PacienteNutricional {
    id_paciente: number; nombres: string; apellido_paterno: string; apellido_materno?: string | null;
    ci: string; fecha_nacimiento: string; telefono?: string | null; ocupacion?: string | null; estado: string;
}
export interface Opciones {
    nivel_actividad: string[]; estado_consulta: string[]; frecuencias: string[];
    objetivo_principal: string[]; enfoque_nutricional: string[]; prioridad: string[];
}
export interface RequerimientoNutricional {
    id_requerimiento_nutricional: number;
    id_paciente: number;
    id_nutricionista: number;
    id_consulta_nutricional: number | null;
    id_evaluacion_nutricional: number;
    id_objetivo_nutricional: number | null;
    fecha_calculo: string;
    peso_referencia: number;
    talla_referencia: number;
    edad_referencia: number | null;
    nivel_actividad: string | null;
    factor_actividad: number;
    tmb: number;
    get: number;
    ajuste_calorico: number;
    calorias_objetivo: number;
    proteinas_diarias: number;
    carbohidratos_diarios: number;
    grasas_diarias: number;
    fibra_diaria: number;
    porcentaje_proteinas: number;
    porcentaje_carbohidratos: number;
    porcentaje_grasas: number;
    metodo_calculo: string;
    observaciones: string | null;
    reglas_aplicadas?: {
        codigo: string;
        nombre: string;
        tipo_regla: string;
        prioridad: number;
    }[] | null;
    estado: boolean;
}
export interface RecomendacionNutricionalExperta {
    id_recomendacion_nutricional_experta: number;
    enfoque_nutricional_experto: string | null;
    prioridad_nutricional: string | null;
    calorias_sugeridas: number | string | null;
    proteinas_porcentaje: number | string | null;
    carbohidratos_porcentaje: number | string | null;
    grasas_porcentaje: number | string | null;
    fibra_sugerida: number | string | null;
    recomendaciones: string[] | null;
    restricciones: string[] | null;
    alertas: string[] | null;
    conclusion: string | null;
    confianza_experta: number | string | null;
    reglas_activadas: string[] | null;
    explicacion_experta: string | null;
    version_motor_experto: string | null;
    estado_validacion_experta: string;
    validado_por: number | null;
    fecha_validacion: string | null;
    observacion_validacion: string | null;
    hechos_utilizados?: Record<string, unknown> | null;
}
export interface CatalogoAlimento { id_alimento:number; nombre:string; grupo_alimentario?:string|null; unidad_base:string; cantidad_base:number|string; calorias:number|string; proteinas:number|string; carbohidratos:number|string; grasas:number|string; fibra:number|string }
export interface CatalogoReceta { id_receta:number; nombre:string; tipo_comida:string; porciones:number; calorias_totales:number|string; proteinas_totales:number|string; carbohidratos_totales:number|string; grasas_totales:number|string; fibra_total:number|string }
export interface ComponentePlan { id_componente_comida_plan:number; tipo_componente:'alimento'|'receta'|'manual'; id_alimento:number|null; id_receta:number|null; nombre_manual:string|null; cantidad:number|string|null; unidad:string|null; calorias:number|string|null; proteinas:number|string|null; carbohidratos:number|string|null; grasas:number|string|null; fibra:number|string|null; observaciones:string|null; alimento?:CatalogoAlimento|null; receta?:CatalogoReceta|null }
export interface ComidaPlan { id_comida_plan_alimentario:number; tipo_comida:string; hora_sugerida:string|null; nombre_comida:string; calorias_totales:number|string; proteinas_totales:number|string; carbohidratos_totales:number|string; grasas_totales:number|string; fibra_total:number|string; observaciones:string|null; componentes:ComponentePlan[] }
export interface DiaPlan { id_dia_plan_alimentario:number; numero_dia:number; nombre_dia:string; fecha:string|null; calorias_totales:number|string; proteinas_totales:number|string; carbohidratos_totales:number|string; grasas_totales:number|string; fibra_total:number|string; comidas:ComidaPlan[] }
export interface PlanAlimentario { id_plan_alimentario:number; id_recomendacion_nutricional_experta:number|null; nombre:string; estado_plan:string; fecha_inicio:string|null; fecha_fin:string|null; duracion_dias:number; objetivo_plan:string|null; generado_por_sistema_experto:boolean; calorias_objetivo:number|string; proteinas_objetivo:number|string; carbohidratos_objetivo:number|string; grasas_objetivo:number|string; fibra_objetivo:number|string; calorias_totales:number|string; proteinas_totales:number|string; carbohidratos_totales:number|string; grasas_totales:number|string; fibra_total:number|string; observaciones:string|null; recomendacion_nutricional_experta?:RecomendacionNutricionalExperta|null; dias:DiaPlan[] }
export interface ResumenAdherencia { comidas_totales:number; completadas:number; parciales:number; no_realizadas:number; reemplazadas:number; pendientes:number; registradas?:number; porcentaje_adherencia:number }
export interface SeguimientoComidaNutricionista { id_comida_plan_alimentario:number; tipo_comida:string; hora_sugerida:string|null; nombre_comida:string; componentes:string[]; estado_cumplimiento:string; porcentaje_consumido:number|null; nivel_agrado:string|null; nivel_saciedad:string|null; nivel_hambre_posterior:string|null; ansiedad_posterior:boolean|null; presento_molestia:boolean|null; tipo_molestia:string|null; intensidad_molestia:string|null; consiguio_ingredientes:boolean|null; motivo_no_cumplimiento:string|null; comentario_paciente:string|null; sugerencia_paciente:string|null }
export interface SeguimientoPacienteNutricionista { plan:{id_plan_alimentario:number;nombre:string;estado_plan:string;fecha_inicio:string|null;fecha_fin:string|null}|null; resumen_adherencia:ResumenAdherencia|null; adherencia_por_tipo_comida:Record<string,ResumenAdherencia>; seguimiento_comidas:{id_dia_plan_alimentario:number;numero_dia:number;nombre_dia:string;fecha:string|null;comidas:SeguimientoComidaNutricionista[]}[]; indicadores_siguiente_plan:{recetas_bien_aceptadas:string[];recetas_a_evitar:string[];alimentos_o_preparaciones_problematicas:string[];horarios_problematicos:Record<string,number>;hambre_frecuente:number;baja_adherencia_por_tipo_comida:Record<string,number>;recomendaciones_para_nutricionista:string[]}; seguimiento_sintomas:{registro_hoy:Registro|null;ultimos_registros:Registro[];indicadores:Record<string,unknown>} }
export interface PerfilProps {
    paciente: PacienteNutricional; consulta: Registro | null; evaluacion: Registro | null;
    habitos: Registro | null; preferencias: Registro | null; restricciones: Registro | null;
    objetivo: Registro | null; requerimientoNutricional: RequerimientoNutricional | null;
    recomendacionExperta: RecomendacionNutricionalExperta | null; opciones: Opciones;
    planAlimentarioPrincipal: PlanAlimentario|null; recomendacionExpertaAprobada:RecomendacionNutricionalExperta|null;
    puedeGenerarPlanSemanal:boolean; alimentosPlan:CatalogoAlimento[]; recetasPlan:CatalogoReceta[];
    seguimientoPaciente: SeguimientoPacienteNutricionista;
    retroalimentacionesPaciente: import('@/Components/nutricionista/seguimiento/RetroalimentacionPacientePanel').RetroalimentacionHistorial[];
    contextoAjustePlan: import('@/Components/nutricionista/seguimiento/ResumenAjustePlanCard').ContextoAjustePlan;
}
export interface CampoFormulario {
    name: string; label: string; type?: 'text' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox';
    options?: string[]; step?: string;
}
export const normalizarFechaInput = (valor: unknown): string => {
    if (typeof valor !== 'string' || valor.trim() === '') return '';

    const fecha = valor.match(/^(\d{4}-\d{2}-\d{2})/);

    return fecha?.[1] ?? '';
};

export const etiqueta = (valor: unknown): string => {
    if (valor === true) return 'Sí';
    if (valor === false) return 'No';
    if (valor === null || valor === undefined || valor === '') return '—';

    return String(valor).replaceAll('_', ' ');
};
