import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { DiferencialEndocrinoData } from '../../../tipos';

interface Props {
    data: DiferencialEndocrinoData;
}

const RANGOS = [
    { label: 'TSH', key: 'tsh', unidad: 'mUI/L', min: 0.4, max: 4.5, alerta: 4.5 },
    { label: 'T4 libre', key: 't4_libre', unidad: 'ng/dL', min: 0.8, max: 1.8, alerta: 1.8 },
    { label: 'Prolactina', key: 'prolactina', unidad: 'ng/mL', min: 2, max: 25, alerta: 25 },
    { label: '17-OH Progesterona', key: 'diecisiete_oh_progesterona', unidad: 'ng/mL', min: 0.2, max: 2, alerta: 2 },
    { label: 'Cortisol', key: 'cortisol', unidad: 'μg/dL', min: 5, max: 25, alerta: 25 },
] as const;

export default function VistaDiferenciales({ data }: Props) {
    const descartes = [
        { label: 'Enfermedad tiroidea', ok: data.alteracion_tiroidea_descartada },
        { label: 'Hiperprolactinemia', ok: data.hiperprolactinemia_descartada },
        { label: 'Hiperplasia suprarrenal', ok: data.hiperplasia_suprarrenal_descartada },
        { label: 'Síndrome de Cushing', ok: data.cushing_descartado },
    ];
    const todosDescartados = descartes.every(d => d.ok);

    return (
        <div className="space-y-4">
            {/* Gráfico de barras de rango */}
            <div className="space-y-2.5">
                {RANGOS.map((r) => {
                    const valor = (data as any)[r.key] as number | null;
                    if (valor == null) return null;

                    const maxEscala = r.max * 1.8;
                    const pct = Math.min((valor / maxEscala) * 100, 100);
                    const pctMin = (r.min / maxEscala) * 100;
                    const pctMax = (r.max / maxEscala) * 100;
                    const fueraRango = valor < r.min || valor > r.max;

                    return (
                        <div key={r.key}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{r.label}</span>
                                <span className={clsx('text-[10.5px] font-bold', fueraRango ? 'text-category-fruits' : 'text-brand-green-dark dark:text-brand-green')}>
                                    {valor} {r.unidad} {fueraRango ? '— Elevado' : ''}
                                </span>
                            </div>
                            <div className="relative h-3 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                                <div className="absolute top-0 h-full bg-brand-green/10 dark:bg-brand-green/5" style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }} />
                                <div className={clsx('absolute top-0.5 bottom-0.5 rounded-full', fueraRango ? 'bg-category-fruits' : 'bg-brand-green')} style={{ left: 0, width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between mt-0.5 text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50">
                                <span>{r.min}</span>
                                <span>{r.min}–{r.max} rango normal</span>
                                <span>{r.max}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Diagnósticos diferenciales descartados */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Diagnósticos diferenciales</p>
                <div className="grid grid-cols-2 gap-2">
                    {descartes.map((d) => (
                        <div key={d.label} className={clsx('rounded-lg px-3 py-2', d.ok ? 'bg-brand-green/5 dark:bg-brand-green/[0.03]' : 'bg-brand-orange/5 dark:bg-brand-orange/[0.03]')}>
                            <div className="flex items-center gap-1.5">
                                <span className={clsx('text-[10px]', d.ok ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange')}>
                                    {d.ok ? '✓' : '?'}
                                </span>
                                <span className="text-[11px] font-medium text-ink dark:text-ink-dark">{d.label}</span>
                            </div>
                            <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                {d.ok ? 'Descartado' : 'Pendiente'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <Badge color={todosDescartados ? 'green' : 'orange'}>
                {todosDescartados ? 'Todos los diferenciales descartados' : 'Diferenciales pendientes'}
            </Badge>

            {data.interpretacion && (
                <div className="rounded-xl border border-surface-border px-3 py-2.5 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">Interpretación</p>
                    <p className="text-[12px] text-ink dark:text-ink-dark">{data.interpretacion}</p>
                </div>
            )}
        </div>
    );
}
