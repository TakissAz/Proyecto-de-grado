import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import CitaFormulario from '@/Components/Citas/CitaFormulario';
import type { PacienteOption, ProfesionalOption } from '@/Components/Citas/tipos';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    pacientes: PacienteOption[];
    profesional: ProfesionalOption;
    tipoProfesional: string;
}

export default function CrearCita({ pacientes, profesional, tipoProfesional }: Props) {
    return (
        <AuthenticatedLayout title="Nueva cita">
            <Head title="Nueva cita - Nutricionista" />
            <div className="space-y-4">
                <Link href="/nutricionista/citas" className="flex items-center gap-1 text-[11px] font-semibold text-ink-muted hover:text-ink transition-colors dark:text-ink-muted-dark dark:hover:text-ink-dark">
                    <ArrowLeft size={12} strokeWidth={1.8} /> Volver
                </Link>
                <div className="card-elevated p-5">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green/15">
                            <CalendarClock size={15} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                        </div>
                        <h2 className="text-[15px] font-bold text-ink dark:text-ink-dark">Programar nueva cita</h2>
                    </div>
                    <CitaFormulario
                        pacientes={pacientes}
                        profesional={profesional}
                        tipoProfesional={tipoProfesional}
                        rutaStore="/nutricionista/citas"
                        rutaBloques="/nutricionista/citas/bloques"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
