import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Box, Button, Card, CardContent, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { PageProps } from '@/types';
import type { AntecedentesData } from './tipos';

interface RegistroHistorial extends AntecedentesData {
    estado?: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    registros: RegistroHistorial[];
}

export default function HistorialAntecedentes({ paciente, registros }: Props) {
    const id = paciente.id_paciente;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Historial de antecedentes</h2>}>
            <Head title={`Historial antecedentes: ${paciente.nombre_completo}`} />

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

                    <Typography variant="h6" fontWeight={600}>Historial de antecedentes endocrino-metabólicos</Typography>

                    {registros.length === 0 ? (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                    No existen registros de antecedentes endocrino-metabólicos para esta paciente.
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
                                            <TableCell>Personales</TableCell>
                                            <TableCell>Familiares</TableCell>
                                            <TableCell>Medicamentos</TableCell>
                                            <TableCell>Otros med.</TableCell>
                                            <TableCell>Observaciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {registros.map((r) => {
                                            const personales = [
                                                r.diabetes_personal && 'DM',
                                                r.hipertension_personal && 'HTA',
                                                r.dislipidemia_personal && 'Dislip.',
                                                r.enfermedad_tiroidea && 'Tiroides',
                                                r.hiperprolactinemia_previa && 'Hiperprol.',
                                            ].filter(Boolean) as string[];

                                            const familiares = [
                                                r.diabetes_familiar && 'DM fam.',
                                                r.hipertension_familiar && 'HTA fam.',
                                                r.dislipidemia_familiar && 'Dislip. fam.',
                                            ].filter(Boolean) as string[];

                                            const meds = [
                                                r.uso_metformina && 'Metformina',
                                                r.uso_anticonceptivos && 'ACOs',
                                                r.uso_corticoides && 'Corticoides',
                                            ].filter(Boolean) as string[];

                                            return (
                                                <TableRow key={r.id_antecedente} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={500}>{r.created_at ?? '-'}</Typography>
                                                        {r.updated_at && r.updated_at !== r.created_at ? (
                                                            <Typography variant="caption" color="text.secondary">Act: {r.updated_at}</Typography>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                                            {personales.length > 0 ? personales.map(p => <Chip key={p} label={p} size="small" color="warning" />) : <Typography variant="caption" color="text.secondary">Ninguno</Typography>}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                                            {familiares.length > 0 ? familiares.map(f => <Chip key={f} label={f} size="small" variant="outlined" />) : <Typography variant="caption" color="text.secondary">Ninguno</Typography>}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                                            {meds.length > 0 ? meds.map(m => <Chip key={m} label={m} size="small" color="primary" variant="outlined" />) : <Typography variant="caption" color="text.secondary">Ninguno</Typography>}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 150 }}>
                                                        <Typography variant="caption" noWrap>{r.otros_medicamentos ?? '-'}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 200 }}>
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
