import { AlertTriangle, BrainCircuit, CheckCircle2, Info } from 'lucide-react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';

export interface PrediccionRiesgoAdherencia {
    riesgo_baja_adherencia: 'bajo' | 'medio' | 'alto';
    probabilidad_riesgo: number;
    score: number;
    factores_influyentes: string[];
    recomendacion_predictiva: string;
    fecha_prediccion: string;
    sin_datos: boolean;
    modelo: { tipo: string; nombre: string; version: string; preparado_para: string };
}

export default function PrediccionRiesgoAdherenciaCard({ prediccionRiesgoAdherencia: p }: { prediccionRiesgoAdherencia?: PrediccionRiesgoAdherencia | null }) {
    if (!p) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark">
                <Info size={15} strokeWidth={1.8} className="text-info shrink-0" />
                <span className="text-[12px] text-ink dark:text-ink-dark">La predicción de adherencia aún no está disponible.</span>
            </div>
        );
    }

    const esAlto = p.riesgo_baja_adherencia === 'alto';
    const esMedio = p.riesgo_baja_adherencia === 'medio';
    const barColor = esAlto ? 'bg-category-fruits' : esMedio ? 'bg-brand-orange' : 'bg-brand-green';
    const badgeColor = esAlto ? 'red' as const : esMedio ? 'orange' as const : 'green' as const;
    const alertBg = esAlto ? 'border-category-fruits/20 bg-category-fruits/5' : esMedio ? 'border-brand-orange/20 bg-brand-orange/5' : 'border-brand-green/20 bg-brand-green/5';
    const alertText = esAlto ? 'text-category-fruits' : esMedio ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green';
    const Icon = p.riesgo_baja_adherencia === 'bajo' ? CheckCircle2 : AlertTriangle;

    return (
        <div className="rounded-xl border border-surface-border p-5 dark:border-surface-border-dark">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                    <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', esAlto ? 'bg-category-fruits/10 text-category-fruits' : esMedio ? 'bg-brand-orange/10 text-brand-orange' : 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green')}>
                        <BrainCircuit size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Predicción de riesgo de baja adherencia</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Baseline explicable basado en seguimiento nutricional.</p>
                    </div>
                </div>
                <Badge color={badgeColor}>
                    <Icon size={11} /> {p.sin_datos ? 'Sin datos' : `Riesgo ${p.riesgo_baja_adherencia}`}
                </Badge>
            </div>

            {p.sin_datos ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-info/20 bg-info/5 px-4 py-3 dark:bg-info/[0.06]">
                    <Info size={15} strokeWidth={1.8} className="text-info shrink-0" />
                    <span className="text-[11.5px] text-ink dark:text-ink-dark">Aún no hay seguimientos suficientes; se mantendrá el monitoreo.</span>
                </div>
            ) : (
                <>
                    {/* Barra de probabilidad */}
                    <div className="mt-4">
                        <div className="flex justify-between text-[10.5px] mb-1.5">
                            <span className="text-ink-muted dark:text-ink-muted-dark">Probabilidad estimada</span>
                            <span className="font-bold text-ink dark:text-ink-dark">{Math.round(p.probabilidad_riesgo * 100)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                            <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${p.probabilidad_riesgo * 100}%` }} />
                        </div>
                    </div>

                    {/* Factores */}
                    <div className="mt-4">
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-2">Factores influyentes</p>
                        {p.factores_influyentes.length ? (
                            <ul className="space-y-1.5">
                                {p.factores_influyentes.map(x => (
                                    <li key={x} className="flex items-start gap-2 text-[11.5px] text-ink dark:text-ink-dark">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-muted/40 dark:bg-ink-muted-dark/40" />
                                        {x}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic">No se identificaron factores de riesgo relevantes.</p>
                        )}
                    </div>
                </>
            )}

            {/* Recomendación */}
            <div className={clsx('mt-4 rounded-xl border px-4 py-3', alertBg)}>
                <p className={clsx('text-[11.5px]', alertText)}>{p.recomendacion_predictiva}</p>
            </div>

            {/* Footer metadata */}
            <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-surface-border/50 dark:border-surface-border-dark/50 pt-3">
                <span className="text-[9.5px] text-ink-muted/60 dark:text-ink-muted-dark/60">{p.modelo.nombre} · v{p.modelo.version}</span>
                <span className="text-[9.5px] text-ink-muted/60 dark:text-ink-muted-dark/60">{new Date(p.fecha_prediccion).toLocaleString('es-BO')}</span>
            </div>
            <p className="mt-2 text-[10px] text-ink-muted/50 dark:text-ink-muted-dark/50 italic">Esta predicción es un apoyo complementario y no reemplaza la evaluación profesional de la nutricionista.</p>
        </div>
    );
}
