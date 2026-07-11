declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useEffect, useMemo, useState } from 'react';

type EstadoPaciente = 'activo' | 'inactivo';
type EstadoFlujoPaciente =
    | 'pendiente_nutricion'
    | 'pendiente_endocrino'
    | 'en_seguimiento'
    | 'completo'
    | 'inactivo';

interface RoleOption {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
    estado?: string | null;
}

interface UserOption {
    id: number;
    name: string;
    email: string;
    estado?: string | null;
    roles?: RoleOption[];
}

interface PacienteRow {
    id_paciente: number;
    user_id: number;
    nombre_completo?: string | null;
    ci: string;
    fecha_nacimiento: string;
    edad?: number | null;
    sexo: string;
    telefono?: string | null;
    direccion?: string | null;
    ocupacion?: string | null;
    estado_civil?: string | null;
    fecha_registro?: string | null;
    estado: EstadoPaciente;
    observaciones?: string | null;
    origen_registro?: string | null;
    estado_flujo?: EstadoFlujoPaciente | null;
    created_at?: string | null;
    updated_at?: string | null;
    user?: UserOption | null;
    creado_por_user?: UserOption | null;
    actualizado_por_user?: UserOption | null;
}

interface PaginatedPacientes {
    data: PacienteRow[];
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
    estado: string;
    estado_flujo: string;
    origen_registro: string;
}

interface Props extends PageProps {
    pacientes: PaginatedPacientes;
    filtros: Filters;
    estados: EstadoPaciente[];
    estados_flujo: EstadoFlujoPaciente[];
    origenes: string[];
}

function estadoColor(estado: EstadoPaciente): 'success' | 'warning' {
    return estado === 'activo' ? 'success' : 'warning';
}

function flujoColor(estadoFlujo?: EstadoFlujoPaciente | null): 'info' | 'warning' | 'success' | 'default' {
    if (estadoFlujo === 'pendiente_nutricion' || estadoFlujo === 'pendiente_endocrino') {
        return 'warning';
    }

    if (estadoFlujo === 'en_seguimiento') {
        return 'info';
    }

    if (estadoFlujo === 'completo') {
        return 'success';
    }

    return 'default';
}

