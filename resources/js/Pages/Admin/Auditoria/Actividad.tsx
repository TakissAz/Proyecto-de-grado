declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useEffect, useState } from 'react';

interface ActivityUser {
    id: number;
    name: string;
    email?: string | null;
}

interface ActivityRow {
    id: number;
    log_name?: string | null;
    description: string;
    event?: string | null;
    created_at?: string | null;
    causer?: ActivityUser | null;
    subject_type?: string | null;
    subject_id?: number | null;
}

interface PaginatedActivities {
    data: ActivityRow[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
}

interface Filters {
    buscar: string;
    paciente: string;
}

interface Props extends PageProps {
    actividades: PaginatedActivities;
    filtros: Filters;
}

export default function Actividad({ actividades, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [paciente, setPaciente] = useState(filtros.paciente ?? '');

    useEffect(() => {
        setBuscar(filtros.buscar ?? '');
        setPaciente(filtros.paciente ?? '');
    }, [filtros.buscar, filtros.paciente]);

    const applyFilters = (page = 1) => {
        router.get(
            route('admin.auditoria.actividad'),
            { buscar, paciente, page },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const clearFilters = () => {
        setBuscar('');
        setPaciente('');
        router.get(route('admin.auditoria.actividad'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const pageCount = actividades.meta?.last_page ?? 1;
    const currentPage = actividades.meta?.current_page ?? 1;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Actividad de pacientes</h2>}
        >
            <Head title="Actividad de pacientes" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: { xs: 'stretch', md: 'center' } }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Actividad
                            </Typography>
                            <Typography color="text.secondary">
                                Eventos generados por el modulo de pacientes.
                            </Typography>
                        </Box>

                        <Button component={Link} href={route('admin.auditoria.pacientes')} variant="outlined">
                            Volver a pacientes
                        </Button>
                    </Box>

                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Stack
                            component="form"
                            spacing={2}
                            onSubmit={(event) => {
                                event.preventDefault();
                                applyFilters(1);
                            }}
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
                                <TextField label="Buscar por evento, descripcion o usuario" value={buscar} onChange={(event) => setBuscar(event.target.value)} fullWidth size="small" />
                                <TextField label="Paciente ID" value={paciente} onChange={(event) => setPaciente(event.target.value)} fullWidth size="small" />
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                                    <Button type="submit" variant="contained">Filtrar</Button>
                                    <Button type="button" variant="outlined" startIcon={<ClearIcon />} onClick={clearFilters}>Limpiar</Button>
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper elevation={1}>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Evento</TableCell>
                                        <TableCell>Descripcion</TableCell>
                                        <TableCell>Usuario</TableCell>
                                        <TableCell>Subject</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {actividades.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                                No se encontraron actividades.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        actividades.data.map((actividad) => (
                                            <TableRow key={actividad.id} hover>
                                                <TableCell>{actividad.created_at ?? '-'}</TableCell>
                                                <TableCell>
                                                    <Chip label={actividad.event ?? '-'} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell>{actividad.description}</TableCell>
                                                <TableCell>{actividad.causer?.name ?? '-'}</TableCell>
                                                <TableCell>{actividad.subject_type ?? '-'} {actividad.subject_id ?? ''}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, px: 2, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total: {actividades.meta.total} eventos</Typography>
                            <TablePagination component="div" count={actividades.meta.total} page={Math.max(currentPage - 1, 0)} rowsPerPage={actividades.meta.per_page} rowsPerPageOptions={[actividades.meta.per_page]} onPageChange={(_, nextPage) => applyFilters(nextPage + 1)} onRowsPerPageChange={() => undefined} labelRowsPerPage="" labelDisplayedRows={({ from, to, count }) => `${from} - ${to} de ${count}`} />
                        </Box>
                    </Paper>

                    {pageCount > 1 ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {actividades.links.map((link, index) => {
                                const label = link.label.replace('&laquo; Previous', 'Anterior').replace('Next &raquo;', 'Siguiente');

                                if (! link.url) {
                                    return <Button key={`${label}-${index}`} variant="outlined" disabled>{label}</Button>;
                                }

                                return (
                                    <Button key={`${label}-${index}`} variant={link.active ? 'contained' : 'outlined'} onClick={() => router.get(link.url as string, {}, { preserveScroll: true, preserveState: true, replace: true })}>
                                        {label}
                                    </Button>
                                );
                            })}
                        </Box>
                    ) : null}
                </Stack>
            </Box>
        </AuthenticatedLayout>
    );
}
