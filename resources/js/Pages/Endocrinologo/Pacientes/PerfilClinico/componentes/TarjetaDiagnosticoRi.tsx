import { Alert, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { DiagnosticoRiData, EvaluacionRiData } from '../tipos';

interface Props {
    evaluacion: EvaluacionRiData;
    diagnostico: DiagnosticoRiData | null;
    onRegistrar: () => void;
    onEditar: () => void;
}

const etiquetasSugerencia: Record<string, { texto: string; color: 'error' | 'warning' | 'info' | 'success' }> = {
    compatible_resistencia_insulina: { texto: 'Compatible con RI', color: 'error' },
    sospecha_clinica_pendiente_confirmacion: { texto: 'Sospecha clínica, pendiente confirmación', color: 'warning' },
    datos_insuficientes: { texto: 'Datos insuficientes', color: 'info' },
    no_compatible: { texto: 'No compatible con RI', color: 'success' },
};

export default function TarjetaDiagnosticoRi({ evaluacion, diagnostico, onRegistrar, onEditar }: Props) {
    const sugerencia = etiquetasSugerencia[evaluacion.diagnostico_sugerido] ?? etiquetasSugerencia.datos_insuficientes;

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <MonitorHeartIcon color={diagnostico?.resistencia_confirmada ? 'error' : 'disabled'} />
                            <Typography variant="subtitle1" fontWeight={700}>Resistencia a la insulina</Typography>
                            {diagnostico ? (
                                <Chip label={diagnostico.resistencia_confirmada ? 'Confirmada' : 'Registrado'} color={diagnostico.resistencia_confirmada ? 'error' : 'default'} size="small" variant="outlined" />
                            ) : (
                                <Chip label="Pendiente de evaluación" size="small" variant="outlined" />
                            )}
                        </Stack>
                        {diagnostico ? (
                            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEditar}>Editar</Button>
                        ) : (
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>Registrar diagnóstico</Button>
                        )}
                    </Box>

                    <Divider />

                    <Typography variant="subtitle2" color="text.secondary">Indicadores evaluados (sugerencia del sistema)</Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                        <Indicador etiqueta="HOMA-IR elevado" cumple={evaluacion.homa_ir_elevado} detalle={evaluacion.homa_ir != null ? `${evaluacion.homa_ir}` : undefined} />
                        <Indicador etiqueta="Hiperinsulinemia" cumple={evaluacion.hiperinsulinemia} />
                        <Indicador etiqueta="Alteración glucémica" cumple={evaluacion.alteracion_glucemica} />
                        <Indicador etiqueta="Signos físicos" cumple={evaluacion.signos_fisicos_asociados} />
                        <Indicador etiqueta="Dislipidemia asociada" cumple={evaluacion.dislipidemia_asociada} />
                        <Indicador etiqueta="Antecedentes relevantes" cumple={evaluacion.antecedentes_relevantes} />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Chip label={sugerencia.texto} color={sugerencia.color} size="small" variant="filled" />
                        <Chip label={`Riesgo sugerido: ${evaluacion.riesgo_sugerido}`} color={evaluacion.riesgo_sugerido === 'alto' ? 'error' : evaluacion.riesgo_sugerido === 'moderado' ? 'warning' : 'default'} size="small" variant="outlined" />
                    </Stack>

                    {evaluacion.alertas_datos_faltantes.length > 0 ? (
                        <Alert severity="info" variant="outlined">
                            {evaluacion.alertas_datos_faltantes.map((a, i) => <Typography key={i} variant="body2">- {a}</Typography>)}
                        </Alert>
                    ) : null}

                    {diagnostico ? (
                        <>
                            <Divider />
                            <Typography variant="subtitle2" color="text.secondary">Diagnóstico del especialista</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                                <ItemDetalle etiqueta="Grado" valor={diagnostico.grado_resistencia.replace(/_/g, ' ')} />
                                <ItemDetalle etiqueta="Riesgo diabetes" valor={diagnostico.riesgo_diabetes.replace(/_/g, ' ')} />
                                <ItemDetalle etiqueta="Riesgo cardiometabólico" valor={diagnostico.riesgo_cardiometabolico.replace(/_/g, ' ')} />
                                <ItemDetalle etiqueta="Fecha" valor={diagnostico.fecha_diagnostico} />
                            </Box>
                            {diagnostico.conclusion_medica ? <Box><Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Conclusión</Typography><Typography variant="body2">{diagnostico.conclusion_medica}</Typography></Box> : null}
                            {diagnostico.recomendaciones_medicas ? <Box><Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Recomendaciones</Typography><Typography variant="body2">{diagnostico.recomendaciones_medicas}</Typography></Box> : null}
                        </>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}

function Indicador({ etiqueta, cumple, detalle }: { etiqueta: string; cumple: boolean; detalle?: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            {cumple ? <CheckCircleIcon color="warning" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
            <Box>
                <Typography variant="body2" fontWeight={500}>{etiqueta}</Typography>
                {detalle ? <Typography variant="caption" color="text.secondary">{detalle}</Typography> : null}
            </Box>
        </Box>
    );
}

function ItemDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return <Box><Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>{etiqueta}</Typography><Typography variant="body2" fontWeight={500}>{valor}</Typography></Box>;
}
