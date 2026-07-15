declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, CheckCircle, Ban, XCircle, X } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { useEffect, useMemo, useState } from 'react';

type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

interface RoleOption {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
    estado?: string | null;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    estado: EstadoUsuario;
    ultimo_acceso?: string | null;
    created_at?: string | null;
    roles?: RoleOption[];
    rol_principal?: RoleOption | null;
}

interface PaginatedUsers {
    data: UserRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

interface Filters {
    buscar: string;
    estado: string;
    rol: string;
}

interface Props extends PageProps {
    users: PaginatedUsers;
    roles: RoleOption[];
    filters: Filters;
}

function estadoVariante(estado: EstadoUsuario): 'success' | 'warning' | 'error' {
    if (estado === 'activo') return 'success';
    if (estado === 'inactivo') return 'warning';
    return 'error';
}

export default function Index({ users, roles, filters, flash }: Props) {
    const [buscar, setBuscar] = useState(filters.buscar ?? '');
    const [estado, setEstado] = useState(filters.estado ?? '');
    const [rol, setRol] = useState(filters.rol ?? '');

    useEffect(() => {
        setBuscar(filters.buscar ?? '');
        setEstado(filters.estado ?? '');
        setRol(filters.rol ?? '');
    }, [filters.buscar, filters.estado, filters.rol]);

    const estadoOptions = useMemo(
        () => [
            { value: '', label: 'Todos los estados' },
            { value: 'activo', label: 'Activo' },
            { value: 'inactivo', label: 'Inactivo' },
            { value: 'bloqueado', label: 'Bloqueado' },
        ],
        [],
    );

    const applyFilters = (page = 1) => {
        router.get(route('admin.users.index'), { buscar, estado, rol, page }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setBuscar('');
        setEstado('');
        setRol('');
        router.get(route('admin.users.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const pageCount = users.meta?.last_page ?? 1;
    const currentPage = users.meta?.current_page ?? 1;

    return (
        <AuthenticatedLayout header={<h2>Usuarios</h2>}>
            <Head title="Usuarios" />

            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold text-base-content">Gestión de usuarios</h2>
                        <p className="text-sm text-base-content/60">Busca, filtra y administra cuentas del sistema.</p>
                    </div>
                    <Link href={route('admin.users.create')} className="btn btn-primary btn-sm gap-1.5">
                        <Plus size={15} /> Crear usuario
                    </Link>
                </div>

                {/* Flash */}
                {flash?.success ? <div className="alert alert-success text-sm">{flash.success}</div> : null}
                {flash?.error ? <div className="alert alert-error text-sm">{flash.error}</div> : null}

                {/* Filtros */}
                <form
                    className="bg-base-100 border border-base-300 rounded-2xl p-4"
                    onSubmit={(e) => { e.preventDefault(); applyFilters(1); }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Buscar</span></div>
                            <input type="text" className="input input-bordered input-sm w-full" placeholder="Nombre o correo" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Estado</span></div>
                            <select className="select select-bordered select-sm w-full" value={estado} onChange={(e) => setEstado(e.target.value)}>
                                {estadoOptions.map((o) => <option key={o.value || 'all'} value={o.value}>{o.label}</option>)}
                            </select>
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Rol</span></div>
                            <select className="select select-bordered select-sm w-full" value={rol} onChange={(e) => setRol(e.target.value)}>
                                <option value="">Todos los roles</option>
                                {roles.map((r) => <option key={r.id_rol} value={String(r.id_rol)}>{r.nombre}</option>)}
                            </select>
                        </label>
                        <div className="flex gap-2 items-end">
                            <button type="submit" className="btn btn-primary btn-sm">Filtrar</button>
                            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={clearFilters}>
                                <X size={14} /> Limpiar
                            </button>
                        </div>
                    </div>
                </form>

                {/* Tabla */}
                <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr className="border-base-300">
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Último acceso</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-base-content/50">
                                            No se encontraron usuarios con los filtros actuales.
                                        </td>
                                    </tr>
                                ) : users.data.map((user) => (
                                    <tr key={user.id} className="hover border-base-300">
                                        <td className="font-semibold">{user.name}</td>
                                        <td className="text-base-content/60">{user.email}</td>
                                        <td>
                                            <div className="flex gap-1 flex-wrap">
                                                {(user.roles ?? []).length > 0
                                                    ? user.roles?.map((r) => <Badge key={`${user.id}-${r.id_rol}`} variante="ghost">{r.nombre}</Badge>)
                                                    : <Badge variante="ghost">Sin rol</Badge>
                                                }
                                            </div>
                                        </td>
                                        <td><Badge variante={estadoVariante(user.estado)}>{user.estado}</Badge></td>
                                        <td className="text-xs text-base-content/50">{user.ultimo_acceso ?? 'Sin registro'}</td>
                                        <td>
                                            <div className="flex gap-1 justify-end">
                                                <Link href={route('admin.users.edit', user.id)} className="btn btn-ghost btn-xs btn-square" aria-label="Editar">
                                                    <Pencil size={14} />
                                                </Link>
                                                <button
                                                    className="btn btn-ghost btn-xs btn-square text-success"
                                                    disabled={user.estado === 'activo'}
                                                    onClick={() => router.patch(route('admin.users.activar', user.id), {}, { preserveScroll: true })}
                                                    aria-label="Activar"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-xs btn-square text-warning"
                                                    disabled={user.estado === 'inactivo'}
                                                    onClick={() => router.patch(route('admin.users.inactivar', user.id), {}, { preserveScroll: true })}
                                                    aria-label="Inactivar"
                                                >
                                                    <Ban size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-xs btn-square text-error"
                                                    disabled={user.estado === 'bloqueado'}
                                                    onClick={() => router.patch(route('admin.users.bloquear', user.id), {}, { preserveScroll: true })}
                                                    aria-label="Bloquear"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4 py-3 border-t border-base-300">
                        <p className="text-xs text-base-content/50">Total: {users.meta.total} usuarios</p>
                        {pageCount > 1 ? (
                            <div className="join">
                                {users.links.map((link, i) => {
                                    const label = link.label.replace('&laquo; Previous', '«').replace('Next &raquo;', '»');
                                    return (
                                        <button
                                            key={`${label}-${i}`}
                                            className={`join-item btn btn-xs ${link.active ? 'btn-primary' : 'btn-ghost'}`}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true, replace: true })}
                                        >
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
