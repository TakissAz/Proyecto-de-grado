declare const route: any;
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import EditarUsuarioModal from './components/EditarUsuarioModal';
import UsuariosFiltros from './components/UsuariosFiltros';
import UsuariosPaginacion from './components/UsuariosPaginacion';
import UsuariosTabla from './components/UsuariosTabla';
import type { PaginatedUsers, RoleOption, UserFilters, UserRow } from './components/types';
interface Props extends PageProps { users: PaginatedUsers; roles: RoleOption[]; filters: UserFilters; }
export default function UsuariosIndex({ users, roles, filters, flash }: Props) {
    const [buscar, setBuscar] = useState(filters.buscar ?? '');
    const [estado, setEstado] = useState(filters.estado ?? '');
    const [rol, setRol] = useState(filters.rol ?? '');
    const [usuarioEditar, setUsuarioEditar] = useState<UserRow | null>(null);
    useEffect(() => { setBuscar(filters.buscar ?? ''); setEstado(filters.estado ?? ''); setRol(filters.rol ?? ''); }, [filters.buscar, filters.estado, filters.rol]);
    const filtrar = (page = 1) => router.get(route('admin.users.index'), { buscar, estado, rol, page }, { preserveState: true, preserveScroll: true, replace: true });
    const limpiar = () => { setBuscar(''); setEstado(''); setRol(''); router.get(route('admin.users.index'), {}, { preserveState: true, preserveScroll: true, replace: true }); };
    return <AuthenticatedLayout title="Usuarios">
        <Head title="Gestión de usuarios" />
        <div className="space-y-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div>
                <div className="mb-1.5 flex items-center gap-2 text-brand-green-dark dark:text-brand-green"><ShieldCheck size={15} strokeWidth={1.8} /><span className="text-[10.5px] font-bold uppercase tracking-[0.14em]">Administración</span></div>
                <h1 className="text-[22px] font-bold tracking-tight text-ink dark:text-ink-dark">Gestión de usuarios</h1><p className="mt-1 text-[12.5px] text-ink-muted dark:text-ink-muted-dark">Controla las cuentas, roles y accesos del sistema desde un solo lugar.</p>
            </div><div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-3 py-2 shadow-card dark:border-surface-border-dark dark:bg-surface-card-dark dark:shadow-card-dark"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green-soft text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green"><Users size={15} /></span><div><p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Usuarios registrados</p><p className="text-[15px] font-bold leading-tight text-ink dark:text-ink-dark">{users.meta.total}</p></div></div></div>
            {flash?.success && <div className="rounded-xl border border-brand-green/20 bg-brand-green-soft/60 px-4 py-3 text-[12px] font-medium text-brand-green-dark dark:bg-brand-green-dark/15 dark:text-brand-green">{flash.success}</div>}
            {flash?.error && <div className="rounded-xl border border-category-fruits/20 bg-category-fruits/10 px-4 py-3 text-[12px] font-medium text-category-fruits dark:bg-category-fruits/15 dark:text-[#FF7468]">{flash.error}</div>}
            <section className="card-elevated overflow-hidden"><UsuariosFiltros total={users.meta.total} buscar={buscar} estado={estado} rol={rol} roles={roles} onBuscarChange={setBuscar} onEstadoChange={setEstado} onRolChange={setRol} onSubmit={() => filtrar(1)} onLimpiar={limpiar} /><UsuariosTabla usuarios={users.data} onEditar={setUsuarioEditar} /><UsuariosPaginacion mostrando={users.data.length} total={users.meta.total} paginaActual={users.meta.current_page} ultimaPagina={users.meta.last_page} onCambiarPagina={filtrar} /></section>
        </div>
        {usuarioEditar && <EditarUsuarioModal key={usuarioEditar.id} usuario={usuarioEditar} roles={roles} onCerrar={() => setUsuarioEditar(null)} />}
    </AuthenticatedLayout>;
}
