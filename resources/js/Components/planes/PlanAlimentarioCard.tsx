import axios, { AxiosError } from 'axios';
import { Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Coffee, FileDown, LoaderCircle, Moon, Pencil, Plus, Sparkles, Sun, Sunrise, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import type { CatalogoAlimento, CatalogoReceta, ComidaPlan, ComponentePlan, DiaPlan, PlanAlimentario, RecomendacionNutricionalExperta } from '@/Pages/Nutricionista/Pacientes/PerfilNutricional/tipos';
import ModalComponentePlan from './ModalComponentePlan';
import ModalEditarComidaPlan from './ModalEditarComidaPlan';

interface Props { plan: PlanAlimentario | null; recomendacion: RecomendacionNutricionalExperta | null; puedeGenerar: boolean; alimentos: CatalogoAlimento[]; recetas: CatalogoReceta[]; pacienteId?: number; modoDetalle?: boolean; soloPlanificacion?: boolean }
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
export default function PlanAlimentarioCard({ plan, recomendacion, puedeGenerar, alimentos, recetas, pacienteId, modoDetalle = false, soloPlanificacion = false }: Props) {
    const [cargando, setCargando] = useState(''), [mensaje, setMensaje] = useState(''), [esError, setEsError] = useState(false), [modalCiclo, setModalCiclo] = useState(false), [modalGenerar, setModalGenerar] = useState(false), [modalManual, setModalManual] = useState(false), [fechaInicio, setFechaInicio] = useState(manana), [fechaNuevo, setFechaNuevo] = useState(''), [observacion, setObservacion] = useState(''), [nombreManual, setNombreManual] = useState('Plan semanal personalizado'), [objetivoManual, setObjetivoManual] = useState('');
    const recargar = () => modoDetalle
        ? router.reload()
        : router.reload({ only: ['planAlimentarioPrincipal', 'recomendacionExpertaAprobada', 'puedeGenerarPlanSemanal', 'historialPlanes', 'analiticaEvolucion', 'seguimientoPaciente'] });
    const accion: Accion = async (clave, fn) => { setCargando(clave); setMensaje(''); try { await fn(); setEsError(false); setMensaje('Operación realizada correctamente.'); recargar() } catch (e) { setEsError(true); setMensaje(errorDe(e)) } finally { setCargando('') } };
    const recomendacionAprobada = !!recomendacion && ['aprobado', 'validado'].includes(recomendacion.estado_validacion_experta);
    const puedeGenerarSeguro = puedeGenerar && recomendacionAprobada;
    const generar = () => {
        if (!recomendacionAprobada) {
            setEsError(true);
            setMensaje('La recomendación nutricional debe aprobarse antes de generar el plan semanal.');
            setModalGenerar(false);
            return;
        }
        accion('generar', async () => {
            await axios.post(`/nutricionista/recomendaciones-expertas/${recomendacion.id_recomendacion_nutricional_experta}/generar-plan`, {
                fecha_inicio: fechaInicio,
                reemplazar_plan_id: plan && editable && !plan.generado_por_sistema_experto ? plan.id_plan_alimentario : undefined,
            }, { headers: { Accept: 'application/json' } });
            setModalGenerar(false);
        });
    };
    const crearManual = () => accion('manual', async () => {
        if (!pacienteId) throw new Error('No se pudo identificar al paciente.');
        await axios.post(`/nutricionista/pacientes/${pacienteId}/planes-alimentarios/manual`, { nombre: nombreManual, fecha_inicio: fechaInicio, objetivo_plan: objetivoManual || null }, { headers: { Accept: 'application/json' } });
        setModalManual(false);
    });
    const cambiarEstado = (estado: 'aprobado' | 'rechazado') => plan && accion(estado, () => axios.patch(`/nutricionista/planes-alimentarios/${plan.id_plan_alimentario}/estado`, { estado_plan: estado }, { headers: { Accept: 'application/json' } }));
    const editable = !!plan && ['sugerido', 'en_revision'].includes(plan.estado_plan);
    const validable = !!plan && ['sugerido', 'en_revision', 'aprobado', 'rechazado'].includes(plan.estado_plan);
    const finalizable = !!plan && ['aprobado', 'activo'].includes(plan.estado_plan);
    const finalizar = () => plan && router.post(route('nutricionista.planes.finalizar-y-generar-siguiente', plan.id_plan_alimentario), { fecha_inicio: fechaNuevo || null, observacion_finalizacion: observacion || null }, { preserveScroll: true, onStart: () => setCargando('finalizar'), onSuccess: () => { setModalCiclo(false); setEsError(false); setMensaje('Plan finalizado y nueva planificación generada.'); recargar() }, onError: e => { setEsError(true); setMensaje(Object.values(e)[0] ?? 'No se pudo finalizar.') }, onFinish: () => setCargando('') });

    if (soloPlanificacion && plan) {
        return <PlanificacionSemanal dias={plan.dias} editable={editable} alimentos={alimentos} recetas={recetas} accion={accion} recargar={recargar} />;
    }

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

            {/* Elección del origen del plan */}
            {!plan && (
                <div className="grid gap-3 md:grid-cols-2">
                    <div className={clsx('rounded-2xl border p-4', puedeGenerarSeguro ? 'border-brand-green/25 bg-brand-green/[.04]' : 'border-surface-border bg-black/[.015] opacity-70 dark:border-surface-border-dark dark:bg-white/[.02]')}>
                        <div className="flex items-start gap-3"><div className="rounded-xl bg-brand-green/12 p-2.5 text-brand-green-dark dark:text-brand-green"><Sparkles size={18}/></div><div><h4 className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Con asistencia experta</h4><p className="mt-1 text-[10px] leading-relaxed text-ink-muted">Genera una propuesta desde la recomendación validada para que nutrición la revise.</p></div></div>
                        <button type="button" onClick={() => setModalGenerar(true)} disabled={!puedeGenerarSeguro || !!cargando} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-3 text-[10.5px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-35"><Sparkles size={13}/> Generar propuesta</button>
                        {!puedeGenerarSeguro && <p className="mt-2 text-[9px] text-ink-muted">Requiere una recomendación experta aprobada.</p>}
                    </div>
                    <div className="rounded-2xl border border-info/25 bg-info/[.035] p-4">
                        <div className="flex items-start gap-3"><div className="rounded-xl bg-info/10 p-2.5 text-info"><Pencil size={18}/></div><div><h4 className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Planificación manual</h4><p className="mt-1 text-[10px] leading-relaxed text-ink-muted">Crea los 7 días y completa personalmente recetas, porciones y horarios.</p></div></div>
                        <button type="button" onClick={() => setModalManual(true)} disabled={!!cargando || !pacienteId} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-info/30 bg-info/10 px-3 text-[10.5px] font-bold text-info hover:bg-info/15 disabled:opacity-35"><Plus size={13}/> Crear plan manual</button>
                        <p className="mt-2 text-[9px] text-ink-muted">No utiliza ni modifica el sistema experto.</p>
                    </div>
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

                    {editable && !plan.generado_por_sistema_experto && (
                        <section className="rounded-2xl border border-brand-green/25 bg-gradient-to-r from-brand-green/[0.08] via-brand-green/[0.035] to-transparent p-4 dark:from-brand-green/[0.1]">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="rounded-xl bg-brand-green/15 p-2.5 text-brand-green-dark dark:text-brand-green"><Sparkles size={18} /></div>
                                    <div>
                                        <p className="text-[9.5px] font-semibold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Alternativa disponible</p>
                                        <h4 className="mt-0.5 text-[12.5px] font-bold text-ink dark:text-ink-dark">¿Prefieres una propuesta del sistema experto?</h4>
                                        <p className="mt-1 max-w-2xl text-[10.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">El sistema tomará la orientación experta validada y preparará los 7 días con recetas sugeridas. Tu borrador manual quedará guardado en el historial como reemplazado.</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setModalGenerar(true)} disabled={!puedeGenerarSeguro || !!cargando}
                                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-green px-3.5 text-[10.5px] font-bold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-40">
                                    <Sparkles size={13} /> Usar propuesta experta
                                </button>
                            </div>
                            {!puedeGenerarSeguro && <p className="mt-3 rounded-lg bg-black/[0.035] px-3 py-2 text-[9.5px] text-ink-muted dark:bg-white/[0.04] dark:text-ink-muted-dark">Primero genera y aprueba la orientación en la etapa <b>Cálculo</b>; luego podrás crear la propuesta experta desde aquí.</p>}
                        </section>
                    )}

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
                        {!modoDetalle && <Link href={route('nutricionista.planes.detalle', plan.id_plan_alimentario)} className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-[11.5px] font-bold text-white shadow-sm transition hover:bg-brand-green-dark">Ver planificación completa <ArrowRight size={14}/></Link>}
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
                    {modoDetalle && <PlanificacionSemanal dias={plan.dias} editable={editable} alimentos={alimentos} recetas={recetas} accion={accion} recargar={recargar} />}
                </>
            )}

            {/* Mensaje */}
            {mensaje && (
                <div className={clsx('rounded-xl px-4 py-2.5 text-[11.5px]', esError ? 'border border-category-fruits/20 bg-category-fruits/5 text-category-fruits' : 'border border-brand-green/20 bg-brand-green/5 text-brand-green-dark dark:text-brand-green')}>
                    {mensaje}
                </div>
            )}

            {modalManual && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[3px]">
                    <div className="w-full max-w-lg space-y-4 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                        <div className="flex items-start gap-3"><div className="rounded-xl bg-info/10 p-2.5 text-info"><Pencil size={18}/></div><div><h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">Crear planificación manual</h3><p className="mt-1 text-[11px] leading-relaxed text-ink-muted">Se prepararán 7 días con desayuno, almuerzo, merienda y cena. Después podrás incorporar recetas o alimentos en cada comida.</p></div></div>
                        <label className="block"><span className="mb-1.5 block text-[10px] font-semibold text-ink-muted">Nombre del plan</span><input value={nombreManual} maxLength={150} onChange={e => setNombreManual(e.target.value)} className="w-full rounded-xl border border-surface-border bg-transparent px-4 py-3 text-[12px] text-ink outline-none focus:border-info/50 dark:border-surface-border-dark dark:text-ink-dark" /></label>
                        <label className="block"><span className="mb-1.5 block text-[10px] font-semibold text-ink-muted">Fecha de inicio</span><input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full rounded-xl border border-surface-border bg-transparent px-4 py-3 text-[12px] text-ink outline-none focus:border-info/50 dark:border-surface-border-dark dark:text-ink-dark" /><span className="mt-1 block text-[9px] text-ink-muted">Puedes elegir la fecha que necesites; el periodo tendrá siete días consecutivos.</span></label>
                        <label className="block"><span className="mb-1.5 block text-[10px] font-semibold text-ink-muted">Objetivo u orientación del plan <i className="font-normal">(opcional)</i></span><textarea value={objetivoManual} maxLength={500} onChange={e => setObjetivoManual(e.target.value)} placeholder="Ej.: mejorar regularidad de comidas y facilitar preparaciones..." className="min-h-20 w-full resize-none rounded-xl border border-surface-border bg-transparent px-4 py-3 text-[12px] text-ink outline-none focus:border-info/50 dark:border-surface-border-dark dark:text-ink-dark" /></label>
                        <div className="rounded-xl border border-info/20 bg-info/[.04] px-4 py-3 text-[9.5px] leading-relaxed text-ink-muted"><b className="text-info">Qué sucederá:</b> se copiarán únicamente las metas del cálculo nutricional. No se seleccionarán recetas automáticamente y el plan quedará “En revisión” hasta completar sus 28 comidas.</div>
                        <div className="flex justify-end gap-3"><Boton type="button" variante="ghost" tamano="sm" onClick={() => setModalManual(false)} disabled={!!cargando}>Cancelar</Boton><button type="button" onClick={crearManual} disabled={!!cargando || !nombreManual.trim() || !fechaInicio} className="inline-flex items-center gap-2 rounded-lg bg-info px-4 py-2 text-[11px] font-bold text-white disabled:opacity-40">{cargando === 'manual' ? <LoaderCircle size={13} className="animate-spin"/> : <CalendarDays size={13}/>} Crear estructura de 7 días</button></div>
                    </div>
                </div>
            )}

            {modalGenerar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
                    <div className="w-full max-w-md space-y-4 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                        <div>
                            <h3 className="text-[15px] font-bold text-ink dark:text-ink-dark">{plan && editable && !plan.generado_por_sistema_experto ? 'Cambiar a propuesta experta' : 'Programar plan semanal'}</h3>
                            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{plan && editable && !plan.generado_por_sistema_experto ? 'Se conservará el borrador manual en el historial y el sistema preparará una nueva propuesta de 7 días para tu revisión.' : 'Elige la fecha de inicio que necesites. El sistema calculará exactamente 7 días consecutivos.'}</p>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">Fecha de inicio</label>
                            <input type="date" required value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                            <p className="mt-1.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">Finaliza el {fechaInicio ? fechaLegible(new Date(`${fechaInicio}T00:00:00`).getTime() ? new Date(new Date(`${fechaInicio}T00:00:00`).getTime() + 6 * 86400000).toISOString().slice(0, 10) : null) : '—'}.</p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Boton type="button" variante="ghost" tamano="sm" onClick={() => setModalGenerar(false)} disabled={!!cargando}>Cancelar</Boton>
                            <Boton type="button" variante="primary" tamano="sm" onClick={generar} disabled={!!cargando || !fechaInicio}>
                                {cargando === 'generar' ? <LoaderCircle size={14} className="animate-spin" /> : <CalendarDays size={14} />}
                                {plan && editable && !plan.generado_por_sistema_experto ? 'Crear propuesta experta' : 'Generar 7 días'}
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
        ['Calorías', plan.calorias_objetivo, plan.calorias_totales, 'kcal'],
        ['Proteínas', plan.proteinas_objetivo, plan.proteinas_totales, 'g'],
        ['Carbohidratos', plan.carbohidratos_objetivo, plan.carbohidratos_totales, 'g'],
        ['Grasas', plan.grasas_objetivo, plan.grasas_totales, 'g'],
        ['Fibra', plan.fibra_objetivo, plan.fibra_total, 'g'],
    ] as const;

    const apariencia = (porcentaje: number, esMetaMinima = false) => {
        if (esMetaMinima && porcentaje >= 85) return {
            etiqueta: porcentaje >= 100 ? 'Objetivo cubierto' : 'Próximo al objetivo',
            borde: 'border-brand-green/30 bg-brand-green/[0.045]',
            barra: 'bg-brand-green', texto: 'text-brand-green-dark dark:text-brand-green',
        };
        if (porcentaje < 70 || porcentaje > 130) return {
            etiqueta: porcentaje < 70 ? 'Muy por debajo' : 'Muy por encima',
            borde: 'border-category-others/35 bg-category-others/[0.055]',
            barra: 'bg-category-others', texto: 'text-category-others',
        };
        if (porcentaje < 85 || porcentaje > 115) return {
            etiqueta: porcentaje < 85 ? 'Por debajo' : 'Por encima',
            borde: 'border-brand-orange/35 bg-brand-orange/[0.055]',
            barra: 'bg-brand-orange', texto: 'text-brand-orange',
        };
        return {
            etiqueta: 'Dentro del rango',
            borde: 'border-brand-green/30 bg-brand-green/[0.045]',
            barra: 'bg-brand-green', texto: 'text-brand-green-dark dark:text-brand-green',
        };
    };

    return (
        <div className="space-y-3">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Balance nutricional semanal</p>
                <p className="mt-1 max-w-3xl text-[10px] leading-relaxed text-ink-muted/90 dark:text-ink-muted-dark/90">
                    Cada porcentaje indica cuánto aporta el plan frente a la meta de los {dias} días: total planificado ÷ meta semanal × 100. Un 100% equivale a cubrir exactamente la meta.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {datos.map(([l, o, p, u]) => {
                    const objetivo = num(o) * dias;
                    const porcentajeReal = objetivo ? (num(p) / objetivo) * 100 : 0;
                    const pct = Math.min(Math.max(porcentajeReal, 0), 100);
                    const esFibra = l === 'Fibra';
                    const estado = apariencia(porcentajeReal, esFibra);
                    const diferencia = porcentajeReal - 100;
                    const lectura = esFibra && diferencia >= 0
                        ? `Cubre el mínimo recomendado y aporta ${n(diferencia)}% adicional`
                        : diferencia < 0
                        ? `Falta ${n(Math.abs(diferencia))}% para alcanzar la meta`
                        : diferencia > 0
                            ? `Supera la meta en ${n(diferencia)}%`
                            : 'Meta cubierta exactamente';
                    return (
                        <div key={l} className={clsx('relative overflow-hidden rounded-xl border px-3 py-3', estado.borde)}>
                            <div className="flex items-center justify-between gap-2"><p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{l}</p><span className={clsx('text-[8px] font-bold', estado.texto)}>{estado.etiqueta}</span></div>
                            <p className={clsx('mt-1 text-[12px] font-bold', estado.texto)}>{n(p)} <span className="text-[9.5px] font-medium text-ink-muted">/ {n(objetivo)} {u}</span></p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]">
                                <div className={clsx('h-full rounded-full transition-all duration-500', estado.barra)} style={{ width: `${pct}%` }} />
                            </div>
                            <p className={clsx('mt-1.5 text-[10px] font-bold', estado.texto)}>{objetivo ? `${n(porcentajeReal)}% de la meta` : 'Sin meta definida'}</p>
                            {objetivo > 0 && <p className="mt-1 text-[8.5px] leading-snug text-ink-muted dark:text-ink-muted-dark">{lectura}</p>}
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-surface-border bg-black/[0.015] px-3 py-2.5 text-[9px] text-ink-muted dark:border-surface-border-dark dark:bg-white/[0.02] dark:text-ink-muted-dark">
                <span className="font-semibold text-ink dark:text-ink-dark">Cómo interpretarlo:</span>
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-category-others" />Menos de 70% o más de 130%: diferencia amplia</span>
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brand-orange" />70–84% o 116–130%: requiere ajuste</span>
                <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brand-green" />85–115%: rango esperado</span>
                <span>En fibra, 100% representa el mínimo recomendado; un valor mayor se revisa según tolerancia.</span>
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
                        {comida.componentes.filter(c => c.tipo_componente === 'receta' && c.receta).map(c => {
                            const ingredientes = c.receta?.receta_alimentos ?? [];
                            const factor = Math.max(Number(c.cantidad ?? 1), 0);
                            const preparacion = c.receta?.preparacion?.trim();

                            return (
                                <div key={`detalle-receta-${c.id_componente_comida_plan}`} className="group mt-4 overflow-hidden rounded-2xl border border-surface-border/70 bg-black/[0.015] transition-all duration-300 hover:border-brand-green/25 hover:shadow-[0_14px_35px_-24px_rgba(0,0,0,0.45)] dark:border-surface-border-dark/70 dark:bg-white/[0.02] dark:hover:border-brand-green/20">
                                    <div className="grid md:grid-cols-[180px_minmax(0,1fr)]">
                                        {/* Imagen protagonista de la receta */}
                                        <div className="relative min-h-44 overflow-hidden bg-surface-muted md:min-h-full dark:bg-surface-muted-dark">
                                            <img
                                                src={c.receta?.imagen_url || '/images/recetas/receta-saludable-portada.png'}
                                                alt={`Fotografía de ${c.receta?.nombre ?? 'la receta'}`}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-3 pb-3 pt-10 md:hidden">
                                                <span className="inline-flex rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">Receta del plan</span>
                                            </div>
                                        </div>

                                        <div className="min-w-0">
                                    {/* Nombre de la receta */}
                                    <div className="flex flex-wrap items-center gap-2 border-b border-surface-border/50 px-4 py-3 dark:border-surface-border-dark/50">
                                        <div className="min-w-0 flex-1">
                                            <p className="hidden text-[8.5px] font-bold uppercase tracking-[0.14em] text-brand-green-dark/75 md:block dark:text-brand-green/80">Receta del plan</p>
                                            <span className="block text-[12px] font-bold leading-snug text-ink dark:text-ink-dark">{c.receta?.nombre ?? 'Receta'}</span>
                                        </div>
                                        {editable && <button type="button" onClick={() => { setSeleccionado(c); setModalComponente(true) }} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-surface-border px-2.5 py-1.5 text-[9px] font-semibold text-ink-muted transition hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green-dark dark:border-surface-border-dark dark:text-ink-muted-dark dark:hover:text-brand-green"><Pencil size={9} /> Ajustar receta</button>}
                                        {editable && <button type="button" title="Eliminar receta" onClick={() => confirm('¿Eliminar esta receta?') && accion(`eliminar-${c.id_componente_comida_plan}`, () => axios.delete(`/nutricionista/componentes-plan/${c.id_componente_comida_plan}`, { headers: { Accept: 'application/json' } }))} className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-muted/60 transition hover:bg-category-fruits/10 hover:text-category-fruits"><Trash2 size={10} /></button>}
                                    </div>

                                    <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface-border/50 dark:divide-surface-border-dark/50">
                                        {/* ── Ingredientes ── */}
                                        <div className="px-4 py-3">
                                            <p className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">
                                                <span className="inline-block h-2 w-2 rounded-sm bg-brand-green/60" />
                                                Ingredientes
                                            </p>
                                            {ingredientes.length > 0 ? (
                                                <ul className="space-y-1.5">
                                                    {ingredientes.map(ingrediente => (
                                                        <li key={ingrediente.id_receta_alimento} className="flex items-baseline justify-between gap-2">
                                                            <span className="text-[10.5px] text-ink/80 dark:text-ink-dark/80 leading-tight">{ingrediente.alimento?.nombre ?? 'Alimento'}</span>
                                                            <span className="shrink-0 font-semibold tabular-nums text-[10px] text-ink-muted dark:text-ink-muted-dark whitespace-nowrap">
                                                                {n(Number(ingrediente.cantidad) * factor)} {ingrediente.unidad}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-[10.5px] italic text-ink-muted dark:text-ink-muted-dark">Sin ingredientes registrados.</p>
                                            )}
                                        </div>

                                        {/* ── Preparación ── */}
                                        <div className="px-4 py-3">
                                            <p className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-category-dairy">
                                                <span className="inline-block h-2 w-2 rounded-sm bg-category-dairy/60" />
                                                Preparación
                                            </p>
                                            {preparacion ? (
                                                <p className="whitespace-pre-line text-[10.5px] leading-relaxed text-ink/80 dark:text-ink-dark/80">
                                                    {preparacion}
                                                </p>
                                            ) : (
                                                <p className="text-[10.5px] italic text-ink-muted dark:text-ink-muted-dark">
                                                    Sin instrucciones de preparación registradas.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {comida.componentes.filter(c => c.tipo_componente !== 'receta' || !c.receta).map(c => (
                            <div key={`componente-${c.id_componente_comida_plan}`} className="mt-3 flex items-center gap-3 rounded-xl border border-surface-border/70 bg-black/[0.015] px-3 py-3 dark:border-surface-border-dark/70 dark:bg-white/[0.02]">
                                <span className={clsx('h-7 w-1 rounded-full', c.tipo_componente === 'alimento' ? 'bg-category-dairy' : 'bg-brand-orange')} />
                                <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-ink dark:text-ink-dark">{c.alimento?.nombre ?? c.nombre_manual ?? 'Componente complementario'}</p><p className="mt-0.5 text-[9px] text-ink-muted dark:text-ink-muted-dark">{n(c.calorias)} kcal · complemento del tiempo de comida</p></div>
                                {editable && <button type="button" onClick={() => { setSeleccionado(c); setModalComponente(true) }} className="inline-flex items-center gap-1 rounded-lg border border-surface-border px-2 py-1 text-[9px] font-semibold text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark"><Pencil size={9} /> Ajustar</button>}
                            </div>
                        ))}
                    </>
                )}

                {/* Observaciones / preparación */}
                {comida.observaciones && (
                    <div className="mt-3 pt-3 border-t border-surface-border/50 dark:border-surface-border-dark/50">
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-1">Indicaciones adicionales</p>
                        <p className="text-[11.5px] text-ink/80 dark:text-ink-dark/80 leading-relaxed">{comida.observaciones}</p>
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
