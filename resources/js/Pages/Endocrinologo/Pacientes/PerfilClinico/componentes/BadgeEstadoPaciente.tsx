import { Badge } from '@/Components/ui/badge';

interface Props {
    estado: 'activo' | 'inactivo';
}

export default function BadgeEstadoPaciente({ estado }: Props) {
    return (
        <Badge variante={estado === 'activo' ? 'success' : 'ghost'}>
            {estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Badge>
    );
}
