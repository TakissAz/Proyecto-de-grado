import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { CitasPaciente } from '@/Components/paciente/CitasPacienteCard';
import type { Progreso } from '@/Components/paciente/ProgresoPacienteCard';
import type { RetroalimentacionesPaciente } from '@/Components/paciente/RetroalimentacionesNutricionistaCard';
import type { SeguimientoSintomas } from '@/Components/paciente/SeguimientoSintomasCard';
import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, Bell, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, HeartPulse, MessageSquareText, Salad, ShoppingCart, Target, TrendingDown, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

type Seguimiento = { estado_cumplimiento: string; porcentaje_consumido: number | null };
type Comida = { id_comida_plan_alimentario: number; tipo_comida: string; hora_sugerida: string | null; nombre_comida: string; seguimiento: Seguimiento };
type Dia = { numero_dia: number; nombre_dia: string; fecha: string | null; comidas: Comida[] };
interface Plan { nombre_plan: string; estado_plan: string; fecha_inicio: string | null; fecha_fin: string | null; dias: Dia[] }
interface Adherencia { comidas_totales: number; registradas: number; pendientes: number; porcentaje_adherencia: number }
interface Props { paciente: { nombre: string } | null; planAlimentario: Plan | null; resumenAdherencia: Adherencia | null; progresoPaciente: Progreso | null; seguimientoSintomas: SeguimientoSintomas | null; citasPaciente: CitasPaciente | null; retroalimentaciones: RetroalimentacionesPaciente | null }

