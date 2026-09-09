import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle, CalendarDays, CheckCircle2,
    ClipboardCheck, Search, TrendingUp, Utensils,
    Users, ArrowUpRight, Clock3, Filter, Download,
    Eye, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import AvatarPaciente from '@/Components/ui/avatar-paciente';

interface Estadisticas {
    total: number; registradas: number; completadas: number;
    parciales: number; reemplazadas: number; no_realizadas: number;
    pendientes: number; porcentaje: number;
}
interface PacienteProgreso {
    paciente: { id_paciente: number; nombre: string; ci: string | null; avatar_url: string | null };
    plan: { id_plan_alimentario: number; nombre: string; estado: string; fecha_inicio: string | null; fecha_fin: string | null };
    estado_seguimiento: string;
    adherencia_semanal: number;
    semana: Estadisticas;
    hoy: Estadisticas & { tiene_dia_planificado: boolean; nombre_dia: string | null; fecha: string | null };
    dias_transcurridos: number;
    dias_cumplidos: number;
    total_dias: number;
    ultima_actualizacion: string | null;
    vigencia: { estado: 'vigente' | 'vence_pronto' | 'vence_hoy' | 'vencido' | 'sin_fecha'; dias_restantes: number | null; fecha_fin: string | null };
}
interface Props {
    resumen: { pacientes_con_plan: number; al_dia: number; en_progreso: number; requieren_atencion: number; adherencia_promedio: number; planes_por_vencer: number; planes_vencidos: number };
    pacientes: PacienteProgreso[];
}

const n = (v: number) => v.toLocaleString('es-BO', { maximumFractionDigits: 1 });

const ESTADOS: Record<string, { label: string; dot: string; badge: string }> = {
    al_dia:           { label: 'Al día',          dot: 'bg-brand-green',  badge: 'border-brand-green/25 bg-brand-green/[.08] text-brand-green-dark dark:text-brand-green' },
    en_progreso:      { label: 'En progreso',      dot: 'bg-info',         badge: 'border-info/25 bg-info/[.08] text-info' },
    requiere_atencion:{ label: 'Requiere atención',dot: 'bg-brand-orange', badge: 'border-brand-orange/25 bg-brand-orange/[.08] text-brand-orange' },
    sin_registros:    { label: 'Sin registros',    dot: 'bg-ink-muted/40', badge: 'border-surface-border bg-black/[.04] text-ink-muted dark:border-surface-border-dark dark:bg-white/[.05] dark:text-ink-muted-dark' },
};

