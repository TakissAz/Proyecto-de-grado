import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import type { EstadoFlujo } from '../tipos';

interface Props {
    estadoFlujo: EstadoFlujo;
}

const coloresEtapa: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
    registro_inicial: 'default',
    en_evaluacion: 'primary',
    diagnostico_completo: 'success',
    inactivo: 'warning',
};

export default function IndicadorEstadoFlujo({ estadoFlujo }: Props) {
    return (
        <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                        Flujo clínico:
                    </Typography>
                    <Chip
                        label={estadoFlujo.etiqueta}
                        color={coloresEtapa[estadoFlujo.etapa] ?? 'default'}
                        size="small"
                        variant="outlined"
                    />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    {estadoFlujo.secciones_completadas} / {estadoFlujo.total_secciones} secciones
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={estadoFlujo.porcentaje}
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Stack>
    );
}
