import { Trash2, Leaf, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

export interface Ingrediente {
    id_receta_alimento?: number;
    id_alimento: number;
    nombre_alimento: string;
    cantidad: number;
    unidad: string;
    calorias_preview: number;
    proteinas_preview: number;
    carbohidratos_preview: number;
    grasas_preview: number;
    fibra_preview: number;
    disponibilidad_temporal?: string | null;
}

interface Props {
    ingredientes: Ingrediente[];
    onQuitar: (index: number) => void;
}

export default function ListaIngredientes({ ingredientes, onQuitar }: Props) {
    if (ingredientes.length === 0) {
        return (
            <div className="rounded-xl border-2 border-dashed border-surface-border py-10 text-center dark:border-surface-border-dark">
                <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">
                    Busca y agrega ingredientes arriba
                </p>
                <p className="text-[11px] text-ink-muted/60 dark:text-ink-muted-dark/60 mt-1">
                    Los aportes nutricionales se calculan automáticamente
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {ingredientes.map((ing, i) => (
                <div
                    key={`${ing.id_alimento}-${i}`}
                    className="rounded-xl border border-surface-border p-4 transition-colors hover:bg-black/[0.01] dark:border-surface-border-dark dark:hover:bg-white/[0.02]"
                >
                    {/* Fila superior: nombre + quitar */}
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                            <p className="text-[13.5px] font-semibold text-ink dark:text-ink-dark">{ing.nombre_alimento}</p>
                            <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                {ing.cantidad} {ing.unidad}
                            </span>
                            {ing.disponibilidad_temporal === 'estacional' && (
                                <Badge color="orange"><Leaf size={9} className="mr-0.5" />Estacional</Badge>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => onQuitar(i)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark"
                        >
                            <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                    </div>

                    {/* Fila inferior: nutrientes como mini chips */}
                    <div className="flex flex-wrap gap-2">
                        <NutriChip icon={<Flame size={11} />} valor={ing.calorias_preview} label="kcal" color="text-brand-orange bg-brand-orange/10" />
                        <NutriChip icon={<Beef size={11} />} valor={ing.proteinas_preview} label="prot" color="text-category-fruits bg-category-fruits/10" />
                        <NutriChip icon={<Wheat size={11} />} valor={ing.carbohidratos_preview} label="carb" color="text-brand-green-dark bg-brand-green/10 dark:text-brand-green" />
                        <NutriChip icon={<Droplets size={11} />} valor={ing.grasas_preview} label="gras" color="text-category-dairy bg-category-dairy/10" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function NutriChip({ icon, valor, label, color }: { icon: React.ReactNode; valor: number; label: string; color: string }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${color}`}>
            {icon} {valor.toFixed(1)} {label}
        </span>
    );
}
