import axios, { AxiosError } from 'axios';
import { CookingPot, LoaderCircle, Plus, Search, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';
import type { CatalogoAlimento, CatalogoReceta, ComidaPlan, ComponentePlan } from '@/Pages/Nutricionista/Pacientes/PerfilNutricional/tipos';
import ModalCrearReceta, { type RecetaCreada } from '@/Components/Nutricion/Recetas/ModalCrearReceta';

interface Props { abierto: boolean; cerrar: () => void; comida: ComidaPlan | null; componente?: ComponentePlan | null; alimentos: CatalogoAlimento[]; recetas: CatalogoReceta[]; onSuccess: () => void }
type Tipo = 'receta' | 'alimento' | 'manual';
const num = (v: unknown) => Number(v ?? 0);
const errorDe = (e: unknown) => { const d = (e as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response?.data; return Object.values(d?.errors ?? {})[0]?.[0] ?? d?.message ?? 'No se pudo guardar el componente.'; };

const inputClass = 'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';
const inputSmClass = 'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';
const labelClass = 'text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5 block';

export default function ModalComponentePlan({ abierto, cerrar, comida, componente, alimentos, recetas, onSuccess }: Props) {
    const [tipo, setTipo] = useState<Tipo>('receta');
    const [seleccion, setSeleccion] = useState('');
    const [buscar, setBuscar] = useState('');
    const [nombre, setNombre] = useState('');
    const [cantidad, setCantidad] = useState('1');
    const [unidad, setUnidad] = useState('porción');
    const [calorias, setCalorias] = useState('0');
    const [proteinas, setProteinas] = useState('0');
    const [carbohidratos, setCarbohidratos] = useState('0');
    const [grasas, setGrasas] = useState('0');
    const [fibra, setFibra] = useState('0');
    const [observaciones, setObservaciones] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [crearReceta, setCrearReceta] = useState(false);

    useEffect(() => {
        if (!abierto) return;
        const t: Tipo = 'receta';
        setTipo(t);
        setSeleccion(String(componente?.tipo_componente === 'receta' ? componente.id_receta ?? '' : ''));
        setNombre(componente?.nombre_manual ?? '');
        setCantidad(String(componente?.cantidad ?? 1));
        setUnidad(componente?.unidad ?? 'porción');
        setCalorias(String(componente?.calorias ?? 0));
        setProteinas(String(componente?.proteinas ?? 0));
        setCarbohidratos(String(componente?.carbohidratos ?? 0));
        setGrasas(String(componente?.grasas ?? 0));
        setFibra(String(componente?.fibra ?? 0));
        setObservaciones(componente?.observaciones ?? '');
        setBuscar('');
        setError('');
    }, [abierto, componente]);

    const recetasFiltradas = useMemo(() => recetas.filter(r => r.nombre.toLowerCase().includes(buscar.toLowerCase())).sort((a, b) => Number(b.tipo_comida === comida?.tipo_comida) - Number(a.tipo_comida === comida?.tipo_comida)), [recetas, buscar, comida]);
    const alimentosFiltrados = useMemo(() => alimentos.filter(a => a.nombre.toLowerCase().includes(buscar.toLowerCase())), [alimentos, buscar]);
    const origen = tipo === 'receta' ? recetas.find(r => r.id_receta === Number(seleccion)) : tipo === 'alimento' ? alimentos.find(a => a.id_alimento === Number(seleccion)) : null;
    const factor = tipo === 'receta' ? num(cantidad) : tipo === 'alimento' ? num(cantidad) / Math.max(num((origen as CatalogoAlimento | undefined)?.cantidad_base), .01) : 1;
    const vista = tipo === 'manual'
        ? { calorias: num(calorias), proteinas: num(proteinas), carbohidratos: num(carbohidratos), grasas: num(grasas), fibra: num(fibra) }
        : tipo === 'receta'
            ? { calorias: num((origen as CatalogoReceta | undefined)?.calorias_totales) * factor, proteinas: num((origen as CatalogoReceta | undefined)?.proteinas_totales) * factor, carbohidratos: num((origen as CatalogoReceta | undefined)?.carbohidratos_totales) * factor, grasas: num((origen as CatalogoReceta | undefined)?.grasas_totales) * factor, fibra: num((origen as CatalogoReceta | undefined)?.fibra_total) * factor }
            : { calorias: num((origen as CatalogoAlimento | undefined)?.calorias) * factor, proteinas: num((origen as CatalogoAlimento | undefined)?.proteinas) * factor, carbohidratos: num((origen as CatalogoAlimento | undefined)?.carbohidratos) * factor, grasas: num((origen as CatalogoAlimento | undefined)?.grasas) * factor, fibra: num((origen as CatalogoAlimento | undefined)?.fibra) * factor };

    if (!abierto || !comida) return null;

    const guardar = async (ev: FormEvent) => {
        ev.preventDefault(); setGuardando(true); setError('');
        const data: Record<string, unknown> = { tipo_componente: tipo, cantidad: num(cantidad), unidad, observaciones: observaciones || null };
        if (tipo === 'receta') data.id_receta = Number(seleccion);
        if (tipo === 'alimento') data.id_alimento = Number(seleccion);
        if (tipo === 'manual') Object.assign(data, { nombre_manual: nombre, calorias: num(calorias), proteinas: num(proteinas), carbohidratos: num(carbohidratos), grasas: num(grasas), fibra: num(fibra) });
        try {
            if (componente) await axios.patch(`/nutricionista/componentes-plan/${componente.id_componente_comida_plan}`, data, { headers: { Accept: 'application/json' } });
            else await axios.post(`/nutricionista/comidas-plan/${comida.id_comida_plan_alimentario}/componentes`, data, { headers: { Accept: 'application/json' } });
            cerrar(); onSuccess();
        } catch (x) { setError(errorDe(x)); } finally { setGuardando(false); }
    };

    const crearYAsignar = async (receta: RecetaCreada) => {
        const datos = {
            tipo_componente: 'receta', id_receta: receta.id_receta, cantidad: 1, unidad: 'porciÃ³n',
            observaciones: 'Receta personalizada creada y asignada por la nutricionista.',
        };
        if (componente) await axios.patch(`/nutricionista/componentes-plan/${componente.id_componente_comida_plan}`, datos, { headers: { Accept: 'application/json' } });
        else await axios.post(`/nutricionista/comidas-plan/${comida.id_comida_plan_alimentario}/componentes`, datos, { headers: { Accept: 'application/json' } });
        setCrearReceta(false);
        cerrar();
        onSuccess();
    };

    const macroLabels = ['Calorías', 'Proteínas', 'Carbs', 'Grasas', 'Fibra'] as const;
    const macroColors = ['text-brand-green-dark dark:text-brand-green', 'text-category-dairy', 'text-brand-orange', 'text-category-others', 'text-info'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-3xl rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between gap-3">
                    <div>
                        <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">{componente ? 'Cambiar receta asignada' : 'Agregar receta al tiempo de comida'}</h3>
                        <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">{comida.nombre_comida} · el cálculo definitivo se realiza en el servidor.</p>
                    </div>
                    <button type="button" onClick={cerrar}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.05] dark:hover:text-ink-dark">
                        <X size={16} />
                    </button>
                </div>

                <form className="mt-5 space-y-4" onSubmit={guardar}>
                    <div className="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
                        <CookingPot size={18} className="mt-0.5 shrink-0 text-brand-green-dark dark:text-brand-green" />
                        <div>
                            <p className="text-[12px] font-semibold text-ink dark:text-ink-dark">PlanificaciÃ³n basada en recetas</p>
                            <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Seleccione una receta existente o cree una personalizada usando alimentos del catÃ¡logo.</p>
                        </div>
                    </div>

                    {/* Búsqueda + selección */}
                    {tipo !== 'manual' && (
                        <>
                            <div className="relative">
                                <Search size={15} className="absolute left-3.5 top-3.5 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                                <input className={`${inputClass} pl-10`} placeholder={`Buscar ${tipo}...`} value={buscar} onChange={ev => setBuscar(ev.target.value)} />
                            </div>
                            <div>
                                <div className="mb-1.5 flex items-center justify-between gap-3">
                                    <label className={`${labelClass} mb-0`}>Receta</label>
                                    <button type="button" onClick={() => setCrearReceta(true)} className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-green-dark hover:underline dark:text-brand-green"><Plus size={11}/> Crear nueva receta</button>
                                </div>
                                <select className={inputClass} required value={seleccion} onChange={ev => { setSeleccion(ev.target.value); const a = alimentos.find(x => x.id_alimento === Number(ev.target.value)); if (tipo === 'alimento' && a) setUnidad(a.unidad_base); }}>
                                    <option value="">Seleccionar…</option>
                                    {tipo === 'receta'
                                        ? recetasFiltradas.map(r => <option key={r.id_receta} value={r.id_receta}>{r.nombre} · {r.tipo_comida} · {r.calorias_totales} kcal</option>)
                                        : alimentosFiltrados.map(a => <option key={a.id_alimento} value={a.id_alimento}>{a.nombre} · {a.grupo_alimentario ?? 'sin grupo'} · {a.calorias} kcal</option>)
                                    }
                                </select>
                            </div>
                        </>
                    )}

                    {/* Nombre manual */}
                    {tipo === 'manual' && (
                        <div>
                            <label className={labelClass}>Nombre</label>
                            <input className={inputClass} required value={nombre} onChange={ev => setNombre(ev.target.value)} />
                        </div>
                    )}

                    {/* Cantidad y unidad */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Cantidad</label>
                            <input className={inputClass} required type="number" min="0.01" step="0.01" value={cantidad} onChange={ev => setCantidad(ev.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Unidad</label>
                            <input className={inputClass} required value={unidad} onChange={ev => setUnidad(ev.target.value)} />
                        </div>
                    </div>

                    {/* Macros manuales */}
                    {tipo === 'manual' && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                            {([['Calorías', calorias, setCalorias], ['Proteínas', proteinas, setProteinas], ['Carbohidratos', carbohidratos, setCarbohidratos], ['Grasas', grasas, setGrasas], ['Fibra', fibra, setFibra]] as const).map(([l, v, s]) => (
                                <div key={l}>
                                    <label className={labelClass}>{l}</label>
                                    <input className={inputSmClass} required type="number" min="0" step="0.01" value={v} onChange={ev => s(ev.target.value)} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Vista previa nutricional */}
                    <div className="rounded-xl border border-surface-border bg-black/[0.02] p-4 dark:border-surface-border-dark dark:bg-white/[0.03]">
                        <p className="mb-2.5 text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">Vista previa nutricional</p>
                        <div className="grid grid-cols-5 gap-2 text-center">
                            {Object.entries(vista).map(([k, v], i) => (
                                <div key={k}>
                                    <p className="text-[9px] capitalize text-ink-muted dark:text-ink-muted-dark">{macroLabels[i]}</p>
                                    <p className={clsx('text-[13px] font-bold mt-0.5', macroColors[i])}>{v.toFixed(1)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className={labelClass}>Observaciones</label>
                        <textarea className={`${inputClass} resize-none min-h-[70px]`} maxLength={1000} value={observaciones} onChange={ev => setObservaciones(ev.target.value)} />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl border border-category-fruits/20 bg-category-fruits/5 px-4 py-2.5 text-[11.5px] text-category-fruits">
                            {error}
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={cerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="sm" disabled={guardando}>
                            {guardando && <LoaderCircle className="animate-spin" size={14} />}
                            {componente ? 'Cambiar receta' : 'Asignar receta'}
                        </Boton>
                    </div>
                </form>
            </div>

            <ModalCrearReceta
                abierto={crearReceta}
                alimentos={alimentos.map(a => ({ ...a, cantidad_base: num(a.cantidad_base), calorias: num(a.calorias), proteinas: num(a.proteinas), carbohidratos: num(a.carbohidratos), grasas: num(a.grasas), fibra: num(a.fibra), grupo_alimentario: a.grupo_alimentario ?? '' }))}
                tipoComidaInicial={comida.tipo_comida}
                onCerrar={() => setCrearReceta(false)}
                onCreada={crearYAsignar}
            />

            {/* Backdrop */}
            <div className="absolute inset-0 -z-10" onClick={cerrar} />
        </div>
    );
}
