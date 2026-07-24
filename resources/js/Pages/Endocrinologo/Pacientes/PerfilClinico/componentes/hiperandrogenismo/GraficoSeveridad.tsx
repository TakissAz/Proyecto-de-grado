import clsx from 'clsx';
import { Activity } from 'lucide-react';

export interface DatoSeveridad {
    label: string;
    valor: number;
    max: number;
    descripcion: string;
    referencia: string;
    color: string;
    colorTexto: string;
}

interface Props {
    datos: DatoSeveridad[];
    tieneHA: boolean;
}

export default function GraficoSeveridad({ datos, tieneHA }: Props) {
    return (
        <div className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark">
            <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-3">
                <Activity size={9} strokeWidth={2} className="text-brand-orange" />
                Perfil de signos
            </p>
            <div className="space-y-3">
                {datos.map((d) => {
                    const pct = Math.min((d.valor / d.max) * 100, 100);
                    const activo = d.valor > 0;
                    return (
                        <div key={d.label}>
                            <div className="flex items-center justify-between mb-1">
                                <span className={clsx('text-[10.5px] font-semibold', activo ? 'text-ink dark:text-ink-dark' : 'text-ink-muted/50 dark:text-ink-muted-dark/50')}>{d.label}</span>
                                <span className={clsx('text-[10.5px] font-bold', activo ? d.colorTexto : 'text-ink-muted/40 dark:text-ink-muted-dark/40')}>
                                    {d.descripcion}
                                </span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
                                <div className={clsx('h-full rounded-full transition-all', activo ? d.color : 'bg-transparent')} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60 mt-0.5">{d.referencia}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
