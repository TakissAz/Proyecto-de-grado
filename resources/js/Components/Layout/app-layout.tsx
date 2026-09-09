import { useState, type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import type { PageProps } from '@/types';

interface AppLayoutProps {
    title: string;
}

/** Detecta el rol activo según la URL y los roles del usuario */
function useRolActivo(): 'nutricionista' | 'endocrinologo' | 'paciente' | 'administrador' {
    const { auth } = usePage<PageProps>().props;
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const roles = auth?.user?.roles ?? [];

    if (pathname.startsWith('/nutricionista')) return 'nutricionista';
    if (pathname.startsWith('/endocrinologo')) return 'endocrinologo';
    if (pathname.startsWith('/paciente')) return 'paciente';
    if (pathname.startsWith('/admin')) return 'administrador';
    if (roles.find(r => ['administrador', 'superadministrador'].includes(r.nombre))) return 'administrador';
    if (roles.find(r => r.nombre === 'nutricionista')) return 'nutricionista';
    if (roles.find(r => r.nombre === 'paciente')) return 'paciente';
    if (roles.find(r => r.nombre === 'endocrinologo')) return 'endocrinologo';
    return 'endocrinologo';
}

export type RolActivo = ReturnType<typeof useRolActivo>;

export default function AppLayout({ title, children }: PropsWithChildren<AppLayoutProps>) {
    const [sidebarAbierto, setSidebarAbierto] = useState(false);
    const rol = useRolActivo();

    return (
        <div className="flex min-h-screen bg-surface-bg transition-colors dark:bg-surface-bg-dark">
            {/* Overlay móvil */}
            {sidebarAbierto ? (
                <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarAbierto(false)} />
            ) : null}

            {/* Sidebar: drawer en móvil, fija en desktop */}
            <div className={`fixed top-0 left-0 z-50 h-screen transition-transform duration-200 lg:translate-x-0 ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar rol={rol} />
            </div>

            <main className="flex-1 overflow-x-auto px-4 md:px-6 py-5 lg:ml-[220px]">
                <Topbar title={title} rol={rol} onMenuClick={() => setSidebarAbierto(true)} />
                {children}
            </main>
        </div>
    );
}
