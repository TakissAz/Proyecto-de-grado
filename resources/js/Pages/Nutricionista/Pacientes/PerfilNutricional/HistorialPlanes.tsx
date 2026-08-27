import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HistorialPlanesNutricionista, { type HistorialPlanes } from '@/Components/nutricionista/planes/HistorialPlanesNutricionista';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarRange, FileClock } from 'lucide-react';
import type { PacienteNutricional } from './tipos';

interface Props {
    paciente: PacienteNutricional;
    historialPlanes: HistorialPlanes;
}

export default function HistorialPlanes({ paciente, historialPlanes }: Props) {
    const nombre = [paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno].filter(Boolean).join(' ');

    return (
        <AuthenticatedLayout title="Historial de planes alimentarios">
            <Head title={`Historial de planes - ${nombre}`} />
            <main className="space-y-5">
                <section className="card-elevated overflow-hidden">
                    <div className="relative h-20 bg-gradient-to-r from-brand-green/15 via-brand-green/5 to-transparent dark:from-brand-green/[0.09] dark:via-brand-green/[0.03] dark:to-transparent">
                        <Link
                            href={route('nutricionista.pacientes.perfil-nutricional', paciente.id_paciente)}
                            className="absolute left-5 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-ink shadow-sm backdrop-blur-sm hover:bg-white dark:bg-black/40 dark:text-ink-dark dark:hover:bg-black/60"
                        >
                            <ArrowLeft size={12} /> Volver al perfil nutricional
                        </Link>
                    </div>
                    <div className="-mt-5 flex flex-wrap items-end gap-3 px-5 pb-5">
                        <div className="rounded-full border-[3px] border-surface-card shadow-md dark:border-surface-card-dark">
                            <AvatarIniciales nombre={nombre} size={52} />
                        </div>
                        <div className="min-w-0 flex-1 pb-0.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Expediente nutricional</p>
                            <h1 className="truncate text-[17px] font-bold text-ink dark:text-ink-dark">{nombre}</h1>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">CI: {paciente.ci || 'Sin registro'}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/[0.05] px-4 py-2.5">
                            <CalendarRange size={15} className="text-brand-green-dark dark:text-brand-green" />
                            <div><b className="block text-[13px] text-ink dark:text-ink-dark">{historialPlanes.total_planes}</b><span className="text-[9.5px] text-ink-muted">planes registrados</span></div>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-surface-border bg-black/[0.015] px-4 py-3 dark:border-surface-border-dark dark:bg-white/[0.02]">
                    <div className="flex items-start gap-2.5">
                        <FileClock size={16} className="mt-0.5 shrink-0 text-brand-orange" />
                        <div>
                            <h2 className="text-[12px] font-bold text-ink dark:text-ink-dark">Historial clínico de planificación</h2>
                            <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
                                Aquí puedes revisar cada plan entregado, su recomendación experta de origen, metas nutricionales, recetas, adherencia y cambios respecto al periodo anterior.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="card-elevated p-5">
                    <HistorialPlanesNutricionista historial={historialPlanes} />
                </section>
            </main>
        </AuthenticatedLayout>
    );
}
