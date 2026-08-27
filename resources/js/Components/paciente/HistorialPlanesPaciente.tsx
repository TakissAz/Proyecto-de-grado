import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, FileText, GitCompare, Sparkles } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { HistorialPlanes, HistorialPlan } from '@/Components/nutricionista/planes/HistorialPlanesNutricionista';

const e = (v: string) => v.replaceAll('_', ' ');
const n = (v: number) => Number(v ?? 0).toLocaleString('es-BO', { maximumFractionDigits: 1 });

export default function HistorialPlanesPaciente({ historial }: { historial: HistorialPlanes | null }) {
    if (!historial) return null;

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                    <FileText size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Historial de mis planes</h2>
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Consulta tus planes validados y los cambios realizados por nutrición.</p>
                </div>
            </div>

            {/* Comparación */}
            <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.03] p-4 dark:bg-brand-green/[0.04]">
                <div className="flex items-start gap-2.5">
                    <GitCompare size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[12px] font-bold text-ink dark:text-ink-dark">Cambios respecto al plan anterior</p>
                        <p className="mt-1 text-[11.5px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">{historial.comparacion.mensaje}</p>
                    </div>
                </div>
            </div>

            {/* Sin planes */}
            {historial.planes.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-10 text-center dark:border-surface-border-dark">
                    <FileText size={32} strokeWidth={1.2} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                    <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Aún no tienes planes en el historial.</p>
                </div>
            )}

            {/* Timeline de planes */}
            {historial.planes.length > 0 && (
                <div className="relative pl-6">
                    {/* Línea vertical de timeline */}
                    <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-surface-border dark:bg-surface-border-dark" />

                    <div className="space-y-4">
                        {historial.planes.map((p, idx) => <PlanCard key={p.id_plan_alimentario} plan={p} esActual={idx === 0} />)}
                    </div>
                </div>
            )}
        </section>
    );
}

