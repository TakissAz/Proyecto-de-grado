import { Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUp, ChartNoAxesCombined, Cookie, Ruler, Scale, ThumbsDown, ThumbsUp, Utensils, Weight } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';

interface ResumenAntropometrico { peso_actual: number | null; cambio_peso: number | null; imc_actual: number | null; cambio_imc: number | null; cintura_actual: number | null; cambio_cintura: number | null; total_evaluaciones: number }
interface Registro { fecha: string | null; peso: number | null; imc: number | null; cintura: number | null; cadera: number | null; icc: number | null; grasa_corporal: number | null; masa_muscular: number | null }
interface Tipo { tipo_comida: string; total: number; registradas: number; porcentaje_adherencia: number; principal_problema: string }
interface Receta { id_receta: number; nombre: string; tipo_comida: string; puntaje_aceptacion: number; motivos?: string[]; frecuencia?: number }
export interface AnaliticaEvolucion { evolucion_antropometrica: { registros: Registro[]; resumen: ResumenAntropometrico }; evolucion_adherencia: { por_plan: Array<{ id_plan_alimentario: number; nombre_plan: string; estado_plan: string; porcentaje_adherencia: number; registradas: number; comidas_totales: number }>; resumen: { promedio_adherencia: number; mejor_plan: { nombre_plan: string; porcentaje_adherencia: number } | null; peor_plan: { nombre_plan: string; porcentaje_adherencia: number } | null; tendencia_adherencia: string } }; cumplimiento_por_tipo_comida: Tipo[]; analitica_sintomas: Record<string, unknown>; recetas_aceptadas: Receta[]; recetas_problematicas: Receta[]; problemas_practicos: { ingredientes_no_conseguidos: Array<{ nombre: string }>; recetas_dificiles: Array<{ nombre: string }>; comidas_reemplazadas: number; motivos_no_cumplimiento_frecuentes: Record<string, number>; horarios_problematicos: Record<string, number> }; alertas: Array<{ tipo: string; severidad: string; mensaje: string; recomendacion: string }>; recomendaciones_siguiente_plan: Array<{ texto: string; origen: string }> }

const n = (v: number | null | undefined) => v === null || v === undefined ? '—' : Number(v).toLocaleString('es-BO', { maximumFractionDigits: 2 });
const etiqueta = (v: string) => v.replaceAll('_', ' ');

type Tab = 'antropometria' | 'adherencia' | 'recetas' | 'problemas';
const TABS: { id: Tab; label: string; icon: typeof Scale; color: string }[] = [
    { id: 'antropometria', label: 'Antropometría', icon: Weight, color: 'text-brand-green-dark dark:text-brand-green' },
    { id: 'adherencia', label: 'Adherencia', icon: ChartNoAxesCombined, color: 'text-info' },
    { id: 'recetas', label: 'Recetas', icon: Cookie, color: 'text-brand-orange' },
    { id: 'problemas', label: 'Problemas', icon: AlertTriangle, color: 'text-category-fruits' },
];

