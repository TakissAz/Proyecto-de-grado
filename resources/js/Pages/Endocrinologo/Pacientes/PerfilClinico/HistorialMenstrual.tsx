import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { PageProps } from '@/types';
import type { HistoriaMenstrualData } from './tipos';

interface RegistroHistorial extends HistoriaMenstrualData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: {
        id_paciente: number;
        nombre_completo: string;
        ci: string;
    };
    registros: RegistroHistorial[];
}

export default function HistorialMenstrual({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Historial menstrual
                </h2>
            }
        >
            <Head title={`Historial menstrual: ${paciente.nombre_completo}`} />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={3}>
                    {/* Navegación */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button
                            component={Link}
                            href={`/endocrinologo/pacientes/${id}/perfil-clinico`}
                            variant="text"
                            startIcon={<ArrowBackIcon />}
                            size="small"
                        >
                            Volver al perfil clínico
                        </Button>
                    </Box>

                    {/* Encabezado */}
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                            <Box>
                                <Typography variant="h5" fontWeight={700}>{paciente.nombre_completo}</Typography>
                                <Typography variant="body2" color="text.secondary">CI: {paciente.ci}</Typography>
                            </Box>
                            <Chip label={`${registros.length} registro(s)`} size="small" variant="outlined" />
                        </Stack>
                    </Paper>

                    <Typography variant="h6" fontWeight={600}>Historial de historia menstrual</Typography>

                    {/* Tabla o estado vacío */}
                    {registros.length === 0 ? (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                    No existen registros de historia menstrual para esta paciente.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Paper variant="outlined">
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Fecha registro</TableCell>
                                            <TableCell>Regularidad</TableCell>
                                            <TableCell>Duración</TableCell>
                                            <TableCell>Intervalo</TableCell>
                                            <TableCell>Última menstruación</TableCell>
                                            <TableCell>Hallazgos</TableCell>
                                            <TableCell>Progesterona</TableCell>
                                            <TableCell>Observaciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {registros.map((r) => (
                                            <TableRow key={r.id_historia_menstrual} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>{r.created_at ?? '-'}</Typography>
                                                    {r.updated_at && r.updated_at !== r.created_at ? (
                                                        <Typography variant="caption" color="text.secondary">Act: {r.updated_at}</Typography>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={formatRegularidad(r.regularidad_ciclo)}
                                                        size="small"
                                                        color={r.regularidad_ciclo === 'irregular' || r.regularidad_ciclo === 'ausente' ? 'warning' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>{r.duracion_ciclo_dias ? `${r.duracion_ciclo_dias} d` : '-'}</TableCell>
                                                <TableCell>{r.intervalo_entre_ciclos_dias ? `${r.intervalo_entre_ciclos_dias} d` : '-'}</TableCell>
                                                <TableCell>{r.fecha_ultima_menstruacion ?? '-'}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                                        {r.amenorrea ? <Chip label="Amenorrea" size="small" color="warning" /> : null}
                                                        {r.oligomenorrea ? <Chip label="Oligomenorrea" size="small" color="warning" /> : null}
                                                        {r.sospecha_anovulacion ? <Chip label="Anovulación" size="small" color="warning" /> : null}
                                                        {r.confirma_anovulacion_por_progesterona ? <Chip label="Anov. confirmada" size="small" color="error" /> : null}
                                                        {r.sangrado_abundante ? <Chip label="Sangrado" size="small" variant="outlined" /> : null}
                                                        {r.dolor_menstrual ? <Chip label="Dolor" size="small" variant="outlined" /> : null}
                                                        {!r.amenorrea && !r.oligomenorrea && !r.sospecha_anovulacion && !r.confirma_anovulacion_por_progesterona ? <Typography variant="caption" color="text.secondary">Sin hallazgos</Typography> : null}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>{r.progesterona_lutea ? `${r.progesterona_lutea} ng/mL` : '-'}</TableCell>
                                                <TableCell sx={{ maxWidth: 200 }}>
                                                    <Typography variant="caption" noWrap>{r.observaciones ?? '-'}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </Stack>
            </Box>
        </AuthenticatedLayout>
    );
}

function formatRegularidad(valor?: string | null): string {
    const map: Record<string, string> = { regular: 'Regular', irregular: 'Irregular', ausente: 'Ausente' };
    return map[valor ?? ''] ?? '-';
}
