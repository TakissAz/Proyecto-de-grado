import { usePage } from '@inertiajs/react';
import { Bell, Menu, Search } from 'lucide-react';
import ThemeToggle from './theme-toggle';
import type { PageProps } from '@/types';

interface TopbarProps {
    title: string;
    onMenuClick?: () => void;
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
    const { auth } = usePage<PageProps>().props;
    const userName = auth?.user?.name?.trim() || 'Usuario';
    const avatar = auth?.user?.avatar;
    const nombresRol = auth?.user?.roles?.map((rol) => rol.nombre) ?? [];
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const rolActual = pathname.startsWith('/admin') || nombresRol.some((rol) => ['administrador', 'superadministrador'].includes(rol))
        ? 'Administrador'
        : pathname.startsWith('/nutricionista') || nombresRol.includes('nutricionista')
            ? 'Nutricionista'
            : pathname.startsWith('/paciente') || nombresRol.includes('paciente')
                ? 'Paciente'
                : 'Endocrinólogo';
    const iniciales = userName
        .replace(/^(lic\.?|dra?\.?|nut\.?|ing\.?)\s+/i, '')
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte.charAt(0))
        .join('')
        .toUpperCase() || 'U';

    return (
        <div
            className="mb-5 flex items-center justify-between rounded-card border border-brand-green/10
                bg-brand-green-soft/[0.18] px-4 md:px-5 py-3.5 shadow-card transition-colors
                dark:border-surface-border-dark dark:bg-surface-card-dark dark:shadow-card-dark"
        >
            <div className="flex items-center gap-3">
                {/* Hamburger — solo móvil */}
                <button
                    type="button"
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full border
                        border-surface-border bg-surface-card text-ink-muted lg:hidden
                        dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-muted-dark"
                    onClick={onMenuClick}
                    aria-label="Abrir menú"
                >
                    <Menu size={16} strokeWidth={1.8} />
                </button>
                <h1 className="text-xl font-bold text-ink dark:text-ink-dark truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-3.5">
                <ThemeToggle />

                <button
                    type="button"
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full border
                        border-brand-green/15 bg-white text-ink-muted hover:text-brand-green-dark transition-colors
                        dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-muted-dark"
                >
                    <Search size={16} strokeWidth={1.8} />
                </button>

                <button
                    type="button"
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full border
                        border-brand-green/15 bg-white text-ink-muted hover:text-brand-green-dark transition-colors
                        dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-muted-dark"
                >
                    <Bell size={16} strokeWidth={1.8} />
                </button>

                <div className="flex items-center gap-2">
                    {avatar ? (
                        <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-green/15" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E7E4DC] text-[11px] font-bold text-ink-muted dark:bg-white/10 dark:text-ink-muted-dark">
                            {iniciales}
                        </div>
                    )}
                    <div className="hidden sm:block">
                        <div className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">
                            {userName}
                        </div>
                        <div className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                            {rolActual}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
