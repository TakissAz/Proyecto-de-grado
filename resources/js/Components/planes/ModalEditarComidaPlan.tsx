import axios, { AxiosError } from 'axios';
import { Clock3, LoaderCircle, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Boton } from '@/Components/ui/boton';
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-xl rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">Editar comida</h3>
                        <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">Los totales se recalculan automáticamente desde sus componentes.</p>
                    </div>
                    <button type="button" onClick={cerrar}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.05] dark:hover:text-ink-dark">
                        <X size={16} />
                    </button>
                </div>

                {/* Formulario */}
                <form className="mt-5 space-y-4" onSubmit={guardar}>
                    {/* Nombre */}
                    <div>
                        <label className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5 block">Nombre de la comida</label>
                        <input
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                            required maxLength={150} value={nombre} onChange={ev => setNombre(ev.target.value)}
                        />
                    </div>

                    {/* Hora sugerida */}
                    <div>
                        <label className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5 block">Hora sugerida</label>
                        <div className="relative">
                            <Clock3 className="absolute left-3 top-3 text-ink-muted/40 dark:text-ink-muted-dark/40" size={16} />
                            <input
                                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] pl-10 pr-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                type="time" value={hora} onChange={ev => setHora(ev.target.value)}
                            />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5 block">Observaciones</label>
                        <textarea
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 resize-none min-h-[100px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                            maxLength={1000} value={observaciones} onChange={ev => setObservaciones(ev.target.value)}
                        />
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
                            Guardar cambios
                        </Boton>
                    </div>
                </form>
            </div>

            {/* Backdrop click */}
            <div className="absolute inset-0 -z-10" onClick={cerrar} />
        </div>
    );
}
