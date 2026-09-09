import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, ChefHat, Clock3, Coffee, Download, HeartPulse, Moon, Salad, ShoppingCart, Sun, Sunrise, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import ModalSeguimientoComida, { type SeguimientoComida } from '@/Components/paciente/ModalSeguimientoComida';
import SeguimientoSintomasCard, { type SeguimientoSintomas } from '@/Components/paciente/SeguimientoSintomasCard';
import { Badge } from '@/Components/ui/badge';

type Nutrientes = { calorias: number; proteinas: number; carbohidratos: number; grasas: number; fibra: number };
interface Componente { tipo_componente: 'receta' | 'alimento' | 'manual'; nombre: string | null; cantidad: number; unidad: string | null; nutrientes: Nutrientes; receta: { imagen_url: string | null; descripcion: string | null; preparacion: string | null } | null }
interface Comida { id_comida_plan_alimentario: number; tipo_comida: string; hora_sugerida: string | null; nombre_comida: string; nutrientes: Nutrientes; componentes: Componente[]; seguimiento: SeguimientoComida }
interface Dia { numero_dia: number; nombre_dia: string; fecha: string | null; nutrientes: Nutrientes; comidas: Comida[] }
interface Plan { nombre_plan: string; estado_plan: string; fecha_inicio: string | null; fecha_fin: string | null; fecha_actual_bolivia: string; estado_periodo: 'vigente' | 'programado' | 'vencido'; numero_dia_actual: number | null; objetivos: Nutrientes; planificados: Nutrientes; dias: Dia[]; recomendacionOrigen: { enfoque_nutricional_experto: string | null; prioridad_nutricional: string | null; recomendaciones: string[]; restricciones: string[]; alertas: string[]; conclusion: string | null } | null }
interface ResumenAdherencia { comidas_totales: number; completadas: number; parciales: number; no_realizadas: number; reemplazadas: number; pendientes: number; registradas: number; porcentaje_adherencia: number }
interface Props { paciente: { nombre: string } | null; planAlimentario: Plan | null; resumenAdherencia: ResumenAdherencia | null; seguimientoSintomas: SeguimientoSintomas | null }

const n = (v: number) => Number(v ?? 0).toLocaleString('es-BO', { maximumFractionDigits: 1 });
const etiqueta = (v: string | null) => v?.replaceAll('_', ' ') ?? 'No definido';

