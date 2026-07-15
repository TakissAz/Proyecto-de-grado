import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, Search, X, Eye, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PageProps } from '@/types';

interface UserOption { name: string; email: string; }
interface PacienteRow { id_paciente: number; nombre_completo?: string | null; ci: string; fecha_nacimiento: string; edad?: number | null; telefono?: string | null; fecha_registro?: string | null; estado: 'activo' | 'inactivo'; user?: UserOption | null; }
interface PaginatedPacientes { data: PacienteRow[]; meta: { current_page: number; last_page: number; per_page: number; total: number }; }
interface Filters { buscar: string; }
interface Props extends PageProps { pacientes: PaginatedPacientes; filtros: Filters; }

export default function Index({ pacientes, filtros, flash }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const buscarRef = useRef(buscar); buscarRef.current = buscar;
    useEffect(() => { setBuscar(filtros.buscar ?? ''); }, [filtros.buscar]);

    const applyFilters = (page = 1) => { const p = new URLSearchParams(); if (buscarRef.current) p.set('buscar', buscarRef.current); p.set('page', String(page)); window.location.href = `/nutricionista/pacientes?${p.toString()}`; };
    const clearFilters = () => { setBuscar(''); window.location.href = '/nutricionista/pacientes'; };
    const cambiarEstado = (idPaciente: number, accion: 'activar' | 'inactivar') => {
        const form = document.createElement('form'); form.method = 'POST'; form.action = `/nutricionista/pacientes/${idPaciente}/${accion}`; form.style.display = 'none';
        const csrf = document.createElement('input'); csrf.name = '_token'; csrf.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const method = document.createElement('input'); method.name = '_method'; method.value = 'PATCH';
        form.appendChild(csrf); form.appendChild(method); document.body.appendChild(form); form.submit();
    };

    return (
        <AuthenticatedLayout header={<h2>Pacientes</h2>}>
            <Head title="Pacientes - Nutricionista" />
            <div className="space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div><h3 className="text-lg font-extrabold text-base-content">Pacientes de nutrición</h3><p className="text-xs text-base-content/60">Consulta y administra los registros.</p></div>
                    <Link href="/nutricionista/pacientes/create" className="btn btn-primary btn-sm gap-1.5"><Plus size={14} /> Registrar paciente</Link>
                </div>

                {flash?.success ? <div className="alert alert-success text-xs py-2">{flash.success}</div> : null}
                {flash?.error ? <div className="alert alert-error text-xs py-2">{flash.error}</div> : null}

                <form className="bg-base-100 border border-base-300 rounded-2xl p-4" onSubmit={e => { e.preventDefault(); applyFilters(1); }}>
                    <div className="flex gap-2 flex-wrap">
                        <input className="input input-bordered input-sm flex-1 min-w-[200px]" placeholder="Buscar por nombre, CI, correo o teléfono" value={buscar} onChange={e => setBuscar(e.target.value)} />
                        <button type="submit" className="btn btn-primary btn-sm gap-1"><Search size={14} /> Filtrar</button>
                        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={clearFilters}><X size={14} /> Limpiar</button>
                    </div>
                </form>

                <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead><tr className="text-base-content/50"><th>Paciente</th><th>CI</th><th>Contacto</th><th>Nacimiento</th><th>Edad</th><th>Registro</th><th className="text-right">Acciones</th></tr></thead>
                            <tbody>
                                {pacientes.data.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-10 text-base-content/50">No se encontraron pacientes.</td></tr>
                                ) : pacientes.data.map(p => (
                                    <tr key={p.id_paciente} className="hover">
                                        <td><p className="font-semibold text-sm">{p.nombre_completo ?? p.user?.name ?? 'Sin nombre'}</p><p className="text-[10px] text-base-content/40">{p.user?.email ?? ''}</p></td>
                                        <td className="text-xs">{p.ci}</td><td className="text-xs">{p.telefono ?? '-'}</td>
                                        <td className="text-xs">{p.fecha_nacimiento}</td><td className="text-xs">{p.edad ?? '-'}</td><td className="text-xs">{p.fecha_registro ?? '-'}</td>
                                        <td><div className="flex justify-end gap-1">
                                            <Link href={`/nutricionista/pacientes/${p.id_paciente}`} className="btn btn-ghost btn-xs"><Eye size={14} /></Link>
                                            <Link href={`/nutricionista/pacientes/${p.id_paciente}/edit`} className="btn btn-ghost btn-xs"><Edit size={14} /></Link>
                                            <button className="btn btn-ghost btn-xs text-success" disabled={p.estado === 'activo'} onClick={() => cambiarEstado(p.id_paciente, 'activar')}><CheckCircle size={14} /></button>
                                            <button className="btn btn-ghost btn-xs text-warning" disabled={p.estado === 'inactivo'} onClick={() => cambiarEstado(p.id_paciente, 'inactivar')}><XCircle size={14} /></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 text-xs text-base-content/50">
                        <span>Total: {pacientes.meta.total} pacientes</span>
                        <div className="join">{Array.from({ length: pacientes.meta.last_page }, (_, i) => (<button key={i} className={`join-item btn btn-xs ${pacientes.meta.current_page === i + 1 ? 'btn-active' : ''}`} onClick={() => applyFilters(i + 1)}>{i + 1}</button>))}</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
