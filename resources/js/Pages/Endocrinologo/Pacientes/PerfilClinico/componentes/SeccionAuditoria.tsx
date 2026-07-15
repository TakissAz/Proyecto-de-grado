import { Clock } from 'lucide-react';
import Tarjeta from '@/Components/ui/tarjeta';
import type { Auditoria } from '../tipos';

interface Props {
    auditoria: Auditoria;
}

export default function SeccionAuditoria({ auditoria }: Props) {
    return (
        <Tarjeta>
            <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/[0.04] text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark">
                    <Clock size={14} strokeWidth={1.8} />
                </div>
                <h3 className="text-[14px] font-semibold text-ink dark:text-ink-dark">Auditoría</h3>
            </div>
            <div className="border-b border-surface-border dark:border-surface-border-dark mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Detalle etiqueta="Creado" valor={auditoria.creado_en} />
                <Detalle etiqueta="Última actualización" valor={auditoria.actualizado_en} />
                <Detalle etiqueta="Fecha registro clínico" valor={auditoria.fecha_registro} />
            </div>
        </Tarjeta>
    );
}

function Detalle({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
    return (
        <div>
            <p className="text-[10.5px] uppercase tracking-wide font-semibold text-ink-muted dark:text-ink-muted-dark">{etiqueta}</p>
            <p className="text-[13px] font-medium text-ink dark:text-ink-dark">{valor ?? '—'}</p>
        </div>
    );
}
