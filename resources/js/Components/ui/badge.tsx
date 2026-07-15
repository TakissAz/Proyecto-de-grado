import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

type BadgeColor = 'green' | 'orange' | 'red' | 'purple' | 'blue' | 'gray';

const colorClasses: Record<BadgeColor, string> = {
    green: 'bg-category-grains/20 text-category-grains dark:bg-category-grains/25',
    orange: 'bg-brand-orange/20 text-brand-orange dark:bg-brand-orange/25',
    red: 'bg-category-fruits/20 text-category-fruits dark:bg-category-fruits/25',
    purple: 'bg-category-dairy/20 text-category-dairy dark:bg-category-dairy/25',
    blue: 'bg-category-others/20 text-category-others dark:bg-category-others/25',
    gray: 'bg-black/[0.06] text-ink-muted dark:bg-white/[0.08] dark:text-ink-muted-dark',
};

interface BadgeProps {
    color?: BadgeColor;
    className?: string;
    /** Legacy: variante como alias de color para compatibilidad */
    variante?: string;
}

export function Badge({ color, variante, className, children }: PropsWithChildren<BadgeProps>) {
    // Mapeo de variante legacy a color
    const resolvedColor: BadgeColor = color
        ?? (variante === 'primary' || variante === 'success' ? 'green'
            : variante === 'secondary' || variante === 'warning' ? 'orange'
            : variante === 'error' ? 'red'
            : variante === 'info' ? 'blue'
            : 'gray');

    return <span className={clsx('pill', colorClasses[resolvedColor], className)}>{children}</span>;
}
