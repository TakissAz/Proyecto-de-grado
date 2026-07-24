export interface CitaData {
    id_cita: number;
    paciente: { id_paciente: number; nombre_completo: string; ci: string } | null;
    profesional: { id: number; name: string } | null;
    tipo_profesional: string;
    fecha_cita: string;
    hora_inicio: string;
    hora_fin: string;
    duracion_minutos: number;
    tipo_cita: string;
    modalidad: string;
    motivo: string;
    estado: string;
    observaciones?: string | null;
    motivo_cancelacion?: string | null;
}

export interface BloqueHorario {
    hora_inicio: string;
    hora_fin: string;
    disponible: boolean;
    pasado?: boolean;
    motivo_bloqueo?: string | null;
}

export interface PacienteOption {
    id_paciente: number;
    nombre_completo: string;
    ci: string;
}

export interface ProfesionalOption {
    id: number;
    name: string;
}

export const ESTADOS_BADGE: Record<string, { class: string; label: string }> = {
    programada: { class: 'badge-warning', label: 'Programada' },
    confirmada: { class: 'badge-info', label: 'Confirmada' },
    atendida: { class: 'badge-success', label: 'Atendida' },
    cancelada: { class: 'badge-error opacity-60', label: 'Cancelada' },
    no_asistio: { class: 'badge-error', label: 'No asistió' },
    reprogramada: { class: 'badge-neutral', label: 'Reprogramada' },
};

export const TIPOS_CITA = [
    'Consulta inicial',
    'Control',
    'Seguimiento',
    'Evaluación',
    'Interconsulta',
];

export const MODALIDADES = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
];
