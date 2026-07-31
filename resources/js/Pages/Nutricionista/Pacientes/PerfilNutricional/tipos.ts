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
export interface PerfilProps {
    paciente: PacienteNutricional; consulta: Registro | null; evaluacion: Registro | null;
    habitos: Registro | null; preferencias: Registro | null; restricciones: Registro | null;
    objetivo: Registro | null; requerimientoNutricional: RequerimientoNutricional | null; opciones: Opciones;
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