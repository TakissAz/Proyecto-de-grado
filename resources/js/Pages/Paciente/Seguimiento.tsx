import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import clsx from 'clsx';
import ProgresoPacienteCard, { type Progreso } from '@/Components/paciente/ProgresoPacienteCard';
import SeguimientoSintomasCard, { type SeguimientoSintomas } from '@/Components/paciente/SeguimientoSintomasCard';
import type { SeguimientoComida } from '@/Components/paciente/ModalSeguimientoComida';

type Nutrientes = { calorias: number; proteinas: number; carbohidratos: number; grasas: number; fibra: number };
interface Comida { id_comida_plan_alimentario: number; tipo_comida: string; hora_sugerida: string | null; nombre_comida: string; nutrientes: Nutrientes; componentes: unknown[]; seguimiento: SeguimientoComida }
interface Dia { numero_dia: number; nombre_dia: string; fecha: string | null; nutrientes: Nutrientes; comidas: Comida[] }
interface Plan { nombre_plan: string; estado_plan: string; fecha_inicio: string | null; fecha_fin: string | null; objetivos: Nutrientes; planificados: Nutrientes; dias: Dia[]; recomendacionOrigen: unknown }
interface ResumenAdherencia { comidas_totales: number; completadas: number; parciales: number; no_realizadas: number; reemplazadas: number; pendientes: number; registradas: number; porcentaje_adherencia: number }
interface Props { paciente: { nombre: string } | null; planAlimentario: Plan | null; resumenAdherencia: ResumenAdherencia | null; progresoPaciente: Progreso | null; seguimientoSintomas: SeguimientoSintomas | null }

const n = (v: number) => Number(v ?? 0).toLocaleString('es-BO', { maximumFractionDigits: 1 });

export default function Seguimiento({ paciente, planAlimentario: plan, resumenAdherencia, progresoPaciente, seguimientoSintomas }: Props) {
    return (
        <AuthenticatedLayout header={<h2>Seguimiento</h2>}>
            <Head title="Seguimiento" />
            <main className="mx-auto max-w-7xl space-y-5">
                {/* Adherencia semanal */}
                {resumenAdherencia && plan && <AdherenciaSemanal resumen={resumenAdherencia} planNombre={plan.nombre_plan} />}

                {/* Sin plan */}
                {!plan && (
                    <div className="rounded-xl border border-dashed border-surface-border p-8 text-center dark:border-surface-border-dark">
                        <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Todavía no tienes un plan activo para registrar seguimiento.</p>
                    </div>
                )}

                {/* Progreso del paciente */}
                <ProgresoPacienteCard progreso={progresoPaciente} />

                {/* Seguimiento de síntomas */}
                <SeguimientoSintomasCard seguimiento={seguimientoSintomas} />
            </main>
        </AuthenticatedLayout>
    );
}

function AdherenciaSemanal({ resumen, planNombre }: { resumen: ResumenAdherencia; planNombre: string }) {
    const barColor = resumen.porcentaje_adherencia >= 70 ? 'bg-brand-green' : resumen.porcentaje_adherencia >= 40 ? 'bg-brand-orange' : 'bg-category-fruits';
    return (
        <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.03] p-5 dark:bg-brand-green/[0.04]">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h3 className="text-[14px] font-bold text-ink dark:text-ink-dark">Seguimiento de esta semana</h3>
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
