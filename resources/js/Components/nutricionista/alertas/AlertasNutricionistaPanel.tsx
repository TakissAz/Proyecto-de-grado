import { AlertTriangle, BellRing, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';

export interface AlertaNutricionista { codigo: string; titulo: string; mensaje: string; severidad: 'baja' | 'media' | 'alta'; categoria: string; recomendacion: string; origen: string }
export interface AlertasNutricionista { resumen: { total: number; altas: number; medias: number; bajas: number; tiene_alertas_criticas: boolean }; alertas: AlertaNutricionista[] }

const dotColor: Record<string, string> = { alta: 'bg-category-fruits', media: 'bg-brand-orange', baja: 'bg-info' };
const borderColor: Record<string, string> = { alta: 'border-l-category-fruits', media: 'border-l-brand-orange', baja: 'border-l-info' };

export default function AlertasNutricionistaPanel({ alertasNutricionista }: { alertasNutricionista?: AlertasNutricionista | null }) {
    const [panelAbierto, setPanelAbierto] = useState(false);
    const datos = alertasNutricionista ?? { resumen: { total: 0, altas: 0, medias: 0, bajas: 0, tiene_alertas_criticas: false }, alertas: [] };
    const tieneAlertas = datos.alertas.length > 0;

    return (
        <>
            {/* Trigger: botón compacto de alertas */}
            <button
                type="button"
                onClick={() => setPanelAbierto(true)}
                className={clsx(
                    'flex items-center gap-3 w-full rounded-xl border px-4 py-3.5 text-left transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.2)]',
                    datos.resumen.tiene_alertas_criticas
                        ? 'border-category-fruits/30 bg-category-fruits/[0.03] dark:bg-category-fruits/[0.05]'
                        : tieneAlertas
                            ? 'border-brand-orange/30 bg-brand-orange/[0.03] dark:bg-brand-orange/[0.05]'
                            : 'border-surface-border dark:border-surface-border-dark'
                )}
            >
                {/* Icono con contador */}
                <div className="relative">
                    <div className={clsx(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        tieneAlertas ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green'
                    )}>
                        <BellRing size={19} strokeWidth={1.8} />
                    </div>
                    {tieneAlertas && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-category-fruits text-[9px] font-bold text-white">
                            {datos.resumen.total}
                        </span>
                    )}
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold text-ink dark:text-ink-dark">
                        {tieneAlertas ? `${datos.resumen.total} alerta${datos.resumen.total > 1 ? 's' : ''} de seguimiento` : 'Sin alertas'}
                    </p>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                        {tieneAlertas
                            ? `${datos.resumen.altas} alta${datos.resumen.altas !== 1 ? 's' : ''} · ${datos.resumen.medias} media${datos.resumen.medias !== 1 ? 's' : ''} · ${datos.resumen.bajas} baja${datos.resumen.bajas !== 1 ? 's' : ''}`
                            : 'Todo en orden con el seguimiento del paciente.'
                        }
                    </p>
                </div>

                {/* Flecha */}
                <ChevronRight size={16} className="text-ink-muted/50 dark:text-ink-muted-dark/50 shrink-0" />
            </button>

            {/* Panel lateral deslizante */}
            {panelAbierto && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setPanelAbierto(false)} />

                    {/* Panel */}
                    <div className="relative w-full max-w-md animate-slide-in-right bg-surface-card border-l border-surface-border shadow-2xl dark:bg-surface-card-dark dark:border-surface-border-dark overflow-hidden flex flex-col">
                        {/* Header del panel */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border/60 dark:border-surface-border-dark/60 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/15 text-brand-orange">
                                    <BellRing size={16} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Centro de alertas</h3>
                                    <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{datos.resumen.total} notificaciones</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setPanelAbierto(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.05] dark:hover:text-ink-dark">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Resumen rápido */}
                        {tieneAlertas && (
                            <div className="flex gap-2 px-5 py-3 border-b border-surface-border/40 dark:border-surface-border-dark/40 shrink-0">
                                <Badge color="red">🔴 {datos.resumen.altas} altas</Badge>
                                <Badge color="orange">🟠 {datos.resumen.medias} medias</Badge>
                                <Badge color="blue">🔵 {datos.resumen.bajas} bajas</Badge>
                            </div>
                        )}

                        {/* Lista de notificaciones */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
                            {datos.alertas.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-12 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10">
                                        <CheckCircle2 size={28} strokeWidth={1.3} className="text-brand-green-dark dark:text-brand-green" />
                                    </div>
                                    <p className="text-[13px] font-semibold text-ink dark:text-ink-dark">Todo en orden</p>
                                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark max-w-[240px]">No hay alertas que requieran atención en este momento.</p>
                                </div>
                            ) : (
                                datos.alertas.map(a => <NotificacionAlerta key={a.codigo} alerta={a} />)
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* Notificación individual */
function NotificacionAlerta({ alerta: a }: { alerta: AlertaNutricionista }) {
    const [expandido, setExpandido] = useState(false);

    return (
        <div
            className={clsx(
                'rounded-xl border border-l-[3px] p-4 transition-all cursor-pointer hover:shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_1px_8px_rgba(0,0,0,0.15)]',
                borderColor[a.severidad],
                'border-surface-border/60 dark:border-surface-border-dark/60',
                expandido && 'bg-black/[0.01] dark:bg-white/[0.01]'
            )}
            onClick={() => setExpandido(!expandido)}
        >
            {/* Cabecera de la notificación */}
            <div className="flex items-start gap-3">
                <span className={clsx('mt-1.5 h-2 w-2 rounded-full shrink-0', dotColor[a.severidad])} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[12px] font-bold text-ink dark:text-ink-dark leading-snug">{a.titulo}</h4>
                        <Badge color={a.severidad === 'alta' ? 'red' : a.severidad === 'media' ? 'orange' : 'blue'}>{a.severidad}</Badge>
                    </div>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-1 leading-relaxed line-clamp-2">{a.mensaje}</p>
                </div>
            </div>

            {/* Detalle expandible */}
            {expandido && (
                <div className="mt-3 ml-5 pt-3 border-t border-surface-border/40 dark:border-surface-border-dark/40 space-y-2.5">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60">Acción sugerida</p>
                        <p className="text-[11px] text-ink dark:text-ink-dark mt-0.5 leading-relaxed">{a.recomendacion}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge color="gray">{a.categoria}</Badge>
                        <span className="text-[9px] text-ink-muted/50 dark:text-ink-muted-dark/50">Origen: {a.origen.replaceAll('_', ' ')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
