import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, BarChart3, CalendarDays, CheckCircle2, Clock3,
    Download, Utensils, TrendingUp, AlertTriangle, Info,
} from 'lucide-react';
import clsx from 'clsx';
import type { SeguimientoPacienteNutricionista } from '../PerfilNutricional/tipos';
import type { AnaliticaEvolucion } from '@/Components/nutricionista/analitica/AnaliticaEvolucionPanel';
import { useState } from 'react';
import AvatarPaciente from '@/Components/ui/avatar-paciente';

type PacienteResumen = { id_paciente: number; nombres: string; apellido_paterno?: string | null; apellido_materno?: string | null; user?: { avatar_url?: string | null } | null };
type Props = { paciente: PacienteResumen; seguimiento: SeguimientoPacienteNutricionista; analitica: AnaliticaEvolucion; fechaActualBolivia: string; horaActualBolivia: string };

const estados: Record<string, { texto: string; estilo: string }> = {
    completada:   { texto: 'Completada',              estilo: 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green border-brand-green/20' },
    parcial:      { texto: 'Parcial',                  estilo: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' },
    reemplazada:  { texto: 'Reemplazada',              estilo: 'bg-info/10 text-info border-info/20' },
    no_realizada: { texto: 'No realizada',             estilo: 'bg-category-fruits/10 text-category-fruits border-category-fruits/20' },
    sin_registro: { texto: 'Horario vencido',          estilo: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' },
    pendiente:    { texto: 'Pendiente',                estilo: 'bg-black/[.04] text-ink-muted dark:bg-white/[.05] dark:text-ink-muted-dark border-surface-border dark:border-surface-border-dark' },
};

const nivelHistorico = (porcentaje: number) => {
    if (porcentaje >= 85 && porcentaje <= 115) return {
        etiqueta: 'Dentro del rango esperado',
        texto:    'text-brand-green-dark dark:text-brand-green',
        fondo:    'bg-brand-green/[.06] dark:bg-brand-green/[.04]',
        borde:    'border-brand-green/20',
        barra:    'bg-brand-green',
        dot:      'bg-brand-green',
    };
    if (porcentaje >= 70 && porcentaje < 85) return {
        etiqueta: 'Requiere acompañamiento',
        texto:    'text-brand-orange',
        fondo:    'bg-brand-orange/[.06] dark:bg-brand-orange/[.04]',
        borde:    'border-brand-orange/20',
        barra:    'bg-brand-orange',
        dot:      'bg-brand-orange',
    };
    return {
        etiqueta: porcentaje > 115 ? 'Por encima de lo planificado' : 'Necesita mayor seguimiento',
        texto:    'text-info',
        fondo:    'bg-info/[.06] dark:bg-info/[.04]',
        borde:    'border-info/20',
        barra:    'bg-info',
        dot:      'bg-info',
    };
};

const fmtFecha = (v: string | null) => {
    if (!v) return 'Sin fecha';
    const fechaIso = String(v).match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
    if (!fechaIso) return '—';
    const d = new Date(`${fechaIso}T12:00:00-04:00`);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/La_Paz' }).format(d);
};

export default function Index({ paciente, seguimiento, analitica, fechaActualBolivia, horaActualBolivia }: Props) {
    const dias = seguimiento.seguimiento_comidas;
    const hoy = dias.find(d => d.fecha === fechaActualBolivia);
    const [diaSeleccionadoId, setDiaSeleccionadoId] = useState<number | null>((hoy ?? dias.at(-1))?.id_dia_plan_alimentario ?? null);
    const diaSeleccionado = dias.find(d => d.id_dia_plan_alimentario === diaSeleccionadoId) ?? hoy ?? dias.at(-1);
    const comidasHoy = diaSeleccionado?.comidas ?? [];
    const vencidasHoy = comidasHoy.filter(c => c.estado_cumplimiento === 'sin_registro').length;
    const registradasHoy = comidasHoy.filter(c => !['pendiente', 'sin_registro'].includes(c.estado_cumplimiento)).length;
    const completadasHoy = comidasHoy.filter(c => c.estado_cumplimiento === 'completada').length;
    const evaluablesHoy = registradasHoy + vencidasHoy;
    const puntosHoy = comidasHoy.reduce((n, c) => n + (c.estado_cumplimiento === 'completada' ? 1 : c.estado_cumplimiento === 'parcial' || c.estado_cumplimiento === 'reemplazada' ? .5 : 0), 0);
    const adherenciaHoy = evaluablesHoy ? Math.round(puntosHoy / evaluablesHoy * 100) : null;
    const nombre = [paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno].filter(Boolean).join(' ');
    const resumen = seguimiento.resumen_adherencia;
    const planFinalizado = seguimiento.estado_periodo === 'finalizado';

    return (
        <AuthenticatedLayout title="Análisis de adherencia">
            <Head title={`Adherencia - ${nombre}`} />
            <main className="space-y-4">

                {/* ══ ENCABEZADO ══════════════════════════════════════ */}
                <section className="card-elevated overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-brand-green via-brand-green/60 to-transparent" />
                    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <AvatarPaciente nombre={nombre} avatarUrl={paciente.user?.avatar_url} size="md" />
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-[17px] font-bold text-ink dark:text-ink-dark">Adherencia del plan semanal</h1>
                                    {seguimiento.plan && (
                                        <span className={clsx(
                                            'rounded-full px-2.5 py-0.5 text-[9px] font-bold',
                                            planFinalizado
                                                ? 'bg-info/10 text-info'
                                                : 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green',
                                        )}>
                                            {planFinalizado ? 'Semana finalizada' : 'Semana en curso'}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                    {nombre}
                                    {seguimiento.plan && ` · ${fmtFecha(seguimiento.plan.fecha_inicio)} al ${fmtFecha(seguimiento.plan.fecha_fin)}`}
                                    {' · '}Corte Bolivia {horaActualBolivia}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={`/nutricionista/pacientes/${paciente.id_paciente}/perfil-nutricional?step=adherencia`}
                                className="inline-flex items-center gap-2 rounded-xl border border-surface-border px-3.5 py-2 text-[11px] font-bold text-ink transition hover:border-brand-green/30 dark:border-surface-border-dark dark:text-ink-dark"
                            >
                                <ArrowLeft size={13} /> Volver
                            </Link>
                            {seguimiento.plan && (
                                <a
                                    href={route('nutricionista.pacientes.reporte-seguimiento-evolucion-pdf', paciente.id_paciente)}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-3.5 py-2 text-[11px] font-bold text-white shadow-sm shadow-brand-green/20 transition hover:bg-brand-green-dark"
                                >
                                    <Download size={13} /> Reporte PDF
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* ══ MÉTRICAS RÁPIDAS ═══════════════════════════════ */}
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat
                        icon={TrendingUp}
                        titulo={planFinalizado ? 'Resultado semanal' : 'Adherencia de hoy'}
                        valor={planFinalizado ? `${resumen?.porcentaje_adherencia ?? 0}%` : !hoy ? 'Fuera de fecha' : evaluablesHoy === 0 ? 'En espera' : `${adherenciaHoy}%`}
                        detalle={planFinalizado ? 'Porcentaje final de comidas consideradas' : 'Solo usa comidas marcadas o con horario vencido'}
                        color="green"
                    />
                    <Stat icon={CheckCircle2} titulo={planFinalizado ? 'Marcadas en la semana' : 'Marcadas hoy'} valor={planFinalizado ? `${resumen?.registradas ?? 0}/${resumen?.comidas_totales ?? 0}` : `${registradasHoy}/${comidasHoy.length}`} detalle="Respuestas enviadas por la paciente" color="blue" />
                    <Stat icon={Clock3} titulo="Vencidas sin registro" valor={String(planFinalizado ? resumen?.sin_registro_vencidas ?? 0 : vencidasHoy)} detalle="Pasó el horario y una hora de tolerancia" color="orange" />
                    <Stat icon={Utensils} titulo={planFinalizado ? 'Completadas en la semana' : 'Completadas hoy'} valor={String(planFinalizado ? resumen?.completadas ?? 0 : completadasHoy)} detalle="Comidas confirmadas como consumidas completamente" color="green" />
                </section>

                {!seguimiento.plan ? (
                    <Vacio texto="La paciente no tiene un plan activo para analizar." />
                ) : seguimiento.estado_periodo === 'no_iniciado' ? (
                    <Vacio texto={`El plan comienza el ${seguimiento.plan.fecha_inicio}. Todavía no corresponde calcular adherencia.`} />
                ) : (
                    <>
                        {/* ══ SELECTOR DE DÍAS ═══════════════════════════════ */}
                        <section className="card-elevated p-5">
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                                <div>
                                    <h2 className="text-[13px] font-bold text-ink dark:text-ink-dark">Comportamiento de los 7 días</h2>
                                    <p className="mt-0.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Selecciona un día para consultar sus comidas.</p>
                                </div>
                                <span className="flex items-center gap-1 text-[9px] text-ink-muted dark:text-ink-muted-dark">
                                    <span className="h-2 w-2 rounded-full bg-brand-green inline-block" /> ≥85% ·
                                    <span className="h-2 w-2 rounded-full bg-brand-orange inline-block ml-1" /> requiere revisión
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-7">
                                {dias.map(d => {
                                    const ev = d.comidas.filter(c => c.estado_cumplimiento !== 'pendiente');
                                    const pts = ev.reduce((n, c) => n + (c.estado_cumplimiento === 'completada' ? 1 : (c.estado_cumplimiento === 'parcial' || c.estado_cumplimiento === 'reemplazada') ? .5 : 0), 0);
                                    const pct = ev.length ? Math.round(pts / ev.length * 100) : null;
                                    const activo = d.id_dia_plan_alimentario === diaSeleccionado?.id_dia_plan_alimentario;
                                    const esHoy = d.fecha === fechaActualBolivia;
                                    const color = pct !== null && pct >= 85 ? 'green' : 'orange';
                                    return (
                                        <button
                                            type="button"
                                            key={d.id_dia_plan_alimentario}
                                            onClick={() => setDiaSeleccionadoId(d.id_dia_plan_alimentario)}
                                            className={clsx(
                                                'rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5',
                                                activo
                                                    ? 'border-info/40 bg-info/[.06] ring-1 ring-info/20 dark:bg-info/[.04]'
                                                    : 'border-surface-border hover:border-brand-green/30 hover:bg-brand-green/[.03] dark:border-surface-border-dark',
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-1 mb-2">
                                                <p className="text-[10.5px] font-bold capitalize text-ink dark:text-ink-dark">{d.nombre_dia}</p>
                                                {esHoy && <span className="rounded-full bg-brand-green/15 px-1.5 py-0.5 text-[7.5px] font-bold text-brand-green-dark dark:text-brand-green">Hoy</span>}
                                            </div>
                                            <p className="text-[8.5px] text-ink-muted dark:text-ink-muted-dark mb-2">{fmtFecha(d.fecha)}</p>
                                            <p className={clsx(
                                                'text-[22px] font-black leading-none',
                                                pct === null ? 'text-ink-muted/40' : color === 'green' ? 'text-brand-green-dark dark:text-brand-green' : 'text-brand-orange',
                                            )}>
                                                {pct === null ? '—' : `${pct}%`}
                                            </p>
                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.06]">
                                                <div className={clsx('h-full rounded-full transition-all', color === 'green' ? 'bg-brand-green' : 'bg-brand-orange')} style={{ width: `${pct ?? 0}%` }} />
                                            </div>
                                            <p className="mt-1.5 text-[8.5px] text-ink-muted dark:text-ink-muted-dark">{ev.length ? `${ev.length} comida(s)` : 'Sin datos'}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* ══ DETALLE DEL DÍA ════════════════════════════════ */}
                        <section className="card-elevated p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-[13px] font-bold capitalize text-ink dark:text-ink-dark">
                                        Detalle: {diaSeleccionado?.nombre_dia ?? 'sin día seleccionado'}
                                    </h2>
                                    <p className="mt-0.5 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                        {fmtFecha(diaSeleccionado?.fecha ?? null)} · El estado proviene de la respuesta real o del vencimiento del horario.
                                    </p>
                                </div>
                                {adherenciaHoy !== null && (
                                    <span className="rounded-xl bg-info/10 px-3 py-1.5 text-[11px] font-bold text-info">{adherenciaHoy}% del día</span>
                                )}
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {comidasHoy.length ? comidasHoy.map(c => {
                                    const e = estados[c.estado_cumplimiento] ?? estados.pendiente;
                                    return (
                                        <article key={c.id_comida_plan_alimentario} className="rounded-2xl border border-surface-border overflow-hidden dark:border-surface-border-dark">
                                            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-surface-border/50 dark:border-surface-border-dark/50">
                                                <div>
                                                    <p className="text-[12px] font-bold capitalize text-ink dark:text-ink-dark">{c.tipo_comida}</p>
                                                    <p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">{c.hora_sugerida || 'Sin horario'} · {c.nombre_comida}</p>
                                                </div>
                                                <span className={clsx('shrink-0 rounded-lg border px-2 py-1 text-[8.5px] font-bold', e.estilo)}>{e.texto}</span>
                                            </div>
                                            {c.componentes.length > 0 && (
                                                <p className="px-4 py-2 text-[10.5px] text-ink/75 dark:text-ink-dark/75 bg-black/[.01] dark:bg-white/[.01]">{c.componentes.join(' · ')}</p>
                                            )}
                                            <div className="grid grid-cols-3 gap-0 divide-x divide-surface-border/50 dark:divide-surface-border-dark/50 text-center">
                                                <Mini label="Consumido" valor={c.porcentaje_consumido === null ? '—' : `${c.porcentaje_consumido}%`} />
                                                <Mini label="Agrado" valor={c.nivel_agrado?.replaceAll('_', ' ') ?? '—'} />
                                                <Mini label="Saciedad" valor={c.nivel_saciedad ?? '—'} />
                                            </div>
                                        </article>
                                    );
                                }) : (
                                    <p className="col-span-2 py-8 text-center text-[11.5px] text-ink-muted dark:text-ink-muted-dark italic">El día seleccionado no contiene comidas configuradas.</p>
                                )}
                            </div>
                        </section>

                        {/* ══ ADHERENCIA HISTÓRICA ═══════════════════════════ */}
                        <section className="card-elevated overflow-hidden">
                            {/* Header con gradiente */}
                            <div className="relative overflow-hidden border-b border-surface-border dark:border-surface-border-dark px-5 py-5 bg-gradient-to-r from-brand-green/[.04] to-transparent">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[.16em] text-brand-green-dark dark:text-brand-green">Seguimiento entre semanas</p>
                                        <h2 className="mt-1.5 text-[16px] font-bold text-ink dark:text-ink-dark">Adherencia histórica</h2>
                                        <p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark max-w-md">
                                            Muestra cuánto se cumplió de cada plan y en qué tiempo de comida conviene acompañar más a la paciente.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 shadow-sm dark:border-surface-border-dark dark:bg-surface-card-dark">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/15 text-info">
                                            <BarChart3 size={16} strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <p className="text-[8.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Promedio histórico</p>
                                            <p className="text-[20px] font-black text-ink dark:text-ink-dark leading-none mt-0.5">
                                                {analitica.evolucion_adherencia.resumen.promedio_adherencia}
                                                <span className="text-[12px] font-semibold text-ink-muted dark:text-ink-muted-dark ml-0.5">%</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* ── Evolución por plan ── */}
                                <div>
                                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                                        <div>
                                            <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Evolución por plan</h3>
                                            <p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">Cada fila representa una semana planificada y sus comidas consideradas.</p>
                                        </div>
                                        <span className="rounded-full border border-info/20 bg-info/10 px-3 py-1 text-[9px] font-bold text-info">
                                            {analitica.evolucion_adherencia.por_plan.length} plan(es)
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {analitica.evolucion_adherencia.por_plan.length ? analitica.evolucion_adherencia.por_plan.map(p => {
                                            const nivel = nivelHistorico(p.porcentaje_adherencia);
                                            return (
                                                <article key={p.id_plan_alimentario} className={clsx('rounded-2xl border p-4', nivel.borde, nivel.fondo)}>
                                                    <div className="grid gap-4 md:grid-cols-[1fr_2fr_180px] md:items-center">
                                                        {/* Nombre + estado */}
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[.04] dark:bg-white/[.06]', nivel.texto)}>
                                                                <CalendarDays size={18} strokeWidth={1.8} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[12px] font-bold text-ink dark:text-ink-dark">{p.nombre_plan}</p>
                                                                <span className={clsx('inline-block mt-1 rounded-full px-2 py-0.5 text-[8px] font-semibold capitalize bg-black/[.04] dark:bg-white/[.05]', nivel.texto)}>
                                                                    {p.estado_plan.replaceAll('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Porcentaje + barra */}
                                                        <div>
                                                            <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
                                                                <div>
                                                                    <p className="text-[8px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Cumplimiento ponderado</p>
                                                                    <p className={clsx('mt-0.5 text-[28px] font-black leading-none', nivel.texto)}>{p.porcentaje_adherencia}%</p>
                                                                </div>
                                                                <span className={clsx('rounded-full border px-2.5 py-1 text-[8.5px] font-bold', nivel.borde, nivel.texto)}>
                                                                    {nivel.etiqueta}
                                                                </span>
                                                            </div>
                                                            <div className="h-2.5 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/[.08]">
                                                                <div className={clsx('h-full rounded-full transition-all', nivel.barra)} style={{ width: `${Math.min(p.porcentaje_adherencia, 100)}%` }} />
                                                            </div>
                                                        </div>

                                                        {/* Completadas + desglose */}
                                                        <div className="rounded-xl border border-black/[.06] bg-black/[.025] p-3.5 dark:border-white/[.06] dark:bg-white/[.035]">
                                                            <div className="flex items-end justify-between gap-2 mb-2">
                                                                <div>
                                                                    <p className="text-[8px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Completadas</p>
                                                                    <p className="text-[18px] font-bold text-ink dark:text-ink-dark mt-0.5">
                                                                        {p.completadas}
                                                                        <span className="text-[11px] font-normal text-ink-muted"> / {p.comidas_totales}</span>
                                                                    </p>
                                                                </div>
                                                                <CheckCircle2 size={16} className="text-brand-green shrink-0" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 text-[8px] text-ink-muted dark:text-ink-muted-dark">
                                                                {p.parciales > 0 && <span className="rounded bg-brand-orange/10 px-1.5 py-0.5 text-brand-orange font-semibold">{p.parciales} parciales</span>}
                                                                {p.reemplazadas > 0 && <span className="rounded bg-info/10 px-1.5 py-0.5 text-info font-semibold">{p.reemplazadas} reemplazadas</span>}
                                                                {p.no_realizadas > 0 && <span className="rounded bg-black/[.05] dark:bg-white/[.07] px-1.5 py-0.5">{p.no_realizadas} no realizadas</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        }) : <Vacio texto="Todavía no existen planes finalizados para comparar." />}
                                    </div>
                                </div>

                                {/* ── Cumplimiento por tipo de comida ── */}
                                <div className="border-t border-surface-border pt-5 dark:border-surface-border-dark">
                                    <div className="mb-4">
                                        <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Cumplimiento por tiempo de comida</h3>
                                        <p className="mt-0.5 text-[10px] text-ink-muted dark:text-ink-muted-dark">Ayuda a identificar si desayuno, almuerzo, merienda o cena requieren un ajuste específico.</p>
                                    </div>

                                    {/* Leyenda informativa compacta */}
                                    <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
                                        <div className="flex items-start gap-2.5 rounded-xl border border-surface-border bg-black/[.015] p-3 dark:border-surface-border-dark dark:bg-white/[.02]">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-dark dark:text-brand-green">
                                                <CheckCircle2 size={13} strokeWidth={2} />
                                            </div>
                                            <div>
                                                <p className="text-[10.5px] font-bold text-ink dark:text-ink-dark">Comidas completas</p>
                                                <p className="mt-0.5 text-[9.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Solo se cuentan las confirmadas al 100%.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5 rounded-xl border border-surface-border bg-black/[.015] p-3 dark:border-surface-border-dark dark:bg-white/[.02]">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                                                <Info size={13} strokeWidth={2} />
                                            </div>
                                            <div>
                                                <p className="text-[10.5px] font-bold text-ink dark:text-ink-dark">Cómo se obtiene el porcentaje</p>
                                                <p className="mt-0.5 text-[9.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Completa = 100%, parcial/reemplazada = 50%, no realizada = 0%.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tarjetas por tipo de comida */}
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {analitica.cumplimiento_por_tipo_comida.map(t => {
                                            const nivel = nivelHistorico(t.porcentaje_adherencia);
                                            const problemaReal = t.principal_problema && !/^sin problemas relevantes$/i.test(t.principal_problema);
                                            return (
                                                <article key={t.tipo_comida} className={clsx('rounded-2xl border overflow-hidden transition hover:-translate-y-0.5 hover:shadow-sm', nivel.borde)}>
                                                    {/* Header de la tarjeta */}
                                                    <div className={clsx('flex items-center justify-between gap-2 px-4 py-3 border-b', nivel.fondo, nivel.borde)}>
                                                        <div className="flex items-center gap-2">
                                                            <Utensils size={13} strokeWidth={1.8} className={nivel.texto} />
                                                            <p className="text-[11.5px] font-bold capitalize text-ink dark:text-ink-dark">{t.tipo_comida}</p>
                                                        </div>
                                                        <span className={clsx('rounded-full px-2 py-0.5 text-[8px] font-bold bg-black/[.04] dark:bg-white/[.04]', nivel.texto)}>
                                                            {nivel.etiqueta}
                                                        </span>
                                                    </div>

                                                    <div className="p-4 space-y-3 bg-surface-card dark:bg-surface-card-dark">
                                                        {/* Porcentaje + completadas */}
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <p className="text-[8px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Cumplimiento</p>
                                                                <p className={clsx('text-[26px] font-black leading-none mt-0.5', nivel.texto)}>{t.porcentaje_adherencia}%</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">Cumplidas</p>
                                                                <p className="text-[15px] font-bold text-ink dark:text-ink-dark mt-0.5">{t.completadas}<span className="text-[10px] font-normal text-ink-muted">/{t.total}</span></p>
                                                            </div>
                                                        </div>

                                                        {/* Barra */}
                                                        <div>
                                                            <div className="flex justify-between text-[8px] text-ink-muted dark:text-ink-muted-dark mb-1">
                                                                <span>Nivel alcanzado</span><span>Meta: 100%</span>
                                                            </div>
                                                            <div className="h-2 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/[.07]">
                                                                <div className={clsx('h-full rounded-full', nivel.barra)} style={{ width: `${Math.min(t.porcentaje_adherencia, 100)}%` }} />
                                                            </div>
                                                        </div>

                                                        {/* Chips de desglose */}
                                                        {(t.parciales > 0 || t.reemplazadas > 0 || t.no_realizadas > 0 || t.pendientes > 0) && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {t.parciales > 0 && <span className="rounded-lg bg-brand-orange/10 px-2 py-0.5 text-[8px] font-semibold text-brand-orange">{t.parciales} parcial(es)</span>}
                                                                {t.reemplazadas > 0 && <span className="rounded-lg bg-info/10 px-2 py-0.5 text-[8px] font-semibold text-info">{t.reemplazadas} reemplazada(s)</span>}
                                                                {t.no_realizadas > 0 && <span className="rounded-lg bg-category-fruits/10 px-2 py-0.5 text-[8px] font-semibold text-category-fruits">{t.no_realizadas} no realizada(s)</span>}
                                                                {t.pendientes > 0 && <span className="rounded-lg bg-black/[.05] dark:bg-white/[.06] px-2 py-0.5 text-[8px] text-ink-muted dark:text-ink-muted-dark">{t.pendientes} pendiente(s)</span>}
                                                            </div>
                                                        )}

                                                        {/* Nota contextual */}
                                                        <p className="text-[9.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark border-t border-surface-border/50 dark:border-surface-border-dark/50 pt-2">
                                                            {problemaReal ? t.principal_problema
                                                                : t.no_realizadas > 0 ? 'Existen comidas confirmadas como no realizadas.'
                                                                    : t.parciales > 0 || t.reemplazadas > 0 ? 'Existen comidas con cumplimiento parcial.'
                                                                        : t.porcentaje_adherencia < 85 ? 'Cumplimiento por debajo del rango esperado.'
                                                                            : 'Sin dificultades relevantes registradas.'}
                                                        </p>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>

                                    {/* Leyenda de colores */}
                                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-surface-border px-4 py-3 text-[9px] text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-green inline-block" /> 85–115%: rango esperado</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-orange inline-block" /> 70–84%: requiere acompañamiento</span>
                                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info inline-block" /> Fuera de esos rangos: revisar el contexto</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </AuthenticatedLayout>
    );
}

/* ── Stat card ───────────────────────────────────────────── */
function Stat({ icon: Icon, titulo, valor, detalle, color }: { icon: typeof CalendarDays; titulo: string; valor: string; detalle: string; color: 'green' | 'blue' | 'orange' }) {
    const c = {
        green:  'bg-brand-green/10 text-brand-green-dark dark:text-brand-green',
        blue:   'bg-info/10 text-info',
        orange: 'bg-brand-orange/10 text-brand-orange',
    }[color];
    return (
        <article className="card-elevated p-4">
            <div className={clsx('flex h-9 w-9 items-center justify-center rounded-xl', c)}>
                <Icon size={17} strokeWidth={1.8} />
            </div>
            <p className="mt-3 text-[9.5px] font-bold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">{titulo}</p>
            <p className="mt-1 text-[22px] font-bold text-ink dark:text-ink-dark leading-none">{valor}</p>
            <p className="mt-1.5 text-[9.5px] text-ink-muted dark:text-ink-muted-dark leading-snug">{detalle}</p>
        </article>
    );
}

/* ── Mini cell ───────────────────────────────────────────── */
function Mini({ label, valor }: { label: string; valor: string }) {
    return (
        <div className="py-2.5 px-3">
            <p className="text-[8px] font-bold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">{label}</p>
            <p className="mt-1 text-[10.5px] font-semibold capitalize text-ink dark:text-ink-dark">{valor}</p>
        </div>
    );
}

/* ── Vacío ───────────────────────────────────────────────── */
function Vacio({ texto }: { texto: string }) {
    return (
        <section className="card-elevated flex flex-col items-center gap-2 p-10 text-center">
            <CalendarDays size={28} strokeWidth={1.2} className="text-ink-muted/25 dark:text-ink-muted-dark/25" />
            <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">{texto}</p>
        </section>
    );
}
