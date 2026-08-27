import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import RetroalimentacionesNutricionistaCard, { type RetroalimentacionesPaciente } from '@/Components/paciente/RetroalimentacionesNutricionistaCard';

type Nutrientes = { calorias: number; proteinas: number; carbohidratos: number; grasas: number; fibra: number };
interface Plan { nombre_plan: string; estado_plan: string; fecha_inicio: string | null; fecha_fin: string | null; objetivos: Nutrientes; planificados: Nutrientes; dias: unknown[]; recomendacionOrigen: { enfoque_nutricional_experto: string | null; prioridad_nutricional: string | null; recomendaciones: string[]; restricciones: string[]; alertas: string[]; conclusion: string | null } | null }
interface Props { paciente: { nombre: string } | null; planAlimentario: Plan | null; retroalimentaciones: RetroalimentacionesPaciente | null }

const etiqueta = (v: string | null) => v?.replaceAll('_', ' ') ?? 'No definido';

export default function Orientacion({ paciente, planAlimentario: plan, retroalimentaciones }: Props) {
    return (
        <AuthenticatedLayout header={<h2>Orientación</h2>}>
            <Head title="Orientación" />
            <main className="mx-auto max-w-7xl space-y-5">
                {plan?.recomendacionOrigen && <OrientacionPlan recomendacion={plan.recomendacionOrigen} />}
                <RetroalimentacionesNutricionistaCard retroalimentaciones={retroalimentaciones} />
            </main>
        </AuthenticatedLayout>
    );
}

function OrientacionPlan({ recomendacion: r }: { recomendacion: NonNullable<Plan['recomendacionOrigen']> }) {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.03] p-5 dark:bg-brand-green/[0.04]">
                <div className="flex items-start gap-2.5">
                    <ShieldCheck size={17} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Orientación de tu plan</h3>
                        {r.conclusion && <p className="mt-2 text-[11.5px] text-ink/70 dark:text-ink-dark/70 leading-relaxed">{r.conclusion}</p>}
                        <p className="mt-2 text-[10px] capitalize text-ink-muted dark:text-ink-muted-dark">Enfoque: {etiqueta(r.enfoque_nutricional_experto)}</p>
                    </div>
                </div>
                {r.recomendaciones?.length ? (
                    <ul className="mt-3 ml-6 space-y-1.5">
                        {r.recomendaciones.map((x, i) => <li key={i} className="flex items-start gap-2 text-[11px] text-ink dark:text-ink-dark"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-green" />{x}</li>)}
                    </ul>
                ) : null}
            </div>
            <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/[0.03] p-5 dark:bg-brand-orange/[0.04]">
                <h3 className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Tus restricciones consideradas</h3>
                {r.restricciones?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.restricciones.map((x, i) => <span key={i} className="inline-flex items-center rounded-lg bg-brand-orange/15 px-2.5 py-1 text-[10.5px] font-semibold text-brand-orange">{x}</span>)}
                    </div>
                ) : <p className="mt-2 text-[11px] text-ink-muted dark:text-ink-muted-dark italic">Sin restricciones registradas.</p>}
                {r.alertas?.map((x, i) => <p key={i} className="mt-3 flex items-start gap-2 text-[11px] text-ink dark:text-ink-dark"><AlertTriangle size={12} className="text-brand-orange shrink-0 mt-0.5" />{x}</p>)}
            </div>
        </div>
    );
}
