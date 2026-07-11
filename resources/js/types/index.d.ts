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
    roles?: Role[];
}

export interface FlashProps {
    success?: string;
    error?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    flash: FlashProps;
};
