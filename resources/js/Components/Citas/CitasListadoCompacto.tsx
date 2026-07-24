import { Edit, Plus, Search } from 'lucide-react';
import clsx from 'clsx';
import { BotonLink } from '@/Components/ui/boton';
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
}

const TABS = [
    { key: '', label: 'Todas' },
    { key: 'programada', label: 'Pendientes' },
    { key: 'confirmada', label: 'Confirmadas' },
    { key: 'atendida', label: 'Completadas' },
    { key: 'cancelada', label: 'Cruzadas' },
];

export default function CitasListadoCompacto({
    citas,
    paciente,
    estado,
    prefijo,
    onPacienteChange,
    onBuscar,
    onEstadoChange,
}: Props) {
    return (
        <section className="border-t border-surface-border pt-4 dark:border-surface-border-dark">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 rounded-lg border border-surface-border px-2.5 py-1.5 dark:border-surface-border-dark sm:w-56">
                    <Search size={12} strokeWidth={1.8} className="shrink-0 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    <input
                        type="search"
                        value={paciente}
                        onChange={(event) => onPacienteChange(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && onBuscar()}
                        placeholder="Buscar paciente..."
                        className="flex-1 bg-transparent text-[11px] text-ink outline-none placeholder:text-ink-muted/50 dark:text-ink-dark dark:placeholder:text-ink-muted-dark/50"
                    />
                </label>

                <div className="flex flex-wrap items-center gap-1.5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onEstadoChange(tab.key)}
                            className={clsx(
                                'rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors',
                                estado === tab.key
                                    ? 'bg-brand-green text-white shadow-sm'
                                    : 'text-ink-muted hover:bg-black/[0.03] dark:text-ink-muted-dark dark:hover:bg-white/[0.03]',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <BotonLink href={`/${prefijo}/citas/create`} variante="primary" tamano="xs">
                        <Plus size={11} strokeWidth={2} /> Nueva
                    </BotonLink>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                        <tr className="border-b border-surface-border text-left text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                            <th className="px-2 py-1.5">Paciente</th>
                            <th className="px-2 py-1.5">Fecha</th>
                            <th className="px-2 py-1.5">Hora</th>
                            <th className="px-2 py-1.5">Tipo</th>
                            <th className="px-2 py-1.5">Estado</th>
                            <th className="px-2 py-1.5">Origen</th>
                            <th className="px-2 py-1.5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-6 text-center text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                    Sin citas registradas
                                </td>
                            </tr>
                        ) : citas.map((cita) => {
                            const badge = ESTADOS_BADGE[cita.estado] ?? { class: 'badge-ghost', label: cita.estado };
                            const nombre = cita.paciente?.nombre_completo ?? '—';

                            return (
                                <tr key={cita.id_cita} className="border-b border-surface-border/40 text-[11.5px] transition-colors hover:bg-black/[0.01] dark:border-surface-border-dark/40 dark:hover:bg-white/[0.01]">
                                    <td className="px-2 py-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand-green/10 text-[7px] font-bold text-brand-green-dark dark:text-brand-green">
                                                {nombre.slice(0, 2).toUpperCase()}
                                            </span>
                                            <span className="max-w-[140px] truncate font-semibold text-ink dark:text-ink-dark">{nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-ink-muted dark:text-ink-muted-dark">{cita.fecha_cita}</td>
                                    <td className="px-2 py-2 font-bold text-ink dark:text-ink-dark">{cita.hora_inicio}</td>
                                    <td className="px-2 py-2 text-ink-muted dark:text-ink-muted-dark">{cita.tipo_cita}</td>
                                    <td className="px-2 py-2"><span className={clsx('pill text-[8px]', badge.class)}>{badge.label}</span></td>
                                    <td className="px-2 py-2 text-[10px] capitalize text-ink-muted/70 dark:text-ink-muted-dark/70">
                                        {cita.tipo_profesional === 'endocrinologo' ? 'Endocrinología' : 'Nutrición'}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {['programada', 'confirmada'].includes(cita.estado) && (
                                            <BotonLink href={`/${prefijo}/citas/${cita.id_cita}/edit`} variante="ghost" tamano="xs">
                                                <Edit size={11} />
                                            </BotonLink>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
