import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Box, Button, Card, CardContent, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { PageProps } from '@/types';
import type { HiperandrogenismoData } from './tipos';

interface RegistroHistorial extends HiperandrogenismoData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialHiperandrogenismo({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Historial de hiperandrogenismo</h2>}>
            <Head title={`Historial hiperandrogenismo: ${paciente.nombre_completo}`} />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button component={Link} href={`/endocrinologo/pacientes/${id}/perfil-clinico`} variant="text" startIcon={<ArrowBackIcon />} size="small">
                            Volver al perfil clínico
                        </Button>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                            <Box>
                                <Typography variant="h5" fontWeight={700}>{paciente.nombre_completo}</Typography>
                                <Typography variant="body2" color="text.secondary">CI: {paciente.ci}</Typography>
                            </Box>
                            <Chip label={`${registros.length} registro(s)`} size="small" variant="outlined" />
                        </Stack>
                    </Paper>

                    <Typography variant="h6" fontWeight={600}>Historial de hiperandrogenismo</Typography>

                    {registros.length === 0 ? (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                    No existen registros de hiperandrogenismo para esta paciente.
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
                                            <TableCell>Signos clínicos</TableCell>
                                            <TableCell>Ferriman-Gallwey</TableCell>
                                            <TableCell>Inicio</TableCell>
                                            <TableCell>Progresión</TableCell>
                                            <TableCell>Observaciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {registros.map((r) => (
                                            <TableRow key={r.id_historia_hiperandrogenica} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>{r.created_at ?? '-'}</Typography>
                                                    {r.updated_at && r.updated_at !== r.created_at ? (
                                                        <Typography variant="caption" color="text.secondary">Act: {r.updated_at}</Typography>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                                        {r.acne ? <Chip label={`Acné ${r.acne_grado !== 'no_aplica' ? r.acne_grado : ''}`} size="small" color={r.acne_grado === 'moderado' || r.acne_grado === 'severo' ? 'warning' : 'default'} /> : null}
                                                        {r.hirsutismo ? <Chip label={r.hirsutismo_zona ? `Hirsutismo (${r.hirsutismo_zona})` : 'Hirsutismo'} size="small" color="warning" /> : null}
                                                        {r.alopecia_androgenica ? <Chip label="Alopecia" size="small" color="warning" /> : null}
                                                        {r.seborrea ? <Chip label="Seborrea" size="small" variant="outlined" /> : null}
                                                        {!r.acne && !r.hirsutismo && !r.alopecia_androgenica && !r.seborrea ? <Typography variant="caption" color="text.secondary">Sin signos</Typography> : null}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    {r.puntaje_ferriman_gallwey != null ? (
                                                        <Chip label={`${r.puntaje_ferriman_gallwey} pts`} size="small" color={r.puntaje_ferriman_gallwey >= 8 ? 'error' : 'default'} variant="outlined" />
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>{r.inicio_sintomas ?? '-'}</TableCell>
                                                <TableCell>
                                                    {r.progresion_sintomas ? (
                                                        <Chip label={formatProgresion(r.progresion_sintomas)} size="small" color={r.progresion_sintomas === 'progresivo' ? 'error' : 'default'} variant="outlined" />
                                                    ) : '-'}
                                                </TableCell>
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

function formatProgresion(progresion: string): string {
    const map: Record<string, string> = { estable: 'Estable', progresivo: 'Progresivo', regresivo: 'Regresivo' };
    return map[progresion] ?? progresion;
}
