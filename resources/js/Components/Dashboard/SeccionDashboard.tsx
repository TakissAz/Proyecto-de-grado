import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
    /** Título de la sección */
    titulo?: string;
    /** Descripción opcional debajo del título */
    descripcion?: string;
    /** Número de columnas en pantallas medianas y grandes (default: 3) */
    columnas?: 1 | 2 | 3 | 4;
    /** Contenido (tarjetas u otros elementos) */
    children: ReactNode;
}

/**
 * Wrapper reutilizable para secciones de grid en dashboards.
 * Maneja el layout responsivo: 1 columna en móvil, `columnas` en desktop.
 *
 * @example
 * <SeccionDashboard titulo="Estadísticas" columnas={3}>
 *   <TarjetaEstadistica ... />
 *   <TarjetaEstadistica ... />
 * </SeccionDashboard>
 */
export default function SeccionDashboard({
    titulo,
    descripcion,
    columnas = 3,
    children,
}: Props) {
    return (
        <Box sx={{ mb: 4 }}>
            {titulo ? (
                <Typography variant="h6" fontWeight={600} sx={{ mb: descripcion ? 0.5 : 2 }}>
                    {titulo}
                </Typography>
            ) : null}

            {descripcion ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {descripcion}
                </Typography>
            ) : null}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: columnas >= 2 ? 'repeat(2, 1fr)' : '1fr',
                        md: `repeat(${columnas}, 1fr)`,
                    },
                    gap: 3,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
