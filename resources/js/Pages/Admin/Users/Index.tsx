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
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import ClearIcon from '@mui/icons-material/Clear';
import { useEffect, useMemo, useState } from 'react';

type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

interface RoleOption {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
    estado?: string | null;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    estado: EstadoUsuario;
    ultimo_acceso?: string | null;
    created_at?: string | null;
    roles?: RoleOption[];
    rol_principal?: RoleOption | null;
}

interface PaginatedUsers {
    data: UserRow[];
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
    rol: string;
}

interface Props extends PageProps {
    users: PaginatedUsers;
    roles: RoleOption[];
    filters: Filters;
}

function estadoColor(estado: EstadoUsuario): 'success' | 'warning' | 'error' {
    if (estado === 'activo') {
        return 'success';
    }

    if (estado === 'inactivo') {
        return 'warning';
    }

    return 'error';
}

export default function Index({ users, roles, filters, flash }: Props) {
    const [buscar, setBuscar] = useState(filters.buscar ?? '');
    const [estado, setEstado] = useState(filters.estado ?? '');
    const [rol, setRol] = useState(filters.rol ?? '');

    useEffect(() => {
        setBuscar(filters.buscar ?? '');
        setEstado(filters.estado ?? '');
        setRol(filters.rol ?? '');
    }, [filters.buscar, filters.estado, filters.rol]);

    const estadoOptions = useMemo(
        () => [
            { value: '', label: 'Todos los estados' },
            { value: 'activo', label: 'Activo' },
            { value: 'inactivo', label: 'Inactivo' },
            { value: 'bloqueado', label: 'Bloqueado' },
        ],
        [],
    );

    const applyFilters = (page = 1) => {
        router.get(
            route('admin.users.index'),
            {
                buscar,
                estado,
                rol,
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
        setRol('');

        router.get(
            route('admin.users.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const pageCount = users.meta?.last_page ?? 1;
    const currentPage = users.meta?.current_page ?? 1;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Usuarios
                </h2>
            }
        >
            <Head title="Usuarios" />

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
                                Gestión de usuarios
                            </Typography>
                            <Typography color="text.secondary">
                                Busca, filtra y administra cuentas del sistema.
                            </Typography>
                        </Box>

                        <Button
                            component={Link}
                            href={route('admin.users.create')}
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}
                        >
                            Crear usuario
                        </Button>
                    </Box>

                    {flash?.success ? (
                        <Alert severity="success">{flash.success}</Alert>
                    ) : null}

                    {flash?.error ? (
                        <Alert severity="error">{flash.error}</Alert>
                    ) : null}

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
                                        md: '2fr 1fr 1fr auto',
                                    },
                                    gap: 2,
                                    alignItems: 'center',
                                }}
                            >
                                <TextField
                                    label="Buscar por nombre o correo"
                                    value={buscar}
                                    onChange={(event) =>
                                        setBuscar(event.target.value)
                                    }
                                    fullWidth
                                    size="small"
                                />

                                <FormControl fullWidth size="small">
                                    <InputLabel id="estado-filter-label">
                                        Estado
                                    </InputLabel>
                                    <Select
                                        labelId="estado-filter-label"
                                        label="Estado"
                                        value={estado}
                                        onChange={(
                                            event: SelectChangeEvent<string>,
                                        ) => setEstado(event.target.value)}
                                    >
                                        {estadoOptions.map((option) => (
                                            <MenuItem
                                                key={option.value || 'todos'}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel id="rol-filter-label">
                                        Rol
                                    </InputLabel>
                                    <Select
                                        labelId="rol-filter-label"
                                        label="Rol"
                                        value={rol}
                                        onChange={(
                                            event: SelectChangeEvent<string>,
                                        ) => setRol(event.target.value)}
                                    >
                                        <MenuItem value="">Todos los roles</MenuItem>
                                        {roles.map((role) => (
                                            <MenuItem
                                                key={role.id_rol}
                                                value={String(role.id_rol)}
                                            >
                                                {role.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        justifyContent: {
                                            xs: 'flex-start',
                                            md: 'flex-end',
                                        },
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <Button
                                        type="submit"
                                        variant="contained"
                                    >
                                        Filtrar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        startIcon={<ClearIcon />}
                                        onClick={clearFilters}
                                    >
                                        Limpiar
                                    </Button>
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper elevation={1}>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Correo</TableCell>
                                        <TableCell>Rol</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Ultimo acceso</TableCell>
                                        <TableCell align="right">
                                            Acciones
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                align="center"
                                                sx={{ py: 6 }}
                                            >
                                                No se encontraron usuarios con
                                                los filtros actuales.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((user) => (
                                            <TableRow key={user.id} hover>
                                                <TableCell>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {user.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            gap: 1,
                                                            flexWrap: 'wrap',
                                                        }}
                                                    >
                                                        {(user.roles ?? [])
                                                            .length > 0 ? (
                                                            user.roles?.map(
                                                                (role) => (
                                                                    <Chip
                                                                        key={`${user.id}-${role.id_rol}`}
                                                                        size="small"
                                                                        label={
                                                                            role.nombre
                                                                        }
                                                                        variant="outlined"
                                                                    />
                                                                ),
                                                            )
                                                        ) : (
                                                            <Chip
                                                                size="small"
                                                                label="Sin rol"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.estado}
                                                        color={estadoColor(
                                                            user.estado,
                                                        )}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {user.ultimo_acceso ??
                                                        'Sin registro'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            gap: 1,
                                                            justifyContent: 'flex-end',
                                                            flexWrap: 'wrap',
                                                        }}
                                                    >
                                                        <IconButton
                                                            component={Link}
                                                            href={route(
                                                                'admin.users.edit',
                                                                user.id,
                                                            )}
                                                            size="small"
                                                            color="primary"
                                                            aria-label="Editar usuario"
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>

                                                        <IconButton
                                                            component="button"
                                                            size="small"
                                                            color="success"
                                                            onClick={() =>
                                                                router.patch(
                                                                    route(
                                                                        'admin.users.activar',
                                                                        user.id,
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveScroll:
                                                                            true,
                                                                    },
                                                                )
                                                            }
                                                            aria-label="Activar usuario"
                                                            disabled={
                                                                user.estado ===
                                                                'activo'
                                                            }
                                                        >
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>

                                                        <IconButton
                                                            component="button"
                                                            size="small"
                                                            color="warning"
                                                            onClick={() =>
                                                                router.patch(
                                                                    route(
                                                                        'admin.users.inactivar',
                                                                        user.id,
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveScroll:
                                                                            true,
                                                                    },
                                                                )
                                                            }
                                                            aria-label="Inactivar usuario"
                                                            disabled={
                                                                user.estado ===
                                                                'inactivo'
                                                            }
                                                        >
                                                            <DoNotDisturbIcon fontSize="small" />
                                                        </IconButton>

                                                        <IconButton
                                                            component="button"
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                router.patch(
                                                                    route(
                                                                        'admin.users.bloquear',
                                                                        user.id,
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveScroll:
                                                                            true,
                                                                    },
                                                                )
                                                            }
                                                            aria-label="Bloquear usuario"
                                                            disabled={
                                                                user.estado ===
                                                                'bloqueado'
                                                            }
                                                        >
                                                            <BlockIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'stretch', sm: 'center' },
                                gap: 2,
                                px: 2,
                                py: 1,
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Total: {users.meta.total} usuarios
                            </Typography>

                            <TablePagination
                                component="div"
                                count={users.meta.total}
                                page={Math.max(currentPage - 1, 0)}
                                rowsPerPage={users.meta.per_page}
                                rowsPerPageOptions={[users.meta.per_page]}
                                onPageChange={(_, nextPage) =>
                                    applyFilters(nextPage + 1)
                                }
                                onRowsPerPageChange={() => undefined}
                                labelRowsPerPage=""
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from} - ${to} de ${count}`
                                }
                            />
                        </Box>
                    </Paper>

                    {pageCount > 1 ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {users.links.map((link, index) => {
                                const label = link.label
                                    .replace('&laquo; Previous', 'Anterior')
                                    .replace('Next &raquo;', 'Siguiente');

                                if (! link.url) {
                                    return (
                                        <Button
                                            key={`${label}-${index}`}
                                            variant="outlined"
                                            disabled
                                        >
                                            {label}
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        key={`${label}-${index}`}
                                        variant={
                                            link.active
                                                ? 'contained'
                                                : 'outlined'
                                        }
                                        onClick={() =>
                                            router.get(link.url as string, {}, {
                                                preserveScroll: true,
                                                preserveState: true,
                                                replace: true,
                                            })
                                        }
                                    >
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