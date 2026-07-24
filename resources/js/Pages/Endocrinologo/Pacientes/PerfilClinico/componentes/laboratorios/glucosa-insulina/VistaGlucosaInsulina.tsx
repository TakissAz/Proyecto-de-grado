import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { GlucosaInsulinaData } from '../../../tipos';

interface Props {
    data: GlucosaInsulinaData;
}

const RANGOS = [
    { label: 'Glucosa ayunas', key: 'glucosa_ayunas', unidad: 'mg/dL', min: 70, max: 99 },
    { label: 'Insulina ayunas', key: 'insulina_ayunas', unidad: 'µU/mL', min: 2, max: 10 },
    { label: 'HbA1c', key: 'hemoglobina_glicosilada', unidad: '%', min: 4, max: 5.6 },
    { label: 'Glucosa 2h OGTT', key: 'glucosa_2h_ogtt', unidad: 'mg/dL', min: 0, max: 139 },
    { label: 'Insulina 2h OGTT', key: 'insulina_2h_ogtt', unidad: 'µU/mL', min: 0, max: 60 },
] as const;

export default function VistaGlucosaInsulina({ data }: Props) {
    return (
        <div className="space-y-4">
            {/* Gauge HOMA-IR */}
            {data.homa_ir != null && <GaugeHomaIR valor={data.homa_ir} />}

            {/* Barras de rango */}
            <div className="space-y-2.5">
                {RANGOS.map((r) => {
                    const valor = (data as any)[r.key] as number | null;
                    if (valor == null) return null;
                    const maxEscala = r.max * 1.6;
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
                                <span>{r.min}–{r.max} normal</span>
                                <span>{r.max}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Alertas */}
            <div className="flex flex-wrap gap-1.5">
                {data.homa_ir != null && data.homa_ir >= 2.5 && <Badge color="red">HOMA-IR ≥ 2.5 ({data.homa_ir})</Badge>}
                {data.resistencia_insulina_sugerida && <Badge color="orange">RI sugerida</Badge>}
                {data.hiperinsulinemia && <Badge color="orange">Hiperinsulinemia</Badge>}
                {!data.resistencia_insulina_sugerida && !data.hiperinsulinemia && !(data.homa_ir != null && data.homa_ir >= 2.5) && <Badge color="green">Sin alteraciones</Badge>}
            </div>

            {data.interpretacion && (
                <div className="rounded-xl border border-surface-border px-3 py-2.5 dark:border-surface-border-dark">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">Interpretación</p>
                    <p className="text-[12px] text-ink dark:text-ink-dark">{data.interpretacion}</p>
                </div>
            )}
        </div>
    );
}

function GaugeHomaIR({ valor }: { valor: number }) {
    const categoria = valor < 2.5 ? 'Normal' : valor < 3.8 ? 'RI moderada' : 'RI severa';
    const color = valor < 2.5 ? 'text-brand-green-dark dark:text-brand-green' : valor < 3.8 ? 'text-brand-orange' : 'text-category-fruits';
    const bgColor = valor < 2.5 ? 'bg-brand-green/10' : valor < 3.8 ? 'bg-brand-orange/10' : 'bg-category-fruits/10';
    const pct = Math.min((valor / 6) * 100, 100);

    return (
        <div className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">HOMA-IR (Resistencia a insulina)</p>
                <div className={clsx('rounded-lg px-2 py-1', bgColor)}>
                    <span className={clsx('text-[12px] font-bold', color)}>{valor}</span>
                </div>
            </div>
            {/* Barra tricolor */}
            <div className="relative h-4 w-full rounded-full overflow-hidden flex mb-1">
                <div className="h-full bg-brand-green/40" style={{ width: '41%' }} />
                <div className="h-full bg-brand-orange/40" style={{ width: '22%' }} />
                <div className="h-full bg-category-fruits/40" style={{ width: '37%' }} />
            </div>
            {/* Marcador */}
            <div className="relative h-2">
                <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-ink dark:border-t-ink-dark" style={{ left: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[8px] text-ink-muted/60 dark:text-ink-muted-dark/60">
                <span className="text-brand-green-dark dark:text-brand-green">Normal (&lt;2.5)</span>
                <span className="text-brand-orange">Moderada (2.5-3.8)</span>
                <span className="text-category-fruits">Severa (&gt;3.8)</span>
            </div>
            <p className={clsx('text-[11px] font-semibold text-center mt-1', color)}>{categoria}</p>
        </div>
    );
}
