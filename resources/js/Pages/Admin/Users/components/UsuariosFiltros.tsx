declare const route: any;

import { Filter, Plus, Search, X } from 'lucide-react';
import { BotonLink } from '@/Components/ui/boton';
import type { RoleOption } from './types';

interface Props {
    total: number; buscar: string; estado: string; rol: string; roles: RoleOption[];
    onBuscarChange: (value: string) => void; onEstadoChange: (value: string) => void;
    onRolChange: (value: string) => void; onSubmit: () => void; onLimpiar: () => void;
}

const control = 'rounded-lg border border-surface-border bg-[#FAF9F6] py-1.5 text-xs text-ink outline-none transition-colors focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';

export default function UsuariosFiltros({ total, buscar, estado, rol, roles, onBuscarChange, onEstadoChange, onRolChange, onSubmit, onLimpiar }: Props) {
    const hayFiltros = Boolean(buscar || estado || rol);
    return (
        <div className="px-5 pb-4 pt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">Directorio de usuarios</h3>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted dark:text-ink-muted-dark">{total} cuenta{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''} en el sistema</p>
                </div>
                <BotonLink href={route('admin.users.create')} variante="primary" tamano="md"><Plus size={14} strokeWidth={1.8} /> Nuevo usuario</BotonLink>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search size={14} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark" />
                    <input value={buscar} onChange={(e) => onBuscarChange(e.target.value)} placeholder="Buscar por nombre o correo..." className={`${control} w-full pl-8 pr-3`} />
                </div>
                <select value={estado} onChange={(e) => onEstadoChange(e.target.value)} className={`${control} min-w-[155px] px-3`} aria-label="Filtrar por estado">
                    <option value="">Todos los estados</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="bloqueado">Bloqueado</option>
                </select>
                <select value={rol} onChange={(e) => onRolChange(e.target.value)} className={`${control} min-w-[165px] px-3`} aria-label="Filtrar por rol">
                    <option value="">Todos los roles</option>{roles.map((item) => <option key={item.id_rol} value={String(item.id_rol)}>{item.nombre}</option>)}
                </select>
                <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand-green/40 dark:border-surface-border-dark dark:text-ink-dark"><Filter size={12} /> Filtrar</button>
                {hayFiltros && <button type="button" onClick={onLimpiar} className="inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark"><X size={12} /> Limpiar</button>}
            </form>
        </div>
    );
}