export default function Pacientes({ pacientes, filtros, estados, estados_flujo, origenes, flash }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? '');
    const [estadoFlujo, setEstadoFlujo] = useState(filtros.estado_flujo ?? '');
    const [origenRegistro, setOrigenRegistro] = useState(filtros.origen_registro ?? '');

    useEffect(() => {
        setBuscar(filtros.buscar ?? '');
        setEstado(filtros.estado ?? '');
        setEstadoFlujo(filtros.estado_flujo ?? '');
        setOrigenRegistro(filtros.origen_registro ?? '');
    }, [filtros.buscar, filtros.estado, filtros.estado_flujo, filtros.origen_registro]);

    const estadoOptions = useMemo(
        () => [
            { value: '', label: 'Todos los estados' },
            ...estados.map((option) => ({ value: option, label: option })),
        ],
        [estados],
    );

    const estadoFlujoOptions = useMemo(
        () => [
            { value: '', label: 'Todos los flujos' },
            ...estados_flujo.map((option) => ({ value: option, label: option })),
        ],
        [estados_flujo],
    );

    const origenOptions = useMemo(
        () => [
            { value: '', label: 'Todos los origenes' },
            ...origenes.map((option) => ({ value: option, label: option })),
        ],
        [origenes],
    );

    const applyFilters = (page = 1) => {
        router.get(
            route('admin.auditoria.pacientes'),
            {
                buscar,
                estado,
                estado_flujo: estadoFlujo,
                origen_registro: origenRegistro,
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setBuscar('');
        setEstado('');
        setEstadoFlujo('');
        setOrigenRegistro('');

        router.get(
            route('admin.auditoria.pacientes'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const pageCount = pacientes.meta?.last_page ?? 1;
    const currentPage = pacientes.meta?.current_page ?? 1;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Auditoria de pacientes</h2>}
        >
            <Head title="Auditoria de pacientes" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={3}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'space-between',
                            gap: 2,
                            alignItems: { xs: 'stretch', md: 'center' },
                        }}
                    >
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Auditoria clinica
                            </Typography>
                            <Typography color="text.secondary">
                                Revisa origen de registro, creador, editor y flujo clinico.
                            </Typography>
                        </Box>

                        <Button
                            component={Link}
                            href={route('admin.auditoria.actividad')}
                            variant="outlined"
                        >
                            Ver actividad
                        </Button>
                    </Box>

                    {flash?.success ? <Alert severity="success">{flash.success}</Alert> : null}
                    {flash?.error ? <Alert severity="error">{flash.error}</Alert> : null}

                    <Paper elevation={1} sx={{ p: 2 }}>
                        <Stack
                            component="form"
                            spacing={2}
                            onSubmit={(event) => {
                                event.preventDefault();
                                applyFilters(1);
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: '2fr 1fr 1fr 1fr auto',
                                    },
                                    gap: 2,
                                    alignItems: 'center',
                                }}
                            >
                                <TextField
                                    label="Buscar por nombre, correo, CI, telefono, creador o editor"
                                    value={buscar}
                                    onChange={(event) => setBuscar(event.target.value)}
                                    fullWidth
                                    size="small"
                                />

                                <FormControl fullWidth size="small">
                                    <InputLabel id="estado-filter-label">Estado</InputLabel>
                                    <Select labelId="estado-filter-label" label="Estado" value={estado} onChange={(event: SelectChangeEvent<string>) => setEstado(event.target.value)}>
                                        {estadoOptions.map((option) => (
                                            <MenuItem key={option.value || 'todos-estados'} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel id="estado-flujo-filter-label">Flujo</InputLabel>
                                    <Select labelId="estado-flujo-filter-label" label="Flujo" value={estadoFlujo} onChange={(event: SelectChangeEvent<string>) => setEstadoFlujo(event.target.value)}>
                                        {estadoFlujoOptions.map((option) => (
                                            <MenuItem key={option.value || 'todos-flujos'} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel id="origen-filter-label">Origen</InputLabel>
                                    <Select labelId="origen-filter-label" label="Origen" value={origenRegistro} onChange={(event: SelectChangeEvent<string>) => setOrigenRegistro(event.target.value)}>
                                        {origenOptions.map((option) => (
                                            <MenuItem key={option.value || 'todos-origenes'} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

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
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Flujo</TableCell>
                                        <TableCell>Origen</TableCell>
                                        <TableCell>Creado por</TableCell>
                                        <TableCell>Actualizado por</TableCell>
                                        <TableCell>Creado</TableCell>
                                        <TableCell>Actualizado</TableCell>
                                        <TableCell align="right">Actividad</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pacientes.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                                No se encontraron pacientes con los filtros actuales.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pacientes.data.map((paciente) => (
                                            <TableRow key={paciente.id_paciente} hover>
                                                <TableCell>
                                                    <Stack spacing={0.25}>
                                                        <Typography sx={{ fontWeight: 600 }}>
                                                            {paciente.nombre_completo ?? paciente.user?.name ?? 'Sin usuario'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {paciente.user?.email ?? ''}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>{paciente.ci}</TableCell>
                                                <TableCell><Chip label={paciente.estado} color={estadoColor(paciente.estado)} size="small" /></TableCell>
                                                <TableCell><Chip label={paciente.estado_flujo ?? '-'} color={flujoColor(paciente.estado_flujo)} size="small" variant="outlined" /></TableCell>
                                                <TableCell>{paciente.origen_registro ?? '-'}</TableCell>
                                                <TableCell>{paciente.creado_por_user?.name ?? '-'}</TableCell>
                                                <TableCell>{paciente.actualizado_por_user?.name ?? '-'}</TableCell>
                                                <TableCell>{paciente.created_at ?? '-'}</TableCell>
                                                <TableCell>{paciente.updated_at ?? '-'}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        component={Link}
                                                        href={route('admin.auditoria.actividad', { paciente: paciente.id_paciente })}
                                                        size="small"
                                                        color="info"
                                                        aria-label="Ver actividad"
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, px: 2, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total: {pacientes.meta.total} pacientes</Typography>
                            <TablePagination component="div" count={pacientes.meta.total} page={Math.max(currentPage - 1, 0)} rowsPerPage={pacientes.meta.per_page} rowsPerPageOptions={[pacientes.meta.per_page]} onPageChange={(_, nextPage) => applyFilters(nextPage + 1)} onRowsPerPageChange={() => undefined} labelRowsPerPage="" labelDisplayedRows={({ from, to, count }) => `${from} - ${to} de ${count}`} />
                        </Box>
                    </Paper>

                    {pageCount > 1 ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {pacientes.links.map((link, index) => {
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



