import { Info } from 'lucide-react';

interface Props {
    alertas: string[];
}

export function ListaAlertasPmos({ alertas }: Props) {
    if (alertas.length === 0) return null;

    return (
        <div className="rounded-xl border border-info/20 bg-info/5 px-4 py-3 dark:bg-info/[0.06]">
            <div className="flex items-start gap-2">
                <Info size={13} strokeWidth={1.8} className="text-info shrink-0 mt-0.5" />
                <div>
                    <p className="text-[11px] font-bold text-ink dark:text-ink-dark mb-1">Datos faltantes para completar evaluación:</p>
                    {alertas.map((a, i) => (
                        <p key={i} className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">• {a}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}
