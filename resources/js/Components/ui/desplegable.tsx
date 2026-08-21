import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    titulo: string;
    tiene: boolean;
    icono?: React.ReactNode;
    children: React.ReactNode;
    defaultAbierto?: boolean;
}

export function Desplegable({ titulo, tiene, icono, children, defaultAbierto }: Props) {
    const [abierto, setAbierto] = useState(defaultAbierto ?? tiene);

    return (
        <div className={clsx('card-elevated overflow-hidden transition-shadow', abierto && 'shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]')}>
            <button
                type="button"
                onClick={() => setAbierto(!abierto)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
            >
                {/* Indicador */}
                {icono ?? (tiene ? (
                    <CheckCircle2 size={16} strokeWidth={1.8} className="shrink-0 text-brand-green-dark dark:text-brand-green" />
                ) : (
                    <Circle size={16} strokeWidth={1.8} className="shrink-0 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                ))}

                {/* Título + estado */}
                <div className="flex-1">
                    <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">{titulo}</span>
                    {tiene ? (
                        <span className="ml-2 text-[10.5px] font-medium text-brand-green-dark dark:text-brand-green">✓ Registrado</span>
                    ) : (
                        <span className="ml-2 text-[10.5px] font-medium text-ink-muted/70 dark:text-ink-muted-dark/70">Pendiente</span>
                    )}
                </div>

                {/* Flecha */}
                <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className={clsx('shrink-0 text-ink-muted transition-transform duration-200 dark:text-ink-muted-dark', abierto && 'rotate-180')}
                />
            </button>

            {/* Contenido */}
            <div className={clsx('transition-all duration-200 overflow-hidden', abierto ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0')}>
                <div className="border-t border-surface-border dark:border-surface-border-dark">
                    {children}
                </div>
            </div>
        </div>
    );
}
