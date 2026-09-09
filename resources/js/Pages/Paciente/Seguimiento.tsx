import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { CalendarCheck2, HeartPulse, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import ProgresoPacienteCard, { type Progreso } from '@/Components/paciente/ProgresoPacienteCard';
import type { SeguimientoComida } from '@/Components/paciente/ModalSeguimientoComida';

type Nutrientes = { calorias: number; proteinas: number; carbohidratos: number; grasas: number; fibra: number };
interface Comida { id_comida_plan_alimentario: number; tipo_comida: string; hora_sugerida: string | null; nombre_comida: string; nutrientes: Nutrientes; componentes: unknown[]; seguimiento: SeguimientoComida }
interface Dia { numero_dia: number; nombre_dia: string; fecha: string | null; nutrientes: Nutrientes; comidas: Comida[] }
interface Plan { nombre_plan: string; estado_plan: string; fecha_inicio: string | null; fecha_fin: string | null; objetivos: Nutrientes; planificados: Nutrientes; dias: Dia[]; recomendacionOrigen: unknown }
interface ResumenAdherencia { comidas_totales: number; completadas: number; parciales: number; no_realizadas: number; reemplazadas: number; pendientes: number; registradas: number; porcentaje_adherencia: number }
interface RegistroProgreso { id: number; fecha: string | null; peso: number | null; imc: number | null; cintura: number | null; cadera: number | null; porcentaje_grasa: number | null; masa_muscular: number | null }
interface Props { paciente: { nombre: string } | null; planAlimentario: Plan | null; resumenAdherencia: ResumenAdherencia | null; progresoPaciente: Progreso | null; historialProgreso: RegistroProgreso[] }

const n = (v: number) => Number(v ?? 0).toLocaleString('es-BO', { maximumFractionDigits: 1 });

export default function Seguimiento({ paciente, planAlimentario: plan, resumenAdherencia, progresoPaciente, historialProgreso }: Props) {
    return (
        <AuthenticatedLayout header={<h2>Seguimiento</h2>}>
            <Head title="Seguimiento" />
            <main className="mx-auto w-full max-w-[1500px] space-y-5 px-4 sm:px-6 lg:px-8">
                <header className="relative overflow-hidden rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-green/[0.14] via-brand-green/[0.045] to-transparent px-5 py-5 dark:from-brand-green/[0.16] dark:via-brand-green/[0.05]">
                    <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-brand-green/15 blur-2xl" />
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark shadow-sm dark:text-brand-green"><HeartPulse size={21} strokeWidth={1.8} /></div><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-green-dark dark:text-brand-green">Mi evolución</p><h1 className="mt-0.5 text-[20px] font-bold text-ink dark:text-ink-dark">Hola{paciente?.nombre ? `, ${paciente.nombre.split(' ')[0]}` : ''}</h1><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">Mira tus avances, celebra lo que ya lograste y mantén el foco en tu siguiente paso.</p></div></div>
                        <div className="flex items-center gap-2 rounded-xl border border-brand-green/20 bg-surface-card/70 px-3 py-2 text-[10.5px] font-semibold text-brand-green-dark backdrop-blur-sm dark:bg-surface-card-dark/70 dark:text-brand-green"><CalendarCheck2 size={14} /> Progreso personal</div>
                    </div>
                </header>
                {/* Adherencia semanal */}
                {resumenAdherencia && plan && <AdherenciaSemanal resumen={resumenAdherencia} planNombre={plan.nombre_plan} />}

                {/* Sin plan */}
                {!plan && (
                    <div className="rounded-2xl border border-dashed border-brand-green/25 bg-brand-green/[0.025] px-6 py-7 dark:bg-brand-green/[0.04]">
                        <div className="mx-auto flex max-w-xl flex-col items-center text-center"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green"><Sparkles size={20} /></div><h2 className="mt-3 text-[14px] font-bold text-ink dark:text-ink-dark">Tu plan aún está en preparación</h2><p className="mt-1 text-[11px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">Cuando tu nutricionista active el plan, aquí podrás ver tu adherencia y los avances de cada semana.</p></div>
                    </div>
                )}

                {/* Progreso del paciente */}
                <ProgresoPacienteCard progreso={progresoPaciente} historial={historialProgreso} />

            </main>
        </AuthenticatedLayout>
    );
}

function AdherenciaSemanal({ resumen, planNombre }: { resumen: ResumenAdherencia; planNombre: string }) {
    const barColor = resumen.porcentaje_adherencia >= 70 ? 'bg-brand-green' : resumen.porcentaje_adherencia >= 40 ? 'bg-brand-orange' : 'bg-category-fruits';
    return (
        <div className="overflow-hidden rounded-2xl border border-brand-green/20 bg-brand-green/[0.03] p-5 dark:bg-brand-green/[0.04]">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-brand-green-dark dark:text-brand-green">Plan activo</p>
                    <h3 className="mt-0.5 text-[14px] font-bold text-ink dark:text-ink-dark">Seguimiento de esta semana</h3>
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-0.5">{planNombre} · Llevas {resumen.registradas} de {resumen.comidas_totales} comidas registradas.</p>
                </div>
                <p className={clsx('text-[24px] font-bold', resumen.porcentaje_adherencia >= 70 ? 'text-brand-green-dark dark:text-brand-green' : resumen.porcentaje_adherencia >= 40 ? 'text-brand-orange' : 'text-category-fruits')}>{n(resumen.porcentaje_adherencia)}%</p>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${resumen.porcentaje_adherencia}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {([['Completadas', resumen.completadas, 'text-brand-green-dark dark:text-brand-green'], ['Parciales', resumen.parciales, 'text-brand-orange'], ['No realizadas', resumen.no_realizadas, 'text-category-fruits'], ['Reemplazadas', resumen.reemplazadas, 'text-info'], ['Pendientes', resumen.pendientes, 'text-ink-muted dark:text-ink-muted-dark']] as const).map(([l, v, color]) => (
                    <div key={l} className="rounded-lg bg-white/60 dark:bg-black/20 px-3 py-2 text-center">
                        <p className={clsx('text-[14px] font-bold', color)}>{v}</p>
                        <p className="text-[9px] text-ink-muted dark:text-ink-muted-dark">{l}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
