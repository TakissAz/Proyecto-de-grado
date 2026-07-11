import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface UserOption {
    name?: string | null;
    email?: string | null;
}

interface PacienteRow {
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
    observaciones?: string | null;
    user?: UserOption | null;
}

interface Props {
    paciente: PacienteRow;
    actions?: ReactNode;
    badges?: ReactNode;
}

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography>{value ?? '-'}</Typography>
        </Box>
    );
}

export default function PacienteResumen({ paciente, actions, badges }: Props) {
    return (
        <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={3}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: { xs: 'flex-start', md: 'center' } }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {paciente.nombre_completo ?? paciente.user?.name ?? 'Paciente'}
                        </Typography>
                        <Typography color="text.secondary">
                            CI {paciente.ci} - {paciente.user?.email ?? 'Sin correo'}
                        </Typography>
                    </Box>

                    {badges ? <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>{badges}</Stack> : null}
                </Box>

                <Divider />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                    <DetailItem label="Fecha nacimiento" value={paciente.fecha_nacimiento} />
                    <DetailItem label="Edad" value={paciente.edad ?? '-'} />
                    <DetailItem label="Sexo" value={paciente.sexo} />
                    <DetailItem label="Telefono" value={paciente.telefono} />
                    <DetailItem label="Direccion" value={paciente.direccion} />
                    <DetailItem label="Ocupacion" value={paciente.ocupacion} />
                    <DetailItem label="Estado civil" value={paciente.estado_civil} />
                    <DetailItem label="Fecha registro" value={paciente.fecha_registro} />
                    <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
                        <DetailItem label="Observaciones" value={paciente.observaciones} />
                    </Box>
                </Box>

                {actions ? <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>{actions}</Stack> : null}
            </Stack>
        </Paper>
    );
}
