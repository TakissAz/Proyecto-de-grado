import clsx from 'clsx';

interface Props {
    imc: number;
}

export default function GraficoIMC({ imc }: Props) {
    const categoria = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad';
    const color = imc < 18.5 ? 'text-category-others' : imc < 25 ? 'text-brand-green-dark dark:text-brand-green' : imc < 30 ? 'text-brand-orange' : 'text-category-fruits';
    const bgColor = imc < 18.5 ? 'bg-category-others/15' : imc < 25 ? 'bg-brand-green/15' : imc < 30 ? 'bg-brand-orange/15' : 'bg-category-fruits/15';

    // Posición del marcador en la barra (IMC 15-40)
    const pct = Math.min(Math.max(((imc - 15) / 25) * 100, 0), 100);

    return (
        <div className="rounded-xl border border-surface-border p-3 dark:border-surface-border-dark">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">IMC</p>
            
            {/* Valor grande */}
            <div className="text-center mb-3">
                <div className={clsx('inline-flex items-center justify-center rounded-xl px-3 py-1.5', bgColor)}>
                    <span className={clsx('text-[20px] font-bold', color)}>{imc}</span>
                </div>
                <p className={clsx('text-[10px] font-semibold mt-1', color)}>{categoria}</p>
            </div>

            {/* Barra de rango */}
            <div className="relative h-3 w-full rounded-full overflow-hidden flex">
                <div className="h-full bg-category-others/40" style={{ width: '14%' }} />
                <div className="h-full bg-brand-green/40" style={{ width: '26%' }} />
                <div className="h-full bg-brand-orange/40" style={{ width: '20%' }} />
                <div className="h-full bg-category-fruits/40" style={{ width: '40%' }} />
            </div>

            {/* Marcador */}
            <div className="relative h-2 mt-0.5">
                <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-ink dark:border-t-ink-dark" style={{ left: `${pct}%` }} />
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-1 text-[8px] text-ink-muted/60 dark:text-ink-muted-dark/60">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
            </div>
        </div>
    );
}
