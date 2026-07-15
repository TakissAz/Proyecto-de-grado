import type { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

interface TarjetaProps {
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
    as?: 'div' | 'section';
}

export function Tarjeta({
    children,
    className,
    padding = 'md',
    as: Component = 'div',
}: PropsWithChildren<TarjetaProps>) {
    return (
        <Component
            className={clsx(
                'card-elevated',
                padding === 'sm' && 'p-4',
                padding === 'md' && 'p-[18px]',
                padding === 'lg' && 'p-5',
                className
            )}
        >
            {children}
        </Component>
    );
}

// Default export para import Tarjeta from '...'
export default Tarjeta;

/* ---------- TarjetaStat ---------- */

interface TarjetaStatProps {
    label: string;
    value: string;
    delta?: string;
    icon: ReactNode;
    tone: 'green' | 'orange' | 'peach';
}

const toneStyles: Record<TarjetaStatProps['tone'], string> = {
    green: 'bg-[#9EE68C] text-brand-green-dark dark:bg-brand-green-dark/25 dark:text-brand-green',
    orange: 'bg-[#FFC15C] text-[#B25F00] dark:bg-brand-orange/25 dark:text-brand-orange',
    peach: 'bg-[#FFA35C] text-[#B24800] dark:bg-brand-peach/25 dark:text-brand-peach',
};

export function TarjetaStat({ label, value, delta, icon, tone }: TarjetaStatProps) {
    return (
        <Tarjeta className="flex items-center gap-3">
            <div
                className={clsx(
                    'flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px]',
                    toneStyles[tone]
                )}
            >
                {icon}
            </div>
            <div>
                <div className="mb-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
                    {label}
                </div>
                <div className="text-[19px] font-bold text-ink dark:text-ink-dark">
                    {value}
                    {delta && (
                        <span className="ml-1.5 text-[10.5px] font-bold text-brand-green-dark dark:text-brand-green">
                            {delta}
                        </span>
                    )}
                </div>
            </div>
        </Tarjeta>
    );
}
