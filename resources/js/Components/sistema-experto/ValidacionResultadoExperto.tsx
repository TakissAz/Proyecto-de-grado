import axios, { AxiosError } from 'axios';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface RespuestaValidacion {
    success: boolean;
    message: string;
    data?: unknown;
}

interface Props {
    url: string;
    estadoActual?: string | null;
    validadoPor?: number | string | null;
    fechaValidacion?: string | null;
    observacionActual?: string | null;
    onSuccess?: (data: unknown) => void;
    onRejected?: () => void;
}

export default function ValidacionResultadoExperto({
    url,
    estadoActual,
    validadoPor,
    fechaValidacion,
    observacionActual,
    onSuccess,
    onRejected,
}: Props) {
    const [observacion, setObservacion] = useState(observacionActual ?? '');
    const [procesando, setProcesando] = useState<'aprobado' | 'rechazado' | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [esError, setEsError] = useState(false);
    const resuelta = ['aprobado', 'validado', 'rechazado'].includes(estadoActual ?? '');

    const validar = async (estado: 'aprobado' | 'rechazado') => {
        setProcesando(estado);
        setMensaje(null);
        setEsError(false);

        try {
            const respuesta = await axios.post<RespuestaValidacion>(url, {
                estado_validacion_experta: estado,
                observacion_validacion: observacion.trim() || null,
            }, {
                headers: { Accept: 'application/json' },
            });
            setMensaje(estado === 'aprobado'
                ? 'Resultado experto aprobado correctamente.'
                : 'Resultado experto rechazado correctamente.');
            onSuccess?.(respuesta.data.data);
            if (estado === 'rechazado') onRejected?.();
        } catch (error) {
            const axiosError = error as AxiosError<RespuestaValidacion>;
            setMensaje(axiosError.response?.data?.message ?? 'No se pudo validar el resultado experto.');
            setEsError(true);
        } finally {
            setProcesando(null);
        }
    };

    return (
        <div className="card border border-base-300 bg-base-100 shadow-none">
            <div className="card-body gap-3 p-4">
                <div>
                    <h4 className="text-sm font-bold">Validación médica</h4>
                    <p className="mt-0.5 text-xs text-base-content/60">
                        Confirme el análisis asistido o rechácelo para complementar la valoración clínica.
                    </p>
                </div>

                {resuelta && (
                    <div className="alert alert-info py-2 text-xs">
                        <span>
                            Estado: <strong>{estadoActual}</strong>
                            {validadoPor != null ? ` · Validado por usuario #${validadoPor}` : ''}
                            {fechaValidacion ? ` · ${formatearFecha(fechaValidacion)}` : ''}
                        </span>
                    </div>
                )}

                <label className="form-control">
                    <span className="label-text mb-1 text-xs font-semibold">Observación</span>
                    <textarea
                        className="textarea textarea-bordered min-h-20 text-sm"
                        maxLength={1000}
                        value={observacion}
                        onChange={(evento) => setObservacion(evento.target.value)}
                        placeholder="Observación clínica opcional"
                        disabled={procesando !== null}
                    />
                </label>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-success btn-sm gap-2"
                        onClick={() => validar('aprobado')}
                        disabled={procesando !== null || estadoActual === 'aprobado' || estadoActual === 'validado'}
                    >
                        {procesando === 'aprobado' ? <LoaderCircle size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                        {procesando === 'aprobado'
                            ? 'Aprobando...'
                            : estadoActual === 'rechazado'
                                ? 'Aprobar nuevamente'
                                : 'Aprobar resultado'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-error btn-outline btn-sm gap-2"
                        onClick={() => validar('rechazado')}
                        disabled={procesando !== null || estadoActual === 'rechazado'}
                    >
                        {procesando === 'rechazado' ? <LoaderCircle size={15} className="animate-spin" /> : <XCircle size={15} />}
                        {procesando === 'rechazado'
                            ? 'Actualizando decisión...'
                            : estadoActual === 'aprobado' || estadoActual === 'validado'
                                ? 'Desaprobar resultado'
                                : 'Rechazar resultado'}
                    </button>
                </div>

                {mensaje && (
                    <div className={`alert py-2 text-xs ${esError ? 'alert-error' : 'alert-success'}`} role="status">
                        <span>{mensaje}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatearFecha(fecha: string): string {
    const valor = new Date(fecha);
    return Number.isNaN(valor.getTime()) ? fecha : valor.toLocaleString('es-BO');
}
