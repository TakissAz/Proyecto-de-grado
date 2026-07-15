declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

interface RoleOption {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
}

interface Props extends PageProps {
    roles: RoleOption[];
    estados: EstadoUsuario[];
}

export default function Create({ roles, estados, flash }: Props) {
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

            <div className="space-y-5">
                <div className="bg-base-100 border border-base-300 rounded-2xl p-5">
                    <div className="mb-5">
                        <h2 className="text-xl font-extrabold text-base-content">Nuevo usuario</h2>
                        <p className="text-sm text-base-content/60">Completa los datos para crear una cuenta y asignar su rol activo.</p>
                    </div>

                    {flash?.success ? <div className="alert alert-success text-sm mb-4">{flash.success}</div> : null}
                    {flash?.error ? <div className="alert alert-error text-sm mb-4">{flash.error}</div> : null}

                    <form
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            post(route('admin.users.store'), { onSuccess: () => reset('password') });
                        }}
                    >
                        <Inp label="Nombre" value={data.name} onChange={(v) => setData('name', v)} error={errors.name} required />
                        <Inp label="Correo electrónico" type="email" value={data.email} onChange={(v) => setData('email', v)} error={errors.email} required />
                        <Inp label="Contraseña" type="password" value={data.password} onChange={(v) => setData('password', v)} error={errors.password} required />

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Estado</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.estado} onChange={(e) => setData('estado', e.target.value as EstadoUsuario)}>
                                {estados.map((est) => <option key={est} value={est}>{est}</option>)}
                            </select>
                            {errors.estado ? <div className="label"><span className="label-text-alt text-error text-xs">{errors.estado}</span></div> : null}
                        </label>

                        <label className="form-control w-full md:col-span-2">
                            <div className="label"><span className="label-text text-xs">Rol activo</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.id_rol} onChange={(e) => setData('id_rol', e.target.value)}>
                                <option value="">Selecciona un rol</option>
                                {roles.map((r) => <option key={r.id_rol} value={String(r.id_rol)}>{r.nombre}</option>)}
                            </select>
                            {errors.id_rol ? <div className="label"><span className="label-text-alt text-error text-xs">{errors.id_rol}</span></div> : null}
                        </label>

                        <div className="md:col-span-2 flex gap-2 justify-end pt-2">
                            <Link href={route('admin.users.index')} className="btn btn-ghost btn-sm">Cancelar</Link>
                            <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={processing}>
                                <Save size={14} /> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Inp({ label, value, onChange, error, type = 'text', required }: {
    label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; required?: boolean;
}) {
    return (
        <label className="form-control w-full">
            <div className="label"><span className="label-text text-xs">{label}{required ? ' *' : ''}</span></div>
            <input type={type} className="input input-bordered input-sm w-full" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
            {error ? <div className="label"><span className="label-text-alt text-error text-xs">{error}</span></div> : null}
        </label>
    );
}