const etiqueta = (v?: string | null) => v?.replaceAll('_', ' ') ?? 'Sin registro';
const numero = (v?: number | null, unidad = '') => v == null ? 'Sin dato' : `${Number(v).toLocaleString('es-BO', { maximumFractionDigits: 1 })}${unidad}`;
const fecha = (v?: string | null) => {
    if (!v) return 'Sin fecha';
    const d = new Date(`${v.slice(0, 10)}T12:00:00`);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Dashboard({ paciente, planAlimentario: plan, resumenAdherencia, progresoPaciente: progreso, seguimientoSintomas: sintomas, citasPaciente, retroalimentaciones }: Props) {
    const adherencia = resumenAdherencia?.porcentaje_adherencia ?? 0;
    const cita = citasPaciente?.proxima_cita;
    const noLeidas = retroalimentaciones?.total_no_leidas ?? 0;
    const hoy = new Date().toLocaleDateString('en-CA');
    const dia = plan?.dias.find(d => d.fecha?.slice(0, 10) === hoy) ?? plan?.dias.find(d => d.comidas.some(c => c.seguimiento.estado_cumplimiento === 'pendiente')) ?? plan?.dias[0] ?? null;
    const pendientes = dia?.comidas.filter(c => c.seguimiento.estado_cumplimiento === 'pendiente').length ?? 0;
    const sintomasHoy = Boolean(sintomas?.registro_hoy);

    return <AuthenticatedLayout header={<h2>Inicio</h2>}>
        <Head title="Inicio" />
        <main className="mx-auto max-w-7xl space-y-5">
            <header className="relative overflow-hidden rounded-2xl border border-surface-border bg-white p-6 shadow-[0_8px_30px_rgba(16,24,20,0.04)] dark:border-surface-border-dark dark:bg-[#1c2027] dark:shadow-none">
                <div className="absolute inset-y-0 left-0 w-1 bg-brand-green" />
                <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green-dark sm:flex dark:text-brand-green">
                            <HeartPulse size={23} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                                <p className="text-[9.5px] font-bold uppercase tracking-[.18em] text-brand-green-dark dark:text-brand-green">Resumen de salud</p>
                            </div>
                            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink dark:text-ink-dark">{paciente ? `Hola, ${paciente.nombre.split(' ')[0]}` : 'Portal del paciente'}</h1>
                            <p className="mt-1 text-[12px] text-ink-muted dark:text-ink-muted-dark">Tu alimentación, progreso y bienestar organizados para hoy.</p>
                        </div>
                    </div>
                    <Link href={route('paciente.seguimiento')} className="inline-flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-95">
                        <ClipboardCheck size={15}/> Registrar seguimiento
                    </Link>
                </div>
            </header>

            {!paciente ? <div className="flex items-center gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange/5 p-4"><AlertTriangle size={17} className="text-brand-orange"/><p className="text-[12px]">No se encontró un perfil de paciente vinculado a tu cuenta.</p></div> : <>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Resumen icon={Salad} color="green" titulo="Plan vigente" valor={plan ? etiqueta(plan.estado_plan) : 'Sin plan activo'} detalle={plan ? `${fecha(plan.fecha_inicio)} — ${fecha(plan.fecha_fin)}` : 'Tu nutricionista aún no publicó un plan.'}/>
                    <Resumen icon={Activity} color={adherencia >= 70 ? 'green' : adherencia >= 40 ? 'orange' : 'red'} titulo="Adherencia semanal" valor={`${adherencia}%`} detalle={`${resumenAdherencia?.registradas ?? 0} de ${resumenAdherencia?.comidas_totales ?? 0} comidas registradas`}/>
                    <Resumen icon={CalendarDays} color="blue" titulo="Próxima cita" valor={cita ? fecha(cita.fecha) : 'Sin cita próxima'} detalle={cita ? `${cita.area} · ${String(cita.hora_inicio).slice(0, 5)}` : 'Consulta tu calendario para más detalles.'}/>
                    <Resumen icon={Bell} color={noLeidas ? 'orange' : 'green'} titulo="Orientación profesional" valor={noLeidas ? `${noLeidas} mensaje${noLeidas === 1 ? '' : 's'} nuevo${noLeidas === 1 ? '' : 's'}` : 'Todo revisado'} detalle={noLeidas ? 'Tu nutricionista dejó indicaciones para ti.' : 'No tienes mensajes pendientes.'}/>
                </section>

                <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
                    <article className="rounded-2xl border border-surface-border p-5 dark:border-surface-border-dark">
                        <Cabecera titulo={dia ? `${etiqueta(dia.nombre_dia)} · ${fecha(dia.fecha)}` : 'Plan de hoy'} subtitulo={dia ? `${pendientes} comida${pendientes === 1 ? '' : 's'} pendiente${pendientes === 1 ? '' : 's'} de registrar.` : 'Todavía no hay comidas planificadas.'} href={route('paciente.mi-plan')}/>
                        {dia ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{dia.comidas.map(c => <ComidaHoy key={c.id_comida_plan_alimentario} comida={c}/>)}</div> : <Vacio texto="Cuando tu plan sea aprobado, aquí verás las comidas del día."/>}
                    </article>
                    <article className="rounded-2xl border border-surface-border p-5 dark:border-surface-border-dark">
                        <div className="flex items-center gap-3"><Icono icon={Target} color="orange"/><div><p className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">Prioridades de hoy</p><h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Próximos pasos</h2></div></div>
                        <div className="mt-4 space-y-2"><Tarea hecha={pendientes === 0 && Boolean(dia)} texto={dia ? pendientes ? `Registrar ${pendientes} comida${pendientes === 1 ? '' : 's'}` : 'Comidas del día registradas' : 'Revisar tu plan alimentario'} href={route('paciente.seguimiento')}/><Tarea hecha={sintomasHoy} texto={sintomasHoy ? 'Bienestar diario registrado' : 'Registrar cómo te sientes hoy'} href={route('paciente.sintomas')}/><Tarea hecha={noLeidas === 0} texto={noLeidas ? `Leer ${noLeidas} orientación${noLeidas === 1 ? '' : 'es'}` : 'Orientaciones revisadas'} href={route('paciente.orientacion')}/></div>
                    </article>
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                    <article className="rounded-2xl border border-surface-border p-5 dark:border-surface-border-dark"><CabeceraIcono icon={TrendingUp} titulo="Tu progreso" subtitulo="Últimos indicadores registrados" href={route('paciente.progreso')}/>{progreso ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metrica label="Peso actual" valor={numero(progreso.evaluacion.peso_actual, ' kg')} cambio={progreso.evaluacion.cambio_peso}/><Metrica label="IMC" valor={numero(progreso.evaluacion.imc_actual)} cambio={progreso.evaluacion.cambio_imc}/><Metrica label="Cintura" valor={numero(progreso.evaluacion.cintura_actual, ' cm')} cambio={progreso.evaluacion.cambio_cintura}/><Metrica label="Objetivo" valor={etiqueta(progreso.objetivo.objetivo_principal)}/></div> : <Vacio texto="Aún no hay evaluaciones suficientes para mostrar tu evolución."/>}</article>
                    <article className="rounded-2xl border border-surface-border p-5 dark:border-surface-border-dark"><CabeceraIcono icon={HeartPulse} titulo="Bienestar y síntomas" subtitulo="Información útil para ajustar tu plan" href={route('paciente.sintomas')} rojo/>{sintomas ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Dato label="Registro de hoy" valor={sintomasHoy ? 'Completado' : 'Pendiente'} alerta={!sintomasHoy}/><Dato label="Energía" valor={etiqueta(sintomas.registro_hoy?.nivel_energia)}/><Dato label="Sueño" valor={etiqueta(sintomas.registro_hoy?.calidad_sueno)}/><Dato label="Agua" valor={sintomas.registro_hoy?.consumo_agua_litros == null ? 'Sin registro' : numero(Number(sintomas.registro_hoy.consumo_agua_litros), ' L')}/></div> : <Vacio texto="Registra tus síntomas para apoyar el seguimiento profesional."/>}</article>
                </section>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Acceso href={route('paciente.mi-plan')} icon={Salad} texto="Plan alimentario"/><Acceso href={route('paciente.lista-compras')} icon={ShoppingCart} texto="Lista de compras"/><Acceso href={route('paciente.citas')} icon={CalendarDays} texto="Mis citas"/><Acceso href={route('paciente.orientacion')} icon={MessageSquareText} texto="Orientación"/></section>
            </>}
        </main>
    </AuthenticatedLayout>;
}

const colores = { green: 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green', orange: 'bg-brand-orange/10 text-brand-orange', red: 'bg-category-fruits/10 text-category-fruits', blue: 'bg-info/10 text-info' };
function Icono({ icon: Icon, color }: { icon: typeof Salad; color: keyof typeof colores }) { return <div className={clsx('flex h-9 w-9 items-center justify-center rounded-xl', colores[color])}><Icon size={18}/></div>; }
function Resumen({ icon, color, titulo, valor, detalle }: { icon: typeof Salad; color: keyof typeof colores; titulo: string; valor: string; detalle: string }) { return <article className="rounded-2xl border border-surface-border p-4 dark:border-surface-border-dark"><Icono icon={icon} color={color}/><p className="mt-3 text-[9.5px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{titulo}</p><p className="mt-1 text-[14px] font-bold capitalize text-ink dark:text-ink-dark">{valor}</p><p className="mt-1 text-[10.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">{detalle}</p></article>; }
function Cabecera({ titulo, subtitulo, href }: { titulo: string; subtitulo: string; href: string }) { return <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Tu alimentación</p><h2 className="mt-1 text-[16px] font-bold text-ink dark:text-ink-dark">{titulo}</h2><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">{subtitulo}</p></div><Link href={href} className="flex items-center text-[11px] font-bold text-brand-green-dark dark:text-brand-green">Ver plan <ChevronRight size={14}/></Link></div>; }
function ComidaHoy({ comida: c }: { comida: Comida }) { const ok = c.seguimiento.estado_cumplimiento === 'completada'; const pendiente = c.seguimiento.estado_cumplimiento === 'pendiente'; return <div className="flex items-center gap-3 rounded-xl border border-surface-border/70 bg-black/[.012] p-3 dark:border-surface-border-dark dark:bg-white/[.02]"><div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', ok ? colores.green : pendiente ? colores.orange : colores.blue)}>{ok ? <CheckCircle2 size={17}/> : <Clock3 size={17}/>}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="text-[10px] font-bold uppercase text-ink-muted">{etiqueta(c.tipo_comida)}</p><span className="text-[9.5px] text-ink-muted">{String(c.hora_sugerida ?? '').slice(0, 5) || 'Sin hora'}</span></div><p className="truncate text-[12px] font-semibold text-ink dark:text-ink-dark">{c.nombre_comida}</p><p className={clsx('text-[9.5px] font-semibold capitalize', ok ? 'text-brand-green' : pendiente ? 'text-brand-orange' : 'text-info')}>{etiqueta(c.seguimiento.estado_cumplimiento)}</p></div></div>; }
function Tarea({ hecha, texto, href }: { hecha: boolean; texto: string; href: string }) { return <Link href={href} className="flex items-center gap-3 rounded-xl border border-surface-border/70 p-3 dark:border-surface-border-dark"><div className={clsx('flex h-7 w-7 items-center justify-center rounded-full', hecha ? colores.green : colores.orange)}>{hecha ? <CheckCircle2 size={15}/> : <Clock3 size={15}/>}</div><span className="flex-1 text-[11.5px] font-semibold">{texto}</span><ChevronRight size={14} className="text-ink-muted"/></Link>; }
function CabeceraIcono({ icon, titulo, subtitulo, href, rojo = false }: { icon: typeof Activity; titulo: string; subtitulo: string; href: string; rojo?: boolean }) { return <div className="flex items-center gap-3"><Icono icon={icon} color={rojo ? 'red' : 'green'}/><div className="flex-1"><h2 className="text-[14px] font-bold">{titulo}</h2><p className="text-[10.5px] text-ink-muted">{subtitulo}</p></div><Link href={href} className="text-[10.5px] font-bold text-brand-green-dark dark:text-brand-green">Ver detalle</Link></div>; }
function Metrica({ label, valor, cambio }: { label: string; valor: string; cambio?: number | null }) { return <div className="rounded-xl bg-black/[.025] p-3 dark:bg-white/[.035]"><p className="text-[9px] font-bold uppercase text-ink-muted">{label}</p><p className="mt-1 text-[13px] font-bold capitalize">{valor}</p>{cambio != null && cambio !== 0 && <p className={clsx('mt-1 flex items-center gap-1 text-[9.5px] font-semibold', cambio < 0 ? 'text-brand-green' : 'text-brand-orange')}>{cambio < 0 ? <TrendingDown size={11}/> : <TrendingUp size={11}/>} {numero(cambio)}</p>}</div>; }
function Dato({ label, valor, alerta = false }: { label: string; valor: string; alerta?: boolean }) { return <div className="rounded-xl bg-black/[.025] p-3 dark:bg-white/[.035]"><p className="text-[9px] font-bold uppercase text-ink-muted">{label}</p><p className={clsx('mt-1 text-[12px] font-bold capitalize', alerta ? 'text-brand-orange' : '')}>{valor}</p></div>; }
function Vacio({ texto }: { texto: string }) { return <p className="mt-4 rounded-xl bg-black/[.025] p-5 text-center text-[11px] text-ink-muted dark:bg-white/[.035]">{texto}</p>; }
function Acceso({ href, icon: Icon, texto }: { href: string; icon: typeof Salad; texto: string }) { return <Link href={href} className="flex items-center gap-3 rounded-xl border border-surface-border p-3.5 transition hover:border-brand-green/35 dark:border-surface-border-dark"><Icono icon={Icon} color="green"/><span className="text-[11px] font-bold">{texto}</span><ChevronRight size={13} className="ml-auto text-ink-muted"/></Link>; }
