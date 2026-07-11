import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import type { EcografiaData } from '../tipos';

interface Props {
    ecografia: EcografiaData | null;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaEcografia({ ecografia, onRegistrar, onEditar }: Props) {
    if (!ecografia) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ImageSearchIcon color="disabled" />
                            <Typography variant="subtitle1" fontWeight={700}>Evaluación ecográfica</Typography>
                            <Chip label="Pendiente" size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            No se ha registrado evaluación ecográfica. Es necesaria para evaluar el criterio de morfología ovárica en el diagnóstico PMOS.
                        </Typography>
                        <Box>
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                                Registrar ecografía
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    const alertas: string[] = [];
    if (ecografia.volumen_ovario_derecho != null && ecografia.volumen_ovario_derecho >= 10) alertas.push(`Vol. OD elevado (${ecografia.volumen_ovario_derecho} mL)`);
    if (ecografia.volumen_ovario_izquierdo != null && ecografia.volumen_ovario_izquierdo >= 10) alertas.push(`Vol. OI elevado (${ecografia.volumen_ovario_izquierdo} mL)`);
    if (ecografia.foliculos_ovario_derecho != null && ecografia.foliculos_ovario_derecho >= 12) alertas.push(`Folículos OD elevados (${ecografia.foliculos_ovario_derecho})`);
    if (ecografia.foliculos_ovario_izquierdo != null && ecografia.foliculos_ovario_izquierdo >= 12) alertas.push(`Folículos OI elevados (${ecografia.foliculos_ovario_izquierdo})`);
    if (ecografia.morfologia_compatible_pmos) alertas.push('Morfología compatible con PMOS');
    if (ecografia.distribucion_periferica) alertas.push('Distribución periférica');

    const tieneHallazgos = alertas.length > 0;

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ImageSearchIcon color={tieneHallazgos ? 'warning' : 'success'} />
                            <Typography variant="subtitle1" fontWeight={700}>Evaluación ecográfica</Typography>
                            <Chip
                                label={tieneHallazgos ? 'Hallazgos compatibles' : 'Sin hallazgos relevantes'}
                                color={tieneHallazgos ? 'warning' : 'success'}
                                size="small"
                                variant="outlined"
                            />
                        </Stack>
                        <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEditar}>Editar</Button>
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        <ItemDetalle etiqueta="Fecha" valor={ecografia.fecha_ecografia} />
                        <ItemDetalle etiqueta="Tipo" valor={ecografia.tipo_ecografia ?? '-'} />
                        <ItemDetalle etiqueta="Vol. ovario derecho" valor={ecografia.volumen_ovario_derecho != null ? `${ecografia.volumen_ovario_derecho} mL` : '-'} />
                        <ItemDetalle etiqueta="Vol. ovario izquierdo" valor={ecografia.volumen_ovario_izquierdo != null ? `${ecografia.volumen_ovario_izquierdo} mL` : '-'} />
                        <ItemDetalle etiqueta="Folículos OD" valor={ecografia.foliculos_ovario_derecho?.toString() ?? '-'} />
                        <ItemDetalle etiqueta="Folículos OI" valor={ecografia.foliculos_ovario_izquierdo?.toString() ?? '-'} />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {tieneHallazgos ? (
                            alertas.map(a => <Chip key={a} label={a} color="warning" size="small" variant="filled" />)
                        ) : (
                            <Chip label="Sin hallazgos ecográficos compatibles" color="success" size="small" variant="outlined" />
                        )}
                    </Stack>

                    {ecografia.observaciones ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Observaciones</Typography>
                            <Typography variant="body2">{ecografia.observaciones}</Typography>
                        </Box>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}

function ItemDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>{etiqueta}</Typography>
            <Typography variant="body2" fontWeight={500}>{valor}</Typography>
        </Box>
    );
}
