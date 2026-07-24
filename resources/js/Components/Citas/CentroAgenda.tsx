import {
    ArrowRight,
    CalendarPlus,
    CheckCircle2,
    CircleDashed,
    Clock3,
    Lightbulb,
    UsersRound,
} from 'lucide-react';
import type { CitaData } from './tipos';

interface Props {
    citas: CitaData[];
    fecha: string;
    prefijo: 'endocrinologo' | 'nutricionista';
    onNuevaCita?: () => void;
}

const TOTAL_BLOQUES = 8;

export default function CentroAgenda({ citas, fecha, prefijo, onNuevaCita }: Props) {
    const citasActivas = citas.filter((cita) => !['cancelada', 'no_asistio'].includes(cita.estado));
    const ocupados = Math.min(citasActivas.length, TOTAL_BLOQUES);
    const disponibles = TOTAL_BLOQUES - ocupados;
    const porcentaje = Math.round((ocupados / TOTAL_BLOQUES) * 100);
    const proximaCita = [...citasActivas].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))[0];
    const fechaLegible = new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <aside className="grid h-full min-w-0 gap-3 sm:grid-cols-2 lg:col-span-2 xl:col-span-1 xl:grid-cols-1 xl:grid-rows-[auto_auto_1fr_auto]">
            <section className="card-elevated overflow-hidden">
                <div className="bg-gradient-to-br from-brand-green-dark to-brand-green p-4 text-white">
                    <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                        <CalendarPlus size={18} strokeWidth={1.8} />
                    </span>
                    <p className="text-[10px] font-medium text-white/70">Acción rápida</p>
                    <h2 className="mt-0.5 text-[15px] font-bold">Agenda una nueva cita</h2>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-white/70">
                        Registra al paciente y reserva un horario disponible.
                    </p>
                    <button
                        type="button"
                        onClick={onNuevaCita}
                        className="mt-4 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-[10px] font-bold text-brand-green-dark shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                        Crear cita <ArrowRight size={11} />
                    </button>
                </div>
            </section>

            <section className="card-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-[12px] font-bold text-ink dark:text-ink-dark">Resumen del día</h2>
                        <p className="mt-0.5 text-[9px] capitalize text-ink-muted dark:text-ink-muted-dark">{fechaLegible}</p>
                    </div>
                    <span className="rounded-lg bg-brand-green/10 px-2 py-1 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">
                        {porcentaje}%
                    </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.05]">
                    <div
                        className="h-full rounded-full bg-brand-green transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                    />
                </div>
                <p className="mt-1.5 text-[8.5px] text-ink-muted dark:text-ink-muted-dark">Ocupación de la jornada</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-surface-border bg-black/[0.008] p-3 dark:border-surface-border-dark dark:bg-white/[0.01]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-dark dark:text-brand-green">
                            <CheckCircle2 size={12} />
                        </span>
                        <p className="mt-2 text-[16px] font-bold text-ink dark:text-ink-dark">{disponibles}</p>
                        <p className="text-[8.5px] text-ink-muted dark:text-ink-muted-dark">Disponibles</p>
                    </div>
                    <div className="rounded-xl border border-surface-border bg-black/[0.008] p-3 dark:border-surface-border-dark dark:bg-white/[0.01]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                            <UsersRound size={12} />
                        </span>
                        <p className="mt-2 text-[16px] font-bold text-ink dark:text-ink-dark">{ocupados}</p>
                        <p className="text-[8.5px] text-ink-muted dark:text-ink-muted-dark">Programadas</p>
                    </div>
                </div>
            </section>

            <section className="card-elevated p-4">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Clock3 size={13} />
                    </span>
                    <div>
                        <h2 className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Próxima cita</h2>
                        <p className="text-[8.5px] text-ink-muted dark:text-ink-muted-dark">Según el día seleccionado</p>
                    </div>
                </div>

                {proximaCita ? (
                    <div className="mt-3 rounded-xl border border-surface-border bg-black/[0.008] p-3 dark:border-surface-border-dark dark:bg-white/[0.01]">
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-bold tabular-nums text-ink dark:text-ink-dark">{proximaCita.hora_inicio}</span>
                            <span className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                        </div>
                        <p className="mt-1 truncate text-[10.5px] font-semibold text-ink dark:text-ink-dark">
                            {proximaCita.paciente?.nombre_completo ?? 'Paciente'}
                        </p>
                        <p className="mt-0.5 text-[8.5px] text-ink-muted dark:text-ink-muted-dark">
                            {proximaCita.tipo_cita} · <span className="capitalize">{proximaCita.modalidad}</span>
                        </p>
                    </div>
                ) : (
                    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-dashed border-surface-border p-3 dark:border-surface-border-dark">
                        <CircleDashed size={16} className="shrink-0 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                        <p className="text-[9.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                            Aún no hay una próxima cita para este día.
                        </p>
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-yellow-500/15 bg-yellow-500/[0.04] p-3.5">
                <div className="flex gap-2.5">
                    <Lightbulb size={14} className="mt-0.5 shrink-0 text-yellow-500" />
                    <div>
                        <p className="text-[10px] font-bold text-ink dark:text-ink-dark">Consejo de agenda</p>
                        <p className="mt-1 text-[9px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                            Selecciona un día del calendario para consultar sus espacios y citas programadas.
                        </p>
                    </div>
                </div>
            </section>
        </aside>
    );
}


