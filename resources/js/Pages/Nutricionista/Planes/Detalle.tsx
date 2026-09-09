import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, FileDown, Info } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PlanAlimentarioCard from '@/Components/planes/PlanAlimentarioCard';
import type { CatalogoAlimento, CatalogoReceta, PlanAlimentario, RecomendacionNutricionalExperta } from '@/Pages/Nutricionista/Pacientes/PerfilNutricional/tipos';

interface Props {
    plan: PlanAlimentario;
    pacienteId: number;
    recomendacion: RecomendacionNutricionalExperta | null;
    alimentos: CatalogoAlimento[];
    recetas: CatalogoReceta[];
}

export default function Detalle({ plan, pacienteId, recomendacion, alimentos, recetas }: Props) {
    return (
        <AuthenticatedLayout title="Planificación semanal">
            <Head title={`Plan alimentario · ${plan.nombre}`} />
            <main className="mx-auto max-w-[1500px] space-y-5">
                <section className="card-elevated overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border bg-gradient-to-r from-brand-green/[0.08] to-transparent px-5 py-4 dark:border-surface-border-dark">
                        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green"><CalendarDays size={19}/></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Vista profesional</p><h1 className="text-lg font-black text-ink dark:text-ink-dark">Planificación alimentaria completa</h1><p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Revisa los 7 días, cada tiempo de comida, recetas, ingredientes y aportes nutricionales.</p></div></div>
                        <div className="flex flex-wrap items-center gap-2">
                            <a href={route('nutricionista.planes.reporte-pdf', plan.id_plan_alimentario)} className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-brand-green-dark"><FileDown size={14}/> Descargar reporte PDF</a>
                            <Link href={`/nutricionista/pacientes/${pacienteId}/perfil-nutricional?step=planificacion`} className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-[11px] font-bold text-ink transition hover:border-brand-green/30 dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-dark"><ArrowLeft size={14}/> Volver al perfil</Link>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 px-5 py-3 text-[10.5px] text-ink-muted dark:text-ink-muted-dark"><Info size={14} className="mt-0.5 shrink-0 text-info"/><span>Los cambios manuales están disponibles mientras el plan se encuentre sugerido o en revisión. La aprobación bloquea su contenido y mantiene la trazabilidad profesional.</span></div>
                </section>

                <section className="card-elevated p-5"><PlanAlimentarioCard plan={plan} recomendacion={recomendacion} puedeGenerar={false} alimentos={alimentos} recetas={recetas} modoDetalle soloPlanificacion /></section>
            </main>
        </AuthenticatedLayout>
    );
}
