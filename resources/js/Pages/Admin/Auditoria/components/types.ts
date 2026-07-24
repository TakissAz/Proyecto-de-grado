export type EstadoPaciente = 'activo' | 'inactivo';
export type EstadoFlujoPaciente = 'pendiente_nutricion' | 'pendiente_endocrino' | 'en_seguimiento' | 'completo' | 'inactivo';
export interface UsuarioAuditoria { id: number; name: string; email?: string | null; }
export interface PacienteAuditoria {
    id_paciente: number; nombre_completo?: string | null; ci: string; estado: EstadoPaciente;
    estado_flujo?: EstadoFlujoPaciente | null; origen_registro?: string | null;
    created_at?: string | null; updated_at?: string | null; user?: UsuarioAuditoria | null;
    creado_por_user?: UsuarioAuditoria | null; actualizado_por_user?: UsuarioAuditoria | null;
}
export interface PacientesPaginados { data: PacienteAuditoria[]; meta: { current_page: number; last_page: number; total: number; }; }
export interface FiltrosAuditoria { buscar: string; estado: string; estado_flujo: string; origen_registro: string; }
