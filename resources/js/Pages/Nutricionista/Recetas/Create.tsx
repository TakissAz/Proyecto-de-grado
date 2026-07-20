import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Users, Clock, CookingPot, Salad, ListOrdered } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alerta from '@/Components/ui/alerta';
import { Boton, BotonLink } from '@/Components/ui/boton';
import { Campo } from '@/Components/ui/campo';
import SelectorTipoComida from '@/Components/Nutricion/Recetas/SelectorTipoComida';
import BuscadorIngredientes, { type AlimentoOpcion } from '@/Components/Nutricion/Recetas/BuscadorIngredientes';
import ListaIngredientes, { type Ingrediente } from '@/Components/Nutricion/Recetas/ListaIngredientes';
import EditorPreparacion from '@/Components/Nutricion/Recetas/EditorPreparacion';
import ResumenNutricional from '@/Components/Nutricion/Recetas/ResumenNutricional';
import ModalNuevoAlimento from '@/Components/Nutricion/ModalNuevoAlimento';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    alimentos: AlimentoOpcion[];
}

interface FormData {
    nombre: string;
    tipo_comida: string;
    porciones: number | string;
    tiempo_preparacion_minutos: number | string;
    preparacion: string;
    ingredientes: Ingrediente[];
}

export default function Create({ alimentos: alimentosIniciales, flash }: Props) {
    const [alimentosLista, setAlimentosLista] = useState<AlimentoOpcion[]>(alimentosIniciales ?? []);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pasos, setPasos] = useState<string[]>(['']);

    const { data, setData, post, processing, errors } = useForm<FormData>({
        nombre: '',
        tipo_comida: '',
        porciones: 1,
        tiempo_preparacion_minutos: '',
        preparacion: '',
        ingredientes: [],
    });

    // Agregar ingrediente con cálculo automático de aportes
    function agregarIngrediente(alimento: AlimentoOpcion) {
        const cantidad = alimento.cantidad_base; // usar cantidad base como default
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

        setData('ingredientes', [...data.ingredientes, nuevo]);
    }

    function quitarIngrediente(index: number) {
        setData('ingredientes', data.ingredientes.filter((_, i) => i !== index));
    }

    // Totales nutricionales
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
        // Juntar pasos en un solo string separado por newlines
        setData('preparacion', pasos.filter(p => p.trim()).join('\n'));
        post('/nutricionista/recetas');
    }

    return (
        <AuthenticatedLayout title="Crear receta">
            <Head title="Crear receta" />

            <div className="space-y-5">
                {flash?.success && <Alerta tipo="success">{flash.success}</Alerta>}
                {flash?.error && <Alerta tipo="error">{flash.error}</Alerta>}

                {/* Header con volver */}
                <div className="flex items-center justify-between">
                    <BotonLink href="/nutricionista/recetas" variante="ghost">
                        <ArrowLeft size={14} strokeWidth={1.8} /> Volver a recetas
                    </BotonLink>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
                    {/* === COLUMNA IZQUIERDA === */}
                    <div className="space-y-5">
                        {/* Nombre de la receta */}
                        <div className="card-elevated p-5">
                            <label className="block">
                                <span className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                    <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                                        <CookingPot size={11} strokeWidth={2} />
                                    </span>
                                    Nombre de la receta
                                </span>
                                <input
                                    type="text"
                                    placeholder="Ej: Ensalada de quinua con pollo"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3.5 text-[15px] font-semibold text-ink placeholder:text-ink-muted/40 outline-none transition-all focus:border-brand-green/50 focus:shadow-sm focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark dark:placeholder:text-ink-muted-dark/40"
                                    required
                                />
                            </label>
                            {errors.nombre && <p className="mt-1.5 text-[11px] text-category-fruits">{errors.nombre}</p>}
                        </div>

                        {/* Tipo de comida */}
                        <div className="card-elevated p-5">
                            <p className="flex items-center gap-2 mb-4 text-[12px] font-semibold text-ink dark:text-ink-dark">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-orange/15 text-brand-orange">
                                    <Clock size={11} strokeWidth={2} />
                                </span>
                                ¿Para qué momento del día?
                            </p>
                            <SelectorTipoComida valor={data.tipo_comida} onChange={(v) => setData('tipo_comida', v)} />
                            {errors.tipo_comida && <p className="mt-2 text-[11px] text-category-fruits">{errors.tipo_comida}</p>}
                        </div>

                        {/* Porciones + Tiempo */}
                        <div className="card-elevated p-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 rounded-xl border border-surface-border px-4 py-3 transition-all focus-within:border-brand-green/50 focus-within:shadow-sm dark:border-surface-border-dark">
                                    <Users size={16} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">Porciones</p>
                                        <input type="number" min={1} value={data.porciones} onChange={(e) => setData('porciones', e.target.value)} className="w-full border-0 bg-transparent p-0 text-[14px] font-bold text-ink outline-none focus:ring-0 dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-surface-border px-4 py-3 transition-all focus-within:border-brand-green/50 focus-within:shadow-sm dark:border-surface-border-dark">
                                    <Clock size={16} strokeWidth={1.8} className="text-brand-orange shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">Tiempo (min)</p>
                                        <input type="number" min={1} placeholder="—" value={data.tiempo_preparacion_minutos} onChange={(e) => setData('tiempo_preparacion_minutos', e.target.value)} className="w-full border-0 bg-transparent p-0 text-[14px] font-bold text-ink outline-none focus:ring-0 placeholder:text-ink-muted/30 dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preparación por pasos */}
                        <div className="card-elevated p-5 space-y-3">
                            <p className="flex items-center gap-2 text-[13px] font-semibold text-ink dark:text-ink-dark">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-category-dairy/15 text-category-dairy">
                                    <ListOrdered size={11} strokeWidth={2} />
                                </span>
                                Preparación
                            </p>
                            <EditorPreparacion pasos={pasos} onChange={setPasos} />
                        </div>
                    </div>

                    {/* === COLUMNA DERECHA === */}
                    <div className="space-y-5">
                        {/* Ingredientes */}
                        <div className="card-elevated p-5 space-y-4">
                            <p className="flex items-center gap-2 text-[13px] font-semibold text-ink dark:text-ink-dark">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-category-grains/15 text-category-grains">
                                    <Salad size={11} strokeWidth={2} />
                                </span>
                                Ingredientes
                            </p>
                            <BuscadorIngredientes
                                alimentos={alimentosLista}
                                onSeleccionar={agregarIngrediente}
                                onCrearNuevo={() => setModalAbierto(true)}
                            />
                            <ListaIngredientes
                                ingredientes={data.ingredientes}
                                onQuitar={quitarIngrediente}
                            />
                            {errors.ingredientes && <p className="text-[11px] text-category-fruits">{errors.ingredientes}</p>}
                        </div>

                        {/* Resumen nutricional */}
                        {data.ingredientes.length > 0 && (
                            <ResumenNutricional {...totales} />
                        )}

                        {/* Acciones */}
                        <div className="flex items-center justify-end">
                            <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                                <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Crear receta'}
                            </Boton>
                        </div>
                    </div>
                </form>
            </div>

            {/* Modal crear alimento */}
            <ModalNuevoAlimento
                abierto={modalAbierto}
                onCerrar={() => setModalAbierto(false)}
                onCreado={(nuevo) => {
                    setAlimentosLista(prev => [...prev, nuevo]);
                    // Agregar automáticamente como ingrediente
                    agregarIngrediente(nuevo);
                }}
            />
        </AuthenticatedLayout>
    );
}
