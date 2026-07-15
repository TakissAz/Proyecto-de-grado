import { CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    label: string;
    cumple: boolean;
    detalle?: string;
}

export function IndicadorRiItem({ label, cumple, detalle }: Props) {
    return (
        <div className="flex items-start gap-2 p-2.5 rounded-xl border border-base-300 bg-base-200/30">
            {cumple
                ? <CheckCircle size={16} className="text-warning mt-0.5 shrink-0" />
                : <XCircle size={16} className="text-base-content/25 mt-0.5 shrink-0" />
            }
            <div>
                <p className={clsx('text-xs font-semibold', cumple ? 'text-base-content' : 'text-base-content/50')}>
                    {label}
                </p>
                {detalle ? <p className="text-[10px] text-base-content/40 mt-0.5">{detalle}</p> : null}
            </div>
        </div>
    );
}
