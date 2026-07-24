declare const route: any;
import Modal from '@/Components/ui/modal';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import { useForm } from '@inertiajs/react';
import { Save, ShieldCheck } from 'lucide-react';
import CampoUsuario from './CampoUsuario';
import type { EstadoUsuario, RoleOption, UserRow } from './types';
interface Props { usuario: UserRow; roles: RoleOption[]; onCerrar: () => void; }
const selectClass = 'w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] capitalize text-ink outline-none transition-colors focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';
export default function EditarUsuarioModal({ usuario, roles, onCerrar }: Props) {
    const { data, setData, patch, processing, errors } = useForm({ name: usuario.name, email: usuario.email, password: '', estado: usuario.estado, id_rol: String(usuario.rol_principal?.id_rol ?? usuario.roles?.[0]?.id_rol ?? '') });
    const userId = Number(usuario.id);
    const guardar = () => {
        if (!Number.isInteger(userId) || userId <= 0) return;
        patch(`/admin/users/${userId}`, { preserveScroll: true, onSuccess: onCerrar });
    };
    return <Modal abierto titulo="Editar usuario" subtitulo="Actualiza la cuenta sin salir del directorio." onCerrar={processing ? () => undefined : onCerrar}>
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-brand-green-soft/50 p-3 dark:bg-brand-green-dark/10"><AvatarIniciales nombre={usuario.name} size={38} /><div className="min-w-0"><p className="truncate text-[13px] font-semibold text-ink dark:text-ink-dark">{usuario.name}</p><p className="truncate text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{usuario.email}</p></div><ShieldCheck size={16} className="ml-auto shrink-0 text-brand-green-dark dark:text-brand-green" /></div>
        <form onSubmit={(event) => { event.preventDefault(); guardar(); }} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><CampoUsuario label="Nombre completo" value={data.name} onChange={(value) => setData('name', value)} error={errors.name} required autoComplete="name" /><CampoUsuario label="Correo electrÃ³nico" type="email" value={data.email} onChange={(value) => setData('email', value)} error={errors.email} required autoComplete="email" /></div>
            <CampoUsuario label="Nueva contraseÃ±a" type="password" value={data.password} onChange={(value) => setData('password', value)} error={errors.password} hint="DÃ©jala vacÃ­a para conservar la contraseÃ±a actual." autoComplete="new-password" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">Estado *</span><select value={data.estado} onChange={(event) => setData('estado', event.target.value as EstadoUsuario)} className={selectClass}><option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="bloqueado">Bloqueado</option></select>{errors.estado && <span className="mt-1 block text-[10.5px] text-category-fruits">{errors.estado}</span>}</label>
            <label><span className="mb-1.5 block text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">Rol activo *</span><select value={data.id_rol} onChange={(event) => setData('id_rol', event.target.value)} className={selectClass}><option value="">Selecciona un rol</option>{roles.map((rol) => <option key={rol.id_rol} value={String(rol.id_rol)}>{rol.nombre}</option>)}</select>{errors.id_rol && <span className="mt-1 block text-[10.5px] text-category-fruits">{errors.id_rol}</span>}</label></div>
            <div className="flex justify-end gap-2 border-t border-surface-border pt-4 dark:border-surface-border-dark"><button type="button" onClick={onCerrar} disabled={processing} className="rounded-lg px-3 py-2 text-[11.5px] font-semibold text-ink-muted hover:bg-black/[0.03] dark:text-ink-muted-dark dark:hover:bg-white/[0.04]">Cancelar</button><button type="submit" disabled={processing || !Number.isInteger(userId) || userId <= 0} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-4 py-2 text-[11.5px] font-semibold text-white hover:bg-brand-green-dark disabled:opacity-50"><Save size={13} /> {processing ? 'Guardando...' : 'Guardar cambios'}</button></div>
        </form>
    </Modal>;
}


