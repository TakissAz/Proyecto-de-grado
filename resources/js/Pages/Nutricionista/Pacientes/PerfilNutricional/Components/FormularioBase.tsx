import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { normalizarFechaInput, type CampoFormulario, type Registro } from '../tipos';

interface Props {
    abierto: boolean; cerrar: () => void; titulo: string; campos: CampoFormulario[];
    registro: Registro | null; url: string;
}

export default function FormularioBase({ abierto, cerrar, titulo, campos, registro, url }: Props) {
    const inicial = useMemo(
        () => Object.fromEntries(campos.map((campo) => {
            const valor = registro?.[campo.name];

            if (campo.type === 'date') {
                return [campo.name, normalizarFechaInput(valor)];
            }

            return [campo.name, valor ?? (campo.type === 'checkbox' ? false : '')];
        })),
        [campos, registro],
    );
    const firmaInicial = JSON.stringify(inicial);
    const { data, setData, post, put, processing, errors, clearErrors } = useForm<Record<string, string | number | boolean | null>>(inicial);

    useEffect(() => {
        if (! abierto) return;

        setData(inicial);
        clearErrors();
    }, [abierto, firmaInicial, url]);
    if (!abierto) return null;
    const enviar = (e: React.FormEvent) => {
        e.preventDefault();
        const opciones = { preserveScroll: true, onSuccess: cerrar };
        registro ? put(url, opciones) : post(url, opciones);
    };
    return (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
            <div className="modal-box flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-3xl flex-col overflow-hidden bg-base-100 p-4 text-base-content sm:max-h-[calc(100dvh-2rem)] sm:p-6">
                <div className="mb-4 flex shrink-0 items-start justify-between gap-3 border-b border-base-300 pb-4 sm:mb-5 sm:gap-4">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Expediente nutricional</p><h3 id="titulo-modal" className="text-xl font-bold">{titulo}</h3></div>
                    <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={cerrar} aria-label="Cerrar"><X size={18}/></button>
                </div>
                <form onSubmit={enviar} className="grid min-h-0 gap-4 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2">
                    {campos.map((campo) => {
                        const error = errors[campo.name];
                        if (campo.type === 'checkbox') return <label key={campo.name} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-base-300 px-4"><input type="checkbox" className="checkbox checkbox-primary" checked={Boolean(data[campo.name])} onChange={(e) => setData(campo.name, e.target.checked)}/><span className="text-sm font-medium">{campo.label}</span></label>;
                        return <label key={campo.name} className={`form-control ${campo.type === 'textarea' ? 'sm:col-span-2' : ''}`}><span className="label-text mb-1.5 font-medium">{campo.label}</span>
                            {campo.type === 'textarea' ? <textarea className={`textarea textarea-bordered min-h-24 ${error ? 'textarea-error' : ''}`} value={String(data[campo.name] ?? '')} onChange={(e) => setData(campo.name, e.target.value)}/> :
                             campo.type === 'select' ? <select className={`select select-bordered ${error ? 'select-error' : ''}`} value={String(data[campo.name] ?? '')} onChange={(e) => setData(campo.name, e.target.value)}><option value="">Seleccione</option>{campo.options?.map((v) => <option key={v} value={v}>{v.replaceAll('_', ' ')}</option>)}</select> :
                             <input type={campo.type ?? 'text'} step={campo.step} className={`input input-bordered ${error ? 'input-error' : ''}`} value={String(data[campo.name] ?? '')} onChange={(e) => setData(campo.name, e.target.value)}/>}
                            {error && <span className="mt-1 text-xs text-error">{error}</span>}</label>;
                    })}
                    {errors.consulta && <div className="alert alert-warning sm:col-span-2 text-sm">{errors.consulta}</div>}
                    <div className="modal-action sticky bottom-0 z-10 -mx-1 flex-wrap border-t border-base-300 bg-base-100 px-1 pt-4 sm:col-span-2"><button type="button" className="btn btn-ghost" onClick={cerrar}>Cancelar</button><button className="btn btn-primary" disabled={processing}>{processing ? <span className="loading loading-spinner loading-sm"/> : null} Guardar</button></div>
                </form>
            </div>
            <button className="modal-backdrop" onClick={cerrar}>Cerrar</button>
        </div>
    );
}
