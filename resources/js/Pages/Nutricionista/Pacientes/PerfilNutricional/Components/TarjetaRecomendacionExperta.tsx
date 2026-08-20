import axios, { AxiosError } from 'axios';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    BrainCircuit,
    CheckCircle2,
    LoaderCircle,
    ShieldCheck,
    Sparkles,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { etiqueta, type RecomendacionNutricionalExperta } from '../tipos';

interface Props {
    pacienteId: number;
    recomendacion: RecomendacionNutricionalExperta | null;
}

interface RespuestaApi {
    success: boolean;
    message: string;
    data?: RecomendacionNutricionalExperta;
}

const numero = (valor: number | string | null, decimales = 0) => {
    if (valor === null || valor === '') return '—';
    return new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
    }).format(Number(valor));
};

const explicaciones = (valor: string | null): string[] => {
    if (!valor) return [];
    try {
        const decodificado: unknown = JSON.parse(valor);
        return Array.isArray(decodificado) ? decodificado.map(String) : [valor];
    } catch {
        return [valor];
    }
};

const listaHecho = (hechos: Record<string, unknown> | null | undefined, campo: string): string[] => {
    const valor = hechos?.[campo];
    if (Array.isArray(valor)) return valor.map(String).filter(Boolean);
    if (typeof valor === 'string' && valor.trim()) return [valor.trim()];
    return [];
};

