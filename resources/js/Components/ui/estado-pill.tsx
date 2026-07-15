import clsx from 'clsx';
import { CheckCircle2, Clock } from 'lucide-react';

interface EstadoPillProps {
  activo: boolean;
  textoActivo?: string;
  textoInactivo?: string;
}

export default function EstadoPill({
  activo,
  textoActivo = 'Activo',
  textoInactivo = 'Inactivo',
}: EstadoPillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-[11.5px] font-semibold',
        activo ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink-muted dark:text-ink-muted-dark'
      )}
    >
      <span
        className={clsx(
          'status-dot',
          activo ? 'bg-brand-green-dark dark:bg-brand-green' : 'bg-[#E4E0D6] dark:bg-[#2B2F38]'
        )}
      >
        {activo ? <CheckCircle2 size={8} strokeWidth={2.5} /> : <Clock size={8} strokeWidth={2.5} />}
      </span>
      {activo ? textoActivo : textoInactivo}
    </span>
  );
}
