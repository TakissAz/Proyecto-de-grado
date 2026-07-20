import { Plus, X } from 'lucide-react';

interface Props {
    pasos: string[];
    onChange: (pasos: string[]) => void;
}

export default function EditorPreparacion({ pasos, onChange }: Props) {
    function agregarPaso() {
        onChange([...pasos, '']);
    }

    function actualizarPaso(index: number, valor: string) {
        const nuevos = [...pasos];
        nuevos[index] = valor;
        onChange(nuevos);
    }

    function quitarPaso(index: number) {
        onChange(pasos.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-3">
            {pasos.map((paso, i) => (
                <div key={i} className="flex items-start gap-3">
                    {/* Número del paso */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-[11px] font-bold text-brand-green-dark dark:bg-brand-green-dark/20 dark:text-brand-green">
                        {i + 1}
                    </div>

                    {/* Input */}
                    <input
                        type="text"
                        value={paso}
                        onChange={(e) => actualizarPaso(i, e.target.value)}
                        placeholder={`Paso ${i + 1}...`}
                        className="flex-1 rounded-lg border border-surface-border bg-[#FAF9F6] px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-brand-green/50 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                    />

                    {/* Quitar */}
                    <button
                        type="button"
                        onClick={() => quitarPaso(i)}
                        className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-muted transition-colors hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark"
                    >
                        <X size={13} strokeWidth={1.8} />
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={agregarPaso}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green-soft dark:text-brand-green dark:hover:bg-brand-green-dark/15"
            >
                <Plus size={14} strokeWidth={1.8} /> Agregar paso
            </button>
        </div>
    );
}
