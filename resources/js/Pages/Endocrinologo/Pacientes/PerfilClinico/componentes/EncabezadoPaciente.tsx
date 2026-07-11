import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import type { DatosPaciente, EstadoFlujo } from '../tipos';
import BadgeEstadoPaciente from './BadgeEstadoPaciente';
import IndicadorEstadoFlujo from './IndicadorEstadoFlujo';

interface Props {
    paciente: DatosPaciente;
    estadoFlujo: EstadoFlujo;
}

export default function EncabezadoPaciente({ paciente, estadoFlujo }: Props) {
    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            {paciente.nombre_completo}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            CI: {paciente.ci} | {paciente.user?.email ?? 'Sin correo'}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <BadgeEstadoPaciente estado={paciente.estado} />
                        <Chip
                            label={`${paciente.edad ?? '-'} años`}
                            size="small"
                            variant="outlined"
                        />
                    </Stack>
                </Box>

                <Divider />

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 2,
                    }}
                >
                    <InfoItem etiqueta="Teléfono" valor={paciente.telefono} />
                    <InfoItem etiqueta="Fecha de nacimiento" valor={paciente.fecha_nacimiento} />
                    <InfoItem etiqueta="Fecha de registro" valor={paciente.fecha_registro} />
                    <InfoItem etiqueta="Ocupación" valor={paciente.ocupacion} />
                </Box>

                <Divider />

                <IndicadorEstadoFlujo estadoFlujo={estadoFlujo} />
            </Stack>
        </Paper>
    );
}

function InfoItem({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {etiqueta}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
                {valor ?? '-'}
            </Typography>
        </Box>
    );
}
