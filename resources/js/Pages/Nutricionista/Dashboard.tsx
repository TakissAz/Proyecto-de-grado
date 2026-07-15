import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EstadisticasNutri from './Dashboard/EstadisticasNutri';
import DistribucionPacientes from './Dashboard/DistribucionPacientes';
import ProximasCitasNutri from './Dashboard/ProximasCitasNutri';
import AccesosRapidosNutri from './Dashboard/AccesosRapidosNutri';
import type { PageProps } from '@/types';

interface EstadisticasDashboard {
    total_pacientes: number;
    total_planes: number;
    total_controles: number;
}

interface Props extends PageProps {
    estadisticas?: EstadisticasDashboard;
}

export default function Dashboard({ estadisticas }: Props) {
    const tp = estadisticas?.total_pacientes ?? 0;
    const tpl = estadisticas?.total_planes ?? 0;
    const tc = estadisticas?.total_controles ?? 0;

    return (
        <AuthenticatedLayout title="Panel Nutricional">
            <Head title="Nutricionista" />

            <div className="space-y-4">
                {/* Metricas */}
                <EstadisticasNutri
                    totalPacientes={tp}
                    totalPlanes={tpl}
                    totalControles={tc}
                />

                {/* Fila: Distribucion + Accesos rapidos */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <DistribucionPacientes total={tp || 128} />
                    </div>
                    <div className="lg:col-span-2">
                        <AccesosRapidosNutri />
                    </div>
                </div>

                {/* Tabla de proximos controles */}
                <ProximasCitasNutri />
            </div>
        </AuthenticatedLayout>
    );
}
