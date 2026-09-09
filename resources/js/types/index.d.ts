export interface Role {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
    estado?: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    avatar?: string | null;
    avatar_url?: string | null;
    roles?: Role[];
}

export interface FlashProps {
    success?: string;
    error?: string;
    nueva_consulta_paciente_id?: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    flash: FlashProps;
    notificaciones?: { total_no_leidas: number; ultimas: { id_notificacion_interna:number; titulo:string; mensaje:string; prioridad:string; leida:boolean; url_destino:string|null; created_at:string|null }[] };
    alertas_vigencia?: { total:number; items:{ id_plan_alimentario:number; nombre_plan:string; fecha_fin:string; dias_restantes:number; estado_vigencia:string; paciente:{id_paciente:number;nombre:string;avatar_url:string|null} }[] };
    [key: string]: unknown;
};
