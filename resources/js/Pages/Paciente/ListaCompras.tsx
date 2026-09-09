import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ListaComprasPacienteCard, { type ListaCompras } from '@/Components/paciente/ListaComprasPacienteCard';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarClock, ShoppingCart } from 'lucide-react';

interface Props { paciente: { nombre: string } | null; planAlimentario: { nombre_plan: string } | null; listaCompras: ListaCompras | null }

export default function ListaComprasPage({ paciente, planAlimentario, listaCompras }: Props) {
    if (!listaCompras) return <AuthenticatedLayout title="Lista de compras">
        <Head title="Lista de compras" />
        <main className="mx-auto max-w-3xl py-10">
            <section className="rounded-2xl border border-dashed border-brand-orange/25 bg-brand-orange/[0.03] px-6 py-14 text-center dark:bg-brand-orange/[0.05]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange"><CalendarClock size={22} /></div>
                <h1 className="mt-4 text-[18px] font-bold text-ink dark:text-ink-dark">No hay compras pendientes para hoy</h1>
                <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">La lista se habilita únicamente cuando tengas un plan alimentario vigente. Así evitamos mostrar ingredientes de semanas anteriores o de un plan que aún no comenzó.</p>
                <Link href={route('paciente.mi-plan')} className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-4 py-2.5 text-[11px] font-bold text-white hover:bg-brand-green-dark">Ver mi plan <ArrowRight size={13} /></Link>
            </section>
        </main>
    </AuthenticatedLayout>;

    return <AuthenticatedLayout title="Lista de compras">
        <Head title="Lista de compras" />
        <main className="mx-auto max-w-7xl space-y-5">
            <header className="rounded-2xl border border-brand-orange/20 bg-brand-orange/[0.035] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange"><ShoppingCart size={19} /></div><div><p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-orange">Organización semanal</p><h1 className="mt-0.5 text-[18px] font-bold text-ink dark:text-ink-dark">Mi lista de compras</h1><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">Ingredientes del plan vigente: {planAlimentario?.nombre_plan}.</p></div></div><Link href={route('paciente.mi-plan')} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-orange/25 px-3 py-2 text-[10.5px] font-semibold text-brand-orange hover:bg-brand-orange/5">Ver plan <ArrowRight size={12} /></Link></div></header>
            <ListaComprasPacienteCard lista={listaCompras} />
        </main>
    </AuthenticatedLayout>;
}
