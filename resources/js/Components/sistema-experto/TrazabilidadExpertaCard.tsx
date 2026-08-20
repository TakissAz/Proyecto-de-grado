import { BrainCircuit, CircleAlert } from 'lucide-react';

export interface TrazabilidadExperta {
    generado_por_motor_experto?: boolean;
    confianza_experta?: number | string | null;
    estado_validacion_experta?: string | null;
    version_motor_experto?: string | null;
    reglas_activadas?: string[] | null;
    explicacion_experta?: string | string[] | null;
    recomendaciones_expertas?: string[] | null;
}

interface Props {
    trazabilidad: TrazabilidadExperta;
}

export default function TrazabilidadExpertaCard({ trazabilidad }: Props) {
    if (!tieneEvaluacion(trazabilidad)) {
        return (
            <div className="card border border-base-300 bg-base-200/40 shadow-none">
                <div className="card-body p-4">
                    <p className="text-sm text-base-content/60">
                        Este diagnóstico aún no fue evaluado por el sistema experto.
                    </p>
                </div>
            </div>
        );
    }

    const explicaciones = normalizarTextos(trazabilidad.explicacion_experta);
    const reglas = trazabilidad.reglas_activadas ?? [];
    const recomendaciones = trazabilidad.recomendaciones_expertas ?? [];
    const estado = trazabilidad.estado_validacion_experta ?? 'pendiente';

    return (
        <div className="card border border-primary/20 bg-primary/5 shadow-none">
            <div className="card-body gap-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={17} className="text-primary" />
                        <h4 className="text-sm font-bold">Resultados del análisis clínico asistido</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {trazabilidad.confianza_experta != null && (
                            <span className="badge badge-primary badge-outline">
                                Confianza {formatearConfianza(trazabilidad.confianza_experta)}
                            </span>
                        )}
                        <span className="badge badge-ghost">{estado}</span>
                        {trazabilidad.version_motor_experto && (
                            <span className="badge badge-ghost">v. {trazabilidad.version_motor_experto}</span>
                        )}
                    </div>
                </div>

                {estado === 'pendiente' && (
                    <div className="alert alert-warning py-2 text-xs">
                        <CircleAlert size={15} />
                        <span>Resultado pendiente de validación por el especialista.</span>
                    </div>
                )}

                {reglas.length > 0 && (
                    <Seccion titulo="Criterios clínicos identificados">
                        <div className="flex flex-wrap gap-1.5">
                            {reglas.map((regla) => (
                                <span key={regla} className="badge badge-outline badge-sm">{regla}</span>
                            ))}
                        </div>
                    </Seccion>
                )}

                {explicaciones.length > 0 && (
                    <Seccion titulo="Interpretación clínica">
                        <Lista textos={explicaciones} />
                    </Seccion>
                )}

                {recomendaciones.length > 0 && (
                    <Seccion titulo="Recomendaciones">
                        <Lista textos={recomendaciones} />
                    </Seccion>
                )}
            </div>
        </div>
    );
}

function tieneEvaluacion(datos: TrazabilidadExperta): boolean {
    return datos.generado_por_motor_experto === true
        || datos.confianza_experta != null
        || Boolean(datos.version_motor_experto)
        || (datos.reglas_activadas?.length ?? 0) > 0;
}

function normalizarTextos(valor?: string | string[] | null): string[] {
    if (Array.isArray(valor)) return valor;
    if (!valor) return [];

    try {
        const decodificado: unknown = JSON.parse(valor);
        return Array.isArray(decodificado)
            ? decodificado.filter((item): item is string => typeof item === 'string')
            : [valor];
    } catch {
        return [valor];
    }
}

function formatearConfianza(valor: number | string): string {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return String(valor);
    return `${Math.round((numero <= 1 ? numero * 100 : numero))}%`;
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <section>
            <h5 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-base-content/60">{titulo}</h5>
            {children}
        </section>
    );
}

function Lista({ textos }: { textos: string[] }) {
    return (
        <ul className="list-disc space-y-1 pl-5 text-xs text-base-content/75">
            {textos.map((texto, indice) => <li key={`${indice}-${texto}`}>{texto}</li>)}
        </ul>
    );
}
