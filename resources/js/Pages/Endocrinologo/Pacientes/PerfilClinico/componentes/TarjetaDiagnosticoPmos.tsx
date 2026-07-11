import { Alert, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { DiagnosticoPmosData, EvaluacionPmosData } from '../tipos';

interface Props {
    evaluacion: EvaluacionPmosData;
    diagnostico: DiagnosticoPmosData | null;
    onRegistrar: () => void;
    onEditar: () => void;
}

const etiquetasSugerencia: Record<string, { texto: string; color: 'success' | 'warning' | 'info' | 'error' }> = {
    compatible_pmos: { texto: 'Compatible con PMOS', color: 'warning' },
    pendiente_descartar_diferenciales: { texto: 'Pendiente descartar diferenciales', color: 'info' },
    datos_insuficientes: { texto: 'Datos insuficientes para evaluar', color: 'info' },
    no_compatible: { texto: 'No compatible con PMOS', color: 'success' },
};

export default function TarjetaDiagnosticoPmos({ evaluacion, diagnostico, onRegistrar, onEditar }: Props) {
    const sugerencia = etiquetasSugerencia[evaluacion.diagnostico_sugerido] ?? etiquetasSugerencia.datos_insuficientes;

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <LocalHospitalIcon color={diagnostico?.diagnostico_confirmado ? 'error' : 'disabled'} />
                            <Typography variant="subtitle1" fontWeight={700}>Diagnóstico PMOS</Typography>
                            {diagnostico ? (
                                <Chip
                                    label={diagnostico.diagnostico_confirmado ? 'Confirmado' : 'Registrado (no confirmado)'}
                                    color={diagnostico.diagnostico_confirmado ? 'error' : 'default'}
                                    size="small"
                                    variant="outlined"
                                />
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

                    {/* Evaluación automática de criterios */}
                    <Typography variant="subtitle2" color="text.secondary">Evaluación de criterios Rotterdam (sugerencia del sistema)</Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                        <CriterioItem
                            etiqueta="1. Alteración ovulatoria"
                            cumple={evaluacion.cumple_alteracion_ovulatoria}
                        />
                        <CriterioItem
                            etiqueta="2. Hiperandrogenismo"
                            cumple={evaluacion.cumple_hiperandrogenismo}
                            detalle={evaluacion.tipo_hiperandrogenismo !== 'ninguno' ? evaluacion.tipo_hiperandrogenismo.replace(/_/g, ' ') : undefined}
                        />
                        <CriterioItem
                            etiqueta="3. Morfología ovárica"
                            cumple={evaluacion.cumple_morfologia_ovarica}
                        />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Chip
                            label={`${evaluacion.total_criterios_rotterdam}/3 criterios`}
                            color={evaluacion.total_criterios_rotterdam >= 2 ? 'warning' : 'default'}
                            size="small"
                        />
                        <Chip
                            label={evaluacion.diagnosticos_diferenciales_descartados ? 'Diferenciales descartados' : 'Diferenciales pendientes'}
                            color={evaluacion.diagnosticos_diferenciales_descartados ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                        />
                        <Chip label={sugerencia.texto} color={sugerencia.color} size="small" variant="filled" />
                        {evaluacion.fenotipo_sugerido ? (
                            <Chip label={`Fenotipo sugerido: ${evaluacion.fenotipo_sugerido.replace(/_/g, ' ')}`} size="small" variant="outlined" />
                        ) : null}
                    </Stack>

                    {evaluacion.alertas_datos_faltantes.length > 0 ? (
                        <Alert severity="info" variant="outlined">
                            <Typography variant="body2" fontWeight={600} gutterBottom>Datos faltantes para completar evaluación:</Typography>
                            {evaluacion.alertas_datos_faltantes.map((a, i) => (
                                <Typography key={i} variant="body2">- {a}</Typography>
                            ))}
                        </Alert>
                    ) : null}

                    {/* Diagnóstico registrado por el especialista */}
                    {diagnostico ? (
                        <>
                            <Divider />
                            <Typography variant="subtitle2" color="text.secondary">Diagnóstico confirmado por el especialista</Typography>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                                {diagnostico.fenotipo_pmos ? <ItemDetalle etiqueta="Fenotipo" valor={diagnostico.fenotipo_pmos.replace(/_/g, ' ')} /> : null}
                                {diagnostico.severidad_clinica ? <ItemDetalle etiqueta="Severidad" valor={diagnostico.severidad_clinica} /> : null}
                                {diagnostico.riesgo_metabolico ? <ItemDetalle etiqueta="Riesgo metabólico" valor={diagnostico.riesgo_metabolico} /> : null}
                                <ItemDetalle etiqueta="Fecha" valor={diagnostico.fecha_diagnostico} />
                            </Box>

                            {diagnostico.conclusion_medica ? (
                                <Box>
                                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Conclusión médica</Typography>
                                    <Typography variant="body2">{diagnostico.conclusion_medica}</Typography>
                                </Box>
                            ) : null}

                            {diagnostico.recomendaciones_medicas ? (
                                <Box>
                                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Recomendaciones</Typography>
                                    <Typography variant="body2">{diagnostico.recomendaciones_medicas}</Typography>
                                </Box>
                            ) : null}
                        </>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}

function CriterioItem({ etiqueta, cumple, detalle }: { etiqueta: string; cumple: boolean; detalle?: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            {cumple ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}
            <Box>
                <Typography variant="body2" fontWeight={500}>{etiqueta}</Typography>
                {detalle ? <Typography variant="caption" color="text.secondary">{detalle}</Typography> : null}
            </Box>
        </Box>
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