export default function TarjetaRecomendacionExperta({ pacienteId, recomendacion }: Props) {
    const [procesando, setProcesando] = useState<'generar' | 'aprobado' | 'rechazado' | null>(null);
    const [observacion, setObservacion] = useState(recomendacion?.observacion_validacion ?? '');
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const resuelta = ['aprobado', 'validado', 'rechazado'].includes(
        recomendacion?.estado_validacion_experta ?? ''
    );

    const recargar = () => router.reload({ only: ['recomendacionExperta'] });

    const generar = async () => {
        setProcesando('generar');
        setMensaje(null);
        setError(false);
        try {
            const respuesta = await axios.post<RespuestaApi>(
                `/nutricionista/pacientes/${pacienteId}/recomendacion-experta/generar`,
                {},
                { headers: { Accept: 'application/json' } }
            );
            setMensaje(respuesta.data.message);
            recargar();
        } catch (excepcion) {
            const fallo = excepcion as AxiosError<RespuestaApi>;
            setError(true);
            setMensaje(fallo.response?.status === 502
                ? 'No se pudo conectar con el sistema experto nutricional. Verifica que el microservicio esté activo.'
                : fallo.response?.data?.message ?? 'No se pudo generar la recomendación nutricional experta.');
        } finally {
            setProcesando(null);
        }
    };

    const validar = async (estado: 'aprobado' | 'rechazado') => {
        if (!recomendacion || resuelta) return;
        setProcesando(estado);
        setMensaje(null);
        setError(false);
        try {
            const respuesta = await axios.post<RespuestaApi>(
                `/nutricionista/recomendaciones-expertas/${recomendacion.id_recomendacion_nutricional_experta}/validar`,
                {
                    estado_validacion_experta: estado,
                    observacion_validacion: observacion.trim() || null,
                },
                { headers: { Accept: 'application/json' } }
            );
            setMensaje(respuesta.data.message);
            recargar();
        } catch (excepcion) {
            const fallo = excepcion as AxiosError<RespuestaApi>;
            setError(true);
            setMensaje(fallo.response?.data?.message ?? 'No se pudo validar la recomendación.');
        } finally {
            setProcesando(null);
        }
    };

    return (
        <article className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-5 p-4 sm:p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary"><BrainCircuit size={22} /></div>
                        <div>
                            <h3 className="text-base font-bold text-base-content">Recomendación nutricional experta</h3>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-base-content/60">
                                Orientación clínica generada con ZEN Engine a partir del perfil endocrinológico y nutricional.
                            </p>
                        </div>
                    </div>
                    {recomendacion && (
                        <span className={`badge gap-1 ${recomendacion.estado_validacion_experta === 'aprobado' || recomendacion.estado_validacion_experta === 'validado' ? 'badge-success' : recomendacion.estado_validacion_experta === 'rechazado' ? 'badge-error' : 'badge-warning'}`}>
                            <ShieldCheck size={12} /> {etiqueta(recomendacion.estado_validacion_experta)}
                        </span>
                    )}
                </header>

                {!recomendacion ? (
                    <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-6 text-center">
                        <Sparkles className="mx-auto mb-3 text-primary/60" size={28} />
                        <p className="text-sm text-base-content/65">Aún no se generó una recomendación nutricional experta.</p>
                        <button className="btn btn-primary btn-sm mt-4 gap-2" type="button" onClick={generar} disabled={procesando !== null}>
                            {procesando === 'generar' ? <LoaderCircle className="animate-spin" size={15} /> : <BrainCircuit size={15} />}
                            {procesando === 'generar' ? 'Generando recomendación...' : 'Generar recomendación experta'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-3 md:grid-cols-3">
                            <Dato label="Enfoque" valor={etiqueta(recomendacion.enfoque_nutricional_experto)} />
                            <Dato label="Prioridad" valor={etiqueta(recomendacion.prioridad_nutricional)} />
                            <Dato label="Confianza" valor={recomendacion.confianza_experta == null ? '—' : `${numero(Number(recomendacion.confianza_experta) * 100)}%`} />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <Metrica label="Energía" valor={`${numero(recomendacion.calorias_sugeridas)} kcal`} />
                            <Metrica label="Proteínas" valor={`${numero(recomendacion.proteinas_porcentaje)}%`} />
                            <Metrica label="Carbohidratos" valor={`${numero(recomendacion.carbohidratos_porcentaje)}%`} />
                            <Metrica label="Grasas" valor={`${numero(recomendacion.grasas_porcentaje)}%`} />
                            <Metrica label="Fibra" valor={`${numero(recomendacion.fibra_sugerida)} g`} />
                        </div>

                        {recomendacion.conclusion && <div className="alert bg-primary/5 text-sm"><Sparkles size={17} /><span>{recomendacion.conclusion}</span></div>}
                        <DatosConsiderados hechos={recomendacion.hechos_utilizados} />
                        <div className="grid gap-4 lg:grid-cols-3">
                            <Lista titulo="Recomendaciones" items={recomendacion.recomendaciones} clase="text-success" />
                            <Lista titulo="Restricciones" items={recomendacion.restricciones} clase="text-error" />
                            <Lista titulo="Alertas" items={recomendacion.alertas} clase="text-warning" iconoAlerta />
                        </div>

                        <section className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="text-xs font-bold uppercase tracking-wide">Trazabilidad experta</h4>
                                <span className="badge badge-outline badge-sm">{recomendacion.version_motor_experto ?? 'Versión no disponible'}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {recomendacion.reglas_activadas?.length
                                    ? recomendacion.reglas_activadas.map((regla) => <span key={regla} className="badge badge-primary badge-outline badge-sm">{regla}</span>)
                                    : <span className="text-xs text-base-content/50">Sin reglas registradas.</span>}
                            </div>
                            {explicaciones(recomendacion.explicacion_experta).length > 0 && (
                                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-base-content/70">
                                    {explicaciones(recomendacion.explicacion_experta).map((texto, indice) => <li key={`${indice}-${texto}`}>{texto}</li>)}
                                </ul>
                            )}
                        </section>

                        <section className="rounded-2xl border border-base-300 p-4">
                            <h4 className="text-sm font-bold">Validación profesional</h4>
                            {resuelta ? (
                                <div className="alert alert-info mt-3 text-xs">
                                    <span>
                                        Estado final: <strong>{etiqueta(recomendacion.estado_validacion_experta)}</strong>
                                        {recomendacion.fecha_validacion ? ` · ${new Date(recomendacion.fecha_validacion).toLocaleString('es-BO')}` : ''}
                                        {recomendacion.observacion_validacion ? ` · ${recomendacion.observacion_validacion}` : ''}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        className="textarea textarea-bordered mt-3 min-h-24 w-full text-sm"
                                        maxLength={1000}
                                        placeholder="Observación profesional opcional"
                                        value={observacion}
                                        onChange={(evento) => setObservacion(evento.target.value)}
                                        disabled={procesando !== null}
                                    />
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button className="btn btn-success btn-sm gap-2" type="button" onClick={() => validar('aprobado')} disabled={procesando !== null}>
                                            {procesando === 'aprobado' ? <LoaderCircle className="animate-spin" size={15} /> : <CheckCircle2 size={15} />}
                                            {procesando === 'aprobado' ? 'Aprobando...' : 'Aprobar recomendación'}
                                        </button>
                                        <button className="btn btn-error btn-outline btn-sm gap-2" type="button" onClick={() => validar('rechazado')} disabled={procesando !== null}>
                                            {procesando === 'rechazado' ? <LoaderCircle className="animate-spin" size={15} /> : <XCircle size={15} />}
                                            {procesando === 'rechazado' ? 'Rechazando...' : 'Rechazar recomendación'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                )}

                {mensaje && <div role="status" className={`alert py-2 text-xs ${error ? 'alert-error' : 'alert-success'}`}><span>{mensaje}</span></div>}
            </div>
        </article>
    );
}

function DatosConsiderados({ hechos }: { hechos?: Record<string, unknown> | null }) {
    const campos = [
        ['Alergias', 'alergias'], ['Intolerancias', 'intolerancias'],
        ['Alimentos restringidos', 'alimentos_restringidos'],
        ['Alimentos no tolerados', 'alimentos_no_tolerados'],
        ['Alimentos rechazados', 'alimentos_rechazados'],
        ['Alimentos preferidos', 'alimentos_preferidos'],
        ['Comidas preferidas', 'comidas_preferidas'],
    ];
    const habitos = [
        hechos?.consume_desayuno === false ? 'Omite el desayuno' : null,
        hechos?.horarios_regulares === false ? 'Horarios irregulares' : null,
        hechos?.ansiedad_por_comida === true ? 'Ansiedad por comida' : null,
        hechos?.cena_tardia === true ? 'Cena tardía' : null,
        hechos?.hambre_nocturna === true ? 'Hambre nocturna' : null,
        hechos?.consumo_azucar ? `Consumo de azúcar: ${String(hechos.consumo_azucar)}` : null,
        hechos?.consumo_ultraprocesados ? `Ultraprocesados: ${String(hechos.consumo_ultraprocesados)}` : null,
    ].filter((valor): valor is string => Boolean(valor));

    return <section className="rounded-2xl border border-base-300 bg-base-200/25 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide">Datos del paciente considerados</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {campos.map(([titulo, campo]) => <div key={campo}><p className="text-[10px] font-bold uppercase text-base-content/50">{titulo}</p><p className="mt-1 text-xs leading-5">{listaHecho(hechos, campo).join(', ') || 'Sin registros'}</p></div>)}
            <div><p className="text-[10px] font-bold uppercase text-base-content/50">Hábitos relevantes</p><p className="mt-1 text-xs leading-5">{habitos.join(', ') || 'Sin registros'}</p></div>
        </div>
    </section>;
}

function Dato({ label, valor }: { label: string; valor: string }) {
    return <div className="rounded-xl bg-base-200/60 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">{label}</p><p className="mt-1 text-sm font-semibold capitalize">{valor}</p></div>;
}

function Metrica({ label, valor }: { label: string; valor: string }) {
    return <div className="rounded-xl border border-base-300 p-3 text-center"><p className="text-[10px] font-semibold uppercase text-base-content/50">{label}</p><p className="mt-1 text-lg font-black text-primary">{valor}</p></div>;
}

function Lista({ titulo, items, clase, iconoAlerta = false }: { titulo: string; items: string[] | null; clase: string; iconoAlerta?: boolean }) {
    return <section className="rounded-xl border border-base-300 p-4"><h4 className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${clase}`}>{iconoAlerta && <AlertTriangle size={14} />}{titulo}</h4>{items?.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-base-content/70">{items.map((item, indice) => <li key={`${indice}-${item}`}>{item}</li>)}</ul> : <p className="mt-2 text-xs text-base-content/45">Sin registros.</p>}</section>;
}
