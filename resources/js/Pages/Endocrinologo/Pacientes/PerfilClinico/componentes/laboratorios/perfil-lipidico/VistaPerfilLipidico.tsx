import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { PerfilLipidicoData } from '../../../tipos';

interface Props {
    data: PerfilLipidicoData;
}

const RANGOS = [
    { label: 'Colesterol total', key: 'colesterol_total', unidad: 'mg/dL', min: 0, max: 199, altoEsAlerta: true },
    { label: 'HDL', key: 'hdl', unidad: 'mg/dL', min: 50, max: 999, altoEsAlerta: false },
    { label: 'LDL', key: 'ldl', unidad: 'mg/dL', min: 0, max: 129, altoEsAlerta: true },
    { label: 'Triglicéridos', key: 'trigliceridos', unidad: 'mg/dL', min: 0, max: 149, altoEsAlerta: true },
    { label: 'VLDL', key: 'vldl', unidad: 'mg/dL', min: 0, max: 30, altoEsAlerta: true },
] as const;

export default function VistaPerfilLipidico({ data }: Props) {
    return (
        <div className="space-y-4">
            {/* Barras de rango */}
            <div className="space-y-2.5">
                {RANGOS.map((r) => {
                    const valor = (data as any)[r.key] as number | null;
                    if (valor == null) return null;

                    const maxEscala = Math.max(r.max * 1.5, valor * 1.2);
                    const pct = Math.min((valor / maxEscala) * 100, 100);
                    const pctRangoBueno = r.altoEsAlerta
                        ? (r.max / maxEscala) * 100
                        : (r.min / maxEscala) * 100;

                    const fueraRango = r.altoEsAlerta ? valor > r.max : valor < r.min;

                    return (
                        <div key={r.key}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10.5px] font-semibold text-ink dark:text-ink-dark">{r.label}</span>
                                <span className={clsx('text-[10.5px] font-bold', fueraRango ? 'text-category-fruits' : 'text-brand-green-dark dark:text-brand-green')}>
                                    {valor} {r.unidad} {fueraRango ? (r.altoEsAlerta ? '— Elevado' : '— Bajo') : ''}
                                </span>
                            </div>
                            <div className="relative h-3 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                                {/* Zona de alerta */}
                                {r.altoEsAlerta ? (
                                    <div className="absolute top-0 h-full bg-brand-green/10 dark:bg-brand-green/5" style={{ left: 0, width: `${pctRangoBueno}%` }} />
                                ) : (
                                    <div className="absolute top-0 h-full bg-brand-green/10 dark:bg-brand-green/5" style={{ left: `${pctRangoBueno}%`, right: 0 }} />
                                )}
                                <div className={clsx('absolute top-0.5 bottom-0.5 rounded-full', fueraRango ? 'bg-category-fruits' : 'bg-brand-green')} style={{ left: 0, width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between mt-0.5 text-[8px] text-ink-muted/50 dark:text-ink-muted-dark/50">
                                <span>0</span>
                                <span className="text-brand-green-dark/60 dark:text-brand-green/60">
                                    {r.altoEsAlerta ? `Normal (<${r.max})` : `Deseable (>${r.min})`}
                                </span>
                                <span>{r.max}+</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Colesterol no-HDL */}
            {data.colesterol_no_hdl != null && (
                <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">Colesterol no-HDL</p>
                    <p className={clsx('text-[13px] font-bold', data.colesterol_no_hdl >= 130 ? 'text-category-fruits' : 'text-ink dark:text-ink-dark')}>
                        {data.colesterol_no_hdl} mg/dL {data.colesterol_no_hdl >= 130 ? '— Elevado' : ''}
                    </p>
                </div>
            )}

            {/* Alertas */}
            <div className="flex flex-wrap gap-1.5">
                {data.dislipidemia_sugerida && <Badge color="orange">Dislipidemia sugerida</Badge>}
                {data.trigliceridos != null && data.trigliceridos >= 150 && <Badge color="orange">TG elevados</Badge>}
                {data.hdl != null && data.hdl < 50 && <Badge color="orange">HDL bajo</Badge>}
                {data.ldl != null && data.ldl >= 130 && <Badge color="orange">LDL elevado</Badge>}
                {!data.dislipidemia_sugerida && !(data.trigliceridos != null && data.trigliceridos >= 150) && !(data.hdl != null && data.hdl < 50) && !(data.ldl != null && data.ldl >= 130) && (
                    <Badge color="green">Sin alteraciones lipídicas</Badge>
                )}
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
