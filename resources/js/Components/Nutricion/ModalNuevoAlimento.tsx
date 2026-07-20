import { useState } from 'react';
import { X, Save, Apple, Beaker, Leaf } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import clsx from 'clsx';

interface AlimentoCreado {
    id_alimento: number;
    nombre: string;
    grupo_alimentario: string;
    unidad_base: string;
    cantidad_base: number;
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    fibra: number;
    disponibilidad_temporal?: string | null;
}

interface Props {
    abierto: boolean;
    onCerrar: () => void;
    onCreado: (alimento: AlimentoCreado) => void;
}

const GRUPOS = [
    { id: 'proteina', label: 'Proteína', color: 'border-category-fruits text-category-fruits bg-category-fruits/10' },
    { id: 'carbohidrato', label: 'Carbohidrato', color: 'border-brand-orange text-brand-orange bg-brand-orange/10' },
    { id: 'verdura', label: 'Verdura', color: 'border-category-grains text-category-grains bg-category-grains/10' },
    { id: 'fruta', label: 'Fruta', color: 'border-category-dairy text-category-dairy bg-category-dairy/10' },
    { id: 'lacteo', label: 'Lácteo', color: 'border-category-others text-category-others bg-category-others/10' },
    { id: 'grasa', label: 'Grasa', color: 'border-brand-peach text-brand-peach bg-brand-peach/10' },
    { id: 'legumbre', label: 'Legumbre', color: 'border-brand-green text-brand-green-dark bg-brand-green/10' },
    { id: 'semilla', label: 'Semilla', color: 'border-category-protein text-category-protein bg-category-protein/10' },
] as const;

