import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CitasPacienteCard, { type CitasPaciente } from '@/Components/paciente/CitasPacienteCard';

interface Props { paciente: { nombre: string } | null; citasPaciente: CitasPaciente | null }

export default function Citas({ paciente, citasPaciente }: Props) {
    return (
        <AuthenticatedLayout header={<h2>Mis Citas</h2>}>
            <Head title="Citas" />
            <main className="mx-auto max-w-7xl">
                <CitasPacienteCard citas={citasPaciente} />
            </main>
        </AuthenticatedLayout>
    );
}
