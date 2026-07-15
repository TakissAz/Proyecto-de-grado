declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Pencil, CheckCircle, Ban, X } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { useEffect, useRef, useState } from 'react';

interface UserOption { name: string; email: string; }

interface PacienteRow {
    id_paciente: number;
    nombre_completo?: string | null;
    ci: string;
    fecha_nacimiento: string;
    edad?: number | null;
    telefono?: string | null;
    fecha_registro?: string | null;
    estado: 'activo' | 'inactivo';
    user?: UserOption | null;
}

interface PaginatedPacientes {
    data: PacienteRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; };
}

interface Filters { buscar: string; }

interface Props extends PageProps {
    pacientes: PaginatedPacientes;
    filtros: Filters;
}

export default function Index({ pacientes, filtros, flash }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const buscarRef = useRef(buscar);
    buscarRef.current = buscar;

    useEffect(() => { setBuscar(filtros.buscar ?? ''); }, [filtros.buscar]);

    const applyFilters = (page = 1) => {
        const params = new URLSearchParams();
        if (buscarRef.current) params.set('buscar', buscarRef.current);
        params.set('page', String(page));
        window.location.href = `/admin/pacientes?${params.toString()}`;
    };

    const clearFilters = () => { setBuscar(''); window.location.href = '/admin/pacientes'; };

    const cambiarEstado = (idPaciente: number, accion: 'activar' | 'inactivar') => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/pacientes/${idPaciente}/${accion}`;
        form.style.display = 'none';
        const csrfInput = document.createElement('input');
        csrfInput.name = '_token';
        csrfInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const methodInput = document.createElement('input');
        methodInput.name = '_method';
        methodInput.value = 'PATCH';
        form.appendChild(csrfInput);
        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
    };

    const pageCount = pacientes.meta?.last_page ?? 1;

    return (
        <AuthenticatedLayout header={<h2>Pacientes</h2>}>
            <Head title="Pacientes" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold text-base-content">Gestión de pacientes</h2>
                        <p className="text-sm text-base-content/60">Busca y administra los registros clínicos base.</p>
                    </div>
                    <Link href={route('admin.pacientes.create')} className="btn btn-primary btn-sm gap-1.5">
                        <Plus size={15} /> Crear paciente
                    </Link>
                </div>

                {flash?.success ? <div className="alert alert-success text-sm">{flash.success}</div> : null}
                {flash?.error ? <div className="alert alert-error text-sm">{flash.error}</div> : null}

                {/* Filtros */}
                <form className="bg-base-100 border border-base-300 rounded-2xl p-4" onSubmit={(e) => { e.preventDefault(); applyFilters(1); }}>
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_auto] gap-3 items-end">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Buscar</span></div>
                            <input type="text" className="input input-bordered input-sm w-full" placeholder="Nombre, correo, CI o teléfono" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
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
                                    <th>Paciente</th>
                                    <th>CI</th>
                                    <th>Contacto</th>
                                    <th>Nacimiento</th>
                                    <th>Edad</th>
                                    <th>Registro</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientes.data.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-10 text-base-content/50">No se encontraron pacientes.</td></tr>
                                ) : pacientes.data.map((p) => (
                                    <tr key={p.id_paciente} className="hover border-base-300">
                                        <td>
                                            <p className="font-semibold">{p.nombre_completo ?? p.user?.name ?? 'Sin nombre'}</p>
                                            <p className="text-xs text-base-content/50">{p.user?.email ?? 'Sin correo'}</p>
                                        </td>
                                        <td>{p.ci}</td>
                                        <td>{p.telefono ?? '-'}</td>
                                        <td>{p.fecha_nacimiento}</td>
                                        <td>{p.edad ?? '-'}</td>
                                        <td className="text-xs">{p.fecha_registro ?? '-'}</td>
                                        <td>
                                            <div className="flex gap-1 justify-end">
                                                <Link href={route('admin.pacientes.show', { paciente: p.id_paciente })} className="btn btn-ghost btn-xs btn-square text-info" aria-label="Ver"><Eye size={14} /></Link>
                                                <Link href={route('admin.pacientes.edit', { paciente: p.id_paciente })} className="btn btn-ghost btn-xs btn-square" aria-label="Editar"><Pencil size={14} /></Link>
                                                <button className="btn btn-ghost btn-xs btn-square text-success" disabled={p.estado === 'activo'} onClick={() => cambiarEstado(p.id_paciente, 'activar')} aria-label="Activar"><CheckCircle size={14} /></button>
                                                <button className="btn btn-ghost btn-xs btn-square text-warning" disabled={p.estado === 'inactivo'} onClick={() => cambiarEstado(p.id_paciente, 'inactivar')} aria-label="Inactivar"><Ban size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 py-3 border-t border-base-300">
                        <p className="text-xs text-base-content/50">Total: {pacientes.meta.total} pacientes</p>
                        {pageCount > 1 ? (
                            <div className="join">
                                {pacientes.links.map((link, i) => {
                                    const label = link.label.replace('&laquo; Previous', '«').replace('Next &raquo;', '»');
                                    return (
                                        <button key={`${label}-${i}`} className={`join-item btn btn-xs ${link.active ? 'btn-primary' : 'btn-ghost'}`} disabled={!link.url} onClick={() => link.url && (window.location.href = link.url)}>
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
