import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import type { ReactNode } from 'react';
import type { SeccionEstado } from '../tipos';

interface Props {
    /** Título de la sección */
    titulo: string;
    /** Icono MUI del encabezado */
    icono: ReactNode;
    /** Estado de la sección */
    seccion: SeccionEstado;
    /** Descripción cuando hay datos */
    descripcionCompleta?: string;
    /** Descripción cuando no hay datos */
    descripcionPendiente?: string;
    /** URL del botón de acción principal (Ver detalle / Completar) */
    urlAccion?: string;
    /** Texto del botón de acción */
    textoAccion?: string;
    /** Contenido extra dentro de la card cuando hay datos */
    children?: ReactNode;
}

export default function TarjetaEstadoSeccion({
    titulo,
    icono,
    seccion,
    descripcionCompleta,
    descripcionPendiente = 'Pendiente de registro.',
    urlAccion,
    textoAccion,
    children,
}: Props) {
    const completada = seccion.completada;

    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%' }}>
                <Stack spacing={1.5} sx={{ height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ color: completada ? 'success.main' : 'text.disabled' }}>
                                {icono}
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {titulo}
                            </Typography>
                        </Stack>

                        {completada ? (
                            <Chip
                                label="Completa"
                                color="success"
                                size="small"
                                icon={<CheckCircleIcon />}
                                variant="outlined"
                            />
                        ) : (
                            <Chip
                                label="Pendiente"
                                size="small"
                                icon={<HourglassEmptyIcon />}
                                variant="outlined"
                            />
                        )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                        {completada
                            ? (descripcionCompleta ?? `${seccion.total_registros ?? 0} registro(s) encontrado(s).`)
                            : descripcionPendiente}
                    </Typography>

                    {completada && children ? children : null}

                    {urlAccion ? (
                        <Box>
                            <Button
                                href={urlAccion}
                                size="small"
                                variant={completada ? 'outlined' : 'contained'}
                            >
                                {textoAccion ?? (completada ? 'Ver detalle' : 'Completar evaluación')}
                            </Button>
                        </Box>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}
