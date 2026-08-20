import axios, { AxiosError } from 'axios';
import { Clock3, LoaderCircle, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import type { ComidaPlan } from '@/Pages/Nutricionista/Pacientes/PerfilNutricional/tipos';

interface Props {
    comida: ComidaPlan | null;
    abierto: boolean;
    cerrar: () => void;
    onSuccess: () => void;
}

const mensajeError = (error: unknown) => {
    const response = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response?.data;
    return Object.values(response?.errors ?? {})[0]?.[0] ?? response?.message ?? 'No se pudo actualizar la comida.';
};

export default function ModalEditarComidaPlan({ comida, abierto, cerrar, onSuccess }: Props) {
    const [nombre, setNombre] = useState('');
    const [hora, setHora] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!comida) return;
        setNombre(comida.nombre_comida ?? '');
        setHora(String(comida.hora_sugerida ?? '').slice(0, 5));
        setObservaciones(comida.observaciones ?? '');
        setError('');
    }, [comida, abierto]);

    if (!abierto || !comida) return null;

    const guardar = async (event: FormEvent) => {
        event.preventDefault();
        setGuardando(true);
        setError('');
        try {
            await axios.patch(`/nutricionista/comidas-plan/${comida.id_comida_plan_alimentario}`, {
                nombre_comida: nombre,
                hora_sugerida: hora || null,
                observaciones: observaciones || null,
            }, { headers: { Accept: 'application/json' } });
            cerrar();
            onSuccess();
        } catch (e) {
            setError(mensajeError(e));
        } finally {
            setGuardando(false);
        }
    };

    return <dialog className="modal modal-open" aria-modal="true">
        <div className="modal-box max-w-xl">
            <div className="flex items-start justify-between gap-3">
                <div><h3 className="text-lg font-bold">Editar comida</h3><p className="text-sm text-base-content/60">Los totales se recalculan automáticamente desde sus componentes.</p></div>
                <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={cerrar}><X size={17}/></button>
            </div>
            <form className="mt-5 space-y-4" onSubmit={guardar}>
                <label className="form-control"><span className="label-text mb-1 font-semibold">Nombre de la comida</span><input className="input input-bordered w-full" required maxLength={150} value={nombre} onChange={e => setNombre(e.target.value)}/></label>
                <label className="form-control"><span className="label-text mb-1 font-semibold">Hora sugerida</span><div className="relative"><Clock3 className="absolute left-3 top-3.5 text-base-content/40" size={17}/><input className="input input-bordered w-full pl-10" type="time" value={hora} onChange={e => setHora(e.target.value)}/></div></label>
                <label className="form-control"><span className="label-text mb-1 font-semibold">Observaciones</span><textarea className="textarea textarea-bordered min-h-28" maxLength={1000} value={observaciones} onChange={e => setObservaciones(e.target.value)}/></label>
                {error && <div className="alert alert-error py-2 text-sm">{error}</div>}
                <div className="modal-action"><button type="button" className="btn btn-ghost" onClick={cerrar}>Cancelar</button><button className="btn btn-primary" disabled={guardando}>{guardando && <LoaderCircle className="animate-spin" size={16}/>}Guardar cambios</button></div>
            </form>
        </div>
        <button type="button" className="modal-backdrop" onClick={cerrar}>Cerrar</button>
    </dialog>;
}
