import { useState, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import clsx from 'clsx';

export interface AlimentoOpcion {
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
    alimentos: AlimentoOpcion[];
    onSeleccionar: (alimento: AlimentoOpcion) => void;
    onCrearNuevo: () => void;
}

export default function BuscadorIngredientes({ alimentos, onSeleccionar, onCrearNuevo }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [abierto, setAbierto] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const resultados = busqueda.length >= 2
        ? alimentos.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 8)
        : [];

    function seleccionar(alimento: AlimentoOpcion) {
        onSeleccionar(alimento);
        setBusqueda('');
        setAbierto(false);
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search size={14} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar ingrediente... (ej: pollo, arroz, tomate)"
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setAbierto(true); }}
                    onFocus={() => setAbierto(true)}
                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] py-3 pl-10 pr-4
                        text-[13px] text-ink outline-none transition-all focus:border-brand-green/50 focus:shadow-sm
                        dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                />
            </div>

            {/* Dropdown de resultados */}
            {abierto && busqueda.length >= 2 && (
                <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-surface-border bg-surface-card shadow-lg dark:border-surface-border-dark dark:bg-surface-card-dark">
                    {resultados.length > 0 ? (
                        <div className="max-h-[220px] overflow-y-auto p-1.5">
                            {resultados.map((a) => (
                                <button
                                    key={a.id_alimento}
                                    type="button"
                                    onClick={() => seleccionar(a)}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-brand-green-soft dark:hover:bg-brand-green-dark/15"
                                >
                                    <div>
                                        <p className="text-[12.5px] font-medium text-ink dark:text-ink-dark">{a.nombre}</p>
                                        <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{a.grupo_alimentario} · {a.cantidad_base}{a.unidad_base}</p>
                                    </div>
                                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{a.calorias} kcal</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mb-2">No se encontró "{busqueda}"</p>
                        </div>
                    )}

                    {/* Botón crear nuevo */}
                    <div className="border-t border-surface-border p-1.5 dark:border-surface-border-dark">
                        <button
                            type="button"
                            onClick={() => { onCrearNuevo(); setAbierto(false); setBusqueda(''); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15"
                        >
                            <Plus size={14} strokeWidth={1.8} /> Crear ingrediente nuevo
                        </button>
                    </div>
                </div>
            )}

            {/* Cerrar al hacer clic fuera */}
            {abierto && <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)} />}
        </div>
    );
}
