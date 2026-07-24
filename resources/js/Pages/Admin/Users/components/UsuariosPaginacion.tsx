import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props { mostrando: number; total: number; paginaActual: number; ultimaPagina: number; onCambiarPagina: (pagina: number) => void; }

export default function UsuariosPaginacion({ mostrando, total, paginaActual, ultimaPagina, onCambiarPagina }: Props) {
    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-border px-5 py-3.5 dark:border-surface-border-dark sm:flex-row">
            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">Mostrando {mostrando} de {total} usuarios</p>
            {ultimaPagina > 1 && <div className="flex items-center gap-1">
                <button type="button" disabled={paginaActual === 1} onClick={() => onCambiarPagina(paginaActual - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-[#F5F3EE] disabled:opacity-30 dark:text-ink-muted-dark dark:hover:bg-white/[0.04]" aria-label="Página anterior"><ChevronLeft size={13} /></button>
                {Array.from({ length: ultimaPagina }, (_, i) => i + 1).map((pagina) => <button key={pagina} type="button" onClick={() => onCambiarPagina(pagina)} className={clsx('flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition-colors', paginaActual === pagina ? 'bg-brand-green text-white' : 'text-ink-muted hover:bg-[#F5F3EE] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]')}>{pagina}</button>)}
                <button type="button" disabled={paginaActual === ultimaPagina} onClick={() => onCambiarPagina(paginaActual + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-[#F5F3EE] disabled:opacity-30 dark:text-ink-muted-dark dark:hover:bg-white/[0.04]" aria-label="Página siguiente"><ChevronRight size={13} /></button>
            </div>}
        </div>
    );
}
