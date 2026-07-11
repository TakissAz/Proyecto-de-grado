import { Box, Chip, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
    /** Título principal del dashboard */
    titulo: string;
    /** Subtítulo o descripción contextual */
    descripcion?: string;
    /** Nombre del módulo/rol (ej. "Administrador", "Endocrinólogo") */
    modulo?: string;
    /** Acciones rápidas (botones) opcionales a la derecha */
    acciones?: ReactNode;
}

/**
 * Encabezado consistente para todos los dashboards del sistema.
 * Muestra título, badge de módulo, descripción y acciones rápidas opcionales.
 *
 * @example
 * <EncabezadoDashboard
 *   titulo="Panel Endocrinológico"
 *   descripcion="Gestión clínica de pacientes con PMOS y resistencia a la insulina."
 *   modulo="Endocrinólogo"
 *   acciones={<Button>Registrar paciente</Button>}
 * />
 */
export default function EncabezadoDashboard({
    titulo,
    descripcion,
    modulo,
    acciones,
}: Props) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 4,
            }}
        >
            <Box>
                {modulo ? (
                    <Chip
                        label={modulo}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1, fontWeight: 600, letterSpacing: 0.5 }}
                    />
                ) : null}

                <Typography variant="h4" fontWeight={700} gutterBottom={Boolean(descripcion)}>
                    {titulo}
                </Typography>

                {descripcion ? (
                    <Typography variant="body1" color="text.secondary">
                        {descripcion}
                    </Typography>
                ) : null}
            </Box>

            {acciones ? (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, flexShrink: 0 }}>
                    {acciones}
                </Box>
            ) : null}
        </Box>
    );
}
