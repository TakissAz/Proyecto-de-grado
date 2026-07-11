import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EncabezadoDashboard } from '@/Components/Dashboard';
import { Head, usePage } from '@inertiajs/react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

interface DatosPaciente {
    nombre_completo?: string | null;
    ci?: string | null;
    fecha_nacimiento?: string | null;
    telefono?: string | null;
    estado?: string | null;
}

interface Props {
    paciente?: DatosPaciente;
}

/**
 * Dashboard del módulo Paciente.
 * Vista de solo lectura con información personal y estado de atención.
 *
 * El prop `paciente` es opcional para no romper si el backend
 * todavía no lo envía (backward-compatible).
 */
export default function Dashboard({ paciente }: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const nombreUsuario = paciente?.nombre_completo ?? auth?.user?.name ?? 'Paciente';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Mi panel
                </h2>
            }
        >
            <Head title="Mi panel" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <EncabezadoDashboard
                    titulo={`Hola, ${nombreUsuario}`}
                    descripcion="Bienvenida al sistema clínico PMOS. Aquí encontrarás tu información médica y de seguimiento."
                    modulo="Paciente"
                />

                <Alert
                    severity="info"
                    icon={<InfoOutlinedIcon />}
                    sx={{ mb: 3 }}
                >
                    Tu módulo de seguimiento estará disponible próximamente. Si tienes alguna consulta, comunícate con tu médico tratante.
                </Alert>

                {paciente ? (
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <PersonOutlineIcon color="primary" />
                                <Typography variant="h6" fontWeight={700}>
                                    Mis datos
                                </Typography>
                            </Stack>

                            <Divider sx={{ mb: 2 }} />

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                                    gap: 2,
                                }}
                            >
                                {paciente.ci ? (
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">CI</Typography>
                                        <Typography>{paciente.ci}</Typography>
                                    </Box>
                                ) : null}

                                {paciente.fecha_nacimiento ? (
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Fecha de nacimiento</Typography>
                                        <Typography>{paciente.fecha_nacimiento}</Typography>
                                    </Box>
                                ) : null}

                                {paciente.telefono ? (
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Teléfono</Typography>
                                        <Typography>{paciente.telefono}</Typography>
                                    </Box>
                                ) : null}

                                {paciente.estado ? (
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" display="block">Estado</Typography>
                                        <Chip
                                            label={paciente.estado}
                                            color={paciente.estado === 'activo' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Box>
                                ) : null}
                            </Box>
                        </CardContent>
                    </Card>
                ) : null}
            </Box>
        </AuthenticatedLayout>
    );
}
