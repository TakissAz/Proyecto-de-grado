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
                        colorNormal="blue"
                        esCritico={(dato) => dato < 15 || dato > 45}
                        textoCritico="Intervalo muy alejado del rango esperado"
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
                        colorNormal="violet"
                        esCritico={(dato) => dato > 14}
                        textoCritico="Sangrado prolongado: evaluacion prioritaria"
                    />
                )}

                {historia.progesterona_lutea != null && (
                    <BarraProgesterona valor={historia.progesterona_lutea} />
                )}
            </div>
        </div>
    );
}

function BarraRango({ label, valor, unidad, min, max, rangoNormalMin, rangoNormalMax, rangoLabel, colorNormal, esCritico, textoCritico }: {
    label: string; valor: number; unidad: string; min: number; max: number;
    rangoNormalMin: number; rangoNormalMax: number; rangoLabel: string;
    colorNormal: 'blue' | 'violet'; esCritico: (dato: number) => boolean; textoCritico: string;
}) {
    const enRango = valor >= rangoNormalMin && valor <= rangoNormalMax;
    const critico = !enRango && esCritico(valor);
    const escalaMax = Math.max(max, Math.ceil(valor * 1.08));
    const pctValor = Math.min((valor / escalaMax) * 100, 100);
    const pctRangoLeft = (rangoNormalMin / escalaMax) * 100;
    const pctRangoWidth = ((rangoNormalMax - rangoNormalMin) / escalaMax) * 100;
    const colores = colorNormal === 'blue'
        ? { barra: 'bg-sky-500', zona: 'bg-sky-500/10', texto: 'text-sky-400', limite: 'bg-sky-400/40' }
        : { barra: 'bg-violet-500', zona: 'bg-violet-500/10', texto: 'text-violet-400', limite: 'bg-violet-400/40' };
    const estado = critico ? 'Critico' : enRango ? 'Esperado' : 'Fuera de rango';

    return (
        <div>
            <div className="flex items-center justify-between text-[10px] text-ink-muted dark:text-ink-muted-dark mb-1">
                <span>{label}</span>
                <span className="flex items-center gap-2 font-semibold text-ink dark:text-ink-dark">
                    {valor} {unidad}
                    <span className={clsx('rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase', critico ? 'bg-red-500/15 text-red-400' : enRango ? `${colores.zona} ${colores.texto}` : 'bg-amber-500/15 text-amber-400')}>{estado}</span>
                </span>
            </div>
            <div className="relative h-5 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                <div className={clsx('absolute top-0 h-full', colores.zona)} style={{ left: `${pctRangoLeft}%`, width: `${pctRangoWidth}%` }} />
                <div className={clsx('absolute top-0.5 bottom-0.5 rounded-full transition-all duration-500', critico ? 'bg-red-500' : enRango ? colores.barra : 'bg-amber-500')} style={{ left: 0, width: `${pctValor}%` }} />
                <div className={clsx('absolute top-0 bottom-0 w-px', colores.limite)} style={{ left: `${pctRangoLeft}%` }} />
                <div className={clsx('absolute top-0 bottom-0 w-px', colores.limite)} style={{ left: `${pctRangoLeft + pctRangoWidth}%` }} />
            </div>
            <div className="flex justify-between mt-0.5 text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60">
                <span>{min}</span>
                <span className={clsx('font-medium', critico ? 'text-red-400' : enRango ? colores.texto : 'text-amber-400')}>{critico ? textoCritico : rangoLabel}</span>
                <span>{escalaMax}{valor >= max ? '+' : ''}</span>
            </div>
        </div>
    );
}

function BarraProgesterona({ valor }: { valor: number }) {
    const enRango = valor >= 10;
    const critico = valor < 3;
    const pctValor = Math.min((valor / 30) * 100, 100);

    return (
        <div>
            <div className="flex items-center justify-between text-[10px] text-ink-muted dark:text-ink-muted-dark mb-1">
                <span>Progesterona lutea</span>
                <span className="flex items-center gap-2 font-semibold text-ink dark:text-ink-dark">
                    {valor} ng/mL
                    <span className={clsx('rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase', critico ? 'bg-red-500/15 text-red-400' : enRango ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/15 text-amber-400')}>
                        {critico ? 'Muy baja' : enRango ? 'Esperada' : 'Baja'}
                    </span>
                </span>
            </div>
            <div className="relative h-5 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                <div className="absolute top-0 h-full bg-cyan-500/10" style={{ left: `${(10/30)*100}%`, right: 0 }} />
                <div className={clsx('absolute top-0.5 bottom-0.5 rounded-full transition-all duration-500', critico ? 'bg-red-500' : enRango ? 'bg-cyan-500' : 'bg-amber-500')} style={{ left: 0, width: `${pctValor}%` }} />
                <div className="absolute top-0 bottom-0 w-px bg-cyan-400/40" style={{ left: `${(10/30)*100}%` }} />
            </div>
            <div className="flex justify-between mt-0.5 text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60">
                <span>0</span>
                <span className={clsx('font-medium', critico ? 'text-red-400' : enRango ? 'text-cyan-400' : 'text-amber-400')}>
                    {enRango ? 'Compatible con ovulacion' : 'Compatible con anovulacion'}
                </span>
                <span>30+</span>
            </div>
        </div>
    );
}
