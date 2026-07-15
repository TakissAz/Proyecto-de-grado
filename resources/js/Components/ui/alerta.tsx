import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

type AlertaTipo = 'success' | 'error' | 'info';

const tipoClasses: Record<AlertaTipo, string> = {
  success: 'border-l-brand-green',
  error: 'border-l-category-fruits',
  info: 'border-l-category-others',
};

interface AlertaProps {
  tipo?: AlertaTipo;
  className?: string;
}

export default function Alerta({
  tipo = 'info',
  className,
  children,
}: PropsWithChildren<AlertaProps>) {
  return (
    <div
      className={clsx(
        'card-elevated flex items-center justify-between gap-3 border-l-4 p-3.5 text-[12.5px] text-ink dark:text-ink-dark',
        tipoClasses[tipo],
        className
      )}
    >
      {children}
    </div>
  );
}
