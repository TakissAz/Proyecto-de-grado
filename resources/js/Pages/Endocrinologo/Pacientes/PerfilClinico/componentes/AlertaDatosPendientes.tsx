import { Alert, Stack } from '@mui/material';
import type { Alerta } from '../tipos';

interface Props {
    alertas: Alerta[];
}

export default function AlertaDatosPendientes({ alertas }: Props) {
    if (alertas.length === 0) return null;

    return (
        <Stack spacing={1}>
            {alertas.map((alerta, index) => (
                <Alert key={index} severity={alerta.tipo} variant="outlined">
                    {alerta.mensaje}
                </Alert>
            ))}
        </Stack>
    );
}
