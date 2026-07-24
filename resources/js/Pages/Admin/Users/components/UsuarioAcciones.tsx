declare const route: any;
import { router } from '@inertiajs/react';
import { Ban, CheckCircle2, LockKeyhole, Pencil } from 'lucide-react';
import type { EstadoUsuario } from './types';
const base = 'flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-25';
export default function UsuarioAcciones({ id, estado, onEditar }: { id: number; estado: EstadoUsuario; onEditar: () => void }) {
    const cambiar = (accion: 'activar' | 'inactivar' | 'bloquear') => router.patch(`/admin/users/${id}/${accion}`, {}, { preserveScroll: true });
    return <div className="flex items-center justify-end gap-0.5"><button type="button" onClick={onEditar} title="Editar usuario" className={`${base} text-ink-muted hover:bg-brand-orange/10 hover:text-brand-orange dark:text-ink-muted-dark`}><Pencil size={13} /></button><button type="button" disabled={estado === 'activo'} onClick={() => cambiar('activar')} title="Activar usuario" className={`${base} text-ink-muted hover:bg-brand-green-soft hover:text-brand-green-dark dark:text-ink-muted-dark dark:hover:bg-brand-green-dark/20 dark:hover:text-brand-green`}><CheckCircle2 size={13} /></button><button type="button" disabled={estado === 'inactivo'} onClick={() => cambiar('inactivar')} title="Inactivar usuario" className={`${base} text-ink-muted hover:bg-brand-orange/10 hover:text-brand-orange dark:text-ink-muted-dark`}><Ban size={13} /></button><button type="button" disabled={estado === 'bloqueado'} onClick={() => cambiar('bloquear')} title="Bloquear usuario" className={`${base} text-ink-muted hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark dark:hover:text-[#FF7468]`}><LockKeyhole size={13} /></button></div>;
}

