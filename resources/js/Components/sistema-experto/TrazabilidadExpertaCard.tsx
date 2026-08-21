import { BrainCircuit, CircleAlert } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

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
            <div className="rounded-xl border border-surface-border bg-black/[0.015] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[0.02]">
                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">
                    Este diagnóstico aún no fue evaluado por el sistema experto.
                </p>
            </div>
        );
    }

    const explicaciones = normalizarTextos(trazabilidad.explicacion_experta);
    const reglas = trazabilidad.reglas_activadas ?? [];
    const recomendaciones = trazabilidad.recomendaciones_expertas ?? [];
    const estado = trazabilidad.estado_validacion_experta ?? 'pendiente';

    return (
        <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.03] p-4 dark:bg-brand-green/[0.04] space-y-3">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <BrainCircuit size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                    <h4 className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Resultados del análisis clínico asistido</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {trazabilidad.confianza_experta != null && (
                        <Badge color="green">Confianza {formatearConfianza(trazabilidad.confianza_experta)}</Badge>
                    )}
                    <Badge color="gray">{estado}</Badge>
                    {trazabilidad.version_motor_experto && (
                        <Badge color="gray">v. {trazabilidad.version_motor_experto}</Badge>
                    )}
                </div>
            </div>

            {/* Alerta pendiente */}
            {estado === 'pendiente' && (
                <div className="flex items-center gap-2 rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-3 py-2 dark:bg-brand-orange/[0.06]">
                    <CircleAlert size={13} strokeWidth={1.8} className="text-brand-orange shrink-0" />
                    <span className="text-[11px] text-ink dark:text-ink-dark">Resultado pendiente de validación por el especialista.</span>
                </div>
            )}

            {/* Reglas / criterios */}
            {reglas.length > 0 && (
                <Seccion titulo="Criterios clínicos identificados">
                    <div className="flex flex-wrap gap-1.5">
                        {reglas.map((regla) => (
                            <Badge key={regla} color="gray">{regla}</Badge>
                        ))}
                    </div>
                </Seccion>
            )}

            {/* Explicación */}
            {explicaciones.length > 0 && (
                <Seccion titulo="Interpretación clínica">
                    <Lista textos={explicaciones} />
                </Seccion>
            )}

            {/* Recomendaciones */}
            {recomendaciones.length > 0 && (
                <Seccion titulo="Recomendaciones">
                    <Lista textos={recomendaciones} />
                </Seccion>
            )}
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
            <h5 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{titulo}</h5>
            {children}
        </section>
    );
}

function Lista({ textos }: { textos: string[] }) {
    return (
        <ul className="space-y-1 pl-1">
            {textos.map((texto, indice) => (
                <li key={`${indice}-${texto}`} className="flex items-start gap-2 text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">
                    <span className="text-ink-muted dark:text-ink-muted-dark mt-0.5">•</span>
                    {texto}
                </li>
            ))}
        </ul>
    );
}
