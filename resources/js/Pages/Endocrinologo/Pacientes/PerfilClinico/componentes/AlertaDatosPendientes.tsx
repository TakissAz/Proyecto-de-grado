import { AlertTriangle, Info } from 'lucide-react';
import type { Alerta } from '../tipos';

interface Props {
    alertas: Alerta[];
}

export default function AlertaDatosPendientes({ alertas }: Props) {
    if (alertas.length === 0) return null;

    return (
        <div className="space-y-2">
            {alertas.map((alerta, i) => (
                <div
                    key={i}
                    className={`card-elevated flex items-center gap-3 border-l-4 px-4 py-3 text-[12.5px] text-ink dark:text-ink-dark ${
                        alerta.tipo === 'warning' ? 'border-l-brand-orange' : 'border-l-category-others'
                    }`}
                >
                    {alerta.tipo === 'warning' ? (
                        <AlertTriangle size={14} strokeWidth={1.8} className="shrink-0 text-brand-orange" />
                    ) : (
                        <Info size={14} strokeWidth={1.8} className="shrink-0 text-category-others" />
                    )}
                    <span>{alerta.mensaje}</span>
                </div>
            ))}
        </div>
    );
}
