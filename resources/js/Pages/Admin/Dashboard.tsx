/* global route */
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    EncabezadoDashboard,
    SeccionDashboard,
    TarjetaAccion,
} from '@/Components/Dashboard';
import { Head } from '@inertiajs/react';
import { Box } from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Panel de Administración
                </h2>
            }
        >
            <Head title="Administrador" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <EncabezadoDashboard
                    titulo="Panel de Administración"
                    descripcion="Gestión de usuarios, auditoría clínica y configuración del sistema."
                    modulo="Administrador"
                />

                <SeccionDashboard titulo="Gestión del sistema" columnas={3}>
                    <TarjetaAccion
                        titulo="Usuarios"
                        descripcion="Crear, editar, activar, inactivar y bloquear usuarios del sistema."
                        Icono={PeopleIcon}
                        textoCta="Gestionar usuarios"
                        href={route('admin.users.index')}
                        variante="contained"
                    />

                    <TarjetaAccion
                        titulo="Auditoría de pacientes"
                        descripcion="Revisar origen, creador, editor y flujo clínico de cada paciente."
                        Icono={AssignmentIndIcon}
                        textoCta="Ver pacientes"
                        href={route('admin.auditoria.pacientes')}
                        variante="contained"
                    />

                    <TarjetaAccion
                        titulo="Actividad del sistema"
                        descripcion="Revisar eventos y cambios recientes registrados en el módulo clínico."
                        Icono={HistoryIcon}
                        textoCta="Ver actividad"
                        href={route('admin.auditoria.actividad')}
                        variante="outlined"
                    />
                </SeccionDashboard>
            </Box>
        </AuthenticatedLayout>
    );
}
