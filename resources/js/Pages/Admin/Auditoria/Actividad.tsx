declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { useEffect, useState } from 'react';

interface ActivityUser { id: number; name: string; email?: string | null; }

interface ActivityRow {
    id: number;
    log_name?: string | null;
    description: string;
    event?: string | null;
    created_at?: string | null;
    causer?: ActivityUser | null;
    subject_type?: string | null;
    subject_id?: number | null;
}

interface PaginatedActivities {
    data: ActivityRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; };
}

interface Filters { buscar: string; paciente: string; }

interface Props extends PageProps {
    actividades: PaginatedActivities;
    filtros: Filters;
}

export default function Actividad({ actividades, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [paciente, setPaciente] = useState(filtros.paciente ?? '');

    useEffect(() => {
        setBuscar(filtros.buscar ?? '');
        setPaciente(filtros.paciente ?? '');
    }, [filtros.buscar, filtros.paciente]);

    const applyFilters = (page = 1) => {
        router.get(route('admin.auditoria.actividad'), { buscar, paciente, page }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setBuscar(''); setPaciente('');
        router.get(route('admin.auditoria.actividad'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const pageCount = actividades.meta?.last_page ?? 1;

    return (
        <AuthenticatedLayout header={<h2>Actividad de pacientes</h2>}>
            <Head title="Actividad de pacientes" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold text-base-content">Actividad</h2>
                        <p className="text-sm text-base-content/60">Eventos generados por el módulo de pacientes.</p>
                    </div>
                    <Link href={route('admin.auditoria.pacientes')} className="btn btn-ghost btn-sm">Volver a pacientes</Link>
                </div>

                {/* Filtros */}
                <form className="bg-base-100 border border-base-300 rounded-2xl p-4" onSubmit={(e) => { e.preventDefault(); applyFilters(1); }}>
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Buscar</span></div>
                            <input type="text" className="input input-bordered input-sm w-full" placeholder="Evento, descripción o usuario" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Paciente ID</span></div>
                            <input type="text" className="input input-bordered input-sm w-full" value={paciente} onChange={(e) => setPaciente(e.target.value)} />
                        </label>
                        <div className="flex gap-2 items-end">
                            <button type="submit" className="btn btn-primary btn-sm">Filtrar</button>
                            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={clearFilters}><X size={14} /> Limpiar</button>
                        </div>
                    </div>
                </form>

                {/* Tabla */}
                <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="border-base-300">
                                    <th>Fecha</th>
                                    <th>Evento</th>
                                    <th>Descripción</th>
                                    <th>Usuario</th>
                                    <th>Subject</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actividades.data.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-base-content/50">No se encontraron actividades.</td></tr>
                                ) : actividades.data.map((a) => (
                                    <tr key={a.id} className="hover border-base-300">
                                        <td className="text-xs">{a.created_at ?? '-'}</td>
                                        <td><Badge variante="ghost">{a.event ?? '-'}</Badge></td>
                                        <td className="text-sm">{a.description}</td>
                                        <td className="text-xs">{a.causer?.name ?? '-'}</td>
                                        <td className="text-xs">{a.subject_type ?? '-'} {a.subject_id ?? ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 py-3 border-t border-base-300">
                        <p className="text-xs text-base-content/50">Total: {actividades.meta.total} eventos</p>
                        {pageCount > 1 ? (
                            <div className="join">
                                {actividades.links.map((link, i) => {
                                    const label = link.label.replace('&laquo; Previous', '«').replace('Next &raquo;', '»');
                                    return (
                                        <button key={`${label}-${i}`} className={`join-item btn btn-xs ${link.active ? 'btn-primary' : 'btn-ghost'}`} disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true, replace: true })}>
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
