import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Box, Button, Card, CardContent, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { PageProps } from '@/types';
import type { EvaluacionFisicaData } from './tipos';

interface RegistroHistorial extends EvaluacionFisicaData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialEvaluacionFisica({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Historial evaluación física</h2>}>
            <Head title={`Historial evaluación física: ${paciente.nombre_completo}`} />

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

                    <Typography variant="h6" fontWeight={600}>Historial de evaluación física endocrina</Typography>

                    {registros.length === 0 ? (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                    No existen registros de evaluación física endocrina para esta paciente.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Paper variant="outlined">
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Peso</TableCell>
                                            <TableCell>Talla</TableCell>
                                            <TableCell>IMC</TableCell>
                                            <TableCell>Cintura</TableCell>
                                            <TableCell>ICC</TableCell>
                                            <TableCell>PA</TableCell>
                                            <TableCell>Hallazgos</TableCell>
                                            <TableCell>Observaciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {registros.map((r) => {
                                            const hallazgos: string[] = [];
                                            if (r.acantosis_nigricans) hallazgos.push('Acantosis');
                                            if (r.skin_tags) hallazgos.push('Acrocordones');
                                            if (r.galactorrea) hallazgos.push('Galactorrea');
                                            if (r.hirsutismo_visible) hallazgos.push('Hirsutismo');
                                            if (r.acne_visible) hallazgos.push('Acné');
                                            if (r.alopecia_visible) hallazgos.push('Alopecia');

                                            return (
                                                <TableRow key={r.id_evaluacion_fisica} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={500}>{r.created_at ?? '-'}</Typography>
                                                        {r.updated_at && r.updated_at !== r.created_at ? (
                                                            <Typography variant="caption" color="text.secondary">Act: {r.updated_at}</Typography>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell>{r.peso != null ? `${r.peso} kg` : '-'}</TableCell>
                                                    <TableCell>{r.talla != null ? `${r.talla} m` : '-'}</TableCell>
                                                    <TableCell>
                                                        {r.imc != null ? (
                                                            <Chip label={`${r.imc}`} size="small" color={r.imc >= 25 ? 'warning' : 'default'} variant="outlined" />
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {r.circunferencia_cintura != null ? (
                                                            <Chip label={`${r.circunferencia_cintura} cm`} size="small" color={r.circunferencia_cintura >= 80 ? 'warning' : 'default'} variant="outlined" />
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {r.indice_cintura_cadera != null ? (
                                                            <Chip label={`${r.indice_cintura_cadera}`} size="small" color={r.indice_cintura_cadera >= 0.85 ? 'warning' : 'default'} variant="outlined" />
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {r.presion_sistolica != null || r.presion_diastolica != null ? (
                                                            <Typography variant="body2">
                                                                {r.presion_sistolica ?? '-'}/{r.presion_diastolica ?? '-'}
                                                            </Typography>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                                            {hallazgos.length > 0 ? hallazgos.map(h => <Chip key={h} label={h} size="small" color="warning" />) : <Typography variant="caption" color="text.secondary">Ninguno</Typography>}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 150 }}>
                                                        <Typography variant="caption" noWrap>{r.observaciones ?? '-'}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
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
