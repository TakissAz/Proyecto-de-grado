/* global route */
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    IconButton,
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
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useEffect, useRef, useState } from 'react';

interface UserOption {
    name: string;
    email: string;
}

interface PacienteRow {
    id_paciente: number;
    nombre_completo?: string | null;
    ci: string;
    fecha_nacimiento: string;
    edad?: number | null;
    telefono?: string | null;
    fecha_registro?: string | null;
    estado: 'activo' | 'inactivo';
    user?: UserOption | null;
}

interface PaginatedPacientes {
    data: PacienteRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null };
}

interface Filters {
    buscar: string;
}

interface Props extends PageProps {
    pacientes: PaginatedPacientes;
    filtros: Filters;
    flash?: {
        success?: string;
        error?: string;
        /** ID del paciente recién creado — muestra un banner para ir a su perfil */
        nueva_consulta_paciente_id?: number;
    };
}

export default function Index({ pacientes, filtros, flash }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const buscarRef = useRef(buscar);
    buscarRef.current = buscar;

    useEffect(() => {
        setBuscar(filtros.buscar ?? '');
    }, [filtros.buscar]);

    const applyFilters = (page = 1) => {
        const params = new URLSearchParams();
        if (buscarRef.current) params.set('buscar', buscarRef.current);
        params.set('page', String(page));
        window.location.href = `/endocrinologo/pacientes?${params.toString()}`;
    };

    const clearFilters = () => {
        setBuscar('');
        window.location.href = '/endocrinologo/pacientes';
    };

    /** Envía un form POST con _method=PATCH — forma más robusta de hacer PATCH desde el browser */
    const cambiarEstado = (idPaciente: number, accion: 'activar' | 'inactivar') => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/endocrinologo/pacientes/${idPaciente}/${accion}`;
        form.style.display = 'none';

        const csrfInput = document.createElement('input');
        csrfInput.name = '_token';
        csrfInput.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

        const methodInput = document.createElement('input');
        methodInput.name = '_method';
        methodInput.value = 'PATCH';

        form.appendChild(csrfInput);
        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Pacientes</h2>}>
            <Head title="Pacientes - Endocrinologo" />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: { xs: 'stretch', md: 'center' } }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>Pacientes de endocrinologia</Typography>
                            <Typography color="text.secondary">Consulta y administra los registros clinicos base.</Typography>
                        </Box>

                        <Button component={Link} href={route('endocrinologo.pacientes.create')} variant="contained" startIcon={<AddIcon />} sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}>Registrar paciente</Button>
                    </Box>

                    {flash?.success ? <Alert severity="success">{flash.success}</Alert> : null}
                    {flash?.error ? <Alert severity="error">{flash.error}</Alert> : null}
                    {flash?.nueva_consulta_paciente_id ? (
                        <Alert
                            severity="success"
                            action={
                                <Button
                                    component={Link}
                                    href={`/endocrinologo/pacientes/${flash.nueva_consulta_paciente_id}`}
                                    color="inherit"
                                    size="small"
                                    variant="outlined"
                                >
                                    Ver perfil e iniciar consulta
                                </Button>
                            }
                        >
                            Paciente registrada correctamente. Puedes iniciar la primera consulta desde su perfil.
                        </Alert>
                    ) : null}

                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Stack component="form" spacing={2} onSubmit={(event) => { event.preventDefault(); applyFilters(1); }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr auto' }, gap: 2, alignItems: 'center' }}>
                                <TextField label="Buscar por nombre, correo, CI o telefono" value={buscar} onChange={(event) => setBuscar(event.target.value)} fullWidth size="small" />
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
                                        <TableCell>Paciente</TableCell>
                                        <TableCell>CI</TableCell>
                                        <TableCell>Contacto</TableCell>
                                        <TableCell>Nacimiento</TableCell>
                                        <TableCell>Edad</TableCell>
                                        <TableCell>Registro</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pacientes.data.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>No se encontraron pacientes con los filtros actuales.</TableCell></TableRow>
                                    ) : pacientes.data.map((paciente) => (
                                        <TableRow key={paciente.id_paciente} hover>
                                            <TableCell>
                                                <Stack spacing={0.25}>
                                                    <Typography sx={{ fontWeight: 600 }}>{paciente.nombre_completo ?? paciente.user?.name ?? 'Sin nombre'}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{paciente.user?.email ?? 'Sin correo'}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{paciente.ci}</TableCell>
                                            <TableCell>{paciente.telefono ?? '-'}</TableCell>
                                            <TableCell>{paciente.fecha_nacimiento}</TableCell>
                                            <TableCell>{paciente.edad ?? '-'}</TableCell>
                                            <TableCell>{paciente.fecha_registro ?? '-'}</TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    <IconButton
                                                        component={Link}
                                                        href={route('endocrinologo.pacientes.show', { paciente: paciente.id_paciente })}
                                                        size="small"
                                                        color="info"
                                                        aria-label="Ver paciente"
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        component={Link}
                                                        href={route('endocrinologo.pacientes.edit', { paciente: paciente.id_paciente })}
                                                        size="small"
                                                        color="primary"
                                                        aria-label="Editar paciente"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        aria-label="Activar paciente"
                                                        disabled={paciente.estado === 'activo'}
                                                        onClick={() => cambiarEstado(paciente.id_paciente, 'activar')}
                                                    >
                                                        <CheckCircleIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="warning"
                                                        aria-label="Inactivar paciente"
                                                        disabled={paciente.estado === 'inactivo'}
                                                        onClick={() => cambiarEstado(paciente.id_paciente, 'inactivar')}
                                                    >
                                                        <DoNotDisturbIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, px: 2, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total: {pacientes.meta.total} pacientes</Typography>
                            <TablePagination component="div" count={pacientes.meta.total} page={Math.max((pacientes.meta.current_page ?? 1) - 1, 0)} rowsPerPage={pacientes.meta.per_page} rowsPerPageOptions={[pacientes.meta.per_page]} onPageChange={(_, nextPage) => applyFilters(nextPage + 1)} onRowsPerPageChange={() => undefined} labelRowsPerPage="" labelDisplayedRows={({ from, to, count }) => `${from} - ${to} de ${count}`} />
                        </Box>
                    </Paper>
                </Stack>
            </Box>
        </AuthenticatedLayout>
    );
}