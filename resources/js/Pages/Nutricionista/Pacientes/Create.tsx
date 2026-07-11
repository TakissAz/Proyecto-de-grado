import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PacienteFormulario, { PacienteFormValues } from '@/Components/Pacientes/PacienteFormulario';

interface Props extends PageProps {}

const valoresIniciales: PacienteFormValues = {
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    fecha_nacimiento: '',
    sexo: 'femenino',
    telefono: '',
    direccion: '',
    ocupacion: '',
    estado_civil: '',
    fecha_registro: '',
    email: '',
    password: '',
};

export default function Create({ flash }: Props) {
    const { data, setData, post, processing, errors } = useForm<PacienteFormValues>({ ...valoresIniciales });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/nutricionista/pacientes', {
            preserveScroll: false,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Registrar paciente
                </h2>
            }
        >
            <Head title="Registrar paciente" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h4" fontWeight={700}>Nueva paciente</Typography>
                            <Typography color="text.secondary">
                                Completa los datos de la paciente y su cuenta de acceso al sistema.
                            </Typography>
                        </Box>

                        {flash?.success ? <Alert severity="success">{flash.success}</Alert> : null}
                        {flash?.error ? <Alert severity="error">{flash.error}</Alert> : null}

                        <Box component="form" onSubmit={handleSubmit}>
                            <PacienteFormulario
                                data={data}
                                setData={setData as (field: keyof PacienteFormValues, value: string) => void}
                                errors={errors}
                                mode="create"
                            />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, flexWrap: 'wrap' }}>
                                <Button
                                    component={Link}
                                    href="/nutricionista/pacientes"
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon />}
                                    disabled={processing}
                                >
                                    Volver al listado
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={processing}
                                >
                                    {processing ? 'Guardando...' : 'Registrar paciente'}
                                </Button>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        </AuthenticatedLayout>
    );
}
