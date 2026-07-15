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
    const userName = auth?.user?.name ?? 'Dr. Usuario';

    return (
        <div
            className="mb-5 flex items-center justify-between rounded-card border border-surface-border
                bg-surface-card px-4 md:px-5 py-3.5 shadow-card transition-colors
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
                        border-surface-border bg-surface-card text-ink-muted
                        dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-muted-dark"
                >
                    <Search size={16} strokeWidth={1.8} />
                </button>

                <button
                    type="button"
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full border
                        border-surface-border bg-surface-card text-ink-muted
                        dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-muted-dark"
                >
                    <Bell size={16} strokeWidth={1.8} />
                </button>

                <div className="flex items-center gap-2">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E7E4DC]
                            text-sm font-semibold text-ink-muted dark:bg-white/10 dark:text-ink-muted-dark"
                    >
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">
                            {userName}
                        </div>
                        <div className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                            Endocrinólogo
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
