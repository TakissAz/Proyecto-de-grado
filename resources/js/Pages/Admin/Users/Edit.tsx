declare const route: any;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

interface RoleOption {
    id_rol: number;
    nombre: string;
    descripcion?: string | null;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    estado: EstadoUsuario;
    roles?: RoleOption[];
    rol_principal?: RoleOption | null;
}

interface Props extends PageProps {
    user: UserRow;
    roles: RoleOption[];
    estados: EstadoUsuario[];
}

export default function Edit({ user, roles, estados, flash }: Props) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
        password: '',
        estado: user.estado ?? 'activo',
        id_rol: String(user.rol_principal?.id_rol ?? user.roles?.[0]?.id_rol ?? ''),
    });

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Editar usuario
                </h2>
            }
        >
            <Head title={`Editar usuario: ${user.name}`} />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Editar usuario
                            </Typography>
                            <Typography color="text.secondary">
                                Actualiza los datos, el estado y el rol activo
                                del usuario.
                            </Typography>
                        </Box>

                        {flash?.success ? (
                            <Alert severity="success">{flash.success}</Alert>
                        ) : null}

                        {flash?.error ? (
                            <Alert severity="error">{flash.error}</Alert>
                        ) : null}

                        <Box
                            component="form"
                            onSubmit={(event) => {
                                event.preventDefault();

                                patch(route('admin.users.update', user.id), {
                                    onSuccess: () => reset('password'),
                                });
                            }}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: '1fr 1fr',
                                },
                                gap: 2,
                            }}
                        >
                            <TextField
                                label="Nombre"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                                fullWidth
                                required
                            />

                            <TextField
                                label="Correo electronico"
                                type="email"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                                fullWidth
                                required
                            />

                            <TextField
                                label="Nueva contrasena"
                                type="password"
                                value={data.password}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                                error={Boolean(errors.password)}
                                helperText={
                                    errors.password ?? 'Deja este campo vacio si no deseas cambiarla.'
                                }
                                fullWidth
                            />

                            <FormControl
                                fullWidth
                                error={Boolean(errors.estado)}
                            >
                                <InputLabel id="estado-edit-label">
                                    Estado
                                </InputLabel>
                                <Select
                                    labelId="estado-edit-label"
                                    label="Estado"
                                    value={data.estado}
                                    onChange={(event) =>
                                        setData(
                                            'estado',
                                            event.target.value as EstadoUsuario,
                                        )
                                    }
                                >
                                    {estados.map((estado) => (
                                        <MenuItem key={estado} value={estado}>
                                            {estado}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    {errors.estado}
                                </FormHelperText>
                            </FormControl>

                            <FormControl
                                fullWidth
                                error={Boolean(errors.id_rol)}
                                sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
                            >
                                <InputLabel id="rol-edit-label">
                                    Rol activo
                                </InputLabel>
                                <Select
                                    labelId="rol-edit-label"
                                    label="Rol activo"
                                    value={data.id_rol}
                                    onChange={(event) =>
                                        setData('id_rol', String(event.target.value))
                                    }
                                >
                                    <MenuItem value="">
                                        Selecciona un rol
                                    </MenuItem>
                                    {roles.map((role) => (
                                        <MenuItem
                                            key={role.id_rol}
                                            value={String(role.id_rol)}
                                        >
                                            {role.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    {errors.id_rol}
                                </FormHelperText>
                            </FormControl>

                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    justifyContent: 'flex-end',
                                    gridColumn: '1 / -1',
                                }}
                            >
                                <Button
                                    component={Link}
                                    href={route('admin.users.index')}
                                    variant="outlined"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={processing}
                                >
                                    Actualizar
                                </Button>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
