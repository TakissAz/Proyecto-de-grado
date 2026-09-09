import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Coffee, Eye, HeartPulse, Moon, Sun, Sunrise, TrendingUp, Utensils, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/Components/ui/badge';
import type { SeguimientoPacienteNutricionista } from '@/Pages/Nutricionista/Pacientes/PerfilNutricional/tipos';

const texto = (v: unknown) => v === null || v === undefined || v === '' ? 'Sin registro' : String(v).replaceAll('_', ' ');
const estadoColor: Record<string, 'green' | 'orange' | 'red' | 'blue' | 'gray'> = { completada: 'green', parcial: 'orange', no_realizada: 'red', reemplazada: 'blue', pendiente: 'gray', sin_registro: 'orange' };
const fechaDia = (fecha: string | null) => fecha
    ? new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/La_Paz' }).format(new Date(`${fecha}T12:00:00-04:00`))
    : 'Fecha no definida';
const resumenDia = (comidas: SeguimientoPacienteNutricionista['seguimiento_comidas'][number]['comidas']) => {
    const evaluables = comidas.filter(c => c.estado_cumplimiento !== 'pendiente');
    const puntos = evaluables.reduce((total, c) => total + (c.estado_cumplimiento === 'completada' ? 1 : c.estado_cumplimiento === 'parcial' ? (c.porcentaje_consumido !== null ? c.porcentaje_consumido / 100 : .5) : c.estado_cumplimiento === 'reemplazada' ? .5 : 0), 0);
    return { evaluables: evaluables.length, porcentaje: evaluables.length ? Math.round(puntos / evaluables.length * 100) : null };
};
const explicacionEstado: Record<string, string> = {
    completada: 'La paciente confirmó que consumió toda la comida.',
    parcial: 'La paciente consumió solamente una parte de lo planificado.',
    reemplazada: 'La comida fue sustituida por otra preparación.',
    no_realizada: 'La paciente confirmó que no realizó esta comida.',
    sin_registro: 'El horario y la tolerancia finalizaron sin una respuesta de la paciente.',
    pendiente: 'La comida todavía no puede evaluarse porque su horario no finalizó.',
};

