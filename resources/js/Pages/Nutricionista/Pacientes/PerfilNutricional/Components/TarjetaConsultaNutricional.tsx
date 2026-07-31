import { Stethoscope, Plus, Edit, Calendar } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import clsx from 'clsx';
import type { Registro } from '../tipos';
import { etiqueta } from '../tipos';

interface Props {
    registro: Registro | null;
    abrir: () => void;
}

const ESTADO_COLOR: Record<string, string> = {
    abierta: 'bg-brand-green/15 text-brand-green-dark dark:bg-brand-green/20 dark:text-brand-green',
    en_seguimiento: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    cerrada: 'bg-ink-muted/10 text-ink-muted dark:text-ink-muted-dark',
    anulada: 'bg-category-fruits/15 text-category-fruits',
};

export default function TarjetaConsultaNutricional({ registro, abrir }: Props) {
    if (!registro) {
        return (
            <div className="card-elevated p-5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/10">
                        <Stethoscope size={15} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-ink dark:text-ink-dark">Consulta nutricional</h3>
                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Motivo y estado de atención</p>
                    </div>
                </div>
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-4 leading-relaxed">
                    Registra la consulta nutricional para habilitar las demás secciones del expediente.
                </p>
                <Boton variante="primary" tamano="sm" onClick={abrir}>
                    <Plus size={13} strokeWidth={1.8} /> Registrar consulta
                </Boton>
            </div>
        );
    }

    const estado = String(registro.estado_consulta ?? '');

    return (
        <div className="card-elevated p-5 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/15">
                        <Stethoscope size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Consulta nutricional</h3>
                        {registro.fecha_consulta && (
                            <p className="flex items-center gap-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                <Calendar size={10} strokeWidth={1.8} /> {String(registro.fecha_consulta).slice(0, 10)}
                            </p>
                        )}
                    </div>
                </div>
                <button onClick={abrir} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15">
                    <Edit size={11} strokeWidth={1.8} /> Editar
                </button>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-2">
                <span className={clsx('pill text-[9.5px] capitalize', ESTADO_COLOR[estado] ?? ESTADO_COLOR.abierta)}>
                    {estado.replace('_', ' ') || 'Sin estado'}
                </span>
            </div>

            {/* Motivo */}
            {registro.motivo_consulta && (
                <div className="rounded-lg bg-black/[0.02] px-3 py-2.5 dark:bg-white/[0.03]">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Motivo</p>
                    <p className="text-[12px] text-ink dark:text-ink-dark leading-relaxed">{String(registro.motivo_consulta)}</p>
                </div>
            )}

            {/* Observaciones */}
            {registro.observaciones && (
                <div className="rounded-xl border border-surface-border px-3 py-2.5 dark:border-surface-border-dark">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                    <p className="text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">{String(registro.observaciones)}</p>
                </div>
            )}
        </div>
    );
}
