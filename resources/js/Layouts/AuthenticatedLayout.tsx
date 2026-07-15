import type { PropsWithChildren, ReactNode } from 'react';
import AppLayout from '@/Components/Layout/app-layout';

interface AuthenticatedLayoutProps {
    /** Nuevo: título directo como string */
    title?: string;
    /** Legacy: header como ReactNode (las páginas existentes lo usan así) */
    header?: ReactNode;
}

/**
 * Wrapper compatible con ambas APIs:
 * - <AuthenticatedLayout title="Panel">  (nuevo estilo Nutrigo)
 * - <AuthenticatedLayout header={<h2>Panel</h2>}>  (estilo anterior)
 */
export default function AuthenticatedLayout({
    title,
    header,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    // Extraer texto del header si viene como ReactNode
    let tituloFinal = title ?? '';
    if (!tituloFinal && header && typeof header === 'object' && 'props' in header) {
        const props = (header as React.ReactElement).props;
        if (typeof props?.children === 'string') {
            tituloFinal = props.children;
        }
    }

    return (
        <>
            {/* Solo ponemos Head si la pagina no lo hace por si misma */}
            <AppLayout title={tituloFinal}>{children}</AppLayout>
        </>
    );
}
