import clsx from 'clsx';
import type { EstadoUsuario } from './types';

const estilos: Record<EstadoUsuario, string> = {
    activo: 'bg-brand-green-soft text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green',
    inactivo: 'bg-brand-orange/10 text-[#B25F00] dark:bg-brand-orange/15 dark:text-brand-orange',
    bloqueado: 'bg-category-fruits/10 text-category-fruits dark:bg-category-fruits/15 dark:text-[#FF7468]',
};

export default function UsuarioEstado({ estado }: { estado: EstadoUsuario }) {
    return (
        <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold capitalize', estilos[estado])}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {estado}
        </span>
    );
}
