import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import HistorialPlanesPaciente from '@/Components/paciente/HistorialPlanesPaciente';
import type { HistorialPlanes } from '@/Components/nutricionista/planes/HistorialPlanesNutricionista';

interface Props { paciente: { nombre: string } | null; historialPlanes: HistorialPlanes | null }

export default function Historial({ paciente, historialPlanes }: Props) {
    return (
        <AuthenticatedLayout header={<h2>Historial de Planes</h2>}>
            <Head title="Historial" />
            <main className="mx-auto max-w-7xl">
                <HistorialPlanesPaciente historial={historialPlanes} />
            </main>
        </AuthenticatedLayout>
    );
}
