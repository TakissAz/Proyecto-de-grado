import { SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

interface Item { nombre: string; motivo?: string }
export interface ContextoAjustePlan {
    id_plan_considerado: number | null;
    nombre_plan_considerado: string | null;
    recetas_bien_aceptadas: Item[];
    recetas_a_evitar: Item[];
    ingredientes_no_conseguidos: Item[];
    necesita_mas_saciedad: Record<string, boolean>;
    recomendaciones_nutricionista: string[];
    resumen_ajuste: string[];
    hambre_nocturna_frecuente: boolean;
    ansiedad_comida_frecuente: boolean;
    antojos_dulces_frecuentes: boolean;
    hinchazon_frecuente: boolean;
}

export default function ResumenAjustePlanCard({ contexto }: { contexto: ContextoAjustePlan }) {
    if (!contexto.id_plan_considerado && contexto.resumen_ajuste.length === 0) return null;

    const sintomas = [
        contexto.hambre_nocturna_frecuente && 'Hambre nocturna',
        contexto.ansiedad_comida_frecuente && 'Ansiedad por comida',
        contexto.antojos_dulces_frecuentes && 'Antojos dulces',
        contexto.hinchazon_frecuente && 'Hinchazón',
    ].filter(Boolean) as string[];

    return (
        <div className="rounded-xl border border-surface-border p-5 dark:border-surface-border-dark">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                    <SlidersHorizontal size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Contexto para el siguiente plan</h3>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">El próximo plan considerará el seguimiento reciente del paciente.</p>
                </div>
            </div>

            {/* Listas */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <ListaChips titulo="Recetas favorecidas" items={contexto.recetas_bien_aceptadas.map(x => x.nombre)} color="green" />
                <ListaChips titulo="Recetas a evitar o revisar" items={contexto.recetas_a_evitar.map(x => x.nombre)} color="red" />
                <ListaChips titulo="Necesitan mayor saciedad" items={Object.keys(contexto.necesita_mas_saciedad)} color="orange" />
                <ListaChips titulo="Síntomas considerados" items={sintomas} color="orange" />
            </div>

            {/* Recomendaciones */}
            {contexto.recomendaciones_nutricionista.length > 0 && (
                <div className="mt-4">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-2">Recomendaciones profesionales consideradas</p>
                    <ul className="space-y-1.5">
                        {contexto.recomendaciones_nutricionista.slice(0, 5).map(x => (
                            <li key={x} className="flex items-start gap-2 text-[11.5px] text-ink dark:text-ink-dark">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-green" />
                                {x}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function ListaChips({ titulo, items, color }: { titulo: string; items: string[]; color: 'green' | 'orange' | 'red' }) {
    const colorMap = {
        green: 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green',
        orange: 'bg-brand-orange/10 text-brand-orange',
        red: 'bg-category-fruits/10 text-category-fruits',
    };
    return (
        <div>
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-1.5">{titulo}</p>
            <div className="flex flex-wrap gap-1.5">
                {items.length ? items.map(x => (
                    <span key={x} className={clsx('inline-flex items-center rounded-lg px-2.5 py-1 text-[10.5px] font-semibold', colorMap[color])}>{x}</span>
                )) : (
                    <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic">Sin registros.</span>
                )}
            </div>
        </div>
    );
}
