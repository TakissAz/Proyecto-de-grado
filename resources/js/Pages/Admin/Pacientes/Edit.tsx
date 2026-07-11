import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PacienteFormulario, { PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';

interface PacienteRow {
    id_paciente: number;
    ci: string;
    nombres?: string | null;
    apellido_paterno?: string | null;
    apellido_materno?: string | null;
    fecha_nacimiento: string;
    telefono?: string | null;
    direccion?: string | null;
    ocupacion?: string | null;
    estado_civil?: string | null;
    fecha_registro?: string | null;
    user?: { email?: string | null } | null;
}

interface Props extends PageProps {
    paciente: PacienteRow;
}

export default function Edit({ paciente, flash }: Props) {
    const { data, setData, post, processing, errors } = useForm<PacienteFormValues>({
        nombres: paciente.nombres ?? '',
        apellido_paterno: paciente.apellido_paterno ?? '',
        apellido_materno: paciente.apellido_materno ?? '',
        ci: paciente.ci ?? '',
        fecha_nacimiento: paciente.fecha_nacimiento ?? '',
        sexo: 'femenino',
        telefono: paciente.telefono ?? '',
        direccion: paciente.direccion ?? '',
        ocupacion: paciente.ocupacion ?? '',
        estado_civil: paciente.estado_civil ?? '',
        fecha_registro: paciente.fecha_registro ?? '',
        email: paciente.user?.email ?? '',
        password: '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post(`/admin/pacientes/${paciente.id_paciente}?_method=PUT`, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Editar paciente
                </h2>
            }
        >
            <Head title={`Editar: ${paciente.ci}`} />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" fontWeight={700}>Editar paciente</Typography>
                            <Typography color="text.secondary">Actualiza los datos de la paciente y su cuenta de acceso.</Typography>
                        </Box>

                        {flash?.success ? <Alert severity="success">{flash.success}</Alert> : null}
                        {flash?.error ? <Alert severity="error">{flash.error}</Alert> : null}

                        <Box component="form" onSubmit={handleSubmit}>
                            <PacienteFormulario
                                data={data}
                                setData={setData as (field: keyof PacienteFormValues, value: string) => void}
                                errors={errors}
                                mode="edit"
                            />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, flexWrap: 'wrap' }}>
                                <Button
                                    component={Link}
                                    href={`/admin/pacientes/${paciente.id_paciente}`}
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon />}
                                    disabled={processing}
                                >
                                    Volver al perfil
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={processing}
                                >
                                    {processing ? 'Guardando...' : 'Guardar cambios'}
                                </Button>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