export default function Index({ resumen, pacientes }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState('');
    const [pagina, setPagina] = useState(1);
    const porPagina = 6;

    const visibles = pacientes.filter(p =>
        (!filtro || p.estado_seguimiento === filtro) &&
        (`${p.paciente.nombre} ${p.paciente.ci ?? ''}`).toLowerCase().includes(busqueda.toLowerCase()),
    );
    const ultimaPagina = Math.max(1, Math.ceil(visibles.length / porPagina));
    const paginaActual = Math.min(pagina, ultimaPagina);
    const pacientesPagina = visibles.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);
    const actualizarBusqueda = (valor: string) => { setBusqueda(valor); setPagina(1); };
    const actualizarFiltro = (valor: string) => { setFiltro(valor); setPagina(1); };

    return (
        <AuthenticatedLayout title="Progreso de pacientes">
            <Head title="Progreso de pacientes" />
            <main className="space-y-5">

                {/* ══ ENCABEZADO ══════════════════════════════════════ */}
                <section className="card-elevated overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-brand-green via-brand-green/50 to-transparent" />
                    <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[9.5px] font-bold uppercase tracking-[.16em] text-brand-green-dark dark:text-brand-green">Seguimiento nutricional</p>
                            <h1 className="mt-1.5 text-[20px] font-bold text-ink dark:text-ink-dark">Cumplimiento diario y semanal</h1>
                            <p className="mt-1 max-w-3xl text-[11.5px] text-ink-muted dark:text-ink-muted-dark">Consulta el avance real de cada paciente, abre su análisis completo y descarga un reporte profesional con sus resultados.</p>
                        </div>
                        <a href={route('nutricionista.reportes.adherencia.pdf', { tipo: 'adherencia' })} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-[10.5px] font-bold text-white shadow-sm shadow-brand-green/20 transition hover:bg-brand-green-dark">
                            <Download size={14}/> Reporte grupal PDF
                        </a>
                    </div>
                </section>

                {/* ══ MÉTRICAS ════════════════════════════════════════ */}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <Metrica icon={Users}         label="Con plan vigente"   valor={resumen.pacientes_con_plan} color="blue" />
                    <Metrica icon={CheckCircle2}  label="Al día"             valor={resumen.al_dia}             color="green" />
                    <Metrica icon={TrendingUp}    label="En progreso"        valor={resumen.en_progreso}        color="blue" />
                    <Metrica icon={AlertTriangle} label="Por revisar"        valor={resumen.requieren_atencion} color="orange" />
                    <Metrica icon={ClipboardCheck} label="Adherencia promedio" valor={`${n(resumen.adherencia_promedio)}%`} color="green" />
                </section>

                {/* ══ TABLA / LISTA ═══════════════════════════════════ */}
                <section className="card-elevated overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b border-surface-border px-5 py-4 dark:border-surface-border-dark sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Pacientes y cumplimiento</h2>
                            <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{visibles.length} paciente(s) mostrado(s)</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Búsqueda */}
                            <label className="relative">
                                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/50 dark:text-ink-muted-dark/50" />
                                <input
                                    value={busqueda}
                                    onChange={e => actualizarBusqueda(e.target.value)}
                                    placeholder="Buscar paciente..."
                                    className="h-9 rounded-xl border border-surface-border bg-black/[.015] py-2 pl-8 pr-3 text-[11px] text-ink outline-none transition focus:border-brand-green/40 focus:ring-1 focus:ring-brand-green/10 dark:border-surface-border-dark dark:bg-white/[.02] dark:text-ink-dark"
                                />
                            </label>
                            {/* Filtro estado */}
                            <div className="relative flex items-center">
                                <Filter size={11} className="absolute left-3 text-ink-muted/50 dark:text-ink-muted-dark/50 pointer-events-none" />
                                <select
                                    value={filtro}
                                    onChange={e => actualizarFiltro(e.target.value)}
                                    className="h-9 rounded-xl border border-surface-border bg-black/[.015] pl-8 pr-3 text-[11px] text-ink outline-none transition focus:border-brand-green/40 dark:border-surface-border-dark dark:bg-white/[.02] dark:text-ink-dark appearance-none"
                                >
                                    <option value="">Todos los estados</option>
                                    {Object.entries(ESTADOS).map(([v, e]) => (
                                        <option key={v} value={v}>{e.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="p-5">
                        {visibles.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-border py-12 text-center dark:border-surface-border-dark">
                                <Users size={28} strokeWidth={1.2} className="text-ink-muted/25" />
                                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">No hay pacientes que coincidan con el filtro.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 xl:grid-cols-2">
                                {pacientesPagina.map(p => <PacienteCard key={p.paciente.id_paciente} dato={p} />)}
                            </div>
                        )}
                        {ultimaPagina > 1 && <div className="mt-4 flex flex-col gap-2 border-t border-surface-border pt-4 dark:border-surface-border-dark sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[9.5px] text-ink-muted">Mostrando {(paginaActual - 1) * porPagina + 1}–{Math.min(paginaActual * porPagina, visibles.length)} de {visibles.length} pacientes</p>
                            <div className="flex items-center gap-2"><button type="button" disabled={paginaActual === 1} onClick={() => setPagina(p => Math.max(1, p - 1))} className="inline-flex h-8 items-center gap-1 rounded-lg border border-surface-border px-3 text-[9px] font-bold disabled:opacity-35 dark:border-surface-border-dark"><ChevronLeft size={12}/>Anterior</button><span className="text-[9.5px] font-semibold text-ink dark:text-ink-dark">Página {paginaActual} de {ultimaPagina}</span><button type="button" disabled={paginaActual === ultimaPagina} onClick={() => setPagina(p => Math.min(ultimaPagina, p + 1))} className="inline-flex h-8 items-center gap-1 rounded-lg border border-surface-border px-3 text-[9px] font-bold disabled:opacity-35 dark:border-surface-border-dark">Siguiente<ChevronRight size={12}/></button></div>
                        </div>}
                    </div>
                </section>
            </main>
        </AuthenticatedLayout>
    );
}

/* ── Métrica card ────────────────────────────────────────── */
function Metrica({ icon: Icon, label, valor, color }: { icon: typeof Users; label: string; valor: number | string; color: 'green' | 'blue' | 'orange' }) {
    const c = {
        green:  'bg-brand-green/12 text-brand-green-dark dark:text-brand-green',
        blue:   'bg-info/10 text-info',
        orange: 'bg-brand-orange/12 text-brand-orange',
    }[color];
    return (
        <div className="card-elevated p-4">
            <div className={clsx('mb-3 flex h-9 w-9 items-center justify-center rounded-xl', c)}>
                <Icon size={16} strokeWidth={1.8} />
            </div>
            <p className="text-[20px] font-black text-ink dark:text-ink-dark leading-none">{valor}</p>
            <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">{label}</p>
        </div>
    );
}

/* ── Paciente card ───────────────────────────────────────── */
function PacienteCard({ dato: p }: { dato: PacienteProgreso }) {
    const e = ESTADOS[p.estado_seguimiento] ?? ESTADOS.sin_registros;
    const adherenciaPct = Math.min(Math.max(p.adherencia_semanal, 0), 100);
    const adherenciaHoyPct = Math.min(Math.max(p.hoy.porcentaje, 0), 100);
    const colorAdherencia = (v: number) => v >= 85 ? 'bg-brand-green' : v >= 50 ? 'bg-brand-orange' : 'bg-category-fruits';
    const textAdherencia = (v: number) => v >= 85 ? 'text-brand-green-dark dark:text-brand-green' : v >= 50 ? 'text-brand-orange' : 'text-category-fruits';

    return (
        <article className="rounded-2xl border border-surface-border overflow-hidden transition hover:border-brand-green/25 hover:shadow-sm dark:border-surface-border-dark">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-surface-border/50 dark:border-surface-border-dark/50">
                <div className="flex min-w-0 items-center gap-3">
                    <AvatarPaciente nombre={p.paciente.nombre} avatarUrl={p.paciente.avatar_url} size="md" />
                    <div className="min-w-0">
                        <h3 className="truncate text-[13px] font-bold text-ink dark:text-ink-dark">{p.paciente.nombre}</h3>
                        <p className="mt-0.5 text-[9.5px] text-ink-muted dark:text-ink-muted-dark">CI {p.paciente.ci || 'sin registro'} · {p.plan.fecha_inicio || '—'} al {p.plan.fecha_fin || '—'}</p>
                    </div>
                </div>
                <span className={clsx('shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold', e.badge)}>
                    <span className={clsx('h-1.5 w-1.5 rounded-full', e.dot)} />
                    {e.label}
                </span>
            </div>

            {/* Barras de adherencia */}
            <div className="grid grid-cols-2 gap-3 px-4 py-3">
                <BarraProgreso
                    titulo={p.hoy.tiene_dia_planificado ? `Hoy · ${p.hoy.nombre_dia ?? ''}` : 'Hoy'}
                    pct={adherenciaHoyPct}
                    detalle={p.hoy.tiene_dia_planificado ? `${p.hoy.completadas}/${p.hoy.total} completadas` : 'Sin día planificado'}
                    colorBarra={colorAdherencia(adherenciaHoyPct)}
                    colorTexto={textAdherencia(adherenciaHoyPct)}
                />
                <BarraProgreso
                    titulo="Semana completa"
                    pct={adherenciaPct}
                    detalle={`${p.semana.completadas}/${p.semana.total} completadas`}
                    colorBarra={colorAdherencia(adherenciaPct)}
                    colorTexto={textAdherencia(adherenciaPct)}
                />
            </div>

            {/* Stats mini */}
            <div className="grid grid-cols-3 divide-x divide-surface-border/50 dark:divide-surface-border-dark/50 border-t border-surface-border/50 dark:border-surface-border-dark/50">
                <MiniStat valor={`${p.dias_cumplidos}/${p.dias_transcurridos}`} label="Días cumplidos" />
                <MiniStat valor={p.semana.parciales + p.semana.reemplazadas} label="Parciales" />
                <MiniStat valor={p.semana.no_realizadas} label="No realizadas" alerta={p.semana.no_realizadas > 0} />
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-black/[.015] px-4 py-2.5 dark:bg-white/[.01]">
                <p className="flex items-center gap-1 text-[9px] text-ink-muted dark:text-ink-muted-dark">
                    <Clock3 size={10} strokeWidth={1.8} />
                    {p.ultima_actualizacion
                        ? `Último registro: ${new Date(p.ultima_actualizacion).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}`
                        : 'La paciente todavía no registró comidas.'}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                    <a href={route('nutricionista.pacientes.reporte-seguimiento-evolucion-pdf', p.paciente.id_paciente)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-surface-border px-2.5 text-[9px] font-bold text-ink hover:border-brand-green/30 dark:border-surface-border-dark dark:text-ink-dark" title="Descargar reporte PDF"><Download size={11}/> PDF</a>
                    <Link href={route('nutricionista.pacientes.adherencia', p.paciente.id_paciente)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-green px-3 text-[9px] font-bold text-white hover:bg-brand-green-dark"><Eye size={11}/> Ver progreso <ArrowUpRight size={10}/></Link>
                </div>
            </div>
        </article>
    );
}

/* ── Barra de progreso ───────────────────────────────────── */
function BarraProgreso({ titulo, pct, detalle, colorBarra, colorTexto }: { titulo: string; pct: number; detalle: string; colorBarra: string; colorTexto: string }) {
    return (
        <div>
            <div className="flex items-center justify-between gap-1 mb-1.5">
                <p className="text-[9.5px] font-bold text-ink dark:text-ink-dark truncate">{titulo}</p>
                <span className={clsx('text-[11px] font-black shrink-0', colorTexto)}>{n(pct)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.07]">
                <div className={clsx('h-full rounded-full transition-all', colorBarra)} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-[8.5px] text-ink-muted dark:text-ink-muted-dark">{detalle}</p>
        </div>
    );
}

/* ── Mini stat ───────────────────────────────────────────── */
function MiniStat({ valor, label, alerta = false }: { valor: number | string; label: string; alerta?: boolean }) {
    return (
        <div className="py-2.5 px-3 text-center">
            <p className={clsx('text-[13px] font-bold leading-none', alerta && Number(valor) > 0 ? 'text-brand-orange' : 'text-ink dark:text-ink-dark')}>{valor}</p>
            <p className="mt-1 text-[8px] font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">{label}</p>
        </div>
    );
}
