import clsx from 'clsx';
import { Users } from 'lucide-react';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import UsuarioAcciones from './UsuarioAcciones';
import UsuarioEstado from './UsuarioEstado';
import type { UserRow } from './types';
const columnas = ['Usuario', 'Rol asignado', 'Estado', 'Último acceso', ''] as const;
export default function UsuariosTabla({ usuarios, onEditar }: { usuarios: UserRow[]; onEditar: (usuario: UserRow) => void }) {
    if (!usuarios.length) return <div className="flex flex-col items-center gap-2 px-5 py-16 text-center"><Users size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" /><p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">No se encontraron usuarios</p><p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60">Prueba con otros criterios de búsqueda</p></div>;
    return <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse">
        <thead><tr className="border-b border-surface-border text-left text-[11px] font-semibold text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">{columnas.map((col, i) => <th key={col || i} className={clsx('px-3 py-2.5', i === 0 && 'px-5', i === columnas.length - 1 && 'px-5 text-right')}>{col}</th>)}</tr></thead>
        <tbody>{usuarios.map((usuario, index) => <tr key={usuario.id} className={clsx('border-b border-[#F5F2EB] transition-colors hover:bg-[#FAFAF8] dark:border-[#262A32] dark:hover:bg-white/[0.02]', index % 2 !== 0 && 'bg-[#FDFCFA] dark:bg-[#1A1D24]')}>
            <td className="px-5 py-3"><div className="flex items-center gap-2.5"><AvatarIniciales nombre={usuario.name} size={32} /><div className="min-w-0"><p className="truncate text-[12.5px] font-semibold leading-tight text-ink dark:text-ink-dark">{usuario.name}</p><p className="truncate text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{usuario.email}</p></div></div></td>
            <td className="px-3 py-3"><div className="flex max-w-[240px] flex-wrap gap-1">{(usuario.roles ?? []).length ? usuario.roles?.map((rol) => <span key={`${usuario.id}-${rol.id_rol}`} className="rounded-full bg-black/[0.035] px-2 py-1 text-[10.5px] font-medium capitalize text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark">{rol.nombre}</span>) : <span className="text-[11px] italic text-ink-muted/70 dark:text-ink-muted-dark/70">Sin rol asignado</span>}</div></td>
            <td className="px-3 py-3"><UsuarioEstado estado={usuario.estado} /></td><td className="px-3 py-3 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">{usuario.ultimo_acceso ?? 'Sin registro'}</td>
            <td className="px-5 py-3"><UsuarioAcciones id={usuario.id} estado={usuario.estado} onEditar={() => onEditar(usuario)} /></td>
        </tr>)}</tbody>
    </table></div>;
}
