import { CalendarDays, Clock3, Plus, Search, Stethoscope, X } from 'lucide-react';
import clsx from 'clsx';
import { BotonLink } from '@/Components/ui/boton';
import AccionesCita from './AccionesCita';
import type { CitaData } from './tipos';
import { ESTADOS_BADGE } from './tipos';

interface Props {
    citas: CitaData[];
    paciente: string;
    estado: string;
    prefijo: 'endocrinologo' | 'nutricionista';
    onPacienteChange: (valor: string) => void;
    onBuscar: () => void;
    onEstadoChange: (estado: string) => void;
    onNuevaCita?: () => void;
}

const TABS = [
    { key: '', label: 'Todas' },
    { key: 'programada', label: 'Pendientes' },
    { key: 'confirmada', label: 'Confirmadas' },
    { key: 'atendida', label: 'Completadas' },
    { key: 'cancelada', label: 'Canceladas' },
];

const fechaLegible = (fecha: string) => new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
});

export default function ListadoCitasMejorado({
    citas,
    paciente,
    estado,
    prefijo,
    onPacienteChange,
    onBuscar,
    onEstadoChange,
    onNuevaCita,
}: Props) {
    return (
        <section className="flex h-full min-h-[170px] flex-col border-t border-surface-border pt-4 dark:border-surface-border-dark">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-[12px] font-bold text-ink dark:text-ink-dark">Listado de citas</h2>
                        <span className="rounded-md bg-brand-green/10 px-1.5 py-0.5 text-[8px] font-bold text-brand-green-dark dark:text-brand-green">
                            {citas.length}
                        </span>
                    </div>
                    <p className="mt-0.5 text-[9px] text-ink-muted dark:text-ink-muted-dark">Consulta y administra las citas registradas</p>
                </div>

                <BotonLink href={onNuevaCita ? '#' : `/${prefijo}/citas/create`} variante="primary" tamano="xs" onClick={(e: any) => { if (onNuevaCita) { e.preventDefault(); onNuevaCita(); } }}>
                    <Plus size={11} strokeWidth={2} /> Nueva cita
                </BotonLink>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="group flex h-9 w-full items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-2 shadow-sm transition-all focus-within:border-brand-green/50 focus-within:ring-2 focus-within:ring-brand-green/10 dark:border-surface-border-dark dark:bg-surface-card-dark sm:w-64">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-dark transition-colors group-focus-within:bg-brand-green group-focus-within:text-white dark:text-brand-green">
                        <Search size={11} strokeWidth={2} />
                    </span>
                    <input
                        type="search"
                        value={paciente}
                        onChange={(event) => onPacienteChange(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && onBuscar()}
                        placeholder="Buscar paciente..."
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[11px] font-medium text-ink outline-none ring-0 placeholder:font-normal placeholder:text-ink-muted/50 focus:border-0 focus:outline-none focus:ring-0 dark:text-ink-dark dark:placeholder:text-ink-muted-dark/50"
                    />
                    {paciente && (
                        <button
                            type="button"
                            onClick={() => onPacienteChange('')}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-ink-muted/50 transition-colors hover:bg-black/[0.05] hover:text-ink dark:text-ink-muted-dark/50 dark:hover:bg-white/[0.06] dark:hover:text-ink-dark"
                            aria-label="Limpiar búsqueda"
                        >
                            <X size={10} />
                        </button>
                    )}
                </div>

                <div className="flex max-w-full gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onEstadoChange(tab.key)}
                            className={clsx(
                                'shrink-0 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold transition-colors',
                                estado === tab.key
                                    ? 'bg-brand-green text-white shadow-sm'
                                    : 'bg-black/[0.015] text-ink-muted hover:bg-black/[0.04] dark:bg-white/[0.02] dark:text-ink-muted-dark dark:hover:bg-white/[0.05]',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {citas.length === 0 ? (
                <div className="mt-3 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-8 text-center dark:border-surface-border-dark">
                    <CalendarDays size={20} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                    <p className="mt-2 text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">No se encontraron citas</p>
                    <p className="mt-0.5 text-[9px] text-ink-muted/60 dark:text-ink-muted-dark/60">Prueba otro filtro o registra una nueva cita</p>
                </div>
            ) : (
                <>
                    <div className="mt-3 hidden overflow-hidden rounded-xl border border-surface-border dark:border-surface-border-dark md:block">
                        <div className="grid min-w-[780px] grid-cols-[minmax(170px,1.4fr)_78px_76px_minmax(100px,1fr)_82px_94px_120px] items-center bg-black/[0.018] px-3 py-2 text-[8px] font-bold uppercase tracking-wider text-ink-muted dark:bg-white/[0.025] dark:text-ink-muted-dark">
                            <span>Paciente</span><span>Fecha</span><span>Horario</span><span>Consulta</span><span>Estado</span><span>Especialidad</span><span className="text-right">Acciones</span>
                        </div>
                        <div className="divide-y divide-surface-border/60 dark:divide-surface-border-dark/60">
                            {citas.map((cita) => {
                                const badge = ESTADOS_BADGE[cita.estado] ?? { class: 'badge-ghost', label: cita.estado };
                                const nombre = cita.paciente?.nombre_completo ?? 'Paciente';
                                return (
                                    <div key={cita.id_cita} className="group grid min-w-[780px] grid-cols-[minmax(170px,1.4fr)_78px_76px_minmax(100px,1fr)_82px_94px_120px] items-center px-3 py-2.5 transition-colors hover:bg-brand-green/[0.025]">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-[8px] font-bold text-brand-green-dark dark:text-brand-green">{nombre.slice(0, 2).toUpperCase()}</span>
                                            <div className="min-w-0"><p className="truncate text-[10.5px] font-semibold text-ink dark:text-ink-dark">{nombre}</p><p className="truncate text-[8px] text-ink-muted dark:text-ink-muted-dark">CI {cita.paciente?.ci ?? 'â€”'}</p></div>
                                        </div>
                                        <span className="text-[9.5px] font-medium capitalize text-ink-muted dark:text-ink-muted-dark">{fechaLegible(cita.fecha_cita)}</span>
                                        <span className="flex items-center gap-1 text-[10px] font-bold tabular-nums text-ink dark:text-ink-dark"><Clock3 size={9} className="text-brand-green" />{cita.hora_inicio}</span>
                                        <span className="truncate text-[9.5px] text-ink-muted dark:text-ink-muted-dark">{cita.tipo_cita}</span>
                                        <span><span className={clsx('pill text-[7.5px]', badge.class)}>{badge.label}</span></span>
                                        <span className="truncate text-[8.5px] text-ink-muted dark:text-ink-muted-dark">{cita.tipo_profesional === 'endocrinologo' ? 'Endocrinología' : 'Nutrición'}</span>
                                        <div className="flex justify-end"><AccionesCita cita={cita} prefijo={prefijo} /></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-3 space-y-2 md:hidden">
                        {citas.map((cita) => {
                            const badge = ESTADOS_BADGE[cita.estado] ?? { class: 'badge-ghost', label: cita.estado };
                            const nombre = cita.paciente?.nombre_completo ?? 'Paciente';
                            return (
                                <article key={cita.id_cita} className="rounded-xl border border-surface-border bg-black/[0.008] p-3 dark:border-surface-border-dark dark:bg-white/[0.01]">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-[9px] font-bold text-brand-green-dark dark:text-brand-green">{nombre.slice(0, 2).toUpperCase()}</span>
                                            <div className="min-w-0"><p className="truncate text-[11px] font-semibold text-ink dark:text-ink-dark">{nombre}</p><p className="text-[8.5px] text-ink-muted dark:text-ink-muted-dark">{cita.tipo_cita}</p></div>
                                        </div>
                                        <span className={clsx('pill shrink-0 text-[7.5px]', badge.class)}>{badge.label}</span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-surface-border/60 pt-2.5 dark:border-surface-border-dark/60">
                                        <span className="flex items-center gap-1 text-[8.5px] text-ink-muted dark:text-ink-muted-dark"><CalendarDays size={9} />{fechaLegible(cita.fecha_cita)}</span>
                                        <span className="flex items-center gap-1 text-[8.5px] font-bold text-ink dark:text-ink-dark"><Clock3 size={9} />{cita.hora_inicio}</span>
                                        <span className="flex items-center justify-end gap-1 truncate text-[8.5px] text-ink-muted dark:text-ink-muted-dark"><Stethoscope size={9} />{cita.tipo_profesional === 'endocrinologo' ? 'Endocrino' : 'Nutrición'}</span>
                                    </div>
                                    <div className="mt-2.5 flex items-center justify-between rounded-lg bg-black/[0.018] px-2 py-1.5 dark:bg-white/[0.02]">
                                        <span className="text-[8px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">Gestionar cita</span>
                                        <AccionesCita cita={cita} prefijo={prefijo} compactas />
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}




