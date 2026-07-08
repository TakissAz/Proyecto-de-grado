import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Panel Endocrinológico
                </h2>
            }
        >
            <Head title="Endocrinólogo" />

            <Box sx={{ padding: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
                    Módulo Endocrinólogo
                </Typography>

                <Typography color="text.secondary" sx={{ marginBottom: 3 }}>
                    Gestión clínica endocrinológica de pacientes con PMOS y resistencia a la insulina.
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
                            <Typography variant="h6">Pacientes</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                0
                            </Typography>
                            <Typography color="text.secondary">
                                Pacientes registradas
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6">Consultas</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                0
                            </Typography>
                            <Typography color="text.secondary">
                                Consultas endocrinológicas
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6">Diagnósticos</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                0
                            </Typography>
                            <Typography color="text.secondary">
                                PMOS / RI registrados
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </AuthenticatedLayout>
    );
}