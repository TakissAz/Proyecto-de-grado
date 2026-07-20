import { useState } from 'react';
import { X, Save, CookingPot, Clock, Users, Salad, ListOrdered } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { Boton } from '@/Components/ui/boton';
import SelectorTipoComida from './SelectorTipoComida';
import BuscadorIngredientes, { type AlimentoOpcion } from './BuscadorIngredientes';
import ListaIngredientes, { type Ingrediente } from './ListaIngredientes';
import EditorPreparacion from './EditorPreparacion';
import ResumenNutricional from './ResumenNutricional';
import ModalNuevoAlimento from '@/Components/Nutricion/ModalNuevoAlimento';

interface Props {
    abierto: boolean;
    alimentos: AlimentoOpcion[];
    onCerrar: () => void;
}

interface FormData {
    nombre: string;
    tipo_comida: string;
    porciones: number | string;
    tiempo_preparacion_minutos: number | string;
    preparacion: string;
    ingredientes: Ingrediente[];
}

export default function ModalCrearReceta({ abierto, alimentos: alimentosIniciales, onCerrar }: Props) {
    const [alimentosLista, setAlimentosLista] = useState<AlimentoOpcion[]>(alimentosIniciales);
    const [modalAlimento, setModalAlimento] = useState(false);
    const [pasos, setPasos] = useState<string[]>(['']);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        nombre: '',
        tipo_comida: '',
        porciones: 1,
        tiempo_preparacion_minutos: '',
        preparacion: '',
        ingredientes: [],
    });

    if (!abierto) return null;

    function agregarIngrediente(alimento: AlimentoOpcion) {
        const cantidad = alimento.cantidad_base;
        const factor = cantidad / alimento.cantidad_base;
        const nuevo: Ingrediente = {
            id_alimento: alimento.id_alimento,
            nombre_alimento: alimento.nombre,
            cantidad, unidad: alimento.unidad_base,
            calorias_preview: alimento.calorias * factor,
            proteinas_preview: alimento.proteinas * factor,
            carbohidratos_preview: alimento.carbohidratos * factor,
            grasas_preview: alimento.grasas * factor,
            fibra_preview: alimento.fibra * factor,
            disponibilidad_temporal: alimento.disponibilidad_temporal,
        };
        setData('ingredientes', [...data.ingredientes, nuevo]);
    }

    function quitarIngrediente(index: number) {
        setData('ingredientes', data.ingredientes.filter((_, i) => i !== index));
    }

    const totales = data.ingredientes.reduce(
        (acc, ing) => ({
            calorias: acc.calorias + ing.calorias_preview,
            proteinas: acc.proteinas + ing.proteinas_preview,
            carbohidratos: acc.carbohidratos + ing.carbohidratos_preview,
            grasas: acc.grasas + ing.grasas_preview,
            fibra: acc.fibra + ing.fibra_preview,
        }),
        { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0 }
    );

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const prep = pasos.filter(p => p.trim()).join('\n');
        data.preparacion = prep;
        post('/nutricionista/recetas', { onSuccess: () => { reset(); setPasos(['']); onCerrar(); } });
    }

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
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Nueva receta</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Completa los datos de tu receta</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Nombre */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <CookingPot size={11} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                            Nombre de la receta
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Ensalada de quinua con pollo"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[14px] font-semibold text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                            required
                        />
                        {errors.nombre && <p className="mt-1 text-[11px] text-category-fruits">{errors.nombre}</p>}
                    </div>

                    {/* Tipo comida */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Clock size={11} strokeWidth={2} className="text-brand-orange" />
                            Momento del día
                        </label>
                        <SelectorTipoComida valor={data.tipo_comida} onChange={(v) => setData('tipo_comida', v)} />
                        {errors.tipo_comida && <p className="mt-2 text-[11px] text-category-fruits">{errors.tipo_comida}</p>}
                    </div>

                    {/* Porciones + Tiempo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2.5 rounded-xl border border-surface-border px-3.5 py-2.5 focus-within:border-brand-green/50 dark:border-surface-border-dark">
                            <Users size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green shrink-0" />
                            <div className="flex-1">
                                <p className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">Porciones</p>
                                <input type="number" min={1} value={data.porciones} onChange={(e) => setData('porciones', e.target.value)} className="w-full border-0 bg-transparent p-0 text-[13px] font-bold text-ink outline-none focus:ring-0 dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-xl border border-surface-border px-3.5 py-2.5 focus-within:border-brand-green/50 dark:border-surface-border-dark">
                            <Clock size={15} strokeWidth={1.8} className="text-brand-orange shrink-0" />
                            <div className="flex-1">
                                <p className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">Tiempo (min)</p>
                                <input type="number" min={1} placeholder="—" value={data.tiempo_preparacion_minutos} onChange={(e) => setData('tiempo_preparacion_minutos', e.target.value)} className="w-full border-0 bg-transparent p-0 text-[13px] font-bold text-ink outline-none focus:ring-0 placeholder:text-ink-muted/30 dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                        </div>
                    </div>

                    {/* Ingredientes */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Salad size={11} strokeWidth={2} className="text-category-grains" />
                            Ingredientes
                        </label>
                        <BuscadorIngredientes
                            alimentos={alimentosLista}
                            onSeleccionar={agregarIngrediente}
                            onCrearNuevo={() => setModalAlimento(true)}
                        />
                        <div className="mt-3">
                            <ListaIngredientes ingredientes={data.ingredientes} onQuitar={quitarIngrediente} />
                        </div>
                        {errors.ingredientes && <p className="mt-2 text-[11px] text-category-fruits">{errors.ingredientes}</p>}
                    </div>

                    {/* Preparación */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <ListOrdered size={11} strokeWidth={2} className="text-category-dairy" />
                            Preparación
                        </label>
                        <EditorPreparacion pasos={pasos} onChange={setPasos} />
                    </div>

                    {/* Resumen */}
                    {data.ingredientes.length > 0 && <ResumenNutricional {...totales} />}

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={onCerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                            <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Crear receta'}
                        </Boton>
                    </div>
                </form>
            </div>

            {/* Modal crear alimento (nested) */}
            <ModalNuevoAlimento
                abierto={modalAlimento}
                onCerrar={() => setModalAlimento(false)}
                onCreado={(nuevo) => { setAlimentosLista(prev => [...prev, nuevo]); agregarIngrediente(nuevo); }}
            />
        </div>
    );
}
