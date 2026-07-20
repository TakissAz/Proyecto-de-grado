import clsx from 'clsx';
import { Coffee, UtensilsCrossed, Sun, Moon } from 'lucide-react';

const OPCIONES = [
    { id: 'desayuno', label: 'Desayuno', icon: Coffee, color: 'border-brand-orange text-brand-orange bg-brand-orange/10', iconBg: 'bg-brand-orange/15' },
    { id: 'almuerzo', label: 'Almuerzo', icon: UtensilsCrossed, color: 'border-brand-green text-brand-green-dark bg-brand-green/10 dark:text-brand-green', iconBg: 'bg-brand-green/15' },
    { id: 'merienda', label: 'Merienda', icon: Sun, color: 'border-category-dairy text-category-dairy bg-category-dairy/10', iconBg: 'bg-category-dairy/15' },
    { id: 'cena', label: 'Cena', icon: Moon, color: 'border-category-others text-category-others bg-category-others/10', iconBg: 'bg-category-others/15' },
] as const;

interface Props {
    valor: string;
    onChange: (tipo: string) => void;
}

export default function SelectorTipoComida({ valor, onChange }: Props) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {OPCIONES.map((op) => {
                const Icon = op.icon;
                const activo = valor === op.id;
                return (
                    <button
                        key={op.id}
                        type="button"
                        onClick={() => onChange(op.id)}
                        className={clsx(
                            'flex flex-col items-center gap-2.5 rounded-2xl border-2 px-4 py-4 transition-all',
                            activo
                                ? `${op.color} shadow-md`
                                : 'border-surface-border text-ink-muted hover:shadow-sm dark:border-surface-border-dark dark:text-ink-muted-dark'
                        )}
                    >
                        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', activo ? op.iconBg : 'bg-black/[0.03] dark:bg-white/[0.05]')}>
                            <Icon size={20} strokeWidth={1.8} />
                        </div>
                        <span className="text-[12px] font-bold">{op.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