const TIPO_ESTILOS: Record<string, { bg: string; accent: string; iconBg: string }> = {
    desayuno: { bg: 'bg-amber-500/[0.06] dark:bg-amber-400/[0.08]', accent: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    almuerzo: { bg: 'bg-brand-green/[0.06] dark:bg-brand-green/[0.08]', accent: 'text-brand-green-dark dark:text-brand-green', iconBg: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green' },
    merienda: { bg: 'bg-purple-500/[0.06] dark:bg-purple-400/[0.08]', accent: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' },
    cena: { bg: 'bg-blue-500/[0.06] dark:bg-blue-400/[0.08]', accent: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
};
const TIPO_ICONO: Record<string, typeof Sun> = { desayuno: Sunrise, almuerzo: Sun, merienda: Coffee, cena: Moon };
const ESTADO_BOTON: Record<string, { texto: string; clase: string }> = {
    pendiente: { texto: 'Registrar comida', clase: 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green hover:bg-brand-green/25 border-brand-green/30' },
    completada: { texto: '✓ Completada', clase: 'bg-brand-green/10 text-brand-green-dark/70 dark:text-brand-green/70 border-brand-green/20' },
    parcial: { texto: 'Actualizar registro', clase: 'bg-brand-orange/10 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/20' },
    no_realizada: { texto: 'Registrar motivo', clase: 'bg-category-fruits/10 text-category-fruits border-category-fruits/30 hover:bg-category-fruits/15' },
    reemplazada: { texto: 'Ver reemplazo', clase: 'bg-info/10 text-info border-info/30 hover:bg-info/15' },
};

export default function MiPlan({ paciente, planAlimentario: plan, resumenAdherencia, seguimientoSintomas }: Props) {
    const indiceHoy = plan?.estado_periodo === 'vigente' ? plan.dias.findIndex(d => d.numero_dia === plan.numero_dia_actual) : -1;
    const [seleccion, setSeleccion] = useState(indiceHoy >= 0 ? indiceHoy : 0);
    const [modalSintomas, setModalSintomas] = useState(false);
    const diaActual = useMemo(() => indiceHoy >= 0 ? plan?.dias[indiceHoy] ?? null : null, [plan, indiceHoy]);
    const diaCompletado = Boolean(diaActual && diaActual.comidas.length > 0 && diaActual.comidas.every(c => c.seguimiento.estado_cumplimiento !== 'pendiente'));

    useEffect(() => {
        if (!plan || !diaCompletado || seguimientoSintomas?.registro_hoy || !diaActual?.fecha) return;
        const clave = `nutrigo-sintomas-sugeridos-${plan.fecha_actual_bolivia}-${plan.nombre_plan}`;
        if (window.sessionStorage.getItem(clave)) return;
        window.sessionStorage.setItem(clave, '1');
        setModalSintomas(true);
    }, [plan, diaActual?.fecha, diaCompletado, seguimientoSintomas?.registro_hoy]);

    useEffect(() => { if (indiceHoy >= 0) setSeleccion(indiceHoy); }, [indiceHoy]);

    return (
        <AuthenticatedLayout header={<h2>Mi Plan Alimentario</h2>}>
            <Head title="Mi Plan" />
            <main className="w-full space-y-6 px-4 sm:px-6 xl:px-8 2xl:px-10">
                {/* Header con estado + PDF */}
                {plan && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border px-5 py-4 dark:border-surface-border-dark">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                                <Salad size={20} strokeWidth={1.8} />
                            </div>
                            <div>
                                <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">{plan.nombre_plan}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge color="green"><CheckCircle2 size={10} /> {etiqueta(plan.estado_plan)}</Badge>
                                    <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{plan.fecha_inicio ?? '—'} al {plan.fecha_fin ?? '—'}</span>
                                </div>
                            </div>
                        </div>
                        <a className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green/15 px-4 py-2.5 text-[11.5px] font-semibold text-brand-green-dark hover:bg-brand-green/25 dark:text-brand-green transition-colors"
                            href={route('paciente.plan-alimentario.pdf')} target="_blank" rel="noreferrer">
                            <Download size={14} strokeWidth={1.8} /> Descargar PDF
                        </a>
                    </div>
                )}

                <Link href={route('paciente.compras')} aria-label="Abrir lista de compras" title="Lista de compras"
                    className="group fixed bottom-6 right-5 z-30 inline-flex h-12 items-center overflow-hidden rounded-full border border-brand-green/30 bg-brand-green text-white shadow-lg shadow-brand-green/25 transition-all hover:w-44 hover:bg-brand-green-dark focus:w-44 lg:right-8">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center"><ShoppingCart size={19} /></span>
                    <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-[11px] font-bold opacity-0 transition-all duration-200 group-hover:max-w-28 group-hover:pr-4 group-hover:opacity-100 group-focus:max-w-28 group-focus:pr-4 group-focus:opacity-100">Lista de compras</span>
                </Link>

                {!plan && (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-12 text-center dark:border-surface-border-dark">
                        <Salad size={38} strokeWidth={1.2} className="text-brand-green/40" />
                        <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Aún no tienes un plan alimentario</h2>
                        <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark max-w-sm">Tu nutricionista lo publicará cuando esté listo.</p>
                    </div>
                )}

                {plan && (
                    <>
                        {/* Balance semanal con colores */}
                        <BalanceSemanal plan={plan} />

                        {/* Selector de días tipo calendar strip */}
                        <div className="rounded-2xl border border-surface-border dark:border-surface-border-dark overflow-hidden">
                            <div className="px-5 py-3 bg-black/[0.015] dark:bg-white/[0.02] border-b border-surface-border dark:border-surface-border-dark">
                                <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark flex items-center gap-2">
                                    <CalendarDays size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                                    Tu semana
                                </h3>
                            </div>

                            {/* Calendar strip */}
                            <div className="overflow-x-auto p-4">
                                <div className="grid min-w-[620px] grid-cols-7 gap-2">
                                {plan.dias.map((d, i) => {
                                    const completadas = d.comidas.filter(c => c.seguimiento.estado_cumplimiento === 'completada').length;
                                    const total = d.comidas.length;
                                    const pct = total ? Math.round((completadas / total) * 100) : 0;
                                    const activo = i === seleccion;
                                    return (
                                        <button key={d.numero_dia} type="button" onClick={() => setSeleccion(i)}
                                            className={clsx(
                                                'flex w-full flex-col items-center gap-1 rounded-xl px-3 py-3 transition-all border',
                                                activo
                                                    ? 'bg-brand-green/[0.08] border-brand-green/30 shadow-sm dark:bg-brand-green/[0.1]'
                                                    : 'border-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                                            )}
                                        >
                                            <span className={clsx('text-[9px] font-bold uppercase tracking-wider', activo ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink-muted dark:text-ink-muted-dark')}>
                                                {d.nombre_dia?.slice(0, 3) ?? `D${d.numero_dia}`}
                                            </span>
                                            <span className={clsx('text-[16px] font-bold', activo ? 'text-ink dark:text-ink-dark' : 'text-ink/70 dark:text-ink-dark/70')}>
                                                {d.numero_dia}
                                            </span>
                                            {/* Mini barra de progreso */}
                                            <div className="w-full h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden mt-0.5">
                                                <div className={clsx('h-full rounded-full', pct >= 70 ? 'bg-brand-green' : pct > 0 ? 'bg-brand-orange' : 'bg-transparent')} style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-[8px] text-ink-muted/60 dark:text-ink-muted-dark/60">{completadas}/{total}</span>
                                        </button>
                                    );
                                })}
                                </div>
                            </div>

                            {/* Comidas del día seleccionado */}
                            {plan.dias[seleccion] && (
                                <div className="px-5 pb-5 pt-2 border-t border-surface-border/50 dark:border-surface-border-dark/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-[15px] font-bold text-ink dark:text-ink-dark capitalize">{plan.dias[seleccion].nombre_dia}</h4>
                                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{plan.dias[seleccion].fecha ?? 'Fecha por definir'}</p>
                                            <p className="mt-1 text-[10px] font-semibold text-brand-green-dark dark:text-brand-green">{plan.dias[seleccion].comidas.length} tiempos de comida planificados</p>
                                        </div>
                                        <MacroPills nutrientes={plan.dias[seleccion].nutrientes} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        {plan.dias[seleccion].comidas.map((c, i) => <ComidaCard key={`${c.tipo_comida}-${i}`} comida={c} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
            <ModalSintomasDelDia abierto={modalSintomas} cerrar={() => setModalSintomas(false)} seguimiento={seguimientoSintomas} />
        </AuthenticatedLayout>
    );
}

/* Balance semanal */
function BalanceSemanal({ plan }: { plan: Plan }) {
    const dias = Math.max(plan.dias.length, 1);
    const macros: [string, number, number, string, string, string][] = [
        ['Energía', plan.objetivos.calorias * dias, plan.planificados.calorias, 'kcal', 'bg-brand-green/[0.06] dark:bg-brand-green/[0.08] border-brand-green/20', 'bg-brand-green'],
        ['Proteínas', plan.objetivos.proteinas * dias, plan.planificados.proteinas, 'g', 'bg-category-dairy/[0.06] dark:bg-category-dairy/[0.08] border-category-dairy/20', 'bg-category-dairy'],
        ['Carbohidratos', plan.objetivos.carbohidratos * dias, plan.planificados.carbohidratos, 'g', 'bg-brand-orange/[0.06] dark:bg-brand-orange/[0.08] border-brand-orange/20', 'bg-brand-orange'],
        ['Grasas', plan.objetivos.grasas * dias, plan.planificados.grasas, 'g', 'bg-category-others/[0.06] dark:bg-category-others/[0.08] border-category-others/20', 'bg-category-others'],
        ['Fibra', plan.objetivos.fibra * dias, plan.planificados.fibra, 'g', 'bg-info/[0.06] dark:bg-info/[0.08] border-info/20', 'bg-info'],
    ];
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-2">Balance semanal</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {macros.map(([label, obj, val, unit, cardBg, barColor]) => {
                    const pct = obj ? Math.min((val / obj) * 100, 100) : 0;
                    return (
                        <div key={label} className={clsx('rounded-xl border px-3 py-3', cardBg)}>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</p>
                            <p className="text-[13px] font-bold text-ink dark:text-ink-dark mt-1">{n(val)} <span className="text-[10px] font-normal text-ink-muted dark:text-ink-muted-dark">/ {n(obj)} {unit}</span></p>
                            <div className="mt-2 h-1.5 w-full rounded-full bg-black/[0.08] dark:bg-white/[0.08] overflow-hidden">
                                <div className={clsx('h-full rounded-full opacity-80', barColor)} style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* Card de comida tipo app */
function ComidaCard({ comida }: { comida: Comida }) {
    const [modal, setModal] = useState(false);
    const [seguimientoActual, setSeguimientoActual] = useState<SeguimientoComida>(comida.seguimiento);
    useEffect(() => setSeguimientoActual(comida.seguimiento), [comida.seguimiento]);
    const estado = seguimientoActual.estado_cumplimiento;
    const estilo = TIPO_ESTILOS[comida.tipo_comida] ?? { bg: 'bg-black/[0.03] dark:bg-white/[0.04]', accent: 'text-ink-muted dark:text-ink-muted-dark', iconBg: 'bg-black/[0.06] text-ink-muted dark:text-ink-muted-dark' };
    const Icono = TIPO_ICONO[comida.tipo_comida] ?? Sun;
    const hora = String(comida.hora_sugerida ?? '').slice(0, 5);
    const botonEstilo = ESTADO_BOTON[estado] ?? ESTADO_BOTON.pendiente;

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-surface-border transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:border-surface-border-dark dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
            {/* Header con color */}
            <div className={clsx('relative px-5 py-4', estilo.bg)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={clsx('flex h-9 w-9 items-center justify-center rounded-xl', estilo.iconBg)}>
                            <Icono size={17} strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className={clsx('text-[10px] font-bold uppercase tracking-wider', estilo.accent)}>{etiqueta(comida.tipo_comida)}</p>
                            <h4 className="text-[13px] font-bold text-ink dark:text-ink-dark mt-0.5">{comida.nombre_comida}</h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge color={estado === 'completada' ? 'green' : estado === 'parcial' ? 'orange' : estado === 'no_realizada' ? 'red' : estado === 'reemplazada' ? 'blue' : 'gray'}>{etiqueta(estado)}</Badge>
                        {hora && <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark flex items-center gap-1"><Clock3 size={11} />{hora}</span>}
                    </div>
                </div>

                {/* Pills de macros */}
                <MacroPills nutrientes={comida.nutrientes} />
            </div>

            {/* Componentes / ingredientes */}
            <div className="flex flex-1 flex-col px-4 py-4">
                {comida.componentes.length > 0 && (
                    <div className="flex-1 space-y-3">
                        {comida.componentes.map((c, i) => c.tipo_componente === 'receta' ? (
                            <article key={`${c.nombre}-${i}`} className="group overflow-hidden rounded-2xl border border-brand-green/20 bg-gradient-to-b from-brand-green/[0.10] via-brand-green/[0.035] to-transparent shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-lg dark:from-brand-green/[0.12] dark:via-brand-green/[0.04]">
                                <div className="flex flex-col gap-3 p-3">
                                    <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-brand-green/10">
                                        <img src={c.receta?.imagen_url || '/images/recetas/receta-saludable-portada.png'} alt={`Foto de ${c.nombre ?? 'la receta'}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 pb-2 pt-6"><span className="inline-flex items-center gap-1 text-[9px] font-bold text-white"><ChefHat size={11} /> Receta del plan</span></div>
                                    </div>
                                    <div className="min-w-0 flex-1 px-0.5 pb-0.5">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0"><p className="text-[13px] font-bold leading-snug text-ink dark:text-ink-dark">{c.nombre}</p><p className="mt-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{n(c.cantidad)} {c.unidad} · {n(c.nutrientes.calorias)} kcal</p></div>
                                            <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[9px] font-bold text-brand-green-dark shadow-sm dark:bg-black/20 dark:text-brand-green">Lista para preparar</span>
                                        </div>
                                        {c.receta?.descripcion && <p className="mt-2 line-clamp-2 text-[10.5px] leading-relaxed text-ink/75 dark:text-ink-dark/75">{c.receta.descripcion}</p>}
                                        {c.receta?.preparacion && (
                                            <details className="mt-2.5">
                                                <summary className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-green/12 px-2.5 py-1.5 text-[10px] font-bold text-brand-green-dark transition hover:bg-brand-green/20 dark:text-brand-green"><ChefHat size={12} /> Ver preparación</summary>
                                                <p className="mt-2 whitespace-pre-line border-l-2 border-brand-green/30 pl-3 text-[10.5px] leading-relaxed text-ink/80 dark:text-ink-dark/80">{c.receta.preparacion}</p>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ) : (
                            <div key={`${c.nombre}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.018] px-3 py-2.5 dark:bg-white/[0.025]">
                                <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-ink dark:text-ink-dark">{c.nombre}</p><p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">{n(c.cantidad)} {c.unidad} · {n(c.nutrientes.calorias)} kcal</p></div>
                                <Badge color="gray">{c.tipo_componente}</Badge>
                            </div>
                        ))}
                    </div>
                )}

                {/* Botón de seguimiento con estado visual */}
                <button type="button" onClick={() => setModal(true)}
                    className={clsx('mt-4 w-full rounded-xl border px-4 py-3 text-[12px] font-bold transition-colors', botonEstilo.clase)}>
                    {botonEstilo.texto}
                </button>
            </div>

            <ModalSeguimientoComida abierto={modal} cerrar={() => setModal(false)} comidaId={comida.id_comida_plan_alimentario} nombre={comida.nombre_comida} seguimiento={seguimientoActual} onSuccess={(actualizado) => {
                setSeguimientoActual(actualizado);
                router.reload({ only: ['planAlimentario', 'resumenAdherencia'] });
            }} />
        </article>
    );
}

/* Pills de macros */
function MacroPills({ nutrientes }: { nutrientes: Nutrientes }) {
    return (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full bg-brand-green/25 px-3 py-1 text-[10.5px] font-bold text-brand-green-dark dark:bg-brand-green/20 dark:text-brand-green">{n(nutrientes.calorias)} kcal</span>
            <span className="inline-flex items-center rounded-full bg-category-dairy/20 px-3 py-1 text-[10.5px] font-bold text-category-dairy dark:bg-category-dairy/15">{n(nutrientes.proteinas)}g P</span>
            <span className="inline-flex items-center rounded-full bg-brand-orange/20 px-3 py-1 text-[10.5px] font-bold text-brand-orange dark:bg-brand-orange/15">{n(nutrientes.carbohidratos)}g C</span>
            <span className="inline-flex items-center rounded-full bg-category-others/20 px-3 py-1 text-[10.5px] font-bold text-category-others dark:bg-category-others/15">{n(nutrientes.grasas)}g G</span>
        </div>
    );
}

function ModalSintomasDelDia({ abierto, cerrar, seguimiento }: { abierto: boolean; cerrar: () => void; seguimiento: SeguimientoSintomas | null }) {
    if (!abierto || !seguimiento) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[3px]">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-surface-border bg-category-fruits/[0.035] px-5 py-4 dark:border-surface-border-dark dark:bg-category-fruits/[0.06] sm:px-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-category-fruits/12 text-category-fruits"><HeartPulse size={19} /></div>
                        <div><p className="text-[9px] font-bold uppercase tracking-[.14em] text-category-fruits">Cierre de tu día</p><h2 className="mt-0.5 text-[16px] font-bold text-ink dark:text-ink-dark">¡Comidas registradas!</h2><p className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark">Cuéntanos cómo te sentiste; le toma menos de dos minutos y ayuda a tu nutricionista.</p></div>
                    </div>
                    <button type="button" onClick={cerrar} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-muted transition hover:bg-black/[.05] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[.05] dark:hover:text-ink-dark" aria-label="Cerrar"><X size={18}/></button>
                </header>
                <div className="overflow-y-auto p-4 sm:p-6"><SeguimientoSintomasCard seguimiento={seguimiento} compacto onGuardado={cerrar} /></div>
            </div>
        </div>
    );
}
