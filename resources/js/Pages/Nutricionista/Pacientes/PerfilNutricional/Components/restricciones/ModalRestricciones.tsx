import { useForm } from '@inertiajs/react';
import { X, ShieldAlert, Save, Skull, HeartCrack, Ban, XOctagon, AlertTriangle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Boton } from '@/Components/ui/boton';
import clsx from 'clsx';
import type { Registro } from '../../tipos';

interface Props {
    abierto: boolean;
    cerrar: () => void;
    registro: Registro | null;
    pacienteId: number;
}

const CAMPOS: { name: string; label: string; placeholder: string; icono: typeof AlertTriangle; color: string }[] = [
    { name: 'alergias', label: 'Alergias', placeholder: 'Escribe y presiona Enter...', icono: Skull, color: 'text-category-fruits' },
    { name: 'intolerancias', label: 'Intolerancias', placeholder: 'Escribe y presiona Enter...', icono: HeartCrack, color: 'text-brand-orange' },
    { name: 'alimentos_restringidos', label: 'Restringidos', placeholder: 'Escribe y presiona Enter...', icono: Ban, color: 'text-category-dairy' },
    { name: 'alimentos_no_tolerados', label: 'No tolerados', placeholder: 'Escribe y presiona Enter...', icono: XOctagon, color: 'text-category-fruits' },
    { name: 'alimentos_rechazados', label: 'Rechazados', placeholder: 'Escribe y presiona Enter...', icono: AlertTriangle, color: 'text-ink-muted dark:text-ink-muted-dark' },
];

function parseTags(valor: string): string[] {
    return valor.split(',').map(s => s.trim()).filter(Boolean);
}
function joinTags(tags: string[]): string {
    return tags.join(', ');
}

export default function ModalRestricciones({ abierto, cerrar, registro, pacienteId }: Props) {
    const id = registro ? (registro['id_restriccion_alimentaria'] ?? registro['id']) : null;
    const url = id
        ? `/nutricionista/pacientes/${pacienteId}/perfil-nutricional/restricciones/${id}`
        : `/nutricionista/pacientes/${pacienteId}/perfil-nutricional/restricciones`;

    const valoresIniciales = {
        alergias: String(registro?.alergias ?? ''),
        intolerancias: String(registro?.intolerancias ?? ''),
        alimentos_restringidos: String(registro?.alimentos_restringidos ?? ''),
        alimentos_no_tolerados: String(registro?.alimentos_no_tolerados ?? ''),
        alimentos_rechazados: String(registro?.alimentos_rechazados ?? ''),
        observaciones: String(registro?.observaciones ?? ''),
    };
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm(valoresIniciales);

    useEffect(() => { if (abierto) { setData(valoresIniciales); clearErrors(); } }, [abierto, id]);

    if (!abierto) return null;

    const enviar = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => { reset(); cerrar(); } };
        if (id) {
            post(`${url}?_method=PUT`, opts);
        } else {
            post(url, opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-category-fruits/15 text-category-fruits">
                            <ShieldAlert size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">
                                {id ? 'Editar restricciones' : 'Registrar restricciones'}
                            </h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                Escribe cada item y presiona Enter para agregar
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={cerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={enviar} className="p-6 space-y-4">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CAMPOS.map(campo => (
                            <CampoTags
                                key={campo.name}
                                label={campo.label}
                                placeholder={campo.placeholder}
                                icono={<campo.icono size={12} strokeWidth={1.8} className={campo.color} />}
                                valor={(data as any)[campo.name]}
                                onChange={(v) => setData(campo.name as any, v)}
                                error={(errors as any)[campo.name]}
                                badgeColor={campo.name === 'alergias' || campo.name === 'alimentos_no_tolerados' ? 'red' : campo.name === 'intolerancias' ? 'orange' : 'default'}
                            />
                        ))}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Observaciones</p>
                        <textarea
                            value={data.observaciones}
                            onChange={e => setData('observaciones', e.target.value)}
                            rows={2}
                            placeholder="Notas adicionales..."
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-none dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={cerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                            <Save size={14} strokeWidth={1.8} />
                            {processing ? 'Guardando...' : (id ? 'Actualizar' : 'Registrar')}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Campo de Tags ── */
function CampoTags({ label, placeholder, icono, valor, onChange, error, badgeColor }: {
    label: string; placeholder: string; icono: React.ReactNode; valor: string;
    onChange: (v: string) => void; error?: string; badgeColor?: 'red' | 'orange' | 'default';
}) {
    const [inputVal, setInputVal] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const tags = parseTags(valor);

    const bgCls = badgeColor === 'red'
        ? 'bg-category-fruits/15 text-category-fruits'
        : badgeColor === 'orange'
            ? 'bg-brand-orange/15 text-brand-orange'
            : 'bg-ink-muted/10 text-ink dark:text-ink-dark';

    function agregar(tag: string) {
        const limpio = tag.trim();
        if (!limpio || tags.includes(limpio)) return;
        onChange(joinTags([...tags, limpio]));
        setInputVal('');
    }

    function quitar(index: number) {
        onChange(joinTags(tags.filter((_, i) => i !== index)));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') { e.preventDefault(); agregar(inputVal); }
        if (e.key === 'Backspace' && !inputVal && tags.length > 0) quitar(tags.length - 1);
    }

    return (
        <div>
            <div className="flex items-center gap-1.5 mb-1.5">
                {icono}
                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">{label}</p>
            </div>
            <div
                className="flex flex-wrap items-center gap-1.5 rounded-xl border border-surface-border bg-[#FAF9F6] px-3 py-2 min-h-[44px] cursor-text dark:border-surface-border-dark dark:bg-[#20232B] focus-within:border-category-fruits/50"
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map((tag, i) => (
                    <span key={`${tag}-${i}`} className={clsx('inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold', bgCls)}>
                        {tag}
                        <button type="button" onClick={(e) => { e.stopPropagation(); quitar(i); }} className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 text-[9px]">×</button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => { if (inputVal.trim()) agregar(inputVal); }}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[80px] bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-muted/40 dark:text-ink-dark"
                />
            </div>
            {error && <p className="mt-1 text-[10px] text-category-fruits">{error}</p>}
        </div>
    );
}
