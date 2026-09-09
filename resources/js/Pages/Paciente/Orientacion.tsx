import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import RetroalimentacionesNutricionistaCard, { type RetroalimentacionesPaciente } from '@/Components/paciente/RetroalimentacionesNutricionistaCard';

interface Props { paciente: { nombre: string } | null; retroalimentaciones: RetroalimentacionesPaciente | null }

export default function Orientacion({ retroalimentaciones }: Props) {
    return <AuthenticatedLayout header={<h2>Habla con tu nutricionista</h2>}>
        <Head title="Habla con tu nutricionista" />
        <main className="mx-auto max-w-6xl">
            <RetroalimentacionesNutricionistaCard retroalimentaciones={retroalimentaciones} />
        </main>
    </AuthenticatedLayout>;
}
