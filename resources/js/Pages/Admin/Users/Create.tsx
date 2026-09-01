declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Save, UserPlus, ArrowLeft } from 'lucide-react';
import CampoUsuario from './components/CampoUsuario';
import { Boton, BotonLink } from '@/Components/ui/boton';
import Alerta from '@/Components/ui/alerta';

type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

interface RoleOption {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
}

interface Props extends PageProps {
    roles: RoleOption[];
}

const selectClass =
    'w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] capitalize text-ink outline-none transition-colors focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';

export default function Create({ roles, flash }: Props) {
    // Los usuarios nuevos se crean siempre en estado "activo" (no editable en el alta).
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        estado: 'activo' as EstadoUsuario,
        id_rol: '',
    });

    return (
        <AuthenticatedLayout header={<h2>Crear usuario</h2>}>
            <Head title="Crear usuario" />

            <div className="mx-auto max-w-3xl space-y-5">
                {flash?.success ? <Alerta tipo="success">{flash.success}</Alerta> : null}
                {flash?.error ? <Alerta tipo="error">{flash.error}</Alerta> : null}

                <div className="card-elevated overflow-hidden">
                    {/* Cabecera */}
                    <div className="flex items-center gap-3 border-b border-surface-border bg-brand-green-soft/[0.18] px-5 py-4 dark:border-surface-border-dark dark:bg-brand-green-dark/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <UserPlus size={19} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-ink dark:text-ink-dark">Nuevo usuario</h2>
                            <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark">Completa los datos para crear una cuenta y asignar su rol activo.</p>
                        </div>
                    </div>

                    <form
                        className="p-5"
                        autoComplete="off"
                        onSubmit={(e) => {
                            e.preventDefault();
                            post(route('admin.users.store'), { onSuccess: () => reset('password') });
                        }}
                    >
                        {/* Campo trampa oculto: engaña al autocompletado del navegador para que no rellene los campos reales */}
                        <input type="text" name="fakeusernameremembered" className="hidden" tabIndex={-1} autoComplete="off" />
                        <input type="password" name="fakepasswordremembered" className="hidden" tabIndex={-1} autoComplete="off" />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <CampoUsuario label="Nombre" value={data.name} onChange={(v) => setData('name', v)} error={errors.name} required autoComplete="off" />
                            <CampoUsuario label="Correo electrónico" type="email" value={data.email} onChange={(v) => setData('email', v)} error={errors.email} required autoComplete="off" />
                            <CampoUsuario label="Contraseña" type="password" value={data.password} onChange={(v) => setData('password', v)} error={errors.password} required autoComplete="new-password" />

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
                                <Save size={13} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Guardar'}
                            </Boton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
