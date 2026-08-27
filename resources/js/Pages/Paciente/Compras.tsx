import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ListaComprasPacienteCard, { type ListaCompras } from '@/Components/paciente/ListaComprasPacienteCard';
import { ShoppingBasket } from 'lucide-react';

interface Props { paciente: { nombre: string } | null; listaCompras: ListaCompras | null }

export default function Compras({ paciente, listaCompras }: Props) {
    return (
        <AuthenticatedLayout header={<h2>Lista de Compras</h2>}>
            <Head title="Lista de Compras" />
            <main className="mx-auto max-w-7xl space-y-5">
                {!listaCompras ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border py-12 text-center dark:border-surface-border-dark">
                        <ShoppingBasket size={38} strokeWidth={1.2} className="text-brand-orange/40" />
                        <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Sin lista de compras disponible</h2>
                        <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark max-w-sm">La lista se generará automáticamente cuando tengas un plan alimentario activo.</p>
                    </div>
                ) : (
                    <ListaComprasPacienteCard lista={listaCompras} />
                )}
            </main>
        </AuthenticatedLayout>
    );
}