function PlanCard({ plan: p, esActual }: { plan: HistorialPlan; esActual: boolean }) {
    const [abierto, setAbierto] = useState(false);
    const pctColor = p.porcentaje_adherencia >= 70 ? 'text-brand-green-dark dark:text-brand-green' : p.porcentaje_adherencia >= 40 ? 'text-brand-orange' : 'text-category-fruits';
    const barColor = p.porcentaje_adherencia >= 70 ? 'bg-brand-green' : p.porcentaje_adherencia >= 40 ? 'bg-brand-orange' : 'bg-category-fruits';

    return (
        <div className="relative">
            {/* Dot del timeline */}
            <div className={clsx('absolute -left-6 top-5 h-[10px] w-[10px] rounded-full border-2', esActual ? 'border-brand-green bg-brand-green/30' : 'border-surface-border bg-surface-card dark:border-surface-border-dark dark:bg-surface-card-dark')} />

            {/* Card del plan */}
            <div className={clsx('rounded-xl border overflow-hidden transition-shadow', esActual ? 'border-brand-green/30 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)]' : 'border-surface-border dark:border-surface-border-dark')}>
                {/* Header clickeable */}
                <button type="button" onClick={() => setAbierto(!abierto)}
                    className="w-full text-left px-5 py-4 transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-[13px] font-bold text-ink dark:text-ink-dark">{p.nombre_plan}</h4>
                                <Badge color={p.estado_plan === 'activo' || p.estado_plan === 'aprobado' ? 'green' : p.estado_plan === 'finalizado' ? 'gray' : 'orange'}>{e(p.estado_plan)}</Badge>
                                {esActual && <span className="text-[9px] font-bold text-brand-green-dark dark:text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md">ACTUAL</span>}
                                {p.generado_por_sistema_experto && <Sparkles size={11} className="text-brand-green-dark dark:text-brand-green" />}
                            </div>
                            <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                <CalendarDays size={11} /> {p.fecha_inicio ?? '—'} al {p.fecha_fin ?? '—'} · {p.total_dias} días · {p.total_comidas} comidas
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {/* Adherencia como mini indicador */}
                            <div className="text-right">
                                <p className={clsx('text-[16px] font-bold', pctColor)}>{n(p.porcentaje_adherencia)}%</p>
                                <p className="text-[8.5px] text-ink-muted dark:text-ink-muted-dark">adherencia</p>
                            </div>
                            <ChevronDown size={14} className={clsx('text-ink-muted transition-transform', abierto && 'rotate-180')} />
                        </div>
                    </div>

                    {/* Barra de adherencia */}
                    <div className="mt-3 h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                        <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${p.porcentaje_adherencia}%` }} />
                    </div>

                    {/* Mini resumen */}
                    <div className="mt-3 flex flex-wrap gap-3">
                        <span className="inline-flex items-center rounded-full bg-brand-green/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-green-dark dark:text-brand-green">{n(p.calorias_planificadas)} kcal</span>
                        <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{p.total_componentes_receta ?? 0} recetas</span>
                        {(p.total_componentes_manual ?? 0) > 0 && <span className="text-[10px] text-brand-orange">{p.total_componentes_manual} manuales</span>}
                    </div>
                </button>

                {/* Contenido expandido */}
                {abierto && (
                    <div className="px-5 pb-5 pt-0 border-t border-surface-border/50 dark:border-surface-border-dark/50">
                        {/* Resumen texto */}
                        {p.resumen && <p className="mt-3 text-[11.5px] text-ink/80 dark:text-ink-dark/80 italic leading-relaxed">{p.resumen}</p>}

                        {/* Swiper de días */}
                        <DiasSwiper dias={p.dias} />

                        {/* Observaciones */}
                        {p.observaciones && (
                            <p className="mt-3 text-[10.5px] text-ink-muted dark:text-ink-muted-dark italic">{p.observaciones}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* Swiper de días */
function DiasSwiper({ dias }: { dias: HistorialPlan['dias'] }) {
    const [diaActivo, setDiaActivo] = useState(0);
    if (dias.length === 0) return null;
    const dia = dias[diaActivo];

    return (
        <div className="mt-4">
            {/* Tabs de días + flechas */}
            <div className="flex items-center gap-2">
                <button type="button" disabled={diaActivo === 0} onClick={() => setDiaActivo(diaActivo - 1)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/[0.04] disabled:opacity-30 dark:text-ink-muted-dark dark:hover:bg-white/[0.04]">
                    <ChevronLeft size={15} />
                </button>

                <div className="flex-1 flex gap-1 overflow-x-auto py-1">
                    {dias.map((d, i) => (
                        <button key={d.numero_dia} type="button" onClick={() => setDiaActivo(i)}
                            className={clsx(
                                'min-w-[60px] flex flex-col items-center rounded-lg px-2 py-1.5 transition-all text-center',
                                i === diaActivo
                                    ? 'bg-brand-green/[0.1] border border-brand-green/30 dark:bg-brand-green/[0.12]'
                                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                            )}
                        >
                            <span className={clsx('text-[9px] font-bold', i === diaActivo ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink-muted dark:text-ink-muted-dark')}>
                                {d.nombre_dia?.slice(0, 3) ?? `D${d.numero_dia}`}
                            </span>
                            <span className={clsx('text-[12px] font-bold', i === diaActivo ? 'text-ink dark:text-ink-dark' : 'text-ink/60 dark:text-ink-dark/60')}>{d.numero_dia}</span>
                        </button>
                    ))}
                </div>

                <button type="button" disabled={diaActivo === dias.length - 1} onClick={() => setDiaActivo(diaActivo + 1)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/[0.04] disabled:opacity-30 dark:text-ink-muted-dark dark:hover:bg-white/[0.04]">
                    <ChevronRight size={15} />
                </button>
            </div>

            {/* Contenido del día activo */}
            <div className="mt-3 rounded-xl border border-surface-border/60 dark:border-surface-border-dark/60 overflow-hidden">
                <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-surface-border/40 dark:border-surface-border-dark/40 flex items-center justify-between">
                    <p className="text-[12px] font-bold text-ink dark:text-ink-dark">{dia.nombre_dia}</p>
                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{dia.comidas.length} comidas</span>
                </div>
                <div className="p-4 space-y-3">
                    {dia.comidas.map((c, i) => (
                        <div key={i} className="flex gap-3">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-ink-muted/50 dark:text-ink-muted-dark/50 w-[70px] shrink-0 pt-0.5">{e(c.tipo_comida)}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">{c.nombre_comida}</p>
                                {c.componentes.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {c.componentes.map((comp, j) => (
                                            <span key={j} className="inline-flex items-center rounded-md bg-black/[0.04] dark:bg-white/[0.05] px-2 py-0.5 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">
                                                {comp.nombre ?? 'Sin nombre'} · {n(comp.cantidad)} {comp.unidad}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] font-medium text-brand-green-dark dark:text-brand-green shrink-0">{n(c.calorias)} kcal</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Indicador de página */}
            <p className="mt-2 text-center text-[9px] text-ink-muted/50 dark:text-ink-muted-dark/50">{diaActivo + 1} de {dias.length} días</p>
        </div>
    );
}
