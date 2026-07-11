/* global route */
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    EncabezadoDashboard,
    SeccionDashboard,
    TarjetaAccion,
    TarjetaEstadistica,
} from '@/Components/Dashboard';
import { Head, Link } from '@inertiajs/react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

interface EstadisticasDashboard {
    total_pacientes: number;
    total_planes: number;
    total_controles: number;
}

interface Props {
    estadisticas?: EstadisticasDashboard;
}

/**
 * Dashboard del módulo Nutricional.
 * Muestra estadísticas de seguimiento y acciones de navegación.
 *
 * Las estadísticas son opcionales para no romper si el backend
 * todavía no las envía (backward-compatible).
 */
export default function Dashboard({ estadisticas }: Props) {
    const totalPacientes = estadisticas?.total_pacientes ?? 0;
    const totalPlanes = estadisticas?.total_planes ?? 0;
    const totalControles = estadisticas?.total_controles ?? 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Panel Nutricional
                </h2>
            }
        >
            <Head title="Nutricionista" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <EncabezadoDashboard
                    titulo="Módulo Nutricional"
                    descripcion="Seguimiento nutricional de pacientes con PMOS y resistencia a la insulina."
                    modulo="Nutricionista"
                    acciones={
                        <Button
                            component={Link}
                            href={route('nutricionista.pacientes.create')}
                            variant="contained"
                            startIcon={<AddIcon />}
                            size="small"
                        >
                            Registrar paciente
                        </Button>
                    }
                />

                <SeccionDashboard titulo="Resumen nutricional" columnas={3}>
                    <TarjetaEstadistica
                        titulo="Pacientes"
                        descripcion="Pacientes en seguimiento nutricional"
                        valor={totalPacientes}
                        Icono={GroupsIcon}
                    />

                    <TarjetaEstadistica
                        titulo="Planes"
                        descripcion="Planes nutricionales generados"
                        valor={totalPlanes}
                        Icono={RestaurantMenuIcon}
                        color="success.main"
                    />

                    <TarjetaEstadistica
                        titulo="Controles"
                        descripcion="Controles de seguimiento registrados"
                        valor={totalControles}
                        Icono={MonitorHeartIcon}
                        color="warning.main"
                    />
                </SeccionDashboard>

                <SeccionDashboard titulo="Accesos rápidos" columnas={2}>
                    <TarjetaAccion
                        titulo="Pacientes"
                        descripcion="Gestiona registros, estados y el seguimiento nutricional de tus pacientes."
                        Icono={GroupsIcon}
                        textoCta="Abrir pacientes"
                        href={route('nutricionista.pacientes.index')}
                    />

                    <TarjetaAccion
                        titulo="Nueva paciente"
                        descripcion="Registra una nueva paciente en el módulo nutricional del sistema."
                        Icono={AddIcon}
                        textoCta="Registrar paciente"
                        href={route('nutricionista.pacientes.create')}
                        variante="outlined"
                    />
                </SeccionDashboard>
            </Box>
        </AuthenticatedLayout>
    );
}