export default function SeguimientoPacientePanel({ seguimiento }: { seguimiento: SeguimientoPacienteNutricionista }) {
    const [modalDia, setModalDia] = useState<SeguimientoPacienteNutricionista['seguimiento_comidas'][number] | null>(null);

    if (!seguimiento.plan || !seguimiento.resumen_adherencia) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-10 text-center dark:border-surface-border-dark">
                <ClipboardList size={32} strokeWidth={1.2} className="text-ink-muted/30 dark:text-ink-muted-dark/30" />
                <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Sin plan activo para seguimiento</h3>
                <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark max-w-xs">Este panel se habilitará cuando exista un plan aprobado o activo.</p>
            </div>
        );
    }

    if (seguimiento.estado_periodo === 'no_iniciado' || seguimiento.estado_periodo === 'sin_registros') {
        const noIniciado = seguimiento.estado_periodo === 'no_iniciado';
        return (
            <div className="rounded-xl border border-surface-border p-6 dark:border-surface-border-dark">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
                        <CalendarDays size={20} strokeWidth={1.7} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">{noIniciado ? 'Seguimiento aún no iniciado' : 'Semana en curso sin registros'}</h3>
                            <Badge color="blue">{noIniciado ? 'Próximamente' : 'Sin actividad'}</Badge>
                        </div>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                            {noIniciado
                                ? `El plan comienza el ${seguimiento.plan.fecha_inicio ?? 'día programado'}. Los datos precargados o ajenos a esta semana no se contabilizan.`
                                : 'El plan ya comenzó, pero la paciente todavía no marcó ninguna comida. Esto no se interpreta como baja adherencia.'}
                        </p>
                        <p className="mt-2 text-[10.5px] font-medium text-ink dark:text-ink-dark">
                            Periodo: {seguimiento.plan.fecha_inicio ?? 'Sin fecha'} — {seguimiento.plan.fecha_fin ?? 'Sin fecha'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const r = seguimiento.resumen_adherencia;
    const i = seguimiento.indicadores_siguiente_plan;
    const s = seguimiento.seguimiento_sintomas.indicadores;
    const alertas = [
        r.porcentaje_adherencia < 60 && 'La adherencia general está por debajo del 60%.',
        r.no_realizadas > 0 && `Hay ${r.no_realizadas} comida(s) no realizada(s).`,
        i.hambre_frecuente > 0 && 'Se reportó hambre posterior o ansiedad.',
        s.alerta_general === true && 'Existen síntomas frecuentes que requieren revisión.',
    ].filter(Boolean) as string[];

    const adherenciaColor = r.porcentaje_adherencia >= 70 ? 'text-brand-green-dark dark:text-brand-green' : r.porcentaje_adherencia >= 40 ? 'text-brand-orange' : 'text-category-fruits';
    const barColor = r.porcentaje_adherencia >= 70 ? 'bg-brand-green' : r.porcentaje_adherencia >= 40 ? 'bg-brand-orange' : 'bg-category-fruits';

    return (
        <div className="space-y-4">
            {/* ═══ DASHBOARD: Adherencia general ═══ */}
            <div className="rounded-xl border border-surface-border p-5 dark:border-surface-border-dark">
                <div className="flex items-start gap-4">
                    {/* Indicador circular de adherencia */}
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-black/[0.06] dark:stroke-white/[0.06]" />
                            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round"
                                className={clsx(r.porcentaje_adherencia >= 70 ? 'stroke-brand-green' : r.porcentaje_adherencia >= 40 ? 'stroke-brand-orange' : 'stroke-category-fruits')}
                                strokeDasharray={`${(r.porcentaje_adherencia / 100) * 213.6} 213.6`} />
                        </svg>
                        <span className={clsx('absolute text-[18px] font-bold', adherenciaColor)}>{r.porcentaje_adherencia}%</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Seguimiento del paciente</h3>
                                <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{seguimiento.plan.nombre} · {texto(seguimiento.plan.estado_plan)}</p>
                            </div>
                            <Badge color={r.porcentaje_adherencia >= 70 ? 'green' : r.porcentaje_adherencia >= 40 ? 'orange' : 'red'}>
                                {r.porcentaje_adherencia >= 70 ? 'Buena' : r.porcentaje_adherencia >= 40 ? 'Regular' : 'Baja'} adherencia
                            </Badge>
                        </div>

                        {/* Mini stats inline */}
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                            <MiniStat label="Completadas" valor={r.completadas} color="text-brand-green-dark dark:text-brand-green" />
                            <MiniStat label="Parciales" valor={r.parciales} color="text-brand-orange" />
                            <MiniStat label="No realizadas" valor={r.no_realizadas} color="text-category-fruits" />
                            <MiniStat label="Reemplazadas" valor={r.reemplazadas} color="text-info" />
                            <MiniStat label="Pendientes" valor={r.pendientes} color="text-ink-muted dark:text-ink-muted-dark" />
                            {(r.sin_registro_vencidas ?? 0) > 0 && <MiniStat label="Sin registrar tras horario" valor={r.sin_registro_vencidas ?? 0} color="text-brand-orange" />}
                        </div>
                    </div>
                </div>

                {/* Barra de progreso full width */}
                <div className="mt-4 h-2 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${r.porcentaje_adherencia}%` }} />
                </div>
            </div>

            {/* ═══ ALERTA rápida si hay problemas ═══ */}
            {alertas.length > 0 && (
                <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 dark:bg-brand-orange/[0.06]">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle size={15} strokeWidth={1.8} className="text-brand-orange shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-[11.5px] font-bold text-ink dark:text-ink-dark">Atención ({alertas.length})</p>
                            <ul className="mt-1 space-y-0.5">
                                {alertas.map(a => <li key={a} className="text-[10.5px] text-ink/80 dark:text-ink-dark/80">• {a}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ GRID: Adherencia por tipo + Síntomas ═══ */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Adherencia por tipo de comida */}
                <div className="lg:col-span-2 rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                    <div className="mb-3"><h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark">
                        <Utensils size={14} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" /> Adherencia por comida
                    </h4><p className="mt-1 text-[9px] text-ink-muted dark:text-ink-muted-dark">El porcentaje valora el cumplimiento; el contador muestra únicamente comidas completadas.</p></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(seguimiento.adherencia_por_tipo_comida).map(([tipo, d]) => {
                            const color = d.porcentaje_adherencia >= 85 ? 'text-brand-green-dark dark:text-brand-green' : d.porcentaje_adherencia >= 70 ? 'text-brand-orange' : 'text-info';
                            const barra = d.porcentaje_adherencia >= 85 ? 'bg-brand-green' : d.porcentaje_adherencia >= 70 ? 'bg-brand-orange' : 'bg-info';
                            return (
                            <div key={tipo} className="rounded-xl border border-surface-border bg-black/[0.02] p-3 dark:border-surface-border-dark dark:bg-white/[0.03]">
                                <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold capitalize text-ink dark:text-ink-dark">{texto(tipo)}</p><span className={clsx('text-[8px] font-bold', color)}>{d.porcentaje_adherencia >= 85 ? 'Adecuada' : 'A revisar'}</span></div>
                                <p className={clsx('mt-2 text-[19px] font-bold', color)}>{d.porcentaje_adherencia}%</p>
                                <p className="text-[7.5px] uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">Cumplimiento ponderado</p>
                                <div className="mt-1.5 h-1 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                                    <div className={clsx('h-full rounded-full', barra)} style={{ width: `${d.porcentaje_adherencia}%` }} />
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-black/[.05] pt-2 dark:border-white/[.05]"><span className="text-[8px] text-ink-muted dark:text-ink-muted-dark">Completadas</span><b className="text-[10px] text-ink dark:text-ink-dark">{d.completadas}/{d.comidas_totales}</b></div>
                                <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[7.5px] text-ink-muted dark:text-ink-muted-dark">
                                    {d.parciales > 0 && <span>{d.parciales} parciales</span>}
                                    {d.reemplazadas > 0 && <span>{d.reemplazadas} reemplazadas</span>}
                                    {d.no_realizadas > 0 && <span>{d.no_realizadas} no realizadas</span>}
                                    {(d.sin_registro_vencidas ?? 0) > 0 && <span>{d.sin_registro_vencidas} sin registro</span>}
                                    {d.pendientes > 0 && <span>{d.pendientes} pendientes</span>}
                                </div>
                            </div>
                        )})}
                    </div>
                </div>

                {/* Síntomas recientes */}
                <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                    <h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark mb-3">
                        <HeartPulse size={14} strokeWidth={1.8} className="text-category-fruits" /> Síntomas
                    </h4>
                    <div className="space-y-1.5">
                        {Object.entries(s).filter(([, v]) => v === true).map(([k]) => (
                            <div key={k} className="flex items-center gap-2 rounded-lg bg-brand-orange/[0.06] px-3 py-2 dark:bg-brand-orange/[0.08]">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shrink-0" />
                                <span className="text-[11px] text-ink dark:text-ink-dark capitalize">{texto(k)}</span>
                            </div>
                        ))}
                        {Object.entries(s).filter(([, v]) => v === true).length === 0 && (
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic text-center py-4">Sin síntomas reportados</p>
                        )}
                    </div>
                    <p className="mt-3 text-[9.5px] text-ink-muted/60 dark:text-ink-muted-dark/60">{texto(s.registros_ultimos_7_dias)} registro(s) recientes</p>
                </div>
            </div>

            {/* ═══ INDICADORES: Para el siguiente plan ═══ */}
            <div className="overflow-hidden rounded-2xl border border-surface-border dark:border-surface-border-dark">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border bg-black/[.015] px-5 py-4 dark:border-surface-border-dark dark:bg-white/[.02]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green-dark dark:text-brand-green"><TrendingUp size={18} strokeWidth={1.8}/></div>
                        <div>
                            <h4 className="text-[13px] font-bold text-ink dark:text-ink-dark">Decisiones para el siguiente plan</h4>
                            <p className="mt-0.5 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">Hallazgos del seguimiento convertidos en acciones útiles para la próxima planificación.</p>
                        </div>
                    </div>
                    <span className="rounded-lg bg-info/10 px-2.5 py-1.5 text-[8.5px] font-bold text-info">Basado en esta semana</span>
                </div>
                <div className="grid gap-3 p-4 md:grid-cols-2">
                    <IndicadorGrupo titulo="Mantener en el plan" descripcion="Recetas con buena aceptación o tolerancia." items={i.recetas_bien_aceptadas} tono="green" icon={CheckCircle2} vacio="Aún no hay recetas destacadas." />
                    <IndicadorGrupo titulo="Revisar antes de repetir" descripcion="Preparaciones que conviene adaptar o sustituir." items={i.recetas_a_evitar} tono="blue" icon={Eye} vacio="No hay recetas que requieran revisión." />
                    <IndicadorGrupo titulo="Dificultades detectadas" descripcion="Alimentos o preparaciones asociados a problemas." items={i.alimentos_o_preparaciones_problematicas} tono="orange" icon={AlertTriangle} vacio="No se detectaron dificultades prácticas." />
                    <IndicadorGrupo titulo="Acciones recomendadas" descripcion="Orientaciones concretas para nutrición." items={i.recomendaciones_para_nutricionista} tono="gray" icon={ClipboardList} vacio="No hay acciones adicionales por el momento." />
                </div>
            </div>

            {/* ═══ DETALLE DIARIO: Lista de días con botón modal ═══ */}
            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div><h4 className="flex items-center gap-2 text-[12px] font-bold text-ink dark:text-ink-dark"><CalendarDays size={14} strokeWidth={1.8} className="text-info" /> Seguimiento por día</h4><p className="mt-1 text-[10px] text-ink-muted dark:text-ink-muted-dark">Selecciona un día para revisar las comidas y respuestas registradas.</p></div>
                    <span className="rounded-lg bg-info/10 px-2.5 py-1 text-[9px] font-bold text-info">Periodo de 7 días</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {seguimiento.seguimiento_comidas.map(d => {
                        const completadas = d.comidas.filter(c => c.estado_cumplimiento === 'completada').length;
                        const { evaluables, porcentaje: pct } = resumenDia(d.comidas);
                        const sinRegistrar = d.comidas.filter(c => c.estado_cumplimiento === 'sin_registro').length;
                        return (
                            <button key={d.id_dia_plan_alimentario} type="button" onClick={() => setModalDia(d)}
                                className={clsx('group rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-sm', pct === null ? 'border-surface-border/60 bg-black/[.015] dark:border-surface-border-dark/60 dark:bg-white/[.015]' : 'border-brand-green/15 bg-brand-green/[.025] dark:bg-brand-green/[.035]')}>
                                <div className="flex items-start justify-between gap-1"><div><p className="text-[10.5px] font-bold capitalize text-ink dark:text-ink-dark">{d.nombre_dia || `Día ${d.numero_dia}`}</p><p className="mt-0.5 text-[8.5px] text-ink-muted dark:text-ink-muted-dark">{fechaDia(d.fecha)}</p></div><Eye size={11} className="mt-0.5 text-ink-muted/35 transition group-hover:text-brand-green dark:text-ink-muted-dark/35" /></div>
                                <p className={clsx('mt-3 text-[18px] font-bold', pct === null ? 'text-ink-muted/50 dark:text-ink-muted-dark/50' : pct >= 70 ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange')}>{pct === null ? '—' : `${pct}%`}</p>
                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.06]"><div className={clsx('h-full rounded-full', pct !== null && pct >= 70 ? 'bg-brand-green' : 'bg-brand-orange')} style={{ width: `${pct ?? 0}%` }} /></div>
                                <p className="mt-2 text-[8.5px] text-ink-muted dark:text-ink-muted-dark">{pct === null ? 'Aún sin comidas evaluables' : `${completadas} completada(s) · ${evaluables} evaluable(s)`}</p>
                                {sinRegistrar > 0 && <p className="mt-1 text-[8.5px] font-semibold text-brand-orange">{sinRegistrar} sin registrar</p>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ MODAL: Detalle del día ═══ */}
            {modalDia && <ModalDetalleDia dia={modalDia} cerrar={() => setModalDia(null)} />}
        </div>
    );
}

/* ═══ Modal detalle del día ═══ */
function ModalDetalleDia({ dia, cerrar }: { dia: SeguimientoPacienteNutricionista['seguimiento_comidas'][number]; cerrar: () => void }) {
    const completadas = dia.comidas.filter(c => c.estado_cumplimiento === 'completada').length;
    const { evaluables, porcentaje: pct } = resumenDia(dia.comidas);
    const pctColor = pct === null ? 'text-ink-muted dark:text-ink-muted-dark' : pct >= 70 ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange';
    const headerBg = pct === null ? 'bg-info/[0.04] dark:bg-info/[0.06]' : pct >= 70 ? 'bg-brand-green/[0.04] dark:bg-brand-green/[0.06]' : 'bg-brand-orange/[0.04] dark:bg-brand-orange/[0.06]';

    const TIPO_ICONO: Record<string, typeof Utensils> = { desayuno: Sunrise, almuerzo: Sun, merienda: Coffee, cena: Moon };
    const TIPO_COLOR: Record<string, { bg: string; accent: string }> = {
        desayuno: { bg: 'bg-amber-500/[0.06] dark:bg-amber-400/[0.08]', accent: 'text-amber-600 dark:text-amber-400' },
        almuerzo: { bg: 'bg-brand-green/[0.06] dark:bg-brand-green/[0.08]', accent: 'text-brand-green-dark dark:text-brand-green' },
        merienda: { bg: 'bg-purple-500/[0.06] dark:bg-purple-400/[0.08]', accent: 'text-purple-600 dark:text-purple-400' },
        cena: { bg: 'bg-blue-500/[0.06] dark:bg-blue-400/[0.08]', accent: 'text-blue-600 dark:text-blue-400' },
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-3xl rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark max-h-[88vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header con color según rendimiento */}
                <div className={clsx('px-6 py-5 shrink-0', headerBg)}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mini círculo de progreso */}
                            <div className="relative flex h-14 w-14 items-center justify-center">
                                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4" className="stroke-black/[0.08] dark:stroke-white/[0.08]" />
                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4" strokeLinecap="round"
                                        className={clsx(pct !== null && pct >= 70 ? 'stroke-brand-green' : 'stroke-brand-orange')}
                                        strokeDasharray={`${((pct ?? 0) / 100) * 138.2} 138.2`} />
                                </svg>
                                <span className={clsx('absolute text-[13px] font-bold', pctColor)}>{pct === null ? '—' : `${pct}%`}</span>
                            </div>
                            <div>
                                <h3 className="text-[16px] font-bold text-ink dark:text-ink-dark">Día {dia.numero_dia} — {dia.nombre_dia}</h3>
                                <p className="text-[11.5px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                                    {fechaDia(dia.fecha)} · {completadas} completada(s) de {evaluables} evaluable(s)
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={cerrar}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-black/[0.06] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.06] dark:hover:text-ink-dark">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mini resumen rápido */}
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        {(['completada', 'parcial', 'no_realizada', 'reemplazada', 'sin_registro', 'pendiente'] as const).map(estado => {
                            const count = dia.comidas.filter(c => c.estado_cumplimiento === estado).length;
                            if (count === 0) return null;
                            return (
                                <Badge key={estado} color={estadoColor[estado] ?? 'gray'}>
                                    {count} {texto(estado)}{count > 1 ? 's' : ''}
                                </Badge>
                            );
                        })}
                    </div>
                    <div className="mt-3 rounded-xl border border-black/[.05] bg-white/35 px-3.5 py-2.5 dark:border-white/[.05] dark:bg-black/10">
                        <p className="text-[10px] leading-relaxed text-ink-muted dark:text-ink-muted-dark"><span className="font-bold text-ink dark:text-ink-dark">Lectura del día:</span> el {pct ?? 0}% se calcula solo con las {evaluables} comida(s) que ya pueden evaluarse. Las comidas pendientes no reducen la adherencia.</p>
                    </div>
                </div>

                {/* Contenido scrollable — comidas */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {dia.comidas.map(c => {
                        const tipoColor = TIPO_COLOR[c.tipo_comida] ?? { bg: 'bg-black/[0.03] dark:bg-white/[0.04]', accent: 'text-ink-muted dark:text-ink-muted-dark' };
                        const Icono = TIPO_ICONO[c.tipo_comida] ?? Utensils;
                        return (
                            <article key={c.id_comida_plan_alimentario} className="rounded-2xl border border-surface-border/70 overflow-hidden dark:border-surface-border-dark/70">
                                {/* Header de comida con color */}
                                <div className={clsx('px-4 py-3.5 flex items-start justify-between gap-3', tipoColor.bg)}>
                                    <div className="flex items-center gap-3">
                                        <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20', tipoColor.accent)}>
                                            <Icono size={15} strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <p className={clsx('text-[11px] font-bold uppercase tracking-wider', tipoColor.accent)}>{texto(c.tipo_comida)}</p>
                                            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">Horario planificado: {c.hora_sugerida ?? 'Sin hora'}</p>
                                        </div>
                                    </div>
                                    <Badge color={estadoColor[c.estado_cumplimiento] ?? 'gray'}>{texto(c.estado_cumplimiento)}</Badge>
                                </div>

                                {/* Body de la comida */}
                                <div className="px-4 py-4 space-y-4">
                                    <div className="rounded-xl border border-surface-border/60 bg-black/[.015] px-3.5 py-3 dark:border-surface-border-dark/60 dark:bg-white/[.02]">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">Interpretación del estado</p>
                                        <p className="mt-1 text-[11px] leading-relaxed text-ink dark:text-ink-dark">{explicacionEstado[c.estado_cumplimiento] ?? 'Estado del seguimiento registrado para esta comida.'}</p>
                                    </div>

                                    {/* Componentes de la comida */}
                                    {c.componentes.length > 0 && (
                                        <div><p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">Preparación planificada · {c.nombre_comida}</p><div className="flex flex-wrap gap-1.5">
                                            {c.componentes.map((comp, idx) => (
                                                <span key={idx} className="inline-flex items-center rounded-md bg-black/[0.03] px-2 py-0.5 text-[10px] text-ink dark:bg-white/[0.04] dark:text-ink-dark">{comp}</span>
                                            ))}
                                        </div></div>
                                    )}

                                    {/* Indicadores visuales */}
                                    <div><p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">Respuesta de la paciente</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <IndicadorVisual label="Consumido" valor={c.porcentaje_consumido} tipo="porcentaje" />
                                        <IndicadorVisual label="Agrado" valor={c.nivel_agrado} tipo="nivel" />
                                        <IndicadorVisual label="Saciedad" valor={c.nivel_saciedad} tipo="nivel" />
                                    </div></div>

                                    {/* Fila secundaria */}
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <DatoCompacto label="Hambre posterior" valor={c.nivel_hambre_posterior} />
                                        <DatoCompacto label="Ansiedad" valor={c.ansiedad_posterior === null ? null : c.ansiedad_posterior ? 'Sí' : 'No'} alerta={c.ansiedad_posterior === true} />
                                        <DatoCompacto label="Ingredientes" valor={c.consiguio_ingredientes === null ? null : c.consiguio_ingredientes ? 'Conseguidos' : 'No conseguidos'} alerta={c.consiguio_ingredientes === false} />
                                    </div>

                                    {/* Molestia */}
                                    {c.presento_molestia && (
                                        <div className="rounded-lg border border-category-fruits/20 bg-category-fruits/[0.04] px-3 py-2.5">
                                            <p className="text-[9.5px] font-bold uppercase tracking-wider text-category-fruits/70 mb-0.5">Molestia reportada</p>
                                            <p className="text-[11.5px] text-ink dark:text-ink-dark font-medium">{texto(c.tipo_molestia)} — intensidad: {texto(c.intensidad_molestia)}</p>
                                        </div>
                                    )}

                                    {/* Motivo no cumplimiento */}
                                    {c.motivo_no_cumplimiento && (
                                        <div className="rounded-lg border border-brand-orange/20 bg-brand-orange/[0.04] px-3 py-2.5">
                                            <p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-orange/70 mb-0.5">Motivo</p>
                                            <p className="text-[11.5px] text-ink dark:text-ink-dark">{texto(c.motivo_no_cumplimiento)}</p>
                                        </div>
                                    )}

                                    {/* Comentarios del paciente — estilo chat bubble */}
                                    {(c.comentario_paciente || c.sugerencia_paciente) && (
                                        <div className="space-y-2 pt-1">
                                            {c.comentario_paciente && (
                                                <div className="flex gap-2">
                                                    <div className="h-5 w-5 shrink-0 rounded-full bg-brand-green/15 flex items-center justify-center mt-0.5">
                                                        <span className="text-[8px]">💬</span>
                                                    </div>
                                                    <div className="rounded-xl rounded-tl-sm bg-brand-green/[0.06] px-3 py-2 dark:bg-brand-green/[0.08]">
                                                        <p className="mb-0.5 text-[8.5px] font-bold uppercase tracking-wide text-brand-green-dark dark:text-brand-green">Comentario</p><p className="text-[10.5px] text-ink dark:text-ink-dark leading-relaxed">{c.comentario_paciente}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {c.sugerencia_paciente && (
                                                <div className="flex gap-2">
                                                    <div className="h-5 w-5 shrink-0 rounded-full bg-info/15 flex items-center justify-center mt-0.5">
                                                        <span className="text-[8px]">💡</span>
                                                    </div>
                                                    <div className="rounded-xl rounded-tl-sm bg-info/[0.06] px-3 py-2 dark:bg-info/[0.08]">
                                                        <p className="mb-0.5 text-[8.5px] font-bold uppercase tracking-wide text-info">Sugerencia</p><p className="text-[10.5px] text-ink dark:text-ink-dark leading-relaxed">{c.sugerencia_paciente}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
            {/* Backdrop */}
            <div className="absolute inset-0 -z-10" onClick={cerrar} />
        </div>
    );
}

/* Indicador visual con barra de nivel */
function IndicadorVisual({ label, valor, tipo }: { label: string; valor: unknown; tipo: 'porcentaje' | 'nivel' }) {
    const escalas: Record<string, Record<string, number>> = {
        agrado: { no_me_gusto: 25, neutral: 55, me_gusto: 100 },
        saciedad: { baja: 30, media: 65, alta: 100 },
        general: { muy_bajo: 20, baja: 30, bajo: 30, moderada: 55, moderado: 55, media: 65, medio: 65, alta: 100, alto: 100, muy_alto: 100 },
    };
    const clave = label.toLowerCase();
    const valorNormalizado = String(valor ?? '').toLowerCase();
    const numVal = tipo === 'porcentaje' ? Number(valor ?? 0) : (escalas[clave] ?? escalas.general)[valorNormalizado] ?? 0;
    const respondido = valor !== null && valor !== undefined && valor !== '';
    const colorBar = !respondido ? 'bg-ink-muted/20 dark:bg-ink-muted-dark/20' : numVal >= 70 ? 'bg-brand-green' : numVal >= 40 ? 'bg-brand-orange' : 'bg-category-fruits';

    return (
        <div className="rounded-lg bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2.5">
            <p className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60">{label}</p>
            <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', colorBar)} style={{ width: `${numVal}%` }} />
                </div>
                <span className="text-[10px] font-bold text-ink dark:text-ink-dark shrink-0">
                    {!respondido ? 'No registrado' : tipo === 'porcentaje' ? `${valor}%` : texto(valor)}
                </span>
            </div>
            {tipo === 'nivel' && respondido && (
                <p className="mt-1.5 text-[8.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                    {clave === 'agrado' ? 'Nivel de aceptación reportado' : clave === 'saciedad' ? 'Sensación de llenura posterior' : 'Nivel reportado por la paciente'}
                </p>
            )}
        </div>
    );
}

/* Dato compacto con alerta */
function DatoCompacto({ label, valor, alerta }: { label: string; valor: unknown; alerta?: boolean }) {
    return (
        <div className={clsx('rounded-lg px-3 py-2.5', alerta ? 'bg-category-fruits/[0.04] border border-category-fruits/15' : 'bg-black/[0.02] dark:bg-white/[0.03]')}>
            <p className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-muted/60 dark:text-ink-muted-dark/60">{label}</p>
            <p className={clsx('text-[11px] font-medium mt-0.5', alerta ? 'text-category-fruits' : 'text-ink dark:text-ink-dark')}>{texto(valor)}</p>
        </div>
    );
}

/* ═══ Componentes auxiliares ═══ */

function MiniStat({ label, valor, color }: { label: string; valor: number; color: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={clsx('text-[14px] font-bold', color)}>{valor}</span>
            <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{label}</span>
        </div>
    );
}

function IndicadorGrupo({ titulo, descripcion, items, tono, icon: Icon, vacio }: { titulo: string; descripcion: string; items: string[]; tono: 'green' | 'orange' | 'blue' | 'gray'; icon: typeof TrendingUp; vacio: string }) {
    const [expandido, setExpandido] = useState(false);
    const estilos = {
        green: { borde: 'border-brand-green/20', icono: 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green', punto: 'bg-brand-green' },
        orange: { borde: 'border-brand-orange/25', icono: 'bg-brand-orange/10 text-brand-orange', punto: 'bg-brand-orange' },
        blue: { borde: 'border-info/20', icono: 'bg-info/10 text-info', punto: 'bg-info' },
        gray: { borde: 'border-surface-border dark:border-surface-border-dark', icono: 'bg-black/[.04] text-ink-muted dark:bg-white/[.06] dark:text-ink-muted-dark', punto: 'bg-ink-muted' },
    }[tono];
    const visibles = expandido ? items : items.slice(0, 4);
    return (
        <article className={clsx('rounded-2xl border bg-white/30 p-4 dark:bg-white/[.015]', estilos.borde)}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', estilos.icono)}><Icon size={16} strokeWidth={1.8}/></div>
                    <div><h5 className="text-[11px] font-bold text-ink dark:text-ink-dark">{titulo}</h5><p className="mt-0.5 text-[8.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{descripcion}</p></div>
                </div>
                <span className="shrink-0 rounded-lg bg-black/[.035] px-2 py-1 text-[8px] font-bold text-ink-muted dark:bg-white/[.05] dark:text-ink-muted-dark">{items.length}</span>
            </div>
            {items.length > 0 ? (
                <div className="mt-3 space-y-1.5">
                    {visibles.map((x, index) => <div key={`${x}-${index}`} className="flex items-start gap-2 rounded-lg bg-black/[.022] px-2.5 py-2 dark:bg-white/[.028]"><span className={clsx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', estilos.punto)}/><span className="text-[9.5px] leading-relaxed text-ink/80 dark:text-ink-dark/80">{x}</span></div>)}
                    {items.length > 4 && <button type="button" onClick={() => setExpandido(v => !v)} className="mt-1 text-[8.5px] font-bold text-info transition hover:underline">{expandido ? 'Ver menos' : `Ver ${items.length - 4} más`}</button>}
                </div>
            ) : (
                <div className="mt-3 rounded-lg border border-dashed border-surface-border px-3 py-3 text-center dark:border-surface-border-dark"><p className="text-[9px] italic text-ink-muted/70 dark:text-ink-muted-dark/70">{vacio}</p></div>
            )}
        </article>
    );
}
