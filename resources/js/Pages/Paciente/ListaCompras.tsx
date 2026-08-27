import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ListaComprasPacienteCard, { type ListaCompras } from '@/Components/paciente/ListaComprasPacienteCard';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ShoppingCart } from 'lucide-react';

interface Props { paciente: { nombre: string } | null; planAlimentario: { nombre_plan: string } | null; listaCompras: ListaCompras | null }

export default function ListaComprasPage({ paciente, planAlimentario, listaCompras }: Props) {
    return <AuthenticatedLayout title="Lista de compras">
        <Head title="Lista de compras" />
        <main className="mx-auto max-w-7xl space-y-5">
            <header className="rounded-2xl border border-brand-orange/20 bg-brand-orange/[0.035] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange"><ShoppingCart size={19} /></div><div><p className="text-[9.5px] font-bold uppercase tracking-wider text-brand-orange">Organización semanal</p><h1 className="mt-0.5 text-[18px] font-bold text-ink dark:text-ink-dark">Mi lista de compras</h1><p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark">Ingredientes calculados desde {planAlimentario?.nombre_plan || 'tu plan alimentario vigente'}.</p></div></div><Link href={route('paciente.mi-plan')} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-orange/25 px-3 py-2 text-[10.5px] font-semibold text-brand-orange hover:bg-brand-orange/5">Ver plan <ArrowRight size={12} /></Link></div></header>
            <ListaComprasPacienteCard lista={listaCompras} />
        </main>
    </AuthenticatedLayout>;
}
