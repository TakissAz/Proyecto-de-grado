import clsx from 'clsx';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
    label: string;
    cumple: boolean;
    detalle?: string;
}

export function IndicadorRiItem({ label, cumple, detalle }: Props) {
    return (
        <div className={clsx(
            'flex items-start gap-2.5 rounded-xl border px-3 py-2.5',
            cumple
                ? 'border-brand-orange/25 bg-brand-orange/5 dark:bg-brand-orange/[0.06]'
                : 'border-surface-border bg-black/[0.015] dark:border-surface-border-dark dark:bg-white/[0.02]',
        )}>
            {cumple
                ? <CheckCircle2 size={14} strokeWidth={1.8} className="text-brand-orange mt-0.5 shrink-0" />
                : <XCircle size={14} strokeWidth={1.8} className="text-ink-muted/30 dark:text-ink-muted-dark/30 mt-0.5 shrink-0" />
            }
            <div>
                <p className={clsx('text-[11.5px] font-semibold', cumple ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-muted-dark')}>
                    {label}
                </p>
                {detalle && <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark mt-0.5">{detalle}</p>}
            </div>
        </div>
    );
}
