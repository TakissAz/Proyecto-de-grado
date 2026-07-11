import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

interface Props {
    /** Título de la tarjeta */
    titulo: string;
    /** Descripción de la acción */
    descripcion: string;
    /** Icono MUI */
    Icono: SvgIconComponent;
    /** Texto del botón principal */
    textoCta: string;
    /** Href destino del botón principal (ruta Inertia/Laravel) */
    href: string;
    /** Variante del botón: 'contained' | 'outlined' | 'text' */
    variante?: 'contained' | 'outlined' | 'text';
    /**
     * Color del icono como token de tema MUI (ej. 'primary.main', 'error.main').
     * Se usa en sx={{ color }} por lo que acepta cualquier valor válido de MUI theme.
     */
    colorIcono?: string;
    /** Acciones extra opcionales (botones adicionales) */
    accionesExtra?: ReactNode;
}

/**
 * Tarjeta reutilizable para navegación de acciones en dashboards.
 * Muestra un ícono, título, descripción y un botón CTA.
 *
 * @example
 * <TarjetaAccion
 *   titulo="Usuarios"
 *   descripcion="Crear, editar y gestionar usuarios del sistema."
 *   Icono={PeopleIcon}
 *   textoCta="Gestionar usuarios"
 *   href={route('admin.users.index')}
 * />
 */
export default function TarjetaAccion({
    titulo,
    descripcion,
    Icono,
    textoCta,
    href,
    variante = 'contained',
    colorIcono = 'primary.main',
    accionesExtra,
}: Props) {
    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%' }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                    <Box sx={{ color: colorIcono }}>
                        <Icono sx={{ fontSize: 36 }} />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            {titulo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {descripcion}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        <Button
                            component={Link}
                            href={href}
                            variant={variante}
                            size="small"
                        >
                            {textoCta}
                        </Button>
                        {accionesExtra}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
