import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import type { ResumenClinico } from '../tipos';

interface Props {
    resumen: ResumenClinico;
}

export default function TarjetaResumenClinico({ resumen }: Props) {
    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocalHospitalIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight={700}>
                            Resumen clínico
                        </Typography>
                    </Stack>

                    <Divider />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                            gap: 2,
                        }}
                    >
                        <ResumenItem
                            etiqueta="Consultas registradas"
                            valor={String(resumen.total_consultas)}
                        />
                        <ResumenItem
                            etiqueta="Última consulta"
                            valor={resumen.ultima_consulta ?? 'Sin consultas'}
                        />

                        {resumen.diagnostico_pmos ? (
                            <>
                                <ResumenItem
                                    etiqueta="PMOS"
                                    valor={resumen.diagnostico_pmos.confirmado ? 'Confirmado' : 'En evaluación'}
                                    chip
                                    chipColor={resumen.diagnostico_pmos.confirmado ? 'error' : 'warning'}
                                />
                                {resumen.diagnostico_pmos.fenotipo ? (
                                    <ResumenItem
                                        etiqueta="Fenotipo"
                                        valor={resumen.diagnostico_pmos.fenotipo.replace(/_/g, ' ')}
                                    />
                                ) : null}
                            </>
                        ) : (
                            <ResumenItem etiqueta="PMOS" valor="Sin diagnóstico" />
                        )}

                        {resumen.diagnostico_resistencia_insulina ? (
                            <ResumenItem
                                etiqueta="Resistencia a la insulina"
                                valor="Confirmada"
                                chip
                                chipColor="error"
                            />
                        ) : (
                            <ResumenItem etiqueta="Resistencia a la insulina" valor="Sin diagnóstico" />
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function ResumenItem({
    etiqueta,
    valor,
    chip,
    chipColor,
}: {
    etiqueta: string;
    valor: string;
    chip?: boolean;
    chipColor?: 'default' | 'primary' | 'success' | 'error' | 'warning';
}) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {etiqueta}
            </Typography>
            {chip ? (
                <Chip label={valor} color={chipColor ?? 'default'} size="small" sx={{ mt: 0.5 }} />
            ) : (
                <Typography variant="body2" fontWeight={500}>{valor}</Typography>
            )}
        </Box>
    );
}
