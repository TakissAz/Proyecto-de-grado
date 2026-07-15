import { useState, type PropsWithChildren } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
    title: string;
}

export default function AppLayout({ title, children }: PropsWithChildren<AppLayoutProps>) {
    const [sidebarAbierto, setSidebarAbierto] = useState(false);

    return (
        <div className="flex min-h-screen bg-surface-bg transition-colors dark:bg-surface-bg-dark">
            {/* Overlay móvil */}
            {sidebarAbierto ? (
                <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarAbierto(false)} />
            ) : null}

            {/* Sidebar: drawer en móvil, fija en desktop */}
            <div className={`fixed top-0 left-0 z-50 h-screen transition-transform duration-200 lg:translate-x-0 ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
            </div>

            <main className="flex-1 overflow-x-auto px-4 md:px-6 py-5 lg:ml-[220px]">
                <Topbar title={title} onMenuClick={() => setSidebarAbierto(true)} />
                {children}
            </main>
        </div>
    );
}
