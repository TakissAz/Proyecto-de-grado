import clsx from 'clsx';
import { Activity } from 'lucide-react';
import type { HistoriaMenstrualData } from '../../tipos';

interface Props {
    historia: HistoriaMenstrualData;
}

export default function GraficoCicloMenstrual({ historia }: Props) {
    if (!historia.duracion_ciclo_dias && !historia.intervalo_entre_ciclos_dias && historia.progesterona_lutea == null) {
        return null;
    }

    return (
        <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-3">
                <Activity size={10} strokeWidth={2} className="text-category-others" />
                Visualizacion del ciclo
            </p>
            <div className="space-y-3">
                {historia.intervalo_entre_ciclos_dias && (
                    <BarraRango
                        label="Intervalo entre ciclos"
                        valor={historia.intervalo_entre_ciclos_dias}
                        unidad="dias"
                        min={0}
                        max={45}
                        rangoNormalMin={21}
                        rangoNormalMax={35}
                        rangoLabel="21-35 normal"
                    />
                )}

                {historia.duracion_ciclo_dias && (
                    <BarraRango
                        label="Duracion del sangrado"
                        valor={historia.duracion_ciclo_dias}
                        unidad="dias"
                        min={0}
                        max={14}
                        rangoNormalMin={3}
                        rangoNormalMax={7}
                        rangoLabel="3-7 normal"
                    />
                )}

                {historia.progesterona_lutea != null && (
                    <BarraProgesterona valor={historia.progesterona_lutea} />
                )}
            </div>
        </div>
    );
}

function BarraRango({ label, valor, unidad, min, max, rangoNormalMin, rangoNormalMax, rangoLabel }: {
    label: string; valor: number; unidad: string; min: number; max: number;
    rangoNormalMin: number; rangoNormalMax: number; rangoLabel: string;
}) {
    const enRango = valor >= rangoNormalMin && valor <= rangoNormalMax;
    const pctValor = Math.min((valor / max) * 100, 100);
    const pctRangoLeft = (rangoNormalMin / max) * 100;
    const pctRangoWidth = ((rangoNormalMax - rangoNormalMin) / max) * 100;

    return (
        <div>
            <div className="flex items-center justify-between text-[10px] text-ink-muted dark:text-ink-muted-dark mb-1">
                <span>{label}</span>
                <span className="font-semibold text-ink dark:text-ink-dark">{valor} {unidad}</span>
            </div>
            <div className="relative h-5 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                <div className="absolute top-0 h-full bg-brand-green/10 dark:bg-brand-green/5" style={{ left: `${pctRangoLeft}%`, width: `${pctRangoWidth}%` }} />
                <div className={clsx('absolute top-0.5 bottom-0.5 rounded-full transition-all', enRango ? 'bg-brand-green' : 'bg-brand-orange')} style={{ left: 0, width: `${pctValor}%` }} />
                <div className="absolute top-0 bottom-0 w-px bg-brand-green-dark/30 dark:bg-brand-green/30" style={{ left: `${pctRangoLeft}%` }} />
                <div className="absolute top-0 bottom-0 w-px bg-brand-green-dark/30 dark:bg-brand-green/30" style={{ left: `${pctRangoLeft + pctRangoWidth}%` }} />
            </div>
            <div className="flex justify-between mt-0.5 text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60">
                <span>{min}</span>
                <span className="text-brand-green-dark dark:text-brand-green font-medium">{rangoLabel}</span>
                <span>{max}+</span>
            </div>
        </div>
    );
}

function BarraProgesterona({ valor }: { valor: number }) {
    const enRango = valor >= 10;
    const pctValor = Math.min((valor / 30) * 100, 100);

    return (
        <div>
            <div className="flex items-center justify-between text-[10px] text-ink-muted dark:text-ink-muted-dark mb-1">
                <span>Progesterona lutea</span>
                <span className="font-semibold text-ink dark:text-ink-dark">{valor} ng/mL</span>
            </div>
            <div className="relative h-5 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                <div className="absolute top-0 h-full bg-brand-green/10 dark:bg-brand-green/5" style={{ left: `${(10/30)*100}%`, right: 0 }} />
                <div className={clsx('absolute top-0.5 bottom-0.5 rounded-full transition-all', enRango ? 'bg-brand-green' : 'bg-category-fruits')} style={{ left: 0, width: `${pctValor}%` }} />
                <div className="absolute top-0 bottom-0 w-px bg-brand-green-dark/30 dark:bg-brand-green/30" style={{ left: `${(10/30)*100}%` }} />
            </div>
            <div className="flex justify-between mt-0.5 text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60">
                <span>0</span>
                <span className={clsx('font-medium', enRango ? 'text-brand-green-dark dark:text-brand-green' : 'text-category-fruits')}>
                    {enRango ? 'Ovulacion confirmada' : 'Anovulacion probable'}
                </span>
                <span>30+</span>
            </div>
        </div>
    );
}
