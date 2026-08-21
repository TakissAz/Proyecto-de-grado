import axios, { AxiosError } from 'axios';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

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
        <div className="rounded-xl border border-surface-border bg-black/[0.015] p-4 dark:border-surface-border-dark dark:bg-white/[0.02] space-y-3">

            <div>
                <h4 className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Validación médica</h4>
                <p className="mt-0.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                    Confirme el análisis asistido o rechácelo para complementar la valoración clínica.
                </p>
            </div>

            {/* Estado actual */}
            {resuelta && (
                <div className={clsx(
                    'flex items-center gap-2 rounded-xl px-3.5 py-2.5',
                    estadoActual === 'rechazado'
                        ? 'border border-category-fruits/20 bg-category-fruits/5 dark:bg-category-fruits/[0.06]'
                        : 'border border-brand-green/20 bg-brand-green/5 dark:bg-brand-green/[0.06]',
                )}>
                    <span className="text-[11px] text-ink dark:text-ink-dark">
                        Estado: <strong className="capitalize">{estadoActual}</strong>
                        {validadoPor != null ? ` · Validado por usuario #${validadoPor}` : ''}
                        {fechaValidacion ? ` · ${formatearFecha(fechaValidacion)}` : ''}
                    </span>
                </div>
            )}

            {/* Observación */}
            <div>
                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Observación</p>
                <textarea
                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[70px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                    maxLength={1000}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Observación clínica opcional"
                    disabled={procesando !== null}
                />
            </div>

            {/* Botones */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => validar('aprobado')}
                    disabled={procesando !== null || estadoActual === 'aprobado' || estadoActual === 'validado'}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-green/15 px-4 py-2 text-[11.5px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green/25 disabled:opacity-40 disabled:cursor-not-allowed dark:text-brand-green"
                >
                    {procesando === 'aprobado' ? <LoaderCircle size={13} className="animate-spin" /> : <CheckCircle2 size={13} strokeWidth={1.8} />}
                    {procesando === 'aprobado'
                        ? 'Aprobando...'
                        : estadoActual === 'rechazado'
                            ? 'Aprobar nuevamente'
                            : 'Aprobar resultado'}
                </button>
                <button
                    type="button"
                    onClick={() => validar('rechazado')}
                    disabled={procesando !== null || estadoActual === 'rechazado'}
                    className="inline-flex items-center gap-2 rounded-lg border border-category-fruits/30 px-4 py-2 text-[11.5px] font-semibold text-category-fruits transition-colors hover:bg-category-fruits/8 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {procesando === 'rechazado' ? <LoaderCircle size={13} className="animate-spin" /> : <XCircle size={13} strokeWidth={1.8} />}
                    {procesando === 'rechazado'
                        ? 'Actualizando...'
                        : estadoActual === 'aprobado' || estadoActual === 'validado'
                            ? 'Desaprobar resultado'
                            : 'Rechazar resultado'}
                </button>
            </div>

            {/* Mensaje feedback */}
            {mensaje && (
                <div className={clsx(
                    'rounded-xl px-3.5 py-2.5 text-[11.5px]',
                    esError
                        ? 'border border-category-fruits/20 bg-category-fruits/5 text-category-fruits'
                        : 'border border-brand-green/20 bg-brand-green/5 text-brand-green-dark dark:text-brand-green',
                )} role="status">
                    {mensaje}
                </div>
            )}
        </div>
    );
}

function formatearFecha(fecha: string): string {
    const valor = new Date(fecha);
    return Number.isNaN(valor.getTime()) ? fecha : valor.toLocaleString('es-BO');
}