export default function ModalNuevoAlimento({ abierto, onCerrar, onCreado }: Props) {
    const [paso, setPaso] = useState<1 | 2>(1);
    const [nombre, setNombre] = useState('');
    const [grupo, setGrupo] = useState('');
    const [unidadBase, setUnidadBase] = useState('g');
    const [cantidadBase, setCantidadBase] = useState('100');
    const [calorias, setCalorias] = useState('');
    const [proteinas, setProteinas] = useState('');
    const [carbohidratos, setCarbohidratos] = useState('');
    const [grasas, setGrasas] = useState('');
    const [fibra, setFibra] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState<Record<string, string>>({});

    if (!abierto) return null;

    function reset() {
        setPaso(1); setNombre(''); setGrupo(''); setUnidadBase('g');
        setCantidadBase('100'); setCalorias(''); setProteinas('');
        setCarbohidratos(''); setGrasas(''); setFibra(''); setErrores({});
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setGuardando(true);
        setErrores({});

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

        try {
            const res = await fetch('/nutricionista/alimentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    nombre, grupo_alimentario: grupo, unidad_base: unidadBase,
                    cantidad_base: Number(cantidadBase), calorias: Number(calorias),
                    proteinas: Number(proteinas), carbohidratos: Number(carbohidratos),
                    grasas: Number(grasas), fibra: Number(fibra) || 0,
                    indice_glucemico: null, observaciones: null,
                }),
            });

            if (res.status === 422) {
                const data = await res.json();
                setErrores(data.errors ?? {});
                setGuardando(false);
                return;
            }

            if (!res.ok) {
                setErrores({ nombre: 'Error al guardar.' });
                setGuardando(false);
                return;
            }

            const creado = await res.json();
            onCreado(creado);
            reset();
            onCerrar();
        } catch {
            setErrores({ nombre: 'Error de conexión.' });
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onCerrar} />

            <div className="relative z-10 w-full max-w-xl rounded-2xl border border-surface-border bg-surface-card p-6 shadow-xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <Apple size={16} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Nuevo ingrediente</h3>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                {paso === 1 ? 'Paso 1: Nombre y tipo' : 'Paso 2: Valores nutricionales'}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={() => { reset(); onCerrar(); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={15} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="mb-5 flex gap-1.5">
                    <div className={clsx('h-1 flex-1 rounded-full', paso >= 1 ? 'bg-brand-green' : 'bg-surface-border dark:bg-surface-border-dark')} />
                    <div className={clsx('h-1 flex-1 rounded-full', paso >= 2 ? 'bg-brand-green' : 'bg-surface-border dark:bg-surface-border-dark')} />
                </div>

                <form onSubmit={handleSubmit}>
                    {paso === 1 && (
                        <div className="space-y-4">
                            {/* Nombre */}
                            <div>
                                <label className="mb-1.5 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">Nombre del alimento</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej: Pollo, Arroz, Quinua..."
                                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none transition-all focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                    required
                                />
                                {errores.nombre && <p className="mt-1 text-[10.5px] text-category-fruits">{errores.nombre}</p>}
                            </div>

                            {/* Grupo alimentario como chips */}
                            <div>
                                <label className="mb-2 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">¿A qué grupo pertenece?</label>
                                <div className="grid grid-cols-4 gap-2.5">
                                    {GRUPOS.map((g) => (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => setGrupo(g.id)}
                                            className={clsx(
                                                'rounded-xl border-2 px-3 py-2.5 text-[11.5px] font-semibold transition-all',
                                                grupo === g.id ? `${g.color} shadow-sm` : 'border-surface-border text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark'
                                            )}
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                                {errores.grupo_alimentario && <p className="mt-1 text-[10.5px] text-category-fruits">{errores.grupo_alimentario}</p>}
                            </div>

                            {/* Siguiente */}
                            <div className="flex justify-end pt-2">
                                <Boton type="button" variante="primary" tamano="sm" onClick={() => setPaso(2)} disabled={!nombre || !grupo}>
                                    Siguiente →
                                </Boton>
                            </div>
                        </div>
                    )}

                    {paso === 2 && (
                        <div className="space-y-4">
                            {/* Unidad + cantidad */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">Unidad base</label>
                                    <div className="flex gap-1.5">
                                        {['g', 'ml', 'unidad'].map((u) => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => setUnidadBase(u)}
                                                className={clsx(
                                                    'flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold transition-all',
                                                    unidadBase === u
                                                        ? 'border-brand-green bg-brand-green/10 text-brand-green-dark dark:text-brand-green'
                                                        : 'border-surface-border text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark'
                                                )}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">Cantidad base</label>
                                    <input type="number" min={1} step="0.01" value={cantidadBase} onChange={e => setCantidadBase(e.target.value)} className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" required />
                                </div>
                            </div>

                            {/* Valores nutricionales */}
                            <div>
                                <label className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                    <Beaker size={12} strokeWidth={1.8} className="text-brand-orange" />
                                    Valores por {cantidadBase}{unidadBase}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <NutriInput label="Calorías" value={calorias} onChange={setCalorias} color="text-brand-orange" error={errores.calorias} />
                                    <NutriInput label="Proteínas" value={proteinas} onChange={setProteinas} color="text-category-fruits" error={errores.proteinas} />
                                    <NutriInput label="Carbos" value={carbohidratos} onChange={setCarbohidratos} color="text-category-grains" error={errores.carbohidratos} />
                                    <NutriInput label="Grasas" value={grasas} onChange={setGrasas} color="text-category-dairy" error={errores.grasas} />
                                    <NutriInput label="Fibra" value={fibra} onChange={setFibra} color="text-brand-green-dark" error={errores.fibra} />
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center justify-between pt-2 border-t border-surface-border dark:border-surface-border-dark">
                                <button type="button" onClick={() => setPaso(1)} className="text-[12px] font-semibold text-ink-muted hover:text-ink transition-colors dark:text-ink-muted-dark dark:hover:text-ink-dark">
                                    ← Atrás
                                </button>
                                <Boton type="submit" variante="primary" tamano="sm" disabled={guardando}>
                                    <Save size={13} strokeWidth={1.8} /> {guardando ? 'Guardando...' : 'Crear ingrediente'}
                                </Boton>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

function NutriInput({ label, value, onChange, color, error }: { label: string; value: string; onChange: (v: string) => void; color: string; error?: string }) {
    return (
        <div>
            <label className={clsx('mb-1 block text-[10px] font-semibold', color)}>{label}</label>
            <input
                type="number"
                min={0}
                step="0.01"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-[#FAF9F6] px-2.5 py-2 text-[12px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            {error && <p className="mt-0.5 text-[9.5px] text-category-fruits">{error}</p>}
        </div>
    );
}
