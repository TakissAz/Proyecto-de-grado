import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import CitaFormulario from '@/Components/Citas/CitaFormulario';
import type { PacienteOption, ProfesionalOption } from '@/Components/Citas/tipos';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    cita: {
        id_cita: number; id_paciente: number; id_profesional: number;
        fecha_cita: string; hora_inicio: string; hora_fin: string;
        tipo_cita: string; modalidad: string; motivo: string;
        observaciones?: string | null; estado: string;
    };
    pacientes: PacienteOption[];
    profesional: ProfesionalOption;
    tipoProfesional: string;
}

export default function EditarCita({ cita, pacientes, profesional, tipoProfesional }: Props) {
    return (
        <AuthenticatedLayout title="Editar cita">
            <Head title="Editar cita - Nutricionista" />
            <div className="space-y-4">
                <Link href="/nutricionista/citas" className="flex items-center gap-1 text-[11px] font-semibold text-ink-muted hover:text-ink transition-colors dark:text-ink-muted-dark dark:hover:text-ink-dark">
                    <ArrowLeft size={12} strokeWidth={1.8} /> Volver
                </Link>
                <div className="card-elevated p-5">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/15">
                            <CalendarClock size={15} strokeWidth={1.8} className="text-brand-orange" />
                        </div>
                        <h2 className="text-[15px] font-bold text-ink dark:text-ink-dark">Editar cita #{cita.id_cita}</h2>
                    </div>
                    <CitaFormulario
                        pacientes={pacientes}
                        profesional={profesional}
                        tipoProfesional={tipoProfesional}
                        rutaStore={`/nutricionista/citas/${cita.id_cita}`}
                        rutaBloques="/nutricionista/citas/bloques"
                        inicial={cita}
                        metodo="put"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
