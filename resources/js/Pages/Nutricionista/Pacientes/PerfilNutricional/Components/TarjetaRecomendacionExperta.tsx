import axios, { AxiosError } from 'axios';
import { router } from '@inertiajs/react';
import { AlertTriangle, BrainCircuit, CheckCircle2, LoaderCircle, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import { etiqueta, type RecomendacionNutricionalExperta } from '../tipos';

interface Props { pacienteId: number; recomendacion: RecomendacionNutricionalExperta | null; requerimientoId?: number; }
interface RespuestaApi { success: boolean; message: string; data?: RecomendacionNutricionalExperta; }

const numero = (valor: number | string | null, decimales = 0) => {
    if (valor === null || valor === '') return '—';
    return new Intl.NumberFormat('es-BO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(Number(valor));
};
const explicaciones = (valor: string | null): string[] => {
    if (!valor) return [];
    try { const d: unknown = JSON.parse(valor); return Array.isArray(d) ? d.map(String) : [valor]; } catch { return [valor]; }
};
const listaHecho = (hechos: Record<string, unknown> | null | undefined, campo: string): string[] => {
    const v = hechos?.[campo];
    if (Array.isArray(v)) return v.map(String).filter(Boolean);
    if (typeof v === 'string' && v.trim()) return [v.trim()];
    return [];
};

export default function TarjetaRecomendacionExperta({ pacienteId, recomendacion, requerimientoId }: Props) {
    const [procesando, setProcesando] = useState<'generar' | 'aprobado' | 'rechazado' | null>(null);
    const [observacion, setObservacion] = useState(recomendacion?.observacion_validacion ?? '');
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const estadoActual = recomendacion?.estado_validacion_experta ?? 'pendiente';
    const requiereActualizar = Boolean(recomendacion && requerimientoId && Number(recomendacion.id_requerimiento_nutricional) !== Number(requerimientoId));

    const recargar = () => router.reload({
        only: [
            'recomendacionExperta',
            'recomendacionExpertaAprobada',
            'puedeGenerarPlanSemanal',
            'planAlimentarioPrincipal',
            'historialPlanes',
        ],
    });

    const generar = async () => {
        setProcesando('generar'); setMensaje(null); setError(false);
        try {
            const r = await axios.post<RespuestaApi>(`/nutricionista/pacientes/${pacienteId}/recomendacion-experta/generar`, {}, { headers: { Accept: 'application/json' } });
            setMensaje(r.data.message); recargar();
        } catch (e) {
            const f = e as AxiosError<RespuestaApi>; setError(true);
            setMensaje(f.response?.status === 502 ? 'No se pudo conectar con el sistema experto.' : f.response?.data?.message ?? 'Error al generar.');
        } finally { setProcesando(null); }
    };

    const validar = async (estado: 'aprobado' | 'rechazado') => {
        if (!recomendacion || estadoActual === estado) return;
        const esCambio = ['aprobado', 'validado', 'rechazado'].includes(estadoActual);
        if (esCambio && !window.confirm(`¿Confirmas cambiar la decisión profesional de ${etiqueta(estadoActual)} a ${etiqueta(estado)}?`)) return;
        setProcesando(estado); setMensaje(null); setError(false);
        try {
            const r = await axios.post<RespuestaApi>(`/nutricionista/recomendaciones-expertas/${recomendacion.id_recomendacion_nutricional_experta}/validar`, { estado_validacion_experta: estado, observacion_validacion: observacion.trim() || null }, { headers: { Accept: 'application/json' } });
            setMensaje(r.data.message); recargar();
        } catch (e) { const f = e as AxiosError<RespuestaApi>; setError(true); setMensaje(f.response?.data?.message ?? 'Error al validar.'); }
        finally { setProcesando(null); }
    };

    return (
        <div className="space-y-4">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                        <BrainCircuit size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Recomendación nutricional experta</h3>
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                            Orientación clínica generada con ZEN Engine a partir del perfil endocrinológico y nutricional.
                        </p>
                    </div>
                </div>
                {recomendacion && (
                    <Badge color={recomendacion.estado_validacion_experta === 'aprobado' || recomendacion.estado_validacion_experta === 'validado' ? 'green' : recomendacion.estado_validacion_experta === 'rechazado' ? 'red' : 'orange'}>
                        <ShieldCheck size={11} strokeWidth={2} /> {etiqueta(recomendacion.estado_validacion_experta)}
                    </Badge>
                )}
            </div>

            {/* ── Sin recomendación ── */}
            {!recomendacion ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-8 text-center dark:border-surface-border-dark">
                    <Sparkles size={28} strokeWidth={1.2} className="text-brand-green/40" />
                    <p className="text-[12.5px] text-ink-muted dark:text-ink-muted-dark">Aún no se generó una recomendación nutricional experta.</p>
                    <Boton variante="primary" tamano="sm" onClick={generar} disabled={procesando !== null}>
                        {procesando === 'generar' ? <LoaderCircle size={14} className="animate-spin" /> : <BrainCircuit size={14} strokeWidth={1.8} />}
                        {procesando === 'generar' ? 'Generando...' : 'Generar recomendación experta'}
                    </Boton>
                </div>
            ) : (
                <>
                    {/* ── Datos principales ── */}
                    <div className="grid grid-cols-3 gap-2">
                        <DatoItem label="Enfoque" valor={etiqueta(recomendacion.enfoque_nutricional_experto)} ayuda="Estrategia seleccionada por las reglas según diagnósticos, evaluación y restricciones." />
                        <DatoItem label="Prioridad" valor={etiqueta(recomendacion.prioridad_nutricional)} ayuda="Aspecto que requiere mayor atención dentro de la intervención nutricional." />
                        <DatoItem label="Confianza" valor={recomendacion.confianza_experta == null ? '—' : `${numero(Number(recomendacion.confianza_experta) * 100)}%`} ayuda="Coherencia de los hechos con las reglas activadas; no es una probabilidad diagnóstica." destacar />
                    </div>

                    <div className="rounded-xl border border-info/15 bg-info/[0.035] px-4 py-3 text-[10.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                        <strong className="text-ink dark:text-ink-dark">¿Por qué se obtuvo este resultado?</strong> El motor cruza el requerimiento vigente con PMOS/RI, medidas corporales, hábitos, alergias, intolerancias y preferencias. Las reglas activadas y su explicación aparecen en la trazabilidad experta.
                    </div>

                    {requiereActualizar && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-orange/25 bg-brand-orange/[0.055] px-4 py-3"><p className="text-[10.5px] font-semibold text-brand-orange">Esta orientación corresponde a un requerimiento anterior y debe volver a ejecutarse.</p><Boton variante="primary" tamano="sm" onClick={generar} disabled={procesando !== null}>{procesando === 'generar' ? <LoaderCircle size={13} className="animate-spin"/> : <BrainCircuit size={13}/>} Actualizar orientación</Boton></div>}

                    {/* ── Macronutrientes ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <MetricaCard label="Energía" valor={`${numero(recomendacion.calorias_sugeridas)}`} unidad="kcal" color="text-brand-green-dark dark:text-brand-green" />
                        <MetricaCard label="Proteínas" valor={`${numero(recomendacion.proteinas_porcentaje)}`} unidad="%" color="text-category-dairy" />
                        <MetricaCard label="Carbohidratos" valor={`${numero(recomendacion.carbohidratos_porcentaje)}`} unidad="%" color="text-brand-orange" />
                        <MetricaCard label="Grasas" valor={`${numero(recomendacion.grasas_porcentaje)}`} unidad="%" color="text-category-others" />
                        <MetricaCard label="Fibra" valor={`${numero(recomendacion.fibra_sugerida)}`} unidad="g" color="text-info" />
                    </div>

                    {/* ── Conclusión ── */}
                    {recomendacion.conclusion && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-brand-green/20 bg-brand-green/[0.04] px-4 py-3 dark:bg-brand-green/[0.05]">
                            <Sparkles size={14} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green shrink-0 mt-0.5" />
                            <p className="text-[12px] text-ink dark:text-ink-dark leading-relaxed">{recomendacion.conclusion}</p>
                        </div>
                    )}

                    {/* ── Datos considerados ── */}
                    <DatosConsiderados hechos={recomendacion.hechos_utilizados} />

                    {/* ── Listas: Recomendaciones, Restricciones, Alertas ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <ListaSeccion titulo="Recomendaciones" items={recomendacion.recomendaciones} color="text-brand-green-dark dark:text-brand-green" borderColor="border-brand-green/20" />
                        <ListaSeccion titulo="Restricciones" items={recomendacion.restricciones} color="text-category-fruits" borderColor="border-category-fruits/20" />
                        <ListaSeccion titulo="Alertas" items={recomendacion.alertas} color="text-brand-orange" borderColor="border-brand-orange/20" icono={<AlertTriangle size={11} strokeWidth={1.8} />} />
                    </div>

                    {/* ── Trazabilidad ── */}
                    <div className="rounded-xl border border-surface-border bg-black/[0.015] p-4 dark:border-surface-border-dark dark:bg-white/[0.02] space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Trazabilidad experta</h4>
                            <Badge color="gray">{recomendacion.version_motor_experto ?? 'N/D'}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {recomendacion.reglas_activadas?.length
                                ? recomendacion.reglas_activadas.map((r) => <Badge key={r} color="green">{r}</Badge>)
                                : <span className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Sin reglas registradas.</span>}
                        </div>
                        {explicaciones(recomendacion.explicacion_experta).length > 0 && (
                            <ul className="space-y-1 pt-1">
                                {explicaciones(recomendacion.explicacion_experta).map((t, i) => (
                                    <li key={`${i}-${t}`} className="flex items-start gap-2 text-[11px] text-ink dark:text-ink-dark">
                                        <span className="text-ink-muted mt-0.5">•</span>{t}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ── Validación profesional ── */}
                    <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark space-y-3">
                        <h4 className="text-[12px] font-bold text-ink dark:text-ink-dark">Validación profesional</h4>
                        {['aprobado', 'validado', 'rechazado'].includes(estadoActual) && (
                            <div className={clsx('rounded-xl px-3.5 py-2.5 text-[11.5px]', recomendacion.estado_validacion_experta === 'rechazado' ? 'border border-category-fruits/20 bg-category-fruits/5 text-category-fruits' : 'border border-brand-green/20 bg-brand-green/5 text-brand-green-dark dark:text-brand-green')}>
                                Estado: <strong className="capitalize">{etiqueta(recomendacion.estado_validacion_experta)}</strong>
                                {recomendacion.fecha_validacion && ` · ${new Date(recomendacion.fecha_validacion).toLocaleString('es-BO')}`}
                                {recomendacion.observacion_validacion && ` · ${recomendacion.observacion_validacion}`}
                            </div>
                        )}
                        <textarea
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[70px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                            maxLength={1000}
                            placeholder="Observación profesional opcional para fundamentar la decisión"
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            disabled={procesando !== null}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                            <button type="button" onClick={() => validar('aprobado')} disabled={procesando !== null || ['aprobado', 'validado'].includes(estadoActual)}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-green/15 px-4 py-2 text-[11.5px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green/25 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-green">
                                {procesando === 'aprobado' ? <LoaderCircle size={13} className="animate-spin" /> : <CheckCircle2 size={13} strokeWidth={1.8} />}
                                {procesando === 'aprobado' ? 'Aprobando...' : ['aprobado', 'validado'].includes(estadoActual) ? 'Recomendación aprobada' : 'Aprobar recomendación'}
                            </button>
                            <button type="button" onClick={() => validar('rechazado')} disabled={procesando !== null || estadoActual === 'rechazado'}
                                className="inline-flex items-center gap-2 rounded-lg border border-category-fruits/30 px-4 py-2 text-[11.5px] font-semibold text-category-fruits transition-colors hover:bg-category-fruits/8 disabled:cursor-not-allowed disabled:opacity-40">
                                {procesando === 'rechazado' ? <LoaderCircle size={13} className="animate-spin" /> : <XCircle size={13} strokeWidth={1.8} />}
                                {procesando === 'rechazado' ? 'Rechazando...' : estadoActual === 'rechazado' ? 'Recomendación rechazada' : 'Rechazar recomendación'}
                            </button>
                            {['aprobado', 'validado', 'rechazado'].includes(estadoActual) && <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Puedes cambiar la decisión; se registrarán la nueva fecha y profesional.</span>}
                        </div>
                    </div>
                </>
            )}

            {/* ── Mensaje ── */}
            {mensaje && (
                <div className={clsx('rounded-xl px-4 py-2.5 text-[11.5px]', error ? 'border border-category-fruits/20 bg-category-fruits/5 text-category-fruits' : 'border border-brand-green/20 bg-brand-green/5 text-brand-green-dark dark:text-brand-green')}>
                    {mensaje}
                </div>
            )}
        </div>
    );
}

/* ── Componentes internos ── */

function DatoItem({ label, valor, ayuda, destacar }: { label: string; valor: string; ayuda: string; destacar?: boolean }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-2.5 dark:border-surface-border-dark dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-0.5">{label}</p>
            <p className={clsx('text-[12.5px] font-bold capitalize', destacar ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink dark:text-ink-dark')}>{valor}</p>
            <p className="mt-1.5 text-[9px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{ayuda}</p>
        </div>
    );
}

function MetricaCard({ label, valor, unidad, color }: { label: string; valor: string; unidad: string; color: string }) {
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.02] px-3 py-3 text-center dark:border-surface-border-dark dark:bg-white/[0.03]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p>
            <p className={clsx('text-[18px] font-bold mt-0.5', color)}>{valor}</p>
            <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{unidad}</p>
        </div>
    );
}

function ListaSeccion({ titulo, items, color, borderColor, icono }: { titulo: string; items: string[] | null; color: string; borderColor: string; icono?: React.ReactNode }) {
    return (
        <div className={clsx('rounded-xl border px-3.5 py-3', borderColor)}>
            <h4 className={clsx('flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2', color)}>
                {icono} {titulo}
            </h4>
            {items?.length ? (
                <ul className="space-y-1">
                    {items.map((item, i) => <li key={`${i}-${item}`} className="text-[11px] text-ink dark:text-ink-dark leading-relaxed">• {item}</li>)}
                </ul>
            ) : <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Sin registros.</p>}
        </div>
    );
}

function DatosConsiderados({ hechos }: { hechos?: Record<string, unknown> | null }) {
    const campos = [['Alergias', 'alergias'], ['Intolerancias', 'intolerancias'], ['Restringidos', 'alimentos_restringidos'], ['No tolerados', 'alimentos_no_tolerados'], ['Preferidos', 'alimentos_preferidos'], ['Comidas pref.', 'comidas_preferidas']];
    return (
        <div className="rounded-xl border border-surface-border bg-black/[0.015] p-4 dark:border-surface-border-dark dark:bg-white/[0.02]">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Datos del paciente considerados</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {campos.map(([titulo, campo]) => (
                    <div key={campo}>
                        <p className="text-[9px] font-semibold uppercase text-ink-muted/60 dark:text-ink-muted-dark/60">{titulo}</p>
                        <p className="text-[10.5px] text-ink dark:text-ink-dark mt-0.5">{listaHecho(hechos, campo).join(', ') || 'Sin registros'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
