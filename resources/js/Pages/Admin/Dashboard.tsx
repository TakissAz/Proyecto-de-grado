import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';

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

            <Box sx={{ padding: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
                    Módulo Administrador
                </Typography>

                <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
                    Gestión de usuarios, roles y trazabilidad de actividad del sistema.
                </Typography>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(3, 1fr)',
                        },
                        gap: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Stack spacing={2}>
                                <PeopleIcon fontSize="large" />

                                <Box>
                                    <Typography variant="h6">
                                        Usuarios
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Crear, editar, activar, inactivar y bloquear usuarios.
                                    </Typography>
                                </Box>

                                <Button
                                    component={Link}
                                    href="/admin/users"
                                    variant="contained"
                                >
                                    Gestionar usuarios
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Stack spacing={2}>
                                <HistoryIcon fontSize="large" />

                                <Box>
                                    <Typography variant="h6">
                                        Actividad
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Revisión de acciones importantes registradas en el sistema.
                                    </Typography>
                                </Box>

                                <Button variant="outlined" disabled>
                                    Próximamente
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Stack spacing={2}>
                                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                    PMOS
                                </Typography>

                                <Box>
                                    <Typography variant="h6">
                                        Sistema clínico
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Base preparada para los módulos endocrinológico y nutricional.
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </AuthenticatedLayout>
    );
}