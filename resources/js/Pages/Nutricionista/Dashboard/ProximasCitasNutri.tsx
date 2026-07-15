import clsx from 'clsx';
import { Filter, Plus, Search } from 'lucide-react';
import { Link } from '@inertiajs/react';
import Tarjeta from '@/Components/ui/tarjeta';

interface Cita {
    paciente: string;
    plan: 'Hipocalorico' | 'Cetogenico' | 'Mediterraneo' | 'DASH' | 'Equilibrado';
    imc: string;
    proximaCita: string;
    estado: 'Confirmada' | 'Pendiente';
}

const planStyles: Record<Cita['plan'], string> = {
    Hipocalorico: 'bg-category-grains/20 text-category-grains dark:bg-category-grains/25',
    Cetogenico: 'bg-category-fruits/20 text-category-fruits dark:bg-category-fruits/25',
    Mediterraneo: 'bg-category-veggies/20 text-category-veggies dark:bg-category-veggies/25',
    DASH: 'bg-category-protein/20 text-category-protein dark:bg-category-protein/25',
    Equilibrado: 'bg-category-dairy/20 text-category-dairy dark:bg-category-dairy/25',
};

const citas: Cita[] = [
    { paciente: 'Ana Torres', plan: 'Hipocalorico', imc: '28.4', proximaCita: '18 Jul', estado: 'Confirmada' },
    { paciente: 'Maria Rojas', plan: 'Mediterraneo', imc: '26.1', proximaCita: '19 Jul', estado: 'Pendiente' },
    { paciente: 'Sofia Vargas', plan: 'Cetogenico', imc: '31.2', proximaCita: '20 Jul', estado: 'Confirmada' },
    { paciente: 'Laura Mendez', plan: 'DASH', imc: '24.8', proximaCita: '21 Jul', estado: 'Confirmada' },
    { paciente: 'Diana Cruz', plan: 'Equilibrado', imc: '27.5', proximaCita: '22 Jul', estado: 'Pendiente' },
];

export default function ProximasCitasNutri() {
    return (
        <Tarjeta>
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
                <div>
                    <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                        Proximos controles
                    </h3>
                    <div className="mt-2 flex gap-4 border-b border-surface-border text-[12.5px] text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                        <span className="border-b-2 border-brand-green-dark pb-2 font-semibold text-brand-green-dark dark:text-brand-green">
                            Todos
                        </span>
                        <span className="cursor-pointer pb-2">Confirmados</span>
                        <span className="cursor-pointer pb-2">Pendientes</span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <Search
                            size={13}
                            strokeWidth={1.8}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark"
                        />
                        <input
                            placeholder="Buscar paciente"
                            className="rounded-lg border border-surface-border bg-[#FAF9F6] py-1.5 pl-7 pr-3 text-xs
                                text-ink-muted outline-none focus:border-brand-green/40
                                dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-muted-dark"
                        />
                    </div>
                    <button
                        type="button"
                        className="flex items-center gap-1 rounded-lg border border-surface-border px-3.5 py-1.5
                            text-xs text-ink dark:border-surface-border-dark dark:text-ink-dark"
                    >
                        <Filter size={12} strokeWidth={1.8} /> Filtrar
                    </button>
                    <Link
                        href="/nutricionista/pacientes/create"
                        className="flex items-center gap-1 rounded-lg bg-brand-green px-4 py-2 text-xs font-bold text-white
                            hover:bg-brand-green-dark transition-colors"
                    >
                        <Plus size={14} strokeWidth={1.8} /> Nuevo paciente
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                    <thead>
                        <tr className="border-b border-surface-border text-left text-[11px] font-semibold text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                            <th className="px-2.5 py-2">Paciente</th>
                            <th className="px-2.5 py-2">Plan nutricional</th>
                            <th className="px-2.5 py-2">IMC</th>
                            <th className="px-2.5 py-2">Proxima cita</th>
                            <th className="px-2.5 py-2">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.map((cita) => (
                            <tr
                                key={cita.paciente}
                                className="border-b border-[#F5F2EB] text-[12.5px] dark:border-[#262A32]"
                            >
                                <td className="px-2.5 py-2.5 font-semibold text-ink dark:text-ink-dark">
                                    {cita.paciente}
                                </td>
                                <td className="px-2.5 py-2.5">
                                    <span className={clsx('pill', planStyles[cita.plan])}>
                                        {cita.plan}
                                    </span>
                                </td>
                                <td className="px-2.5 py-2.5 text-ink dark:text-ink-dark">{cita.imc}</td>
                                <td className="px-2.5 py-2.5 text-ink dark:text-ink-dark">{cita.proximaCita}</td>
                                <td className="px-2.5 py-2.5">
                                    <span
                                        className={clsx(
                                            'inline-flex items-center gap-1.5 text-[11.5px] font-semibold',
                                            cita.estado === 'Confirmada'
                                                ? 'text-brand-green-dark dark:text-brand-green'
                                                : 'text-ink-muted dark:text-ink-muted-dark'
                                        )}
                                    >
                                        <span
                                            className={clsx(
                                                'status-dot',
                                                cita.estado === 'Confirmada'
                                                    ? 'bg-brand-green-dark'
                                                    : 'bg-[#E4E0D6] dark:bg-[#2B2F38]'
                                            )}
                                        />
                                        {cita.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Tarjeta>
    );
}
