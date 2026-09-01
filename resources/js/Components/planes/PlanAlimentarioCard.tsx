import axios, { AxiosError } from 'axios';
import { router } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, Coffee, FileDown, LoaderCircle, Moon, Pencil, Plus, Sparkles, Sun, Sunrise, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import type { CatalogoAlimento, CatalogoReceta, ComidaPlan, ComponentePlan, DiaPlan, PlanAlimentario, RecomendacionNutricionalExperta } from '@/Pages/Nutricionista/Pacientes/PerfilNutricional/tipos';
import ModalComponentePlan from './ModalComponentePlan';
import ModalEditarComidaPlan from './ModalEditarComidaPlan';

interface Props { plan: PlanAlimentario | null; recomendacion: RecomendacionNutricionalExperta | null; puedeGenerar: boolean; alimentos: CatalogoAlimento[]; recetas: CatalogoReceta[] }
type Accion = (clave: string, fn: () => Promise<unknown>) => void;
const num = (v: unknown) => Number(v ?? 0);
const n = (v: unknown) => num(v).toLocaleString('es-BO', { maximumFractionDigits: 2 });
const etiqueta = (v: string | null | undefined) => v?.replaceAll('_', ' ') ?? 'No definido';
const fechaLegible = (valor: string | null | undefined) => {
    if (!valor) return 'Sin fecha';
    const coincidencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!coincidencia) return 'Fecha no válida';
    const [, anio, mes, dia] = coincidencia;
    return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
        .format(new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia))));
};
const nombrePlanLegible = (valor: string) => valor.replace(/\s*-\s*\d{4}-\d{2}-\d{2}\s*$/, '').trim() || 'Plan alimentario semanal';
const manana = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
};
const errorDe = (e: unknown) => { const d = (e as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response?.data; return Object.values(d?.errors ?? {})[0]?.[0] ?? d?.message ?? 'No se pudo completar la operación.'; };
const datosGroq = (observaciones?: string | null) => {
    const coincidencia = observaciones?.match(/Ranking Groq:\s*([\d.]+)\/100\.\s*(.*)$/is);
    return coincidencia ? { puntaje: Number(coincidencia[1]), motivos: coincidencia[2].trim() } : null;
};

export default function PlanAlimentarioCard({ plan, recomendacion, puedeGenerar, alimentos, recetas }: Props) {
    const [detalle, setDetalle] = useState(false), [cargando, setCargando] = useState(''), [mensaje, setMensaje] = useState(''), [esError, setEsError] = useState(false), [modalCiclo, setModalCiclo] = useState(false), [modalGenerar, setModalGenerar] = useState(false), [fechaInicio, setFechaInicio] = useState(manana), [fechaNuevo, setFechaNuevo] = useState(''), [observacion, setObservacion] = useState('');
    const recargar = () => router.reload({ only: ['planAlimentarioPrincipal', 'recomendacionExpertaAprobada', 'puedeGenerarPlanSemanal', 'historialPlanes', 'analiticaEvolucion', 'seguimientoPaciente'] });
    const accion: Accion = async (clave, fn) => { setCargando(clave); setMensaje(''); try { await fn(); setEsError(false); setMensaje('Operación realizada correctamente.'); recargar() } catch (e) { setEsError(true); setMensaje(errorDe(e)) } finally { setCargando('') } };
    const generar = () => recomendacion && accion('generar', async () => {
        await axios.post(`/nutricionista/recomendaciones-expertas/${recomendacion.id_recomendacion_nutricional_experta}/generar-plan`, { fecha_inicio: fechaInicio }, { headers: { Accept: 'application/json' } });
        setModalGenerar(false);
    });
    const cambiarEstado = (estado: 'aprobado' | 'rechazado') => plan && accion(estado, () => axios.patch(`/nutricionista/planes-alimentarios/${plan.id_plan_alimentario}/estado`, { estado_plan: estado }, { headers: { Accept: 'application/json' } }));
    const editable = !!plan && ['sugerido', 'en_revision'].includes(plan.estado_plan);
    const validable = !!plan && ['sugerido', 'en_revision', 'aprobado', 'rechazado'].includes(plan.estado_plan);
    const finalizable = !!plan && ['aprobado', 'activo'].includes(plan.estado_plan);
    const componentesPlan = plan?.dias.flatMap(dia => dia.comidas.flatMap(comida => comida.componentes)) ?? [];
    const componentesGroq = componentesPlan.filter(componente => datosGroq(componente.observaciones));
    const finalizar = () => plan && router.post(route('nutricionista.planes.finalizar-y-generar-siguiente', plan.id_plan_alimentario), { fecha_inicio: fechaNuevo || null, observacion_finalizacion: observacion || null }, { preserveScroll: true, onStart: () => setCargando('finalizar'), onSuccess: () => { setModalCiclo(false); setEsError(false); setMensaje('Plan finalizado y nueva planificación generada.'); recargar() }, onError: e => { setEsError(true); setMensaje(Object.values(e)[0] ?? 'No se pudo finalizar.') }, onFinish: () => setCargando('') });

    return (
        <article className="space-y-4">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                        <CalendarDays size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="text-[9.5px] font-semibold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Planificación profesional</p>
                        <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Plan alimentario semanal</h3>
                        <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">7 días · desayuno, almuerzo, merienda y cena</p>
                    </div>
                </div>
                {plan && <Badge color={plan.estado_plan === 'aprobado' || plan.estado_plan === 'activo' ? 'green' : plan.estado_plan === 'rechazado' ? 'red' : 'orange'}>{etiqueta(plan.estado_plan)}</Badge>}
            </div>

            {plan && componentesPlan.length > 0 && (
                <div className={clsx('flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3', componentesGroq.length > 0 ? 'border-brand-green/25 bg-brand-green/[0.05]' : 'border-brand-orange/25 bg-brand-orange/[0.05]')}>
                    <div className="flex items-center gap-2.5">
                        <Sparkles size={16} className={componentesGroq.length > 0 ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange'} />
                        <div>
                            <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Selección asistida por Groq</p>
                            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{componentesGroq.length > 0 ? `${componentesGroq.length} de ${componentesPlan.length} recetas recibieron priorización de IA; las demás conservaron el ranking clínico seguro.` : 'Groq no intervino en este plan; se utilizó únicamente el ranking clínico determinista.'}</p>
                        </div>
                    </div>
                    <Badge color={componentesGroq.length > 0 ? 'green' : 'orange'}>{componentesGroq.length > 0 ? 'Groq aplicado' : 'Fallback seguro'}</Badge>
                </div>
            )}

            {/* Sin plan */}
            {!plan && !puedeGenerar && (
                <div className="flex items-center gap-2 rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 dark:bg-brand-orange/[0.06]">
                    <AlertTriangle size={14} strokeWidth={1.8} className="text-brand-orange shrink-0" />
                    <span className="text-[12px] text-ink dark:text-ink-dark">Primero debe existir una recomendación nutricional aprobada.</span>
                </div>
            )}
            {!plan && puedeGenerar && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-8 text-center dark:border-surface-border-dark">
                    <Sparkles size={28} strokeWidth={1.2} className="text-brand-green/40" />
                    <p className="text-[12.5px] text-ink-muted dark:text-ink-muted-dark">La recomendación está lista para convertirse en un plan semanal.</p>
                    <Boton variante="primary" tamano="sm" onClick={() => setModalGenerar(true)} disabled={!!cargando}>
                        <Plus size={14} strokeWidth={1.8} />
                        Generar plan
                    </Boton>
                </div>
            )}

            {finalizable && (
                <button type="button" onClick={() => setModalCiclo(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-orange/30 px-4 py-2 text-[11.5px] font-semibold text-brand-orange transition-colors hover:bg-brand-orange/8">
                    <CalendarDays size={14} strokeWidth={1.8} /> Finalizar plan y generar siguiente
                </button>
            )}

            {plan && (
                <>
                    {/* Origen */}
                    <Origen plan={plan} recomendacion={plan.recomendacion_nutricional_experta ?? recomendacion} />

                    {/* Datos del plan */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.1fr_1.5fr_1fr]">
                        <DatoItem label="Plan vigente" valor={nombrePlanLegible(plan.nombre)} icono={<CalendarDays size={15} />} />
                        <DatoItem label="Periodo de aplicación" valor={`${fechaLegible(plan.fecha_inicio)} — ${fechaLegible(plan.fecha_fin)}`} secundario={`${plan.duracion_dias || 7} días de planificación`} icono={<CalendarDays size={15} />} />
                        <DatoItem label="Energía semanal" valor={`${n(plan.calorias_totales)} kcal`} secundario={`${n(num(plan.calorias_totales) / Math.max(plan.duracion_dias || 7, 1))} kcal por día`} destacar icono={<Sparkles size={15} />} />
                    </div>

                    {/* Balance semanal */}
                    <Resumen plan={plan} />

                    {/* Acciones */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => setDetalle(!detalle)}
                            className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-[12px] font-semibold text-ink transition-colors hover:bg-black/[0.03] dark:border-surface-border-dark dark:text-ink-dark dark:hover:bg-white/[0.04]">
                            {detalle ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {detalle ? 'Ocultar detalle' : 'Ver planificación completa'}
                        </button>
                        <a className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] hover:text-ink dark:border-surface-border-dark dark:text-ink-muted-dark dark:hover:bg-white/[0.04] dark:hover:text-ink-dark"
                            href={route('nutricionista.planes.reporte-pdf', plan.id_plan_alimentario)} target="_blank" rel="noreferrer">
                            <FileDown size={13} strokeWidth={1.8} /> PDF
                        </a>
                        {validable && (
                            <>
                                <button type="button" onClick={() => cambiarEstado('aprobado')} disabled={!!cargando || (plan.estado_plan === 'aprobado' && !!plan.fecha_inicio && !!plan.fecha_fin)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green/15 px-4 py-2.5 text-[11.5px] font-bold text-brand-green-dark hover:bg-brand-green/25 dark:text-brand-green disabled:opacity-40 transition-colors">
                                    {cargando === 'aprobado' ? <LoaderCircle size={13} className="animate-spin" /> : <CheckCircle2 size={13} strokeWidth={1.8} />} {plan.estado_plan === 'aprobado' && (!plan.fecha_inicio || !plan.fecha_fin) ? 'Asignar periodo de 7 días' : 'Aprobar plan'}
                                </button>
                                <button type="button" onClick={() => cambiarEstado('rechazado')} disabled={!!cargando || plan.estado_plan === 'rechazado'}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-category-fruits/30 bg-category-fruits/5 px-4 py-2.5 text-[11.5px] font-bold text-category-fruits hover:bg-category-fruits/10 disabled:opacity-40 transition-colors">
                                    {cargando === 'rechazado' ? <LoaderCircle size={13} className="animate-spin" /> : <XCircle size={13} strokeWidth={1.8} />} Rechazar plan
                                </button>
                            </>
                        )}
                    </div>

                    {!editable && (
                        <div className="flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/5 px-4 py-2.5 dark:bg-brand-green/[0.06]">
                            <CheckCircle2 size={13} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                            <span className="text-[11.5px] text-ink dark:text-ink-dark">El contenido del plan ya fue validado y no puede editarse. Su decisión profesional sí puede cambiar entre aprobado y rechazado.</span>
                        </div>
                    )}

                    {/* Detalle de días */}
                    {detalle && <PlanificacionSemanal dias={plan.dias} editable={editable} alimentos={alimentos} recetas={recetas} accion={accion} recargar={recargar} />}
                </>
            )}

            {/* Mensaje */}
            {mensaje && (
                <div className={clsx('rounded-xl px-4 py-2.5 text-[11.5px]', esError ? 'border border-category-fruits/20 bg-category-fruits/5 text-category-fruits' : 'border border-brand-green/20 bg-brand-green/5 text-brand-green-dark dark:text-brand-green')}>
                    {mensaje}
                </div>
            )}

            {modalGenerar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
                    <div className="w-full max-w-md space-y-4 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                        <div>
                            <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">Programar plan semanal</h3>
                            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">El inicio automático es mañana. Puedes elegir una fecha posterior; el sistema calculará exactamente 7 días consecutivos.</p>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">Fecha de inicio</label>
                            <input type="date" min={manana()} required value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                            <p className="mt-1.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">Finaliza el {fechaInicio ? fechaLegible(new Date(`${fechaInicio}T00:00:00`).getTime() ? new Date(new Date(`${fechaInicio}T00:00:00`).getTime() + 6 * 86400000).toISOString().slice(0, 10) : null) : '—'}.</p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Boton type="button" variante="ghost" tamano="sm" onClick={() => setModalGenerar(false)} disabled={!!cargando}>Cancelar</Boton>
                            <Boton type="button" variante="primary" tamano="sm" onClick={generar} disabled={!!cargando || !fechaInicio}>
                                {cargando === 'generar' ? <LoaderCircle size={14} className="animate-spin" /> : <CalendarDays size={14} />}
                                Generar 7 días
                            </Boton>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal finalizar */}
            {modalCiclo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
                    <div className="relative w-full max-w-md rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark space-y-4">
                        <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">Finalizar plan actual</h3>
                        <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">Esta acción cerrará el plan actual y generará una nueva planificación utilizando el seguimiento y retroalimentación registrados.</p>
                        <div>
                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Fecha de inicio del nuevo plan (opcional)</p>
                            <input type="date" value={fechaNuevo} onChange={e => setFechaNuevo(e.target.value)}
                                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                        </div>
                        <div>
                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Observación (opcional)</p>
                            <textarea maxLength={1000} value={observacion} onChange={e => setObservacion(e.target.value)}
                                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 resize-none min-h-[70px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Boton type="button" variante="ghost" tamano="sm" onClick={() => setModalCiclo(false)} disabled={!!cargando}>Cancelar</Boton>
                            <button type="button" onClick={finalizar} disabled={!!cargando}
                                className="inline-flex items-center gap-2 rounded-lg border border-brand-orange/30 px-4 py-2 text-[11.5px] font-semibold text-brand-orange hover:bg-brand-orange/8 disabled:opacity-40">
                                {cargando === 'finalizar' && <LoaderCircle size={13} className="animate-spin" />}
                                Finalizar y generar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
}

/* Origen del plan */
function Origen({ plan, recomendacion }: { plan: PlanAlimentario; recomendacion: RecomendacionNutricionalExperta | null }) {
    return (
        <div className="rounded-2xl border border-brand-green/25 bg-gradient-to-br from-brand-green/[0.07] to-transparent p-4 dark:from-brand-green/[0.08]">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h4 className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink dark:text-ink-dark"><Sparkles size={13} className="text-brand-green-dark dark:text-brand-green" /> Fundamento del plan</h4>
                    <p className="mt-0.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{plan.generado_por_sistema_experto ? 'Propuesta construida desde una recomendación experta y revisada por nutrición.' : 'Plan elaborado manualmente por nutricionista.'}</p>
                </div>
                {plan.generado_por_sistema_experto && <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/15 px-3 py-1.5 text-[10px] font-bold text-brand-green-dark dark:text-brand-green"><CheckCircle2 size={11} /> Asistencia experta</span>}
            </div>
            {recomendacion && (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <DatoMini label="Enfoque nutricional" valor={etiqueta(recomendacion.enfoque_nutricional_experto)} color="green" />
                    <DatoMini label="Prioridad de intervención" valor={etiqueta(recomendacion.prioridad_nutricional)} color="orange" />
                    <DatoMini label="Validación profesional" valor={etiqueta(recomendacion.estado_validacion_experta)} color="blue" />
                </div>
            )}
        </div>
    );
}

/* Balance semanal */
function Resumen({ plan }: { plan: PlanAlimentario }) {
    const dias = Math.max(plan.duracion_dias || 7, 1);
    const datos = [
        ['Calorías', plan.calorias_objetivo, plan.calorias_totales, 'kcal', 'bg-brand-green', 'text-brand-green-dark dark:text-brand-green'],
        ['Proteínas', plan.proteinas_objetivo, plan.proteinas_totales, 'g', 'bg-category-dairy', 'text-category-dairy'],
        ['Carbohidratos', plan.carbohidratos_objetivo, plan.carbohidratos_totales, 'g', 'bg-brand-orange', 'text-brand-orange'],
        ['Grasas', plan.grasas_objetivo, plan.grasas_totales, 'g', 'bg-category-others', 'text-category-others'],
        ['Fibra', plan.fibra_objetivo, plan.fibra_total, 'g', 'bg-info', 'text-info'],
    ] as const;

    return (
        <div>
            <div className="mb-2 flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Balance nutricional semanal</p><p className="mt-0.5 text-[9.5px] text-ink-muted/80 dark:text-ink-muted-dark/80">Comparación entre el total planificado y la meta calculada para {dias} días.</p></div><span className="hidden text-[9px] text-ink-muted sm:block">Rango esperado: 85–115%</span></div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {datos.map(([l, o, p, u, fondo, colorTexto]) => {
                    const objetivo = num(o) * dias;
                    const porcentajeReal = objetivo ? (num(p) / objetivo) * 100 : 0;
                    const pct = Math.min(Math.max(porcentajeReal, 0), 100);
                    const alerta = objetivo > 0 && (porcentajeReal < 85 || porcentajeReal > 115);
                    return (
                        <div key={l} className={clsx('relative overflow-hidden rounded-xl border px-3 py-3', alerta ? 'border-brand-orange/35 bg-brand-orange/[0.055]' : 'border-surface-border bg-black/[0.02] dark:border-surface-border-dark dark:bg-white/[0.03]')}>
                            <div className="flex items-center justify-between"><p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{l}</p>{alerta && <AlertTriangle size={11} className="text-brand-orange" />}</div>
                            <p className={clsx('mt-1 text-[12px] font-bold', colorTexto)}>{n(p)} <span className="text-[9.5px] font-medium text-ink-muted">/ {n(objetivo)} {u}</span></p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]">
                                <div className={clsx('h-full rounded-full transition-all duration-500', alerta ? 'bg-brand-orange' : fondo)} style={{ width: `${pct}%` }} />
                            </div>
                            <p className={clsx('mt-1.5 text-[9px] font-semibold', alerta ? 'text-brand-orange' : 'text-ink-muted dark:text-ink-muted-dark')}>{objetivo ? `${n(porcentajeReal)}% de la meta` : 'Sin meta definida'}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* Planificación semanal con tabs por día */
function PlanificacionSemanal({ dias, editable, alimentos, recetas, accion, recargar }: { dias: DiaPlan[]; editable: boolean; alimentos: CatalogoAlimento[]; recetas: CatalogoReceta[]; accion: Accion; recargar: () => void }) {
    const [diaActivo, setDiaActivo] = useState(0);
    const dia = dias[diaActivo];
    useEffect(() => {
        if (diaActivo >= dias.length) setDiaActivo(Math.max(dias.length - 1, 0));
    }, [diaActivo, dias.length]);

    if (!dia) return null;

    const nombreCorto = (d: DiaPlan) => {
        const fecha = String(d.fecha ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (fecha) {
            const [, anio, mes, numeroDia] = fecha;
            const nombre = new Intl.DateTimeFormat('es-BO', { weekday: 'short', timeZone: 'UTC' })
                .format(new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(numeroDia))));
            return nombre.replace('.', '').replace(/^./, letra => letra.toUpperCase());
        }
        return d.nombre_dia?.slice(0, 3) || `D${d.numero_dia}`;
    };

    return (
        <div className="space-y-3">
            {/* Selector de días */}
            <div className="flex gap-1 rounded-xl bg-black/[0.02] p-1 dark:bg-white/[0.03] overflow-x-auto">
                {dias.map((d, i) => (
                    <button
                        key={d.id_dia_plan_alimentario}
                        type="button"
                        onClick={() => setDiaActivo(i)}
                        className={clsx(
                            'flex-1 min-w-[50px] flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 transition-all',
                            diaActivo === i
                                ? 'bg-surface-card shadow-sm dark:bg-surface-card-dark'
                                : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]',
                        )}
                    >
                        <span className={clsx('text-[10px] font-bold', diaActivo === i ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink-muted dark:text-ink-muted-dark')}>
                            {nombreCorto(d)}
                        </span>
                        <span className={clsx('text-[9px]', diaActivo === i ? 'text-ink dark:text-ink-dark' : 'text-ink-muted/60 dark:text-ink-muted-dark/60')}>
                            {n(d.calorias_totales)} kcal
                        </span>
                    </button>
                ))}
            </div>

            {/* Contenido del día seleccionado */}
            <div className="rounded-xl border border-surface-border dark:border-surface-border-dark overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-black/[0.015] dark:bg-white/[0.02] border-b border-surface-border dark:border-surface-border-dark">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={13} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                        <span className="text-[12.5px] font-bold text-ink dark:text-ink-dark">{dia.nombre_dia}</span>
                        {dia.fecha && <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">· {fechaLegible(dia.fecha)}</span>}
                    </div>
                    <Badge color="green">{n(dia.calorias_totales)} kcal</Badge>
                </div>
                <div className="p-4 grid gap-3 xl:grid-cols-2">
                    {dia.comidas.map(c => <Comida key={c.id_comida_plan_alimentario} comida={c} editable={editable} alimentos={alimentos} recetas={recetas} accion={accion} recargar={recargar} />)}
                </div>
            </div>

            {/* Navegación prev/next */}
            <div className="flex items-center justify-between">
                <button type="button" disabled={diaActivo === 0} onClick={() => setDiaActivo(diaActivo - 1)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] disabled:opacity-30 dark:text-ink-muted-dark dark:hover:bg-white/[0.04]">
                    ← Día anterior
                </button>
                <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{diaActivo + 1} / {dias.length}</span>
                <button type="button" disabled={diaActivo === dias.length - 1} onClick={() => setDiaActivo(diaActivo + 1)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition-colors hover:bg-black/[0.03] disabled:opacity-30 dark:text-ink-muted-dark dark:hover:bg-white/[0.04]">
                    Día siguiente →
                </button>
            </div>
        </div>
    );
}

/* Comida */
const TIPO_ESTILOS: Record<string, { bg: string; accent: string; dot: string; label: string; iconBg: string }> = {
    desayuno: { bg: 'bg-amber-500/[0.06] dark:bg-amber-400/[0.08]', accent: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: 'DESAYUNO', iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    almuerzo: { bg: 'bg-brand-green/[0.06] dark:bg-brand-green/[0.08]', accent: 'text-brand-green-dark dark:text-brand-green', dot: 'bg-brand-green', label: 'ALMUERZO', iconBg: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green' },
    merienda: { bg: 'bg-purple-500/[0.06] dark:bg-purple-400/[0.08]', accent: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500', label: 'MERIENDA', iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' },
    cena: { bg: 'bg-blue-500/[0.06] dark:bg-blue-400/[0.08]', accent: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', label: 'CENA', iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
};
const TIPO_ICONO_LUCIDE: Record<string, typeof Sunrise> = { desayuno: Sunrise, almuerzo: Sun, merienda: Coffee, cena: Moon };

function Comida({ comida, editable, alimentos, recetas, accion, recargar }: { comida: ComidaPlan; editable: boolean; alimentos: CatalogoAlimento[]; recetas: CatalogoReceta[]; accion: Accion; recargar: () => void }) {
    const [editarComida, setEditarComida] = useState(false), [modalComponente, setModalComponente] = useState(false), [seleccionado, setSeleccionado] = useState<ComponentePlan | null>(null);
    const [verDetalle, setVerDetalle] = useState(false);
    const manual = comida.componentes.some(c => c.tipo_componente === 'manual');
    const estilo = TIPO_ESTILOS[comida.tipo_comida] ?? { bg: 'bg-black/[0.03] dark:bg-white/[0.04]', accent: 'text-ink-muted dark:text-ink-muted-dark', dot: 'bg-ink-muted', label: comida.tipo_comida.toUpperCase(), iconBg: 'bg-black/[0.06] text-ink-muted dark:text-ink-muted-dark' };
    const IconoComida = TIPO_ICONO_LUCIDE[comida.tipo_comida] ?? Sun;
    const hora = String(comida.hora_sugerida ?? '').slice(0, 5);

    return (
        <section className={clsx('rounded-2xl border overflow-hidden transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.25)]', manual ? 'border-brand-orange/30' : 'border-surface-border dark:border-surface-border-dark')}>
            {/* Hero: fondo de color + icono + tipo/hora */}
            <div className={clsx('relative px-5 pt-5 pb-4', estilo.bg)}>
                {/* Icono decorativo grande */}
                <div className={clsx('absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl opacity-40', estilo.iconBg)}>
                    <IconoComida size={22} strokeWidth={1.5} />
                </div>

                {/* Label tipo + hora */}
                <div className="flex items-center gap-2 mb-2">
                    <span className={clsx('h-2 w-2 rounded-full shrink-0', estilo.dot)} />
                    <span className={clsx('text-[10px] font-bold tracking-wider', estilo.accent)}>{estilo.label}</span>
                    {hora && <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{'·'} {hora}</span>}
                </div>

                {/* Nombre comida */}
                <h5 className="text-[14px] font-bold text-ink dark:text-ink-dark leading-snug pr-12">{comida.nombre_comida}</h5>

                {/* Pills de macros */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center rounded-full bg-brand-green/30 px-3.5 py-1.5 text-[12px] font-bold text-brand-green-dark dark:bg-brand-green/25 dark:text-brand-green">{n(comida.calorias_totales)} kcal</span>
                    <span className="inline-flex items-center rounded-full bg-category-dairy/25 px-3.5 py-1.5 text-[12px] font-bold text-category-dairy dark:bg-category-dairy/20">{n(comida.proteinas_totales)}g P</span>
                    <span className="inline-flex items-center rounded-full bg-brand-orange/25 px-3.5 py-1.5 text-[12px] font-bold text-brand-orange dark:bg-brand-orange/20">{n(comida.carbohidratos_totales)}g C</span>
                    <span className="inline-flex items-center rounded-full bg-category-others/25 px-3.5 py-1.5 text-[12px] font-bold text-category-others dark:bg-category-others/20">{n(comida.grasas_totales)}g G</span>
                </div>

                {/* Editar comida */}
                {editable && (
                    <button type="button" title="Configurar nombre, horario y observaciones" aria-label="Configurar tiempo de comida" onClick={() => setEditarComida(true)}
                        className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/60 text-ink-muted hover:bg-white/90 hover:text-ink dark:bg-black/30 dark:hover:bg-black/50 dark:text-ink-muted-dark dark:hover:text-ink-dark transition-colors">
                        <Pencil size={12} />
                    </button>
                )}
            </div>

            {/* Componentes como tabla de ingredientes */}
            <div className="px-5 py-3">
                {comida.componentes.length === 0 && (
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic py-2 text-center">Sin componentes registrados.</p>
                )}

                {comida.componentes.length > 0 && (
                    <>
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-2">Recetas planificadas</p>
                        <div className="divide-y divide-surface-border/50 dark:divide-surface-border-dark/50">
                            {comida.componentes.map(c => (
                                <div key={c.id_componente_comida_plan} className="flex items-center gap-2 py-2 group">
                                    <div className={clsx('h-5 w-1 rounded-full shrink-0', c.tipo_componente === 'receta' ? 'bg-brand-green' : c.tipo_componente === 'alimento' ? 'bg-category-dairy' : 'bg-brand-orange')} />
                                    <span className="flex-1 text-[12px] text-ink dark:text-ink-dark truncate">{c.receta?.nombre ?? c.alimento?.nombre ?? c.nombre_manual}</span>
                                    {datosGroq(c.observaciones) && <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-green/10 px-1.5 py-0.5 text-[8.5px] font-bold text-brand-green-dark dark:text-brand-green"><Sparkles size={9} /> Groq</span>}
                                    <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark font-medium shrink-0 tabular-nums">{n(c.cantidad)} {c.unidad}</span>
                                    {editable && (
                                        <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" title="Cambiar receta" onClick={() => { setSeleccionado(c); setModalComponente(true) }} className="flex h-5 w-5 items-center justify-center rounded text-ink-muted/50 hover:text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"><Pencil size={10} /></button>
                                            <button type="button" onClick={() => confirm('¿Eliminar?') && accion(`eliminar-${c.id_componente_comida_plan}`, () => axios.delete(`/nutricionista/componentes-plan/${c.id_componente_comida_plan}`, { headers: { Accept: 'application/json' } }))} className="flex h-5 w-5 items-center justify-center rounded text-ink-muted/50 hover:text-category-fruits hover:bg-category-fruits/10"><Trash2 size={10} /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {comida.componentes.filter(c => c.tipo_componente === 'receta' && c.receta).map(c => {
                            const ingredientes = c.receta?.receta_alimentos ?? [];
                            const factor = Math.max(Number(c.cantidad ?? 1), 0);

                            return (
                                <div key={`detalle-receta-${c.id_componente_comida_plan}`} className="mt-3 grid gap-3 rounded-xl border border-surface-border/70 bg-black/[0.015] p-3 sm:grid-cols-2 dark:border-surface-border-dark/70 dark:bg-white/[0.02]">
                                    <div>
                                        <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Ingredientes</p>
                                        {ingredientes.length > 0 ? (
                                            <ul className="space-y-1">
                                                {ingredientes.map(ingrediente => (
                                                    <li key={ingrediente.id_receta_alimento} className="flex items-start justify-between gap-3 text-[10.5px]">
                                                        <span className="text-ink/80 dark:text-ink-dark/80">{ingrediente.alimento?.nombre ?? 'Alimento'}</span>
                                                        <span className="shrink-0 font-semibold tabular-nums text-ink-muted dark:text-ink-muted-dark">{n(Number(ingrediente.cantidad) * factor)} {ingrediente.unidad}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-[10.5px] italic text-ink-muted dark:text-ink-muted-dark">Sin ingredientes detallados.</p>}
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wider text-category-dairy">PreparaciÃ³n</p>
                                        <p className="whitespace-pre-line text-[10.5px] leading-relaxed text-ink/80 dark:text-ink-dark/80">{c.receta?.preparacion || 'Sin instrucciones de preparaciÃ³n.'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}

                {/* Observaciones / preparación */}
                {comida.observaciones && (
                    <div className="mt-3 pt-3 border-t border-surface-border/50 dark:border-surface-border-dark/50">
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-1">Indicaciones adicionales</p>
                        <p className="text-[11.5px] text-ink/80 dark:text-ink-dark/80 leading-relaxed">{comida.observaciones}</p>
                    </div>
                )}

                {/* Ver detalle expandido con macros por componente */}
                {comida.componentes.length > 0 && (
                    <button type="button" onClick={() => setVerDetalle(!verDetalle)}
                        className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors">
                        {verDetalle ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {verDetalle ? 'Ocultar detalle' : 'Ver detalle'}
                    </button>
                )}

                {verDetalle && (
                    <div className="mt-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] p-3 space-y-2">
                        {comida.componentes.map(c => (
                            <div key={c.id_componente_comida_plan} className="space-y-2 rounded-lg border border-surface-border/50 p-2 dark:border-surface-border-dark/50">
                                <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-ink dark:text-ink-dark truncate">{c.receta?.nombre ?? c.alimento?.nombre ?? c.nombre_manual}</p>
                                    <div className="flex gap-2 mt-0.5">
                                        <span className="text-[9px] text-brand-green-dark dark:text-brand-green font-medium">{n(c.calorias)} kcal</span>
                                        <span className="text-[9px] text-category-dairy font-medium">{n(c.proteinas)}g P</span>
                                        <span className="text-[9px] text-brand-orange font-medium">{n(c.carbohidratos)}g C</span>
                                        <span className="text-[9px] text-category-others font-medium">{n(c.grasas)}g G</span>
                                    </div>
                                </div>
                                <span className={clsx('text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0', c.tipo_componente === 'receta' ? 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green' : c.tipo_componente === 'alimento' ? 'bg-category-dairy/10 text-category-dairy' : 'bg-brand-orange/10 text-brand-orange')}>{c.tipo_componente}</span>
                                </div>
                                {datosGroq(c.observaciones) ? <div className="rounded-lg bg-brand-green/[0.06] px-2.5 py-2"><p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green"><Sparkles size={10} /> Groq {n(datosGroq(c.observaciones)?.puntaje)}/100</p><p className="mt-1 text-[10px] leading-relaxed text-ink/75 dark:text-ink-dark/75">{datosGroq(c.observaciones)?.motivos}</p></div> : c.tipo_componente === 'receta' && <p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark">Seleccionada mediante reglas clínicas deterministas.</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Agregar componente */}
                {editable && (
                    <button type="button" onClick={() => { setSeleccionado(null); setModalComponente(true) }}
                        className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-brand-green/30 px-3 py-2 w-full justify-center text-[11px] font-semibold text-brand-green-dark transition-colors hover:bg-brand-green/5 dark:text-brand-green dark:hover:bg-brand-green/[0.06]">
                        <Plus size={12} strokeWidth={2} /> Agregar receta
                    </button>
                )}
            </div>

            {/* Warning manual */}
            {manual && (
                <div className="px-5 py-2 border-t border-brand-orange/20 bg-brand-orange/[0.03]">
                    <div className="flex items-center justify-between gap-3">
                        <p className="flex items-center gap-1.5 text-[10px] text-brand-orange font-semibold"><AlertTriangle size={11} /> Falta reemplazar una sugerencia manual por una receta.</p>
                        {editable && <button type="button" onClick={() => { setSeleccionado(comida.componentes.find(c => c.tipo_componente === 'manual') ?? null); setModalComponente(true); }} className="text-[10px] font-bold text-brand-orange hover:underline">Completar con receta</button>}
                    </div>
                </div>
            )}

            <ModalEditarComidaPlan abierto={editarComida} comida={comida} cerrar={() => setEditarComida(false)} onSuccess={recargar} />
            <ModalComponentePlan abierto={modalComponente} cerrar={() => setModalComponente(false)} comida={comida} componente={seleccionado} alimentos={alimentos} recetas={recetas} onSuccess={recargar} />
        </section>
    );
}

/* Macros grid */
function Macros({ valores }: { valores: unknown[] }) {
    const labels = ['kcal', 'Prot', 'Carbs', 'Grasas', 'Fibra'];
    return (
        <div className="mt-2 grid grid-cols-5 gap-1 rounded-lg bg-black/[0.02] p-1.5 text-center dark:bg-white/[0.03]">
            {labels.map((l, i) => (
                <div key={l}>
                    <p className="text-[8px] text-ink-muted/60 dark:text-ink-muted-dark/60">{l}</p>
                    <p className="text-[10px] font-bold text-ink dark:text-ink-dark">{n(valores[i])}</p>
                </div>
            ))}
        </div>
    );
}

/* DatoItem */
function DatoItem({ label, valor, secundario, destacar, icono }: { label: string; valor: string; secundario?: string; destacar?: boolean; icono?: React.ReactNode }) {
    return (
        <div className={clsx('rounded-xl border px-3.5 py-3', destacar ? 'border-brand-green/25 bg-brand-green/[0.045]' : 'border-surface-border bg-black/[0.02] dark:border-surface-border-dark dark:bg-white/[0.03]')}>
            <div className="flex items-center gap-1.5"><span className={destacar ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink-muted'}>{icono}</span><p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p></div>
            <p className={clsx('mt-1 text-[12.5px] font-bold leading-snug', destacar ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink dark:text-ink-dark')}>{valor}</p>
            {secundario && <p className="mt-1 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">{secundario}</p>}
        </div>
    );
}

function DatoMini({ label, valor, color }: { label: string; valor: string; color: 'green' | 'orange' | 'blue' }) {
    const estilos = { green: 'border-brand-green/20 bg-brand-green/[0.045]', orange: 'border-brand-orange/20 bg-brand-orange/[0.045]', blue: 'border-info/20 bg-info/[0.04]' };
    return (
        <div className={clsx('rounded-xl border px-3 py-2.5', estilos[color])}>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p>
            <p className="text-[11px] font-bold capitalize text-ink dark:text-ink-dark">{valor}</p>
        </div>
    );
}
