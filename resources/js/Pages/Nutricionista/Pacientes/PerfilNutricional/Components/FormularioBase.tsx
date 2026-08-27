import { useForm } from '@inertiajs/react';
import { LoaderCircle, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';
import { normalizarFechaInput, type CampoFormulario, type Registro } from '../tipos';

interface Props {
    abierto: boolean; cerrar: () => void; titulo: string; campos: CampoFormulario[];
    registro: Registro | null; url: string;
}

const inputClass = 'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';
const labelClass = 'text-[11px] font-semibold text-ink dark:text-ink-dark mb-1.5 block';

export default function FormularioBase({ abierto, cerrar, titulo, campos, registro, url }: Props) {
    const inicial = useMemo(
        () => Object.fromEntries(campos.map((campo) => {
            const valor = registro?.[campo.name];
            if (campo.type === 'date') return [campo.name, normalizarFechaInput(valor)];
            return [campo.name, valor ?? (campo.type === 'checkbox' ? false : '')];
        })),
        [campos, registro],
    );
    const firmaInicial = JSON.stringify(inicial);
    const { data, setData, post, processing, errors, clearErrors } = useForm<Record<string, string | number | boolean | null>>(inicial);

    useEffect(() => {
        if (!abierto) return;
        setData(inicial);
        clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [abierto, firmaInicial, url]);

    if (!abierto) return null;

    const enviar = (e: React.FormEvent) => {
        e.preventDefault();
        const opciones = { preserveScroll: true, onSuccess: cerrar };
        registro ? post(`${url}?_method=PUT`, opciones) : post(url, opciones);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-3xl rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-surface-border/60 dark:border-surface-border-dark/60 shrink-0 bg-brand-green/[0.03] dark:bg-brand-green/[0.05]">
                    <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Expediente nutricional</p>
                        <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark mt-0.5">{titulo}</h3>
                    </div>
                    <button type="button" onClick={cerrar} aria-label="Cerrar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.05] dark:hover:text-ink-dark">
                        <X size={18} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={enviar} className="flex-1 overflow-y-auto p-6 grid gap-4 sm:grid-cols-2">
                    {campos.map((campo) => {
                        const error = errors[campo.name];
                        if (campo.type === 'checkbox') {
                            return (
                                <label key={campo.name} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-surface-border px-4 dark:border-surface-border-dark sm:col-span-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-surface-border accent-brand-green dark:border-surface-border-dark" checked={Boolean(data[campo.name])} onChange={(e) => setData(campo.name, e.target.checked)} />
                                    <span className="text-[13px] font-medium text-ink dark:text-ink-dark">{campo.label}</span>
                                </label>
                            );
                        }
                        return (
                            <div key={campo.name} className={campo.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                <label className={labelClass}>{campo.label}</label>
                                {campo.type === 'textarea' ? (
                                    <textarea className={clsx(inputClass, 'resize-none min-h-[90px]', error && 'border-category-fruits')} value={String(data[campo.name] ?? '')} onChange={(e) => setData(campo.name, e.target.value)} />
                                ) : campo.type === 'select' ? (
                                    <select className={clsx(inputClass, error && 'border-category-fruits')} value={String(data[campo.name] ?? '')} onChange={(e) => setData(campo.name, e.target.value)}>
                                        <option value="">Seleccione</option>
                                        {campo.options?.map((v) => <option key={v} value={v}>{v.replaceAll('_', ' ')}</option>)}
                                    </select>
                                ) : (
                                    <input type={campo.type ?? 'text'} step={campo.step} className={clsx(inputClass, error && 'border-category-fruits')} value={String(data[campo.name] ?? '')} onChange={(e) => setData(campo.name, e.target.value)} />
                                )}
                                {error && <span className="mt-1 block text-[11px] text-category-fruits">{error}</span>}
                            </div>
                        );
                    })}
                    {errors.consulta && (
                        <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-2.5 text-[11.5px] text-brand-orange sm:col-span-2">{errors.consulta}</div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-border/60 dark:border-surface-border-dark/60 shrink-0">
                    <Boton type="button" variante="ghost" tamano="sm" onClick={cerrar}>Cancelar</Boton>
                    <Boton type="submit" variante="primary" tamano="sm" disabled={processing} onClick={enviar}>
                        {processing && <LoaderCircle size={14} className="animate-spin" />} Guardar
                    </Boton>
                </div>
            </div>
            <div className="absolute inset-0 -z-10" onClick={cerrar} />
        </div>
    );
}
