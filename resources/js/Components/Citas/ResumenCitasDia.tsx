import { Bell, CalendarClock, Clock3, UserRound } from 'lucide-react';
import clsx from 'clsx';
import type { CitaData } from './tipos';
import { ESTADOS_BADGE } from './tipos';

interface Props { citas: CitaData[]; fecha: string; }

export default function ResumenCitasDia({ citas, fecha }: Props) {
    const fechaCorta = new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    return (
        <section>
            <header className="flex items-start justify-between gap-3">
                <div><h2 className="text-[12px] font-bold text-ink dark:text-ink-dark">Citas del día</h2><p className="mt-0.5 text-[9.5px] capitalize text-ink-muted dark:text-ink-muted-dark">{fechaCorta}</p></div>
                <span className="flex h-7 items-center gap-1 rounded-lg bg-brand-green/10 px-2 text-[9px] font-bold text-brand-green-dark dark:text-brand-green"><Bell size={10} /> {citas.length}</span>
            </header>
            {citas.length === 0 ? (
                <div className="mt-3 flex min-h-[112px] flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-black/[0.008] px-4 text-center dark:border-surface-border-dark dark:bg-white/[0.01]">
                    <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.025] dark:bg-white/[0.03]"><CalendarClock size={18} className="text-ink-muted/40" /></span>
                    <p className="text-[10.5px] font-medium text-ink-muted dark:text-ink-muted-dark">Agenda libre este día</p>
                    <p className="mt-0.5 text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60">No hay citas programadas</p>
                </div>
            ) : (
                <div className="mt-3 space-y-2">
                    {citas.map((cita) => {
                        const badge = ESTADOS_BADGE[cita.estado] ?? { class: 'badge-ghost', label: cita.estado };
                        const borde = cita.estado === 'programada' ? 'border-l-yellow-500' : cita.estado === 'confirmada' ? 'border-l-blue-500' : cita.estado === 'atendida' ? 'border-l-brand-green' : 'border-l-category-fruits/50';
                        return (
                            <article key={cita.id_cita} className={clsx('rounded-xl border border-surface-border border-l-[3px] bg-black/[0.008] p-3 dark:border-surface-border-dark dark:bg-white/[0.015]', borde)}>
                                <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[11.5px] font-bold tabular-nums text-ink dark:text-ink-dark"><Clock3 size={11} className="text-brand-green-dark" />{cita.hora_inicio} – {cita.hora_fin}</span><span className={clsx('pill text-[8px]', badge.class)}>{badge.label}</span></div>
                                <p className="mt-2 flex items-center gap-1.5 truncate text-[10.5px] font-semibold text-ink dark:text-ink-dark"><UserRound size={10} className="text-ink-muted/50" />{cita.paciente?.nombre_completo ?? '—'}</p>
                                <p className="mt-1 text-[9px] text-ink-muted dark:text-ink-muted-dark">{cita.tipo_cita} · <span className="capitalize">{cita.modalidad}</span></p>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
