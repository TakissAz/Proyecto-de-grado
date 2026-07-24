import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { PerfilAndrogenicoData } from '../../../tipos';

interface Props {
    data: PerfilAndrogenicoData;
}

/** Rangos de referencia femeninos aproximados */
const RANGOS = [
    { label: 'Testosterona total', key: 'testosterona_total', unidad: 'ng/dL', min: 15, max: 70, alerta: 70 },
    { label: 'Testosterona libre', key: 'testosterona_libre', unidad: 'pg/mL', min: 0.5, max: 4.5, alerta: 4.5 },
    { label: 'SHBG', key: 'shbg', unidad: 'nmol/L', min: 20, max: 130, alerta: 20, invertido: true },
    { label: 'DHEA-S', key: 'dhea_s', unidad: 'μg/dL', min: 35, max: 430, alerta: 430 },
    { label: 'Androstenediona', key: 'androstenediona', unidad: 'ng/mL', min: 0.3, max: 3.3, alerta: 3.3 },
] as const;

export default function VistaPerfilAndrogenico({ data }: Props) {
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
                                <span className={clsx('text-[10.5px] font-bold', fueraRango ? 'text-category-fruits' : 'text-brand-green-dark dark:text-brand-green')}>
                                    {valor} {r.unidad} {fueraRango ? '— Fuera de rango' : ''}
                                </span>
                            </div>
                            <div className="relative h-3 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                                {/* Zona normal */}
                                <div className="absolute top-0 h-full bg-brand-green/10 dark:bg-brand-green/5" style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }} />
                                {/* Barra del valor */}
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

            {/* Índice androgénico libre */}
            {data.indice_androgenico_libre != null && (
                <div className="rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">Índice androgénico libre</p>
                    <p className={clsx('text-[13px] font-bold', data.indice_androgenico_libre > 5 ? 'text-category-fruits' : 'text-ink dark:text-ink-dark')}>{data.indice_androgenico_libre}</p>
                </div>
            )}

            {/* Interpretación */}
            <Badge color={data.hiperandrogenismo_bioquimico ? 'red' : 'green'}>
                {data.hiperandrogenismo_bioquimico ? 'Hiperandrogenismo bioquímico positivo' : 'Sin hiperandrogenismo bioquímico'}
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
