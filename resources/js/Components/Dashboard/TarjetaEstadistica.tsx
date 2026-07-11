import { Box, Card, CardContent, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface Props {
    /** Etiqueta principal de la tarjeta */
    titulo: string;
    /** Descripción secundaria debajo del número */
    descripcion: string;
    /** Valor numérico o string a mostrar como estadística */
    valor: string | number;
    /** Icono MUI opcional */
    Icono?: SvgIconComponent;
    /** Color de acento para el icono y el valor (default: 'primary.main') */
    color?: string;
}

/**
 * Tarjeta reutilizable para mostrar una estadística numérica en dashboards.
 * Acepta un ícono MUI, título, descripción y valor.
 *
 * @example
 * <TarjetaEstadistica
 *   titulo="Pacientes"
 *   descripcion="Pacientes registradas"
 *   valor={42}
 *   Icono={PeopleIcon}
 * />
 */
export default function TarjetaEstadistica({
    titulo,
    descripcion,
    valor,
    Icono,
    color = 'primary.main',
}: Props) {
    return (
        <Card variant="outlined">
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
                    >
                        {titulo}
                    </Typography>
                    {Icono ? (
                        <Box sx={{ color, opacity: 0.75 }}>
                            <Icono fontSize="small" />
                        </Box>
                    ) : null}
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 700, color, lineHeight: 1.1 }}>
                    {valor}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {descripcion}
                </Typography>
            </CardContent>
        </Card>
    );
}
