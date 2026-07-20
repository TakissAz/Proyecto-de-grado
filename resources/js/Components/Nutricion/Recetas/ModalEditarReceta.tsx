import { useState, useEffect } from 'react';
import { X, Save, CookingPot, Clock, Users, Salad, ListOrdered } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import SelectorTipoComida from './SelectorTipoComida';
import BuscadorIngredientes, { type AlimentoOpcion } from './BuscadorIngredientes';
import ListaIngredientes, { type Ingrediente } from './ListaIngredientes';
import EditorPreparacion from './EditorPreparacion';
import ResumenNutricional from './ResumenNutricional';
import ModalNuevoAlimento from '@/Components/Nutricion/ModalNuevoAlimento';
import type { RecetaDetalle } from './ModalVerReceta';

interface Props {
    abierto: boolean;
    receta: RecetaDetalle | null;
    cargando: boolean;
    alimentos: AlimentoOpcion[];
    onCerrar: () => void;
    onGuardado: () => void;
}

export default function ModalEditarReceta({ abierto, receta, cargando, alimentos: alimentosIniciales, onCerrar, onGuardado }: Props) {
    const [alimentosLista, setAlimentosLista] = useState<AlimentoOpcion[]>(alimentosIniciales);
    const [modalAlimento, setModalAlimento] = useState(false);
    const [pasos, setPasos] = useState<string[]>(['']);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState<Record<string, string>>({});

    const [nombre, setNombre] = useState('');
    const [tipoComida, setTipoComida] = useState('');
    const [porciones, setPorciones] = useState<number | string>(1);
    const [tiempoPreparacion, setTiempoPreparacion] = useState<number | string>('');
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

    // Sincronizar alimentos iniciales cuando cambian
    useEffect(() => {
        setAlimentosLista(alimentosIniciales);
    }, [alimentosIniciales]);

    // Precargar datos cuando se abre el modal con una receta
    useEffect(() => {
        if (receta && abierto) {
            setNombre(receta.nombre);
            setTipoComida(receta.tipo_comida);
            setPorciones(receta.porciones);
            setTiempoPreparacion(receta.tiempo_preparacion_minutos ?? '');
            setPasos(receta.preparacion ? receta.preparacion.split('\n').filter(p => p.trim()) : ['']);
            setIngredientes(
                (receta.ingredientes ?? []).map((ing) => ({
                    id_receta_alimento: ing.id_receta_alimento,
                    id_alimento: ing.id_alimento,
                    nombre_alimento: ing.alimento_nombre,
                    cantidad: Number(ing.cantidad),
                    unidad: ing.unidad,
                    calorias_preview: Number(ing.calorias_aporte),
                    proteinas_preview: Number(ing.proteinas_aporte),
                    carbohidratos_preview: Number(ing.carbohidratos_aporte),
                    grasas_preview: Number(ing.grasas_aporte),
                    fibra_preview: Number(ing.fibra_aporte),
                }))
            );
            setErrores({});
        }
    }, [receta, abierto]);

    if (!abierto) return null;

    function agregarIngrediente(alimento: AlimentoOpcion) {
        const cantidad = alimento.cantidad_base;
        const factor = cantidad / alimento.cantidad_base;
        const nuevo: Ingrediente = {
            id_alimento: alimento.id_alimento,
            nombre_alimento: alimento.nombre,
            cantidad,
            unidad: alimento.unidad_base,
            calorias_preview: alimento.calorias * factor,
            proteinas_preview: alimento.proteinas * factor,
            carbohidratos_preview: alimento.carbohidratos * factor,
            grasas_preview: alimento.grasas * factor,
            fibra_preview: alimento.fibra * factor,
            disponibilidad_temporal: alimento.disponibilidad_temporal,
        };
        setIngredientes(prev => [...prev, nuevo]);
    }

    function quitarIngrediente(index: number) {
        setIngredientes(prev => prev.filter((_, i) => i !== index));
    }

    const totales = ingredientes.reduce(
        (acc, ing) => ({
            calorias: acc.calorias + ing.calorias_preview,
            proteinas: acc.proteinas + ing.proteinas_preview,
            carbohidratos: acc.carbohidratos + ing.carbohidratos_preview,
            grasas: acc.grasas + ing.grasas_preview,
            fibra: acc.fibra + ing.fibra_preview,
        }),
        { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0 }
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!receta) return;

        setGuardando(true);
        setErrores({});

        const prep = pasos.filter(p => p.trim()).join('\n');
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

        const payload = {
            nombre,
            tipo_comida: tipoComida,
            porciones: Number(porciones),
            tiempo_preparacion_minutos: tiempoPreparacion ? Number(tiempoPreparacion) : null,
            preparacion: prep || null,
            ingredientes: ingredientes.map((ing) => ({
                id_receta_alimento: ing.id_receta_alimento ?? null,
                id_alimento: ing.id_alimento,
                cantidad: ing.cantidad,
                unidad: ing.unidad,
            })),
        };

        try {
            const res = await fetch(`/nutricionista/recetas/${receta.id_receta}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 422) {
                const data = await res.json();
                setErrores(data.errors ?? {});
                setGuardando(false);
                return;
            }

            if (!res.ok) {
                setErrores({ nombre: 'Error al actualizar la receta.' });
                setGuardando(false);
                return;
            }

            onGuardado();
        } catch {
            setErrores({ nombre: 'Error de conexion.' });
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-4xl lg:w-[70vw] max-h-[85vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <CookingPot size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Editar receta</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Modifica los datos de la receta</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Body */}
                {cargando ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
                        <span className="ml-3 text-[13px] text-ink-muted dark:text-ink-muted-dark">Cargando receta...</span>
                    </div>
                ) : (
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
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[14px] font-semibold text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                required
                            />
                            {errores.nombre && <p className="mt-1 text-[11px] text-category-fruits">{errores.nombre}</p>}
                        </div>

                        {/* Tipo comida */}
                        <div>
                            <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                <Clock size={11} strokeWidth={2} className="text-brand-orange" />
                                Momento del dia
                            </label>
                            <SelectorTipoComida valor={tipoComida} onChange={setTipoComida} />
                            {errores.tipo_comida && <p className="mt-2 text-[11px] text-category-fruits">{errores.tipo_comida}</p>}
                        </div>

                        {/* Porciones + Tiempo */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2.5 rounded-xl border border-surface-border px-3.5 py-2.5 focus-within:border-brand-green/50 dark:border-surface-border-dark">
                                <Users size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">Porciones</p>
                                    <input type="number" min={1} value={porciones} onChange={(e) => setPorciones(e.target.value)} className="w-full border-0 bg-transparent p-0 text-[13px] font-bold text-ink outline-none focus:ring-0 dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 rounded-xl border border-surface-border px-3.5 py-2.5 focus-within:border-brand-green/50 dark:border-surface-border-dark">
                                <Clock size={15} strokeWidth={1.8} className="text-brand-orange shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">Tiempo (min)</p>
                                    <input type="number" min={1} placeholder="—" value={tiempoPreparacion} onChange={(e) => setTiempoPreparacion(e.target.value)} className="w-full border-0 bg-transparent p-0 text-[13px] font-bold text-ink outline-none focus:ring-0 placeholder:text-ink-muted/30 dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
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
                                <ListaIngredientes ingredientes={ingredientes} onQuitar={quitarIngrediente} />
                            </div>
                            {errores.ingredientes && <p className="mt-2 text-[11px] text-category-fruits">{errores.ingredientes}</p>}
                        </div>

                        {/* Preparacion */}
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                <ListOrdered size={11} strokeWidth={2} className="text-category-dairy" />
                                Preparacion
                            </label>
                            <EditorPreparacion pasos={pasos} onChange={setPasos} />
                        </div>

                        {/* Resumen */}
                        {ingredientes.length > 0 && <ResumenNutricional {...totales} />}

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                            <Boton type="button" variante="ghost" tamano="sm" onClick={onCerrar}>Cancelar</Boton>
                            <Boton type="submit" variante="primary" tamano="md" disabled={guardando}>
                                <Save size={14} strokeWidth={1.8} /> {guardando ? 'Guardando...' : 'Actualizar receta'}
                            </Boton>
                        </div>
                    </form>
                )}
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
