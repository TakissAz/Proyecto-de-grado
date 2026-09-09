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
    estado_periodo: 'sin_plan' | 'no_iniciado' | 'en_curso' | 'finalizado';
    datos_utilizados?: { adherencia_promedio?: number; comidas_sin_registro_vencidas?: number; comidas_no_realizadas?: number; comidas_parciales?: number; comidas_reemplazadas?: number; dias_sin_registro?: number };
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
    const porcentaje = Math.round(p.probabilidad_riesgo * 100);
    const datos = p.datos_utilizados;
    const significado = esAlto
        ? 'Existe una concentración importante de señales que podrían dificultar el cumplimiento de esta semana.'
        : esMedio
            ? 'Se detectaron algunas señales que conviene revisar antes de que afecten el resto de la semana.'
            : 'Las señales disponibles no muestran actualmente un riesgo relevante de baja adherencia.';

    return (
        <div className="rounded-xl border border-surface-border bg-gradient-to-br from-transparent to-info/[.025] p-5 dark:border-surface-border-dark">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                    <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', esAlto ? 'bg-category-fruits/10 text-category-fruits' : esMedio ? 'bg-brand-orange/10 text-brand-orange' : 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green')}>
                        <BrainCircuit size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Riesgo de baja adherencia esta semana</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Estimación preventiva basada exclusivamente en el seguimiento del plan vigente.</p>
                    </div>
                </div>
                <Badge color={badgeColor}>
                    <Icon size={11} /> {p.sin_datos ? 'Sin datos' : `Riesgo ${p.riesgo_baja_adherencia}`}
                </Badge>
            </div>

            {p.sin_datos ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-info/20 bg-info/5 px-4 py-3 dark:bg-info/[0.06]">
                    <Info size={15} strokeWidth={1.8} className="text-info shrink-0" />
                    <span className="text-[11.5px] text-ink dark:text-ink-dark">
                        {p.estado_periodo === 'no_iniciado'
                            ? 'El plan semanal aún no comenzó. La predicción se habilitará desde su fecha de inicio y no utilizará datos de otras semanas.'
                            : 'Aún no hay registros de esta semana suficientes para calcular el riesgo.'}
                    </span>
                </div>
            ) : (
                <>
                    <div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr]">
                        <div className={clsx('rounded-xl border p-4 text-center',alertBg)}><p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Riesgo de no cumplir</p><p className={clsx('mt-2 text-[30px] font-bold',alertText)}>{porcentaje}%</p><p className="mt-1 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">{porcentaje === 0 ? 'Resultado favorable' : `Nivel de riesgo ${p.riesgo_baja_adherencia}`}</p></div>
                        <div className="rounded-xl border border-surface-border/70 p-4 dark:border-surface-border-dark/70"><p className="text-[10px] font-bold text-ink dark:text-ink-dark">¿Qué significa este resultado?</p><p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{significado}</p><p className="mt-2 text-[10px] font-semibold text-brand-green-dark dark:text-brand-green">Mientras más cerca de 0%, menor riesgo. Mientras más cerca de 100%, mayor riesgo de incumplimiento.</p><div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.06]"><div className={clsx('h-full rounded-full',barColor)} style={{width:`${porcentaje}%`}}/></div><div className="mt-2 flex justify-between text-[8px] text-ink-muted"><span>0% · Favorable</span><span>35% · Requiere atención</span><span>65% · Alto</span><span>100% · Crítico</span></div></div>
                    </div>

                    {datos && <div className="mt-4"><div className="mb-2 flex flex-wrap items-end justify-between gap-1"><p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">Datos de la semana considerados</p><p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">La adherencia alta es favorable; los demás datos pueden incrementar el riesgo.</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"><Dato label="Adherencia lograda" valor={`${datos.adherencia_promedio ?? 0}%`}/><Dato label="Sin registrar" valor={datos.comidas_sin_registro_vencidas ?? 0}/><Dato label="No realizadas" valor={datos.comidas_no_realizadas ?? 0}/><Dato label="Parciales" valor={datos.comidas_parciales ?? 0}/><Dato label="Reemplazadas" valor={datos.comidas_reemplazadas ?? 0}/><Dato label="Días sin registro" valor={datos.dias_sin_registro ?? 0}/></div></div>}

                    {/* Factores */}
                    <div className="mt-4">
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-2">Señales que explican el resultado</p>
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
                <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Acción sugerida para nutrición</p><p className={clsx('mt-1 text-[11.5px] leading-relaxed', alertText)}>{p.recomendacion_predictiva}</p>
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

function Dato({label,valor}:{label:string;valor:string|number}){return <div className="rounded-lg bg-black/[.025] px-3 py-2.5 dark:bg-white/[.03]"><p className="text-[8px] font-bold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">{label}</p><p className="mt-1 text-[14px] font-bold text-ink dark:text-ink-dark">{valor}</p></div>}
