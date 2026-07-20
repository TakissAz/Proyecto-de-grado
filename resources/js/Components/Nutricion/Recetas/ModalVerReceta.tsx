import { X, CookingPot, Clock, Users, Salad, ListOrdered } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import ResumenNutricional from './ResumenNutricional';

interface IngredienteDetalle {
    id_receta_alimento: number;
    id_alimento: number;
    alimento_nombre: string;
    alimento_grupo: string;
    cantidad: number;
    unidad: string;
    calorias_aporte: number;
    proteinas_aporte: number;
    carbohidratos_aporte: number;
    grasas_aporte: number;
    fibra_aporte: number;
    observaciones: string | null;
}

export interface RecetaDetalle {
    id_receta: number;
    nombre: string;
    descripcion: string | null;
    tipo_comida: string;
    porciones: number;
    tiempo_preparacion_minutos: number | null;
    preparacion: string | null;
    calorias_totales: number;
    proteinas_totales: number;
    carbohidratos_totales: number;
    grasas_totales: number;
    fibra_total: number;
    observaciones: string | null;
    estado: string;
    created_at: string;
    updated_at: string;
    ingredientes: IngredienteDetalle[];
}

interface Props {
    abierto: boolean;
    receta: RecetaDetalle | null;
    cargando: boolean;
    onCerrar: () => void;
}

const tipoComidaLabel: Record<string, string> = {
    desayuno: 'Desayuno',
    media_manana: 'Media manana',
    almuerzo: 'Almuerzo',
    merienda: 'Merienda',
    cena: 'Cena',
    colacion: 'Colacion',
};

export default function ModalVerReceta({ abierto, receta, cargando, onCerrar }: Props) {
    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-4xl lg:w-[70vw] max-h-[85vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <CookingPot size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Detalle de receta</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Vista completa de la receta</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {cargando && (
                        <div className="flex items-center justify-center py-16">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
                            <span className="ml-3 text-[13px] text-ink-muted dark:text-ink-muted-dark">Cargando receta...</span>
                        </div>
                    )}

                    {!cargando && receta && (
                        <>
                            {/* Nombre */}
                            <div>
                                <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1">Nombre</p>
                                <p className="text-[15px] font-bold text-ink dark:text-ink-dark">{receta.nombre}</p>
                            </div>

                            {/* Tipo + Porciones + Tiempo */}
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge color="blue">{tipoComidaLabel[receta.tipo_comida] ?? receta.tipo_comida}</Badge>
                                <div className="flex items-center gap-1.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">
                                    <Users size={13} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                                    <span className="font-semibold text-ink dark:text-ink-dark">{receta.porciones}</span> porciones
                                </div>
                                {receta.tiempo_preparacion_minutos && (
                                    <div className="flex items-center gap-1.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">
                                        <Clock size={13} strokeWidth={1.8} className="text-brand-orange" />
                                        <span className="font-semibold text-ink dark:text-ink-dark">{receta.tiempo_preparacion_minutos}</span> min
                                    </div>
                                )}
                            </div>

                            {/* Resumen nutricional */}
                            <ResumenNutricional
                                calorias={Number(receta.calorias_totales)}
                                proteinas={Number(receta.proteinas_totales)}
                                carbohidratos={Number(receta.carbohidratos_totales)}
                                grasas={Number(receta.grasas_totales)}
                                fibra={Number(receta.fibra_total)}
                            />

                            {/* Ingredientes */}
                            {receta.ingredientes && receta.ingredientes.length > 0 && (
                                <div>
                                    <p className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                        <Salad size={11} strokeWidth={2} className="text-category-grains" />
                                        Ingredientes ({receta.ingredientes.length})
                                    </p>
                                    <div className="space-y-2">
                                        {receta.ingredientes.map((ing) => (
                                            <div
                                                key={ing.id_receta_alimento}
                                                className="flex items-center justify-between rounded-xl border border-surface-border px-4 py-3 dark:border-surface-border-dark"
                                            >
                                                <div>
                                                    <p className="text-[13px] font-semibold text-ink dark:text-ink-dark">{ing.alimento_nombre}</p>
                                                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                                        {ing.cantidad} {ing.unidad} · {ing.alimento_grupo}
                                                    </p>
                                                </div>
                                                <div className="flex gap-3 text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                                    <span className="text-brand-orange font-semibold">{Number(ing.calorias_aporte).toFixed(0)} kcal</span>
                                                    <span>{Number(ing.proteinas_aporte).toFixed(1)}p</span>
                                                    <span>{Number(ing.carbohidratos_aporte).toFixed(1)}c</span>
                                                    <span>{Number(ing.grasas_aporte).toFixed(1)}g</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preparacion */}
                            {receta.preparacion && (
                                <div>
                                    <p className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                        <ListOrdered size={11} strokeWidth={2} className="text-category-dairy" />
                                        Preparacion
                                    </p>
                                    <div className="space-y-2.5">
                                        {receta.preparacion.split('\n').filter(p => p.trim()).map((paso, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-[11px] font-bold text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green">
                                                    {i + 1}
                                                </div>
                                                <p className="pt-1 text-[13px] text-ink dark:text-ink-dark">{paso}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Observaciones */}
                            {receta.observaciones && (
                                <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                                    <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1">Observaciones</p>
                                    <p className="text-[13px] text-ink dark:text-ink-dark">{receta.observaciones}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
