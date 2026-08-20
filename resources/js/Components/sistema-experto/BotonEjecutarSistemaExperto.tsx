import axios, { AxiosError } from 'axios';
import { BrainCircuit, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface RespuestaSistemaExperto {
    success: boolean;
    message: string;
    data?: unknown;
}

interface Props {
    url: string;
    label?: string;
    successMessage?: string;
    onSuccess?: (data: unknown) => void;
    onError?: (message: string) => void;
    disabled?: boolean;
}

export default function BotonEjecutarSistemaExperto({
    url,
    label = 'Generar análisis clínico asistido',
    successMessage = 'Análisis clínico generado correctamente.',
    onSuccess,
    onError,
    disabled = false,
}: Props) {
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [esError, setEsError] = useState(false);

    const ejecutar = async () => {
        setProcesando(true);
        setMensaje(null);
        setEsError(false);

        try {
            const respuesta = await axios.post<RespuestaSistemaExperto>(url, {}, {
                headers: { Accept: 'application/json' },
            });
            setMensaje(successMessage);
            onSuccess?.(respuesta.data.data);
        } catch (error) {
            const axiosError = error as AxiosError<RespuestaSistemaExperto>;
            const estado = axiosError.response?.status;
            const mensajeError = estado === 502
                ? 'No se pudo conectar con el sistema experto. Verifica que el microservicio esté activo.'
                : 'No se pudo ejecutar el sistema experto.';
            setMensaje(mensajeError);
            setEsError(true);
            onError?.(axiosError.response?.data?.message ?? mensajeError);
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                type="button"
                className="btn btn-primary btn-sm gap-2"
                onClick={ejecutar}
                disabled={disabled || procesando}
            >
                {procesando ? (
                    <LoaderCircle size={15} className="animate-spin" />
                ) : (
                    <BrainCircuit size={15} />
                )}
                {procesando ? 'Analizando información clínica...' : label}
            </button>

            {mensaje && (
                <div className={`alert py-2 text-xs ${esError ? 'alert-error' : 'alert-success'}`} role="status">
                    <span>{mensaje}</span>
                </div>
            )}
        </div>
    );
}
