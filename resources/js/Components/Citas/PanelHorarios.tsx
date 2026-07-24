import { CalendarDays, Check, Clock3 } from 'lucide-react';
import clsx from 'clsx';
import type { CitaData } from './tipos';

interface Props { fecha: string; citas: CitaData[]; }
const BLOQUES = ['08:00', '09:10', '10:20', '11:30', '12:40', '13:50', '15:00', '16:10'];

export default function PanelHorarios({ fecha, citas }: Props) {
    const fechaLegible = new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    return (
        <section>
            <header className="mb-4 flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-dark dark:text-brand-green"><CalendarDays size={15} /></span>
                <div>
                    <h2 className="text-[12px] font-bold text-ink dark:text-ink-dark">Horarios disponibles</h2>
                    <p className="mt-0.5 text-[9.5px] capitalize text-ink-muted dark:text-ink-muted-dark">{fechaLegible} · 10 min de descanso</p>
                </div>
            </header>
            <div className="grid grid-cols-2 gap-2">
                {BLOQUES.map((hora) => {
                    const cita = citas.find((item) => item.hora_inicio === hora);
                    return (
                        <div key={hora} className={clsx('min-h-[60px] rounded-xl border px-3 py-2.5 transition-all', cita ? 'border-brand-orange/25 bg-brand-orange/[0.04]' : 'border-surface-border bg-black/[0.008] hover:-translate-y-px hover:border-brand-green/30 hover:bg-brand-green/[0.03] dark:border-surface-border-dark dark:bg-white/[0.01]')}>
                            <div className="flex items-center justify-between">
                                <p className={clsx('text-[13px] font-bold tabular-nums', cita ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{hora}</p>
                                {cita ? <Clock3 size={11} className="text-brand-orange/60" /> : <Check size={11} className="text-brand-green/70" />}
                            </div>
                            <p className="mt-0.5 truncate text-[9px] text-ink-muted dark:text-ink-muted-dark">{cita ? cita.paciente?.nombre_completo?.split(' ')[0] ?? 'Ocupado' : 'Disponible'}</p>
                        </div>
                    );
                })}
            </div>
            <footer className="mt-3 flex items-center gap-4 border-t border-surface-border pt-2.5 dark:border-surface-border-dark">
                <span className="flex items-center gap-1.5 text-[9px] text-ink-muted dark:text-ink-muted-dark"><i className="h-2.5 w-2.5 rounded border border-brand-green/30 bg-brand-green/[0.05]" /> Libre</span>
                <span className="flex items-center gap-1.5 text-[9px] text-ink-muted dark:text-ink-muted-dark"><i className="h-2.5 w-2.5 rounded border border-brand-orange/25 bg-brand-orange/20" /> Ocupado</span>
            </footer>
        </section>
    );
}
