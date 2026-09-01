declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import CampoUsuario from './components/CampoUsuario';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import { Boton, BotonLink } from '@/Components/ui/boton';
import Alerta from '@/Components/ui/alerta';

type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

interface RoleOption {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    estado: EstadoUsuario;
    roles?: RoleOption[];
    rol_principal?: RoleOption | null;
}

interface Props extends PageProps {
    user: UserRow;
    roles: RoleOption[];
    estados: EstadoUsuario[];
}

const selectClass =
    'w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] capitalize text-ink outline-none transition-colors focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';

export default function Edit({ user, roles, estados, flash }: Props) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
        password: '',
        estado: user.estado ?? 'activo',
        id_rol: String(user.rol_principal?.id_rol ?? user.roles?.[0]?.id_rol ?? ''),
    });

    return (
        <AuthenticatedLayout header={<h2>Editar usuario</h2>}>
            <Head title={`Editar usuario: ${user.name}`} />

            <div className="mx-auto max-w-3xl space-y-5">
                {flash?.success ? <Alerta tipo="success">{flash.success}</Alerta> : null}
                {flash?.error ? <Alerta tipo="error">{flash.error}</Alerta> : null}

                <div className="card-elevated overflow-hidden">
                    {/* Cabecera con avatar del usuario */}
                    <div className="flex items-center gap-3 border-b border-surface-border bg-brand-green-soft/[0.18] px-5 py-4 dark:border-surface-border-dark dark:bg-brand-green-dark/10">
                        <AvatarIniciales nombre={user.name} size={42} />
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-[15px] font-bold text-ink dark:text-ink-dark">{user.name}</h2>
                            <p className="truncate text-[11.5px] text-ink-muted dark:text-ink-muted-dark">{user.email}</p>
                        </div>
                        <ShieldCheck size={18} className="shrink-0 text-brand-green-dark dark:text-brand-green" />
                    </div>

                    <form
                        className="p-5"
                        onSubmit={(e) => {
                            e.preventDefault();
                            patch(route('admin.users.update', user.id), { onSuccess: () => reset('password') });
                        }}
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <CampoUsuario label="Nombre" value={data.name} onChange={(v) => setData('name', v)} error={errors.name} required autoComplete="name" />
                            <CampoUsuario label="Correo electrónico" type="email" value={data.email} onChange={(v) => setData('email', v)} error={errors.email} required autoComplete="email" />
                            <CampoUsuario label="Nueva contraseña" type="password" value={data.password} onChange={(v) => setData('password', v)} error={errors.password} hint="Déjala vacía si no deseas cambiarla." autoComplete="new-password" />

                            <label className="block">
                                <span className="mb-1.5 block text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">Estado *</span>
                                <select value={data.estado} onChange={(e) => setData('estado', e.target.value as EstadoUsuario)} className={selectClass}>
                                    {estados.map((est) => <option key={est} value={est}>{est}</option>)}
                                </select>
                                {errors.estado ? <span className="mt-1 block text-[10.5px] text-category-fruits dark:text-[#FF7468]">{errors.estado}</span> : null}
                            </label>

                            <label className="block sm:col-span-2">
                                <span className="mb-1.5 block text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">Rol activo *</span>
                                <select value={data.id_rol} onChange={(e) => setData('id_rol', e.target.value)} className={selectClass}>
                                    <option value="">Selecciona un rol</option>
                                    {roles.map((r) => <option key={r.id_rol} value={String(r.id_rol)}>{r.nombre}</option>)}
                                </select>
                                {errors.id_rol ? <span className="mt-1 block text-[10.5px] text-category-fruits dark:text-[#FF7468]">{errors.id_rol}</span> : null}
                            </label>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                            <BotonLink href={route('admin.users.index')} variante="ghost">
                                <ArrowLeft size={13} strokeWidth={1.8} /> Cancelar
                            </BotonLink>
                            <Boton type="submit" disabled={processing}>
                                <Save size={13} strokeWidth={1.8} /> {processing ? 'Actualizando...' : 'Actualizar'}
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