export default function AnaliticaEvolucionPanel({ analitica }: { analitica: AnaliticaEvolucion }) {
    const [tabActivo, setTabActivo] = useState<Tab>('antropometria');
    const res = analitica.evolucion_antropometrica.resumen;
    const adh = analitica.evolucion_adherencia;
    const sintomas = Object.entries(analitica.analitica_sintomas).filter(([k, v]) => k.endsWith('_frecuente') && v === true).map(([k]) => etiqueta(k));

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info">
                    <ChartNoAxesCombined size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Analítica de evolución</h2>
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Resumen histórico para apoyar decisiones del siguiente plan.</p>
                </div>
            </div>

            {/* ═══ MÉTRICAS RÁPIDAS ═══ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
                <MetricaCard icon={<Scale size={16} />} titulo="Peso" valor={`${n(res.peso_actual)} kg`} cambio={res.cambio_peso} positivo="down" color="green" />
                <MetricaCard icon={<Activity size={16} />} titulo="IMC" valor={n(res.imc_actual)} cambio={res.cambio_imc} positivo="down" color="purple" />
                <MetricaCard icon={<Ruler size={16} />} titulo="Cintura" valor={`${n(res.cintura_actual)} cm`} cambio={res.cambio_cintura} positivo="down" color="orange" />
                <MetricaCard icon={<ChartNoAxesCombined size={16} />} titulo="Adherencia" valor={`${n(adh.resumen.promedio_adherencia)}%`} detalle={etiqueta(adh.resumen.tendencia_adherencia)} color="blue" />
                <MetricaCard icon={<AlertTriangle size={16} />} titulo="Síntomas" valor={String(sintomas.length)} detalle={sintomas[0] ?? 'Sin alertas'} color="red" />
            </div>

            {/* ═══ ALERTAS (si hay) ═══ */}
            {analitica.alertas.length > 0 && (
                <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/[0.03] p-4 dark:bg-brand-orange/[0.05]">
                    <p className="text-[11px] font-bold text-ink dark:text-ink-dark mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-brand-orange" /> {analitica.alertas.length} alerta{analitica.alertas.length > 1 ? 's' : ''} detectada{analitica.alertas.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1.5">
                        {analitica.alertas.slice(0, 3).map((x, i) => (
                            <div key={`${x.tipo}-${i}`} className="flex items-start gap-2">
                                <span className={clsx('mt-1.5 h-1.5 w-1.5 rounded-full shrink-0', x.severidad === 'alta' ? 'bg-category-fruits' : x.severidad === 'media' ? 'bg-brand-orange' : 'bg-info')} />
                                <div>
                                    <p className="text-[11px] text-ink dark:text-ink-dark">{x.mensaje}</p>
                                    <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{x.recomendacion}</p>
                                </div>
                            </div>
                        ))}
                        {analitica.alertas.length > 3 && <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark ml-4">+{analitica.alertas.length - 3} más</p>}
                    </div>
                </div>
            )}

            {/* ═══ TABS DE NAVEGACIÓN ═══ */}
            <div className="flex gap-1 rounded-xl bg-black/[0.03] p-1.5 dark:bg-white/[0.04] overflow-x-auto">
                {TABS.map(tab => {
                    const TabIcon = tab.icon;
                    const activo = tabActivo === tab.id;
                    return (
                        <button key={tab.id} type="button" onClick={() => setTabActivo(tab.id)}
                            className={clsx(
                                'flex-1 min-w-[100px] flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-[11.5px] font-semibold transition-all',
                                activo
                                    ? 'bg-surface-card shadow-sm dark:bg-surface-card-dark'
                                    : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark'
                            )}
                        >
                            <TabIcon size={14} strokeWidth={1.8} className={activo ? tab.color : ''} />
                            <span className={activo ? 'text-ink dark:text-ink-dark' : ''}>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ═══ CONTENIDO DEL TAB ═══ */}
            <div className="min-h-[200px]">
                {tabActivo === 'antropometria' && <TabAntropometria registros={analitica.evolucion_antropometrica.registros} />}
                {tabActivo === 'adherencia' && <TabAdherencia adh={adh} cumplimiento={analitica.cumplimiento_por_tipo_comida} />}
                {tabActivo === 'recetas' && <TabRecetas aceptadas={analitica.recetas_aceptadas} problematicas={analitica.recetas_problematicas} />}
                {tabActivo === 'problemas' && <TabProblemas problemas={analitica.problemas_practicos} />}
            </div>

            {/* ═══ RECOMENDACIONES PARA SIGUIENTE PLAN ═══ */}
            {analitica.recomendaciones_siguiente_plan.length > 0 && (
                <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.03] p-5 dark:bg-brand-green/[0.04]">
                    <p className="text-[11px] font-bold text-brand-green-dark dark:text-brand-green mb-3 flex items-center gap-1.5">
                        <Activity size={13} /> Recomendaciones para el siguiente plan
                    </p>
                    <div className="space-y-2">
                        {analitica.recomendaciones_siguiente_plan.map((x, i) => (
                            <div key={`${x.texto}-${i}`} className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[11.5px] text-ink dark:text-ink-dark">{x.texto}</p>
                                    <span className="text-[9px] text-ink-muted/50 dark:text-ink-muted-dark/50">{x.origen}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══ Métrica Card ═══ */
const metricaColors: Record<string, { bg: string; icon: string; border: string }> = {
    green: { bg: 'bg-brand-green/[0.05] dark:bg-brand-green/[0.07]', icon: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green', border: 'border-brand-green/20' },
    purple: { bg: 'bg-category-dairy/[0.05] dark:bg-category-dairy/[0.07]', icon: 'bg-category-dairy/15 text-category-dairy', border: 'border-category-dairy/20' },
    orange: { bg: 'bg-brand-orange/[0.05] dark:bg-brand-orange/[0.07]', icon: 'bg-brand-orange/15 text-brand-orange', border: 'border-brand-orange/20' },
    blue: { bg: 'bg-info/[0.05] dark:bg-info/[0.07]', icon: 'bg-info/15 text-info', border: 'border-info/20' },
    red: { bg: 'bg-category-fruits/[0.05] dark:bg-category-fruits/[0.07]', icon: 'bg-category-fruits/15 text-category-fruits', border: 'border-category-fruits/20' },
};

function MetricaCard({ icon, titulo, valor, cambio, positivo, detalle, color = 'green' }: { icon: React.ReactNode; titulo: string; valor: string; cambio?: number | null; positivo?: 'up' | 'down'; detalle?: string; color?: string }) {
    const CambioIcon = cambio === null || cambio === undefined ? null : cambio < 0 ? ArrowDown : cambio > 0 ? ArrowUp : ArrowRight;
    const esPositivo = cambio !== null && cambio !== undefined && ((positivo === 'down' && cambio < 0) || (positivo === 'up' && cambio > 0));
    const esNegativo = cambio !== null && cambio !== undefined && ((positivo === 'down' && cambio > 0) || (positivo === 'up' && cambio < 0));
    const c = metricaColors[color] ?? metricaColors.green;

    return (
        <div className={clsx('rounded-xl border p-4 transition-shadow hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_10px_rgba(0,0,0,0.15)]', c.bg, c.border)}>
            <div className="flex items-center gap-2">
                <div className={clsx('flex h-7 w-7 items-center justify-center rounded-lg', c.icon)}>
                    {icon}
                </div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{titulo}</span>
            </div>
            <p className="mt-2.5 text-[19px] font-bold text-ink dark:text-ink-dark">{valor}</p>
            {CambioIcon && cambio !== null && cambio !== undefined ? (
                <div className={clsx('flex items-center gap-1 mt-1.5 rounded-md px-2 py-0.5 w-fit', esPositivo ? 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green' : esNegativo ? 'bg-category-fruits/10 text-category-fruits' : 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark')}>
                    <CambioIcon size={11} />
                    <span className="text-[10px] font-semibold">{cambio > 0 ? '+' : ''}{n(cambio)}</span>
                </div>
            ) : detalle ? (
                <p className="text-[10px] text-ink-muted/70 dark:text-ink-muted-dark/70 mt-1.5 capitalize">{detalle}</p>
            ) : null}
        </div>
    );
}

/* ═══ Tab: Antropometría ═══ */
function TabAntropometria({ registros }: { registros: Registro[] }) {
    if (registros.length === 0) return <Vacio texto="Sin registros antropométricos disponibles." />;
    return (
        <div className="rounded-xl border border-surface-border dark:border-surface-border-dark overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                    <thead>
                        <tr className="bg-black/[0.02] dark:bg-white/[0.03]">
                            {['Fecha', 'Peso (kg)', 'IMC', 'Cintura', 'Cadera', 'ICC', 'Grasa %', 'Músculo'].map(h => (
                                <th key={h} className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {registros.map((x, i) => (
                            <tr key={`${x.fecha}-${i}`} className="border-t border-surface-border/30 dark:border-surface-border-dark/30 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                                <td className="px-3 py-2.5 font-medium text-ink dark:text-ink-dark">{x.fecha ?? '—'}</td>
                                <td className="px-3 py-2.5 text-ink dark:text-ink-dark">{n(x.peso)}</td>
                                <td className="px-3 py-2.5 text-ink dark:text-ink-dark">{n(x.imc)}</td>
                                <td className="px-3 py-2.5 text-ink dark:text-ink-dark">{n(x.cintura)}</td>
                                <td className="px-3 py-2.5 text-ink dark:text-ink-dark">{n(x.cadera)}</td>
                                <td className="px-3 py-2.5 text-ink dark:text-ink-dark">{n(x.icc)}</td>
                                <td className="px-3 py-2.5 text-ink dark:text-ink-dark">{n(x.grasa_corporal)}</td>
                                <td className="px-3 py-2.5 text-ink dark:text-ink-dark">{n(x.masa_muscular)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ═══ Tab: Adherencia ═══ */
function TabAdherencia({ adh, cumplimiento }: { adh: AnaliticaEvolucion['evolucion_adherencia']; cumplimiento: Tipo[] }) {
    return (
        <div className="space-y-4">
            {/* Adherencia por plan */}
            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                <h4 className="text-[12px] font-bold text-ink dark:text-ink-dark mb-3">Histórico por plan</h4>
                {adh.por_plan.length === 0 ? <Vacio texto="Sin planes con seguimiento." /> : (
                    <div className="space-y-3">
                        {adh.por_plan.map(x => (
                            <div key={x.id_plan_alimentario}>
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="text-ink dark:text-ink-dark font-medium truncate flex-1">{x.nombre_plan}</span>
                                    <span className={clsx('font-bold ml-2', x.porcentaje_adherencia >= 70 ? 'text-brand-green-dark dark:text-brand-green' : x.porcentaje_adherencia >= 40 ? 'text-brand-orange' : 'text-category-fruits')}>{n(x.porcentaje_adherencia)}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                                    <div className={clsx('h-full rounded-full', x.porcentaje_adherencia >= 70 ? 'bg-brand-green' : x.porcentaje_adherencia >= 40 ? 'bg-brand-orange' : 'bg-category-fruits')} style={{ width: `${x.porcentaje_adherencia}%` }} />
                                </div>
                                <p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark mt-1">{x.registradas}/{x.comidas_totales} registradas · {etiqueta(x.estado_plan)}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 pt-3 border-t border-surface-border/40 dark:border-surface-border-dark/40 grid grid-cols-2 gap-3 text-[10.5px]">
                    <p className="text-ink dark:text-ink-dark"><span className="font-semibold text-ink-muted dark:text-ink-muted-dark">Mejor plan:</span> {adh.resumen.mejor_plan?.nombre_plan ?? '—'}</p>
                    <p className="text-ink dark:text-ink-dark"><span className="font-semibold text-ink-muted dark:text-ink-muted-dark">A revisar:</span> {adh.resumen.peor_plan?.nombre_plan ?? '—'}</p>
                </div>
            </div>

            {/* Cumplimiento por tipo */}
            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                <h4 className="text-[12px] font-bold text-ink dark:text-ink-dark mb-3">Por tipo de comida</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {cumplimiento.map(x => (
                        <div key={x.tipo_comida} className="rounded-lg bg-black/[0.02] dark:bg-white/[0.03] p-3 text-center">
                            <p className="text-[9.5px] font-semibold text-ink-muted dark:text-ink-muted-dark capitalize">{etiqueta(x.tipo_comida)}</p>
                            <p className={clsx('text-[18px] font-bold mt-1', x.porcentaje_adherencia >= 70 ? 'text-brand-green-dark dark:text-brand-green' : x.porcentaje_adherencia >= 40 ? 'text-brand-orange' : 'text-category-fruits')}>{n(x.porcentaje_adherencia)}%</p>
                            <div className="mt-1.5 h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                                <div className={clsx('h-full rounded-full', x.porcentaje_adherencia >= 70 ? 'bg-brand-green' : x.porcentaje_adherencia >= 40 ? 'bg-brand-orange' : 'bg-category-fruits')} style={{ width: `${x.porcentaje_adherencia}%` }} />
                            </div>
                            <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark mt-1.5">{x.principal_problema || `${x.registradas}/${x.total}`}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══ Tab: Recetas ═══ */
function TabRecetas({ aceptadas, problematicas }: { aceptadas: Receta[]; problematicas: Receta[] }) {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            {/* Bien aceptadas */}
            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                <h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark mb-3">
                    <ThumbsUp size={13} className="text-brand-green-dark dark:text-brand-green" /> Mejor aceptadas
                </h4>
                {aceptadas.length === 0 ? <Vacio texto="Sin datos de recetas aceptadas." /> : (
                    <div className="space-y-2">
                        {aceptadas.slice(0, 6).map(x => (
                            <div key={x.id_receta} className="flex items-center justify-between gap-2 rounded-lg bg-brand-green/[0.03] px-3 py-2.5 dark:bg-brand-green/[0.05]">
                                <div className="min-w-0">
                                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark truncate">{x.nombre}</p>
                                    <p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark capitalize">{etiqueta(x.tipo_comida)}</p>
                                </div>
                                <Badge color="green">{x.puntaje_aceptacion} pts</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Problemáticas */}
            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                <h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark mb-3">
                    <ThumbsDown size={13} className="text-category-fruits" /> A revisar o evitar
                </h4>
                {problematicas.length === 0 ? <Vacio texto="Sin recetas problemáticas detectadas." /> : (
                    <div className="space-y-2">
                        {problematicas.slice(0, 6).map(x => (
                            <div key={x.id_receta} className="flex items-center justify-between gap-2 rounded-lg bg-category-fruits/[0.03] px-3 py-2.5 dark:bg-category-fruits/[0.05]">
                                <div className="min-w-0">
                                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark truncate">{x.nombre}</p>
                                    <p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark capitalize">{etiqueta(x.tipo_comida)}{x.motivos?.length ? ` · ${x.motivos.map(etiqueta).join(', ')}` : ''}</p>
                                </div>
                                <Badge color="orange">{x.frecuencia ?? 0} motivo(s)</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══ Tab: Problemas prácticos ═══ */
function TabProblemas({ problemas }: { problemas: AnaliticaEvolucion['problemas_practicos'] }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                {/* Ingredientes no conseguidos */}
                <ChipList titulo="Ingredientes no conseguidos" items={problemas.ingredientes_no_conseguidos.map(x => x.nombre)} vacio="Todos los ingredientes fueron conseguidos." />

                {/* Recetas difíciles */}
                <ChipList titulo="Recetas difíciles de preparar" items={problemas.recetas_dificiles.map(x => x.nombre)} vacio="Sin recetas reportadas como difíciles." />
            </div>

            {/* Motivos de no cumplimiento */}
            {Object.keys(problemas.motivos_no_cumplimiento_frecuentes).length > 0 && (
                <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                    <h4 className="text-[12px] font-bold text-ink dark:text-ink-dark mb-3">Motivos frecuentes de no cumplimiento</h4>
                    <div className="space-y-2">
                        {Object.entries(problemas.motivos_no_cumplimiento_frecuentes).sort(([, a], [, b]) => b - a).map(([motivo, count]) => (
                            <div key={motivo} className="flex items-center justify-between gap-3">
                                <span className="text-[11px] text-ink dark:text-ink-dark capitalize flex-1">{etiqueta(motivo)}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="w-24 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                                        <div className="h-full rounded-full bg-brand-orange" style={{ width: `${Math.min((count / Math.max(...Object.values(problemas.motivos_no_cumplimiento_frecuentes))) * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-ink dark:text-ink-dark w-6 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resumen numérico */}
            <div className="flex gap-3">
                <div className="flex-1 rounded-xl border border-surface-border p-3 text-center dark:border-surface-border-dark">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">Comidas reemplazadas</p>
                    <p className="text-[18px] font-bold text-brand-orange mt-1">{problemas.comidas_reemplazadas}</p>
                </div>
                <div className="flex-1 rounded-xl border border-surface-border p-3 text-center dark:border-surface-border-dark">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">Horarios problemáticos</p>
                    <p className="text-[18px] font-bold text-category-fruits mt-1">{Object.keys(problemas.horarios_problematicos).length}</p>
                </div>
            </div>
        </div>
    );
}

/* ═══ Auxiliares ═══ */
function ChipList({ titulo, items, vacio }: { titulo: string; items: string[]; vacio: string }) {
    return (
        <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
            <h4 className="text-[12px] font-bold text-ink dark:text-ink-dark mb-2.5">{titulo}</h4>
            {items.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {items.map(x => <span key={x} className="inline-flex items-center rounded-lg bg-brand-orange/10 px-2.5 py-1 text-[10.5px] font-semibold text-brand-orange">{x}</span>)}
                </div>
            ) : (
                <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic">{vacio}</p>
            )}
        </div>
    );
}

function Vacio({ texto }: { texto: string }) {
    return <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic py-4 text-center">{texto}</p>;
}
