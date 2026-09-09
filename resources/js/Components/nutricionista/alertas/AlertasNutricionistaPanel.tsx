import { BellRing, CheckCircle2, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';

export interface AlertaNutricionista { codigo: string; titulo: string; mensaje: string; severidad: 'baja' | 'media' | 'alta'; categoria: string; recomendacion: string; origen: string }
export interface AlertasNutricionista { resumen: { total: number; altas: number; medias: number; bajas: number; tiene_alertas_criticas: boolean }; alertas: AlertaNutricionista[] }

const dotColor = { alta: 'bg-category-fruits', media: 'bg-brand-orange', baja: 'bg-info' };
const borderColor = { alta: 'border-l-category-fruits', media: 'border-l-brand-orange', baja: 'border-l-info' };

export default function AlertasNutricionistaPanel({ alertasNutricionista }: { alertasNutricionista?: AlertasNutricionista | null }) {
    const [abierto, setAbierto] = useState(false);
    const datos = alertasNutricionista ?? { resumen: { total: 0, altas: 0, medias: 0, bajas: 0, tiene_alertas_criticas: false }, alertas: [] };
    const tieneAlertas = datos.alertas.length > 0;

    return (
        <>
            <button type="button" onClick={() => setAbierto(true)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                <div className="relative">
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', tieneAlertas ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green')}><BellRing size={18} strokeWidth={1.8} /></div>
                    {tieneAlertas && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-bold text-white">{datos.resumen.total}</span>}
                </div>
                <div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Alertas nutricionales</p><p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">{tieneAlertas ? `${datos.resumen.total} señal${datos.resumen.total !== 1 ? 'es' : ''} de seguimiento por revisar` : 'El seguimiento actual no presenta alertas pendientes'}</p></div>
                <span className="hidden rounded-full bg-black/[0.025] px-3 py-1 text-[9px] font-semibold text-ink-muted dark:bg-white/[0.04] dark:text-ink-muted-dark sm:inline">Ver al costado</span>
                <ChevronRight size={15} className="text-ink-muted dark:text-ink-muted-dark" />
            </button>

            {abierto && (
                <aside className="fixed bottom-4 right-4 top-20 z-40 flex w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <header className="flex items-center justify-between gap-3 border-b border-surface-border/60 px-5 py-4 dark:border-surface-border-dark/60">
                        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange"><BellRing size={17} /></div><div><h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Notificaciones de seguimiento</h3><p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark">Panel lateral · puedes seguir usando el perfil</p></div></div>
                        <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar notificaciones" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-black/[0.04] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.05]"><X size={16} /></button>
                    </header>

                    {tieneAlertas && <div className="flex flex-wrap gap-2 border-b border-surface-border/40 px-5 py-3 dark:border-surface-border-dark/40"><Badge color="red">{datos.resumen.altas} altas</Badge><Badge color="orange">{datos.resumen.medias} medias</Badge><Badge color="blue">{datos.resumen.bajas} bajas</Badge></div>}

                    <div className="flex-1 space-y-2.5 overflow-y-auto p-5">
                        {!tieneAlertas ? <div className="flex flex-col items-center py-10 text-center"><CheckCircle2 size={30} className="text-brand-green" /><p className="mt-3 text-[12px] font-bold text-ink dark:text-ink-dark">Sin alertas pendientes</p><p className="mt-1 max-w-64 text-[10px] text-ink-muted dark:text-ink-muted-dark">El seguimiento no presenta señales que requieran atención.</p></div> : datos.alertas.map(alerta => <NotificacionAlerta key={alerta.codigo} alerta={alerta} />)}
                    </div>
                </aside>
            )}
        </>
    );
}

function NotificacionAlerta({ alerta }: { alerta: AlertaNutricionista }) {
    const [expandida, setExpandida] = useState(false);
    return (
        <button type="button" onClick={() => setExpandida(valor => !valor)} className={clsx('block w-full rounded-xl border border-l-[3px] border-surface-border/60 p-4 text-left transition hover:bg-black/[0.012] dark:border-surface-border-dark/60 dark:hover:bg-white/[0.015]', borderColor[alerta.severidad])}>
            <div className="flex items-start gap-3"><span className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', dotColor[alerta.severidad])} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h4 className="text-[12px] font-bold leading-snug text-ink dark:text-ink-dark">{alerta.titulo}</h4><div className="flex items-center gap-2"><Badge color={alerta.severidad === 'alta' ? 'red' : alerta.severidad === 'media' ? 'orange' : 'blue'}>{alerta.severidad}</Badge><ChevronDown size={13} className={clsx('text-ink-muted transition-transform', expandida && 'rotate-180')} /></div></div><p className={clsx('mt-1 text-[10.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark', !expandida && 'line-clamp-2')}>{alerta.mensaje}</p></div></div>
            {expandida && <div className="ml-5 mt-3 space-y-2.5 border-t border-surface-border/40 pt-3 dark:border-surface-border-dark/40"><div><p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted/60">Acción sugerida</p><p className="mt-0.5 text-[11px] leading-relaxed text-ink dark:text-ink-dark">{alerta.recomendacion}</p></div><div className="flex flex-wrap items-center gap-2"><Badge color="gray">{alerta.categoria}</Badge><span className="text-[9px] text-ink-muted/60">Origen: {alerta.origen.replaceAll('_', ' ')}</span></div></div>}
        </button>
    );
}
