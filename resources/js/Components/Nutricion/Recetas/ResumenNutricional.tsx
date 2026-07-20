import { Flame, Beef, Wheat, Droplets, Sprout } from 'lucide-react';

interface Props {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    fibra: number;
}

const items = [
    { key: 'calorias', label: 'Calorías', unidad: 'kcal', icon: Flame, color: 'text-brand-orange', bg: 'bg-brand-orange/15' },
    { key: 'proteinas', label: 'Proteínas', unidad: 'g', icon: Beef, color: 'text-category-fruits', bg: 'bg-category-fruits/15' },
    { key: 'carbohidratos', label: 'Carbos', unidad: 'g', icon: Wheat, color: 'text-brand-green-dark dark:text-brand-green', bg: 'bg-brand-green/15' },
    { key: 'grasas', label: 'Grasas', unidad: 'g', icon: Droplets, color: 'text-category-dairy', bg: 'bg-category-dairy/15' },
    { key: 'fibra', label: 'Fibra', unidad: 'g', icon: Sprout, color: 'text-category-grains', bg: 'bg-category-grains/15' },
] as const;

export default function ResumenNutricional({ calorias, proteinas, carbohidratos, grasas, fibra }: Props) {
    const valores: Record<string, number> = { calorias, proteinas, carbohidratos, grasas, fibra };

    return (
        <div className="card-elevated p-5">
            <p className="text-[12px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-4">
                RESUMEN NUTRICIONAL
            </p>
            <div className="grid grid-cols-5 gap-3">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.key} className="text-center">
                            <div className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}>
                                <Icon size={18} strokeWidth={1.8} className={item.color} />
                            </div>
                            <p className={`text-[20px] font-bold ${item.color}`}>
                                {valores[item.key].toFixed(0)}
                            </p>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                {item.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
