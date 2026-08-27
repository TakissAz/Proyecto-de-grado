import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProgresoPacienteCard, { type Progreso } from '@/Components/paciente/ProgresoPacienteCard';
import { Head } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';

interface Props { paciente: { nombre: string } | null; progresoPaciente: Progreso | null }

export default function ProgresoPage({ paciente, progresoPaciente }: Props) {
    return <AuthenticatedLayout title="Mi progreso">
        <Head title="Mi progreso" />
        <main className="mx-auto max-w-7xl space-y-5">
            <Cabecera icono={<TrendingUp size={19} />} titulo="Mi progreso" descripcion="Revisa la evolución de tus medidas, adherencia y avances nutricionales." nombre={paciente?.nombre} />
            <ProgresoPacienteCard progreso={progresoPaciente} />
        </main>
    </AuthenticatedLayout>;
}

function Cabecera({ icono, titulo, descripcion, nombre }: { icono: React.ReactNode; titulo: string; descripcion: string; nombre?: string }) {
    return <header className="rounded-2xl border border-brand-green/20 bg-brand-green/[0.035] p-5 dark:bg-brand-green/[0.045]"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">{icono}</div><div><p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-green-dark dark:text-brand-green">Portal del paciente</p><h1 className="mt-0.5 text-[18px] font-bold text-ink dark:text-ink-dark">{titulo}</h1><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">{nombre ? `${nombre}, ` : ''}{descripcion}</p></div></div></header>;
}
