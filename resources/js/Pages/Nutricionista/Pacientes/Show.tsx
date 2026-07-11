import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Alert, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import EditIcon from '@mui/icons-material/Edit';
import PacienteResumen from '@/Components/Pacientes/PacienteResumen';

interface PacienteRow {
    id_paciente: number;
    ci: string;
    nombre_completo?: string | null;
    fecha_nacimiento: string;
    edad?: number | null;
    sexo: string;
    telefono?: string | null;
    direccion?: string | null;
    ocupacion?: string | null;
    estado_civil?: string | null;
    fecha_registro?: string | null;
    observaciones?: string | null;
    estado: 'activo' | 'inactivo';
    user?: { name?: string | null; email?: string | null } | null;
}

interface Props extends PageProps {
    paciente: PacienteRow;
}

export default function Show({ paciente, flash }: Props) {
    const id = paciente.id_paciente;

    const urlEdit      = `/nutricionista/pacientes/${id}/edit`;
    const urlIndex     = `/nutricionista/pacientes`;
    const urlActivar   = `/nutricionista/pacientes/${id}/activar`;
    const urlInactivar = `/nutricionista/pacientes/${id}/inactivar`;

    const enviarFormEstado = (url: string) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        form.style.display = 'none';

        const csrf = document.createElement('input');
        csrf.name = '_token';
        csrf.value = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

        const method = document.createElement('input');
        method.name = '_method';
        method.value = 'PATCH';

        form.appendChild(csrf);
        form.appendChild(method);
        document.body.appendChild(form);
        form.submit();
    };

    const actions = (
        <>
            <Button
                component={Link}
                href={urlEdit}
                variant="contained"
                startIcon={<EditIcon />}
            >
                Editar
            </Button>

            <Button
                variant="outlined"
                color="success"
                startIcon={<CheckCircleIcon />}
                disabled={paciente.estado === 'activo'}
                onClick={() => enviarFormEstado(urlActivar)}
            >
                Activar
            </Button>

            <Button
                variant="outlined"
                color="warning"
                startIcon={<DoNotDisturbIcon />}
                disabled={paciente.estado === 'inactivo'}
                onClick={() => enviarFormEstado(urlInactivar)}
            >
                Inactivar
            </Button>

            <Button
                component={Link}
                href={urlIndex}
                variant="text"
                startIcon={<ArrowBackIcon />}
            >
                Volver al listado
            </Button>
        </>
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Perfil de paciente
                </h2>
            }
        >
            <Head title={`Paciente: ${paciente.ci}`} />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {flash?.success ? (
                    <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>
                ) : null}
                {flash?.error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{flash.error}</Alert>
                ) : null}

                <PacienteResumen paciente={paciente} actions={actions} />
            </Box>
        </AuthenticatedLayout>
    );
}
