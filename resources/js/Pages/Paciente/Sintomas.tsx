import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SeguimientoSintomasCard, { type HistorialSintomasPaginado, type SeguimientoSintomas } from '@/Components/paciente/SeguimientoSintomasCard';
import { Head } from '@inertiajs/react';
import { HeartPulse, MoonStar, Sparkles, SunMedium } from 'lucide-react';

interface Props { paciente: { nombre: string } | null; seguimientoSintomas: SeguimientoSintomas | null; historialSintomas: HistorialSintomasPaginado | null }

export default function Sintomas({ paciente, seguimientoSintomas, historialSintomas }: Props) {
    return <AuthenticatedLayout title="Seguimiento de síntomas">
        <Head title="Mis síntomas" />
        <main className="mx-auto w-full max-w-[1280px] space-y-5 px-4 sm:px-6 lg:px-8">
            <header className="relative overflow-hidden rounded-3xl border border-category-dairy/25 bg-gradient-to-br from-category-dairy/[.16] via-category-fruits/[.045] to-brand-green/[.06] p-5 dark:from-category-dairy/[.2] dark:via-category-fruits/[.08] dark:to-brand-green/[.08]"><div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-category-dairy/15 blur-2xl"/><div className="relative flex flex-wrap items-center justify-between gap-5"><div className="flex items-start gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-category-dairy text-white shadow-lg shadow-category-dairy/20"><HeartPulse size={22} /></div><div><p className="text-[9.5px] font-bold uppercase tracking-[.15em] text-category-dairy">Mi bienestar</p><h1 className="mt-0.5 text-[20px] font-bold text-ink dark:text-ink-dark">Tu check-in del día</h1><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">{paciente?.nombre ? `${paciente.nombre}, ` : ''}un momento para escucharte y ayudar a personalizar tu plan.</p></div></div><div className="flex gap-2"><Mini icon={SunMedium} texto="Tu día"/><Mini icon={MoonStar} texto="Tu descanso"/><Mini icon={Sparkles} texto="A tu ritmo"/></div></div></header>
            <SeguimientoSintomasCard seguimiento={seguimientoSintomas} historial={historialSintomas} />
        </main>
    </AuthenticatedLayout>;
}

function Mini({ icon: Icon, texto }: { icon: typeof SunMedium; texto: string }) { return <div className="hidden items-center gap-1.5 rounded-xl border border-white/15 bg-surface-card/60 px-3 py-2 text-[9px] font-bold text-ink-muted backdrop-blur dark:bg-surface-card-dark/60 dark:text-ink-muted-dark sm:flex"><Icon size={13} className="text-category-dairy"/>{texto}</div>; }
