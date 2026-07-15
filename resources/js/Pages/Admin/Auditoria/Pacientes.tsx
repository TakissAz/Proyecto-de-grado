declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, X } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { useEffect, useMemo, useState } from 'react';

type EstadoPaciente = 'activo' | 'inactivo';
type EstadoFlujoPaciente = 'pendiente_nutricion' | 'pendiente_endocrino' | 'en_seguimiento' | 'completo' | 'inactivo';

interface RoleOption { id_rol: number; nombre: string; descripcion?: string | null; estado?: string | null; }
interface UserOption { id: number; name: string; email: string; estado?: string | null; roles?: RoleOption[]; }

interface PacienteRow {
    id_paciente: number;
    user_id: number;
    nombre_completo?: string | null;
    ci: string;
    fecha_nacimiento: string;
    edad?: number | null;
    sexo: string;
    telefono?: string | null;
    direccion?: string | null;
    ocupacion?: string | null;
    estado_civil?: string | null;
    fecha_registro?: string | null;
    estado: EstadoPaciente;
    observaciones?: string | null;
    origen_registro?: string | null;
    estado_flujo?: EstadoFlujoPaciente | null;
    created_at?: string | null;
    updated_at?: string | null;
    user?: UserOption | null;
    creado_por_user?: UserOption | null;
    actualizado_por_user?: UserOption | null;
}

interface PaginatedPacientes {
    data: PacienteRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; };
}

interface Filters { buscar: string; estado: string; estado_flujo: string; origen_registro: string; }

interface Props extends PageProps {
    pacientes: PaginatedPacientes;
    filtros: Filters;
    estados: EstadoPaciente[];
    estados_flujo: EstadoFlujoPaciente[];
    origenes: string[];
}

function estadoVariante(estado: EstadoPaciente): 'success' | 'warning' {
    return estado === 'activo' ? 'success' : 'warning';
}

function flujoVariante(f?: EstadoFlujoPaciente | null): 'warning' | 'info' | 'success' | 'ghost' {
    if (f === 'pendiente_nutricion' || f === 'pendiente_endocrino') return 'warning';
    if (f === 'en_seguimiento') return 'info';
    if (f === 'completo') return 'success';
    return 'ghost';
}

export default function Pacientes({ pacientes, filtros, estados, estados_flujo, origenes, flash }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');
    const [estadoFlujo, setEstadoFlujo] = useState(filtros.estado_flujo ?? '');
    const [origenRegistro, setOrigenRegistro] = useState(filtros.origen_registro ?? '');

    useEffect(() => {
        setBuscar(filtros.buscar ?? '');
        setEstado(filtros.estado ?? '');
        setEstadoFlujo(filtros.estado_flujo ?? '');
        setOrigenRegistro(filtros.origen_registro ?? '');
    }, [filtros.buscar, filtros.estado, filtros.estado_flujo, filtros.origen_registro]);

    const applyFilters = (page = 1) => {
        router.get(route('admin.auditoria.pacientes'), { buscar, estado, estado_flujo: estadoFlujo, origen_registro: origenRegistro, page }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setBuscar(''); setEstado(''); setEstadoFlujo(''); setOrigenRegistro('');
        router.get(route('admin.auditoria.pacientes'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const pageCount = pacientes.meta?.last_page ?? 1;

    return (
        <AuthenticatedLayout header={<h2>Auditoría de pacientes</h2>}>
            <Head title="Auditoría de pacientes" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold text-base-content">Auditoría clínica</h2>
                        <p className="text-sm text-base-content/60">Revisa origen de registro, creador, editor y flujo clínico.</p>
                    </div>
                    <Link href={route('admin.auditoria.actividad')} className="btn btn-ghost btn-sm">Ver actividad</Link>
                </div>

                {flash?.success ? <div className="alert alert-success text-sm">{flash.success}</div> : null}
                {flash?.error ? <div className="alert alert-error text-sm">{flash.error}</div> : null}

                {/* Filtros */}
                <form className="bg-base-100 border border-base-300 rounded-2xl p-4" onSubmit={(e) => { e.preventDefault(); applyFilters(1); }}>
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-end">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Buscar</span></div>
                            <input type="text" className="input input-bordered input-sm w-full" placeholder="Nombre, correo, CI, teléfono, creador o editor" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Estado</span></div>
                            <select className="select select-bordered select-sm w-full" value={estado} onChange={(e) => setEstado(e.target.value)}>
                                <option value="">Todos</option>
                                {estados.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Flujo</span></div>
                            <select className="select select-bordered select-sm w-full" value={estadoFlujo} onChange={(e) => setEstadoFlujo(e.target.value)}>
                                <option value="">Todos</option>
                                {estados_flujo.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Origen</span></div>
                            <select className="select select-bordered select-sm w-full" value={origenRegistro} onChange={(e) => setOrigenRegistro(e.target.value)}>
                                <option value="">Todos</option>
                                {origenes.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
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
                                    <th>Estado</th>
                                    <th>Flujo</th>
                                    <th>Origen</th>
                                    <th>Creado por</th>
                                    <th>Actualizado por</th>
                                    <th>Creado</th>
                                    <th>Actualizado</th>
                                    <th className="text-right">Actividad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientes.data.length === 0 ? (
                                    <tr><td colSpan={10} className="text-center py-10 text-base-content/50">No se encontraron pacientes.</td></tr>
                                ) : pacientes.data.map((p) => (
                                    <tr key={p.id_paciente} className="hover border-base-300">
                                        <td>
                                            <p className="font-semibold">{p.nombre_completo ?? p.user?.name ?? 'Sin usuario'}</p>
                                            <p className="text-xs text-base-content/50">{p.user?.email ?? ''}</p>
                                        </td>
                                        <td>{p.ci}</td>
                                        <td><Badge variante={estadoVariante(p.estado)}>{p.estado}</Badge></td>
                                        <td><Badge variante={flujoVariante(p.estado_flujo)}>{p.estado_flujo ?? '-'}</Badge></td>
                                        <td className="text-xs">{p.origen_registro ?? '-'}</td>
                                        <td className="text-xs">{p.creado_por_user?.name ?? '-'}</td>
                                        <td className="text-xs">{p.actualizado_por_user?.name ?? '-'}</td>
                                        <td className="text-xs">{p.created_at ?? '-'}</td>
                                        <td className="text-xs">{p.updated_at ?? '-'}</td>
                                        <td className="text-right">
                                            <Link href={route('admin.auditoria.actividad', { paciente: p.id_paciente })} className="btn btn-ghost btn-xs btn-square text-info" aria-label="Ver actividad">
                                                <Eye size={14} />
                                            </Link>
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
