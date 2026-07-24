export type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

export interface RoleOption {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
    estado?: string | null;
}

export interface UserRow {
    id: number;
    name: string;
    email: string;
    estado: EstadoUsuario;
    ultimo_acceso?: string | null;
    created_at?: string | null;
    roles?: RoleOption[];
    rol_principal?: RoleOption | null;
}

export interface PaginatedUsers {
    data: UserRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

export interface UserFilters {
    buscar: string;
    estado: string;
    rol: string;
}
