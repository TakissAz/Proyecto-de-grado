import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <Box sx={{ padding: 3 }}>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                >
                    Sistema PMOS
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ marginBottom: 3 }}
                >
                    Plataforma web para la gestión clínica, nutricional y seguimiento de pacientes.
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
                            <Typography variant="h6">
                                Pacientes
                            </Typography>

                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 700 }}
                            >
                                0
                            </Typography>

                            <Typography color="text.secondary">
                                Pacientes registradas
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Planes
                            </Typography>

                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 700 }}
                            >
                                0
                            </Typography>

                            <Typography color="text.secondary">
                                Planes nutricionales generados
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Seguimiento
                            </Typography>

                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 700 }}
                            >
                                0
                            </Typography>

                            <Typography color="text.secondary">
                                Controles registrados
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ marginTop: 4 }}>
                    <Button variant="contained" startIcon={<AddIcon />}>
                        Crear paciente
                    </Button>
                </Box>
            </Box>
        </AuthenticatedLayout>
    );
}