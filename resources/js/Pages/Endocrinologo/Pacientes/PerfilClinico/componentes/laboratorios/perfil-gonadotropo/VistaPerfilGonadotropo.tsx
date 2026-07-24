import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { PerfilGonadotropoData } from '../../../tipos';

interface Props {
    data: PerfilGonadotropoData;
}

const RANGOS = [
    { label: 'LH', key: 'lh', unidad: 'mUI/mL', min: 1, max: 12, alerta: 12 },
    { label: 'FSH', key: 'fsh', unidad: 'mUI/mL', min: 3, max: 10, alerta: 10 },
    { label: 'Relación LH/FSH', key: 'relacion_lh_fsh', unidad: '', min: 0.5, max: 2, alerta: 2 },
    { label: 'Estradiol', key: 'estradiol', unidad: 'pg/mL', min: 30, max: 400, alerta: 400 },
    { label: 'Progesterona', key: 'progesterona', unidad: 'ng/mL', min: 0.5, max: 20, alerta: 3, invertido: true },
] as const;

export default function VistaPerfilGonadotropo({ data }: Props) {
    const lhFshAlta = data.relacion_lh_fsh != null && data.relacion_lh_fsh > 2;

    return (
        <div className="space-y-4">
            {/* Gráfico de barras de rango */}
            <div className="space-y-2.5">
                {RANGOS.map((r) => {
                    const valor = (data as any)[r.key] as number | null;
                    if (valor == null) return null;

                    const maxEscala = r.max * 1.5;
                    const pct = Math.min((valor / maxEscala) * 100, 100);
                    const pctMin = (r.min / maxEscala) * 100;
                    const pctMax = (r.max / maxEscala) * 100;
                    const fueraRango = (r as any).invertido ? valor < r.min : (valor < r.min || valor > r.max);

                    return (
                        <div key={r.key}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{r.label}</span>
                                <span className={clsx('text-[10.5px] font-bold', fueraRango ? 'text-brand-orange' : 'text-brand-green-dark dark:text-brand-green')}>
                                    {valor} {r.unidad}
                                </span>
                            </div>
                            <div className="relative h-3 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                                <div className="absolute top-0 h-full bg-brand-green/10 dark:bg-brand-green/5" style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }} />
                                <div className={clsx('absolute top-0.5 bottom-0.5 rounded-full', fueraRango ? 'bg-brand-orange' : 'bg-brand-green')} style={{ left: 0, width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between mt-0.5 text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50">
                                <span>{r.min}</span>
                                <span className="text-brand-green-dark/60 dark:text-brand-green/60">Normal</span>
                                <span>{r.max}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Alertas */}
            <div className="flex flex-wrap gap-1.5">
                {lhFshAlta && <Badge color="orange">LH/FSH elevada (&gt;2)</Badge>}
                {data.progesterona != null && data.progesterona < 3 && <Badge color="orange">Progesterona baja (&lt;3)</Badge>}
                {!lhFshAlta && !(data.progesterona != null && data.progesterona < 3) && <Badge color="green">Sin alteraciones</Badge>}
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
