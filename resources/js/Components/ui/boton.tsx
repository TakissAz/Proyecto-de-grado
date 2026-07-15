import clsx from 'clsx';
import { Link, type InertiaLinkProps } from '@inertiajs/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Tamano = 'xs' | 'sm' | 'md' | 'lg';

const varianteClases: Record<Variante, string> = {
    primary: 'bg-brand-green text-white hover:bg-brand-green-dark',
    secondary: 'bg-brand-orange text-white hover:brightness-110',
    ghost: 'bg-transparent text-ink-muted hover:bg-black/[0.03] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]',
    outline: 'border border-surface-border text-ink hover:border-brand-green/30 dark:border-surface-border-dark dark:text-ink-dark',
    danger: 'bg-category-fruits text-white hover:brightness-110',
};

const tamanoClases: Record<Tamano, string> = {
    xs: 'px-2 py-1 text-[10.5px] gap-1',
    sm: 'px-3 py-1.5 text-[11.5px] gap-1.5',
    md: 'px-4 py-2 text-xs gap-1.5',
    lg: 'px-5 py-2.5 text-sm gap-2',
};

/* ---------- Boton (button nativo) ---------- */

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variante?: Variante;
    tamano?: Tamano;
}

export function Boton({ children, variante = 'primary', tamano = 'sm', className, disabled, ...rest }: BotonProps) {
    return (
        <button
            {...rest}
            disabled={disabled}
            className={clsx(
                'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-40',
                varianteClases[variante],
                tamanoClases[tamano],
                className
            )}
        >
            {children}
        </button>
    );
}

/* ---------- BotonLink (Inertia Link con estilo de botón) ---------- */

interface BotonLinkProps extends Omit<InertiaLinkProps, 'className'> {
    children: ReactNode;
    variante?: Variante;
    tamano?: Tamano;
    className?: string;
}

export function BotonLink({ children, variante = 'primary', tamano = 'sm', className, ...rest }: BotonLinkProps) {
    return (
        <Link
            {...rest}
            className={clsx(
                'inline-flex items-center justify-center rounded-lg font-semibold transition-colors',
                varianteClases[variante],
                tamanoClases[tamano],
                className
            )}
        >
            {children}
        </Link>
    );
}
