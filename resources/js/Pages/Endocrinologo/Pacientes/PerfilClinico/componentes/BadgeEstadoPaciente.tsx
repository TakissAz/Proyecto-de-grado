import { Chip } from '@mui/material';

interface Props {
    estado: 'activo' | 'inactivo';
}

const colores: Record<string, 'success' | 'default' | 'error'> = {
    activo: 'success',
    inactivo: 'default',
};

export default function BadgeEstadoPaciente({ estado }: Props) {
    return (
        <Chip
            label={estado.charAt(0).toUpperCase() + estado.slice(1)}
            color={colores[estado] ?? 'default'}
            size="small"
        />
    );
}
