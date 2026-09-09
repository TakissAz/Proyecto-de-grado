import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, FileClock, HeartPulse, Salad, TrendingUp, UserPlus, Users } from 'lucide-react';
import clsx from 'clsx';
import RoleWelcomePreloader from '@/Components/ui/RoleWelcomePreloader';

interface Resumen { total_pacientes: number; planes_activos: number; consultas_mes: number; adherencia_promedio: number; planes_por_aprobar: number; seguimientos_por_revisar: number; citas_hoy: number }
interface Cita { id_cita: number; id_paciente: number; paciente: string; fecha: string; hora: string; tipo_cita: string | null; modalidad: string | null; estado: string }
interface Props extends PageProps { resumen: Resumen; proximasCitas: Cita[]; derivaciones:{pendientes:number;en_proceso:number} }

const fecha = (valor: string) => new Date(`${valor}T12:00:00`).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' });
const etiqueta = (valor?: string | null) => valor?.replaceAll('_', ' ') ?? 'Sin definir';

export default function Dashboard({ auth, resumen, proximasCitas, derivaciones }: Props) {
    const nombre = auth?.user?.name?.trim().replace(/^(lic\.?|dra?\.?|nut\.?)\s+/i, '').split(/\s+/)[0] || 'Nutricionista';
    const tareas = resumen.planes_por_aprobar + resumen.seguimientos_por_revisar;

    return <AuthenticatedLayout title="Panel nutricional">
        <Head title="Panel nutricional" />
        <RoleWelcomePreloader role="nutricionista" userName={auth?.user?.name} userId={auth?.user?.id}/>
        <main className="mx-auto max-w-7xl space-y-5">
            <Link href="/nutricionista/derivaciones" className="card-elevated flex items-center gap-4 border-brand-green/20 p-4"><Icono icon={UserPlus} color="green"/><div className="flex-1"><p className="text-xs font-bold">Derivaciones desde endocrinología</p><p className="text-[10px] text-ink-muted">{derivaciones.pendientes} pendientes · {derivaciones.en_proceso} en proceso</p></div><span className="text-[10px] font-bold text-brand-green">Ver derivaciones →</span></Link>
            <header className="relative overflow-hidden rounded-2xl border border-surface-border bg-white p-6 shadow-[0_8px_30px_rgba(16,24,20,.04)] dark:border-surface-border-dark dark:bg-[#1c2027] dark:shadow-none">
                <div className="absolute inset-y-0 left-0 w-1 bg-brand-green" />
                <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex items-center gap-4"><div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green-dark sm:flex dark:text-brand-green"><HeartPulse size={23}/></div><div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-green"/><p className="text-[9.5px] font-bold uppercase tracking-[.18em] text-brand-green-dark dark:text-brand-green">Gestión nutricional</p></div><h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink dark:text-ink-dark">Hola, {nombre}</h1><p className="mt-1 text-[12px] text-ink-muted dark:text-ink-muted-dark">Tu agenda, pacientes y pendientes clínicos en un solo lugar.</p></div></div>
                    <div className="flex gap-2"><Link href={route('nutricionista.citas.index')} className="inline-flex items-center gap-2 rounded-xl border border-surface-border px-4 py-2.5 text-[11px] font-bold text-ink dark:border-surface-border-dark dark:text-ink-dark"><CalendarDays size={15}/> Ver agenda</Link><Link href={route('nutricionista.pacientes.create')} className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-[11px] font-bold text-white"><UserPlus size={15}/> Nuevo paciente</Link></div>
                </div>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metrica icon={Users} titulo="Pacientes atendidos" valor={resumen.total_pacientes} detalle="Con atención o planificación nutricional" color="green"/>
                <Metrica icon={Salad} titulo="Planes activos" valor={resumen.planes_activos} detalle={`${resumen.planes_por_aprobar} pendiente${resumen.planes_por_aprobar === 1 ? '' : 's'} de aprobación`} color="orange"/>
                <Metrica icon={ClipboardCheck} titulo="Consultas del mes" valor={resumen.consultas_mes} detalle={`${resumen.citas_hoy} cita${resumen.citas_hoy === 1 ? '' : 's'} para hoy`} color="blue"/>
                <Metrica icon={TrendingUp} titulo="Adherencia promedio" valor={`${resumen.adherencia_promedio}%`} detalle="Según registros de comidas" color={resumen.adherencia_promedio >= 70 ? 'green' : 'red'}/>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
                <article className="rounded-2xl border border-surface-border p-5 dark:border-surface-border-dark">
                    <Titulo icon={CalendarDays} titulo="Próximas consultas" subtitulo="Agenda nutricional programada" href={route('nutricionista.citas.index')}/>
                    {proximasCitas.length ? <div className="mt-4 overflow-hidden rounded-xl border border-surface-border/70 dark:border-surface-border-dark">{proximasCitas.map((cita, i) => <Link key={cita.id_cita} href={route('nutricionista.pacientes.perfil-nutricional', cita.id_paciente)} className={clsx('flex items-center gap-3 p-3.5 transition hover:bg-brand-green/[.025]', i > 0 && 'border-t border-surface-border/70 dark:border-surface-border-dark')}><div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-info/10 text-info"><span className="text-[10px] font-bold">{cita.hora}</span></div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-ink dark:text-ink-dark">{cita.paciente || 'Paciente'}</p><p className="mt-0.5 text-[10px] capitalize text-ink-muted dark:text-ink-muted-dark">{fecha(cita.fecha)} · {etiqueta(cita.tipo_cita)} · {etiqueta(cita.modalidad)}</p></div><span className={clsx('rounded-lg px-2 py-1 text-[9px] font-bold capitalize', cita.estado === 'confirmada' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-orange/10 text-brand-orange')}>{etiqueta(cita.estado)}</span><ChevronRight size={14} className="text-ink-muted"/></Link>)}</div> : <Vacio icon={CalendarDays} texto="No tienes próximas consultas programadas."/>}
                </article>

                <article className="rounded-2xl border border-surface-border p-5 dark:border-surface-border-dark">
                    <div className="flex items-center gap-3"><Icono icon={AlertTriangle} color={tareas ? 'orange' : 'green'}/><div><p className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">Atención requerida</p><h2 className="text-[14px] font-bold">Pendientes profesionales</h2></div></div>
                    <div className="mt-4 space-y-2">
                        <Pendiente icon={Salad} cantidad={resumen.planes_por_aprobar} titulo="Planes por aprobar" descripcion="Revisa la planificación antes de publicarla" href={route('nutricionista.pacientes.index')}/>
                        <Pendiente icon={FileClock} cantidad={resumen.seguimientos_por_revisar} titulo="Seguimientos por revisar" descripcion="Registros de pacientes aún no revisados" href={route('nutricionista.pacientes.index')}/>
                        <Pendiente icon={CalendarDays} cantidad={resumen.citas_hoy} titulo="Consultas de hoy" descripcion="Citas programadas o confirmadas" href={route('nutricionista.citas.index')}/>
                    </div>
                    {tareas === 0 && resumen.citas_hoy === 0 && <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-green/5 p-3 text-[11px] font-semibold text-brand-green-dark dark:text-brand-green"><CheckCircle2 size={15}/> No tienes pendientes prioritarios.</div>}
                </article>
            </section>

            <section className="rounded-2xl border border-surface-border p-5 dark:border-surface-border-dark">
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Accesos de trabajo</p><h2 className="mt-1 text-[15px] font-bold">¿Qué deseas gestionar?</h2></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Acceso icon={Users} titulo="Mis pacientes" detalle="Perfiles y seguimiento" href={route('nutricionista.pacientes.index')}/><Acceso icon={CalendarDays} titulo="Agenda" detalle="Consultas y controles" href={route('nutricionista.citas.index')}/><Acceso icon={UserPlus} titulo="Registrar paciente" detalle="Crear nuevo perfil" href={route('nutricionista.pacientes.create')}/><Acceso icon={Salad} titulo="Planes alimentarios" detalle="Gestionar desde pacientes" href={route('nutricionista.pacientes.index')}/></div>
            </section>
        </main>
    </AuthenticatedLayout>;
}

const colores = { green: 'bg-brand-green/10 text-brand-green-dark dark:text-brand-green', orange: 'bg-brand-orange/10 text-brand-orange', red: 'bg-category-fruits/10 text-category-fruits', blue: 'bg-info/10 text-info' };
function Icono({ icon: Icon, color }: { icon: typeof Users; color: keyof typeof colores }) { return <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', colores[color])}><Icon size={18}/></div>; }
function Metrica({ icon, titulo, valor, detalle, color }: { icon: typeof Users; titulo: string; valor: number | string; detalle: string; color: keyof typeof colores }) { return <article className="rounded-2xl border border-surface-border p-4 dark:border-surface-border-dark"><Icono icon={icon} color={color}/><p className="mt-3 text-[9.5px] font-bold uppercase tracking-wider text-ink-muted">{titulo}</p><p className="mt-1 text-2xl font-bold text-ink dark:text-ink-dark">{valor}</p><p className="mt-1 text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{detalle}</p></article>; }
function Titulo({ icon, titulo, subtitulo, href }: { icon: typeof Users; titulo: string; subtitulo: string; href: string }) { return <div className="flex items-center gap-3"><Icono icon={icon} color="blue"/><div className="flex-1"><h2 className="text-[14px] font-bold">{titulo}</h2><p className="text-[10.5px] text-ink-muted">{subtitulo}</p></div><Link href={href} className="text-[10.5px] font-bold text-brand-green-dark dark:text-brand-green">Ver agenda</Link></div>; }
function Pendiente({ icon: Icon, cantidad, titulo, descripcion, href }: { icon: typeof Users; cantidad: number; titulo: string; descripcion: string; href: string }) { return <Link href={href} className="flex items-center gap-3 rounded-xl border border-surface-border/70 p-3 dark:border-surface-border-dark"><div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', cantidad ? colores.orange : colores.green)}>{cantidad ? <span className="text-[12px] font-bold">{cantidad}</span> : <CheckCircle2 size={16}/>}</div><div className="min-w-0 flex-1"><p className="text-[11.5px] font-bold">{titulo}</p><p className="truncate text-[9.5px] text-ink-muted">{descripcion}</p></div><ChevronRight size={14} className="text-ink-muted"/></Link>; }
function Acceso({ icon, titulo, detalle, href }: { icon: typeof Users; titulo: string; detalle: string; href: string }) { return <Link href={href} className="group flex items-center gap-3 rounded-xl border border-surface-border p-3.5 transition hover:border-brand-green/35 dark:border-surface-border-dark"><Icono icon={icon} color="green"/><div className="flex-1"><p className="text-[11.5px] font-bold">{titulo}</p><p className="text-[9.5px] text-ink-muted">{detalle}</p></div><ChevronRight size={14} className="text-ink-muted transition group-hover:translate-x-0.5"/></Link>; }
function Vacio({ icon: Icon, texto }: { icon: typeof Users; texto: string }) { return <div className="mt-4 flex flex-col items-center rounded-xl bg-black/[.025] p-8 text-center dark:bg-white/[.025]"><Icon size={25} className="text-ink-muted/40"/><p className="mt-2 text-[11px] text-ink-muted">{texto}</p></div>; }
