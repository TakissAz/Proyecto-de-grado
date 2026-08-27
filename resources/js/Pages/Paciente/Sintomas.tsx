import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SeguimientoSintomasCard, { type SeguimientoSintomas } from '@/Components/paciente/SeguimientoSintomasCard';
import { Head } from '@inertiajs/react';
import { HeartPulse } from 'lucide-react';

interface Props { paciente: { nombre: string } | null; seguimientoSintomas: SeguimientoSintomas | null }

export default function Sintomas({ paciente, seguimientoSintomas }: Props) {
    return <AuthenticatedLayout title="Seguimiento de síntomas">
        <Head title="Mis síntomas" />
        <main className="mx-auto max-w-7xl space-y-5">
            <header className="rounded-2xl border border-category-fruits/15 bg-category-fruits/[0.025] p-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-category-fruits/10 text-category-fruits"><HeartPulse size={19} /></div><div><p className="text-[9.5px] font-bold uppercase tracking-wider text-category-fruits">Bienestar y síntomas</p><h1 className="mt-0.5 text-[18px] font-bold text-ink dark:text-ink-dark">Registro de síntomas PMOS y RI</h1><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">{paciente?.nombre ? `${paciente.nombre}, registra ` : 'Registra '}cómo te sientes para apoyar el seguimiento profesional.</p></div></div></header>
            <SeguimientoSintomasCard seguimiento={seguimientoSintomas} />
        </main>
    </AuthenticatedLayout>;
}
