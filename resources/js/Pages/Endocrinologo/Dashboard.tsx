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
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';

interface EstadisticasDashboard {
    total_pacientes: number;
    total_consultas: number;
    total_diagnosticos: number;
}

interface Props {
    estadisticas?: EstadisticasDashboard;
}

/**
 * Dashboard del módulo Endocrinológico.
 * Muestra estadísticas clínicas y acciones rápidas de navegación.
 *
 * Las estadísticas son opcionales para no romper si el backend
 * todavía no las envía (backward-compatible).
 */
export default function Dashboard({ estadisticas }: Props) {
    const totalPacientes = estadisticas?.total_pacientes ?? 0;
    const totalConsultas = estadisticas?.total_consultas ?? 0;
    const totalDiagnosticos = estadisticas?.total_diagnosticos ?? 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Panel Endocrinológico
                </h2>
            }
        >
            <Head title="Endocrinólogo" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <EncabezadoDashboard
                    titulo="Módulo Endocrinológico"
                    descripcion="Gestión clínica endocrinológica de pacientes con PMOS y resistencia a la insulina."
                    modulo="Endocrinólogo"
                    acciones={
                        <>
                            <Button
                                component={Link}
                                href={route('endocrinologo.pacientes.create')}
                                variant="contained"
                                startIcon={<AddIcon />}
                                size="small"
                            >
                                Registrar paciente
                            </Button>

                            <Button
                                component={Link}
                                href={route('endocrinologo.pacientes.index')}
                                variant="outlined"
                                startIcon={<PeopleIcon />}
                                size="small"
                            >
                                Ver pacientes
                            </Button>
                        </>
                    }
                />

                <SeccionDashboard titulo="Resumen clínico" columnas={3}>
                    <TarjetaEstadistica
                        titulo="Pacientes"
                        descripcion="Pacientes registradas en el sistema"
                        valor={totalPacientes}
                        Icono={PeopleIcon}
                    />

                    <TarjetaEstadistica
                        titulo="Consultas"
                        descripcion="Consultas endocrinológicas realizadas"
                        valor={totalConsultas}
                        Icono={AssignmentIcon}
                        color="secondary.main"
                    />

                    <TarjetaEstadistica
                        titulo="Diagnósticos"
                        descripcion="PMOS / Resistencia a la insulina"
                        valor={totalDiagnosticos}
                        Icono={LocalHospitalIcon}
                        color="error.main"
                    />
                </SeccionDashboard>

                <SeccionDashboard titulo="Accesos rápidos" columnas={2}>
                    <TarjetaAccion
                        titulo="Pacientes"
                        descripcion="Gestiona registros, estados y el historial clínico completo de cada paciente."
                        Icono={PeopleIcon}
                        textoCta="Abrir pacientes"
                        href={route('endocrinologo.pacientes.index')}
                    />

                    <TarjetaAccion
                        titulo="Nueva consulta"
                        descripcion="Registra una nueva paciente e inicia el proceso de consulta endocrinológica."
                        Icono={AddIcon}
                        textoCta="Nueva paciente"
                        href={route('endocrinologo.pacientes.create')}
                        variante="outlined"
                    />
                </SeccionDashboard>
            </Box>
        </AuthenticatedLayout>
    );
}
