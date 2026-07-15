import clsx from 'clsx';

interface PacientesPaginacionProps {
  mostrando: number;
  total: number;
  paginaActual: number;
  ultimaPagina: number;
  onCambiarPagina: (pagina: number) => void;
}

export default function PacientesPaginacion({
  mostrando,
  total,
  paginaActual,
  ultimaPagina,
  onCambiarPagina,
}: PacientesPaginacionProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-border px-5 py-3.5 dark:border-surface-border-dark sm:flex-row">
      <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">
        Mostrando {mostrando} de {total} pacientes
      </p>

      {ultimaPagina > 1 ? (
        <div className="flex items-center gap-1">
          {Array.from({ length: ultimaPagina }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onCambiarPagina(i + 1)}
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors',
                paginaActual === i + 1
                  ? 'bg-brand-green text-white'
                  : 'text-ink-muted hover:bg-[#F5F3EE] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
