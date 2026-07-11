import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { DiagnosticoRiData, EvaluacionRiData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    evaluacion: EvaluacionRiData;
    existente?: DiagnosticoRiData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_diagnostico: string;
    homa_ir: string;
    glucosa_ayunas: string;
    insulina_ayunas: string;
    hemoglobina_glicosilada: string;
    resistencia_confirmada: boolean;
    grado_resistencia: string;
    riesgo_diabetes: string;
    riesgo_cardiometabolico: string;
    conclusion_medica: string;
    recomendaciones_medicas: string;
    id_glucosa_insulina: number | string;
    id_perfil_lipidico: number | string;
    id_evaluacion_fisica: number | string;
}

export default function FormularioDiagnosticoRi({ abierto, idPaciente, idConsulta, evaluacion, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_diagnostico: existente?.fecha_diagnostico ?? hoy,
        homa_ir: existente?.homa_ir?.toString() ?? evaluacion.homa_ir?.toString() ?? '',
        glucosa_ayunas: existente?.glucosa_ayunas?.toString() ?? evaluacion.glucosa_ayunas?.toString() ?? '',
        insulina_ayunas: existente?.insulina_ayunas?.toString() ?? evaluacion.insulina_ayunas?.toString() ?? '',
        hemoglobina_glicosilada: existente?.hemoglobina_glicosilada?.toString() ?? evaluacion.hemoglobina_glicosilada?.toString() ?? '',
        resistencia_confirmada: existente?.resistencia_confirmada ?? (evaluacion.diagnostico_sugerido === 'compatible_resistencia_insulina'),
        grado_resistencia: existente?.grado_resistencia ?? 'no_aplica',
        riesgo_diabetes: existente?.riesgo_diabetes ?? 'no_evaluado',
        riesgo_cardiometabolico: existente?.riesgo_cardiometabolico ?? evaluacion.riesgo_sugerido ?? 'no_evaluado',
        conclusion_medica: existente?.conclusion_medica ?? '',
        recomendaciones_medicas: existente?.recomendaciones_medicas ?? '',
        id_glucosa_insulina: evaluacion.id_glucosa_insulina ?? '',
        id_perfil_lipidico: evaluacion.id_perfil_lipidico ?? '',
        id_evaluacion_fisica: evaluacion.id_evaluacion_fisica ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/diagnostico-ri/${existente!.id_diagnostico_ri}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/diagnostico-ri`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar diagnóstico RI' : 'Registrar diagnóstico de resistencia a la insulina'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Valores pre-llenados desde los laboratorios registrados. El especialista confirma.
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <TextField label="Fecha del diagnóstico" type="date" value={data.fecha_diagnostico} onChange={(e) => setData('fecha_diagnostico', e.target.value)} error={Boolean(errors.fecha_diagnostico)} helperText={errors.fecha_diagnostico} size="small" required fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 250 }} />

                        <Typography variant="subtitle2" color="text.secondary">Valores metabólicos</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                            <TextField label="HOMA-IR" type="number" value={data.homa_ir} onChange={(e) => setData('homa_ir', e.target.value)} error={Boolean(errors.homa_ir)} helperText={errors.homa_ir ?? '>= 2.5 = RI'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Glucosa ayunas" type="number" value={data.glucosa_ayunas} onChange={(e) => setData('glucosa_ayunas', e.target.value)} error={Boolean(errors.glucosa_ayunas)} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Insulina ayunas" type="number" value={data.insulina_ayunas} onChange={(e) => setData('insulina_ayunas', e.target.value)} error={Boolean(errors.insulina_ayunas)} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="HbA1c (%)" type="number" value={data.hemoglobina_glicosilada} onChange={(e) => setData('hemoglobina_glicosilada', e.target.value)} error={Boolean(errors.hemoglobina_glicosilada)} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                        </Box>

                        <Divider />

                        <FormControlLabel control={<Checkbox checked={data.resistencia_confirmada} onChange={(e) => setData('resistencia_confirmada', e.target.checked)} />} label="Resistencia a la insulina confirmada" />

                        <Typography variant="subtitle2" color="text.secondary">Clasificación</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Grado de resistencia</InputLabel>
                                <Select value={data.grado_resistencia} label="Grado de resistencia" onChange={(e) => setData('grado_resistencia', e.target.value)}>
                                    <MenuItem value="no_aplica">No aplica</MenuItem>
                                    <MenuItem value="leve">Leve</MenuItem>
                                    <MenuItem value="moderada">Moderada</MenuItem>
                                    <MenuItem value="severa">Severa</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Riesgo diabetes</InputLabel>
                                <Select value={data.riesgo_diabetes} label="Riesgo diabetes" onChange={(e) => setData('riesgo_diabetes', e.target.value)}>
                                    <MenuItem value="no_evaluado">No evaluado</MenuItem>
                                    <MenuItem value="bajo">Bajo</MenuItem>
                                    <MenuItem value="moderado">Moderado</MenuItem>
                                    <MenuItem value="alto">Alto</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Riesgo cardiometabólico</InputLabel>
                                <Select value={data.riesgo_cardiometabolico} label="Riesgo cardiometabólico" onChange={(e) => setData('riesgo_cardiometabolico', e.target.value)}>
                                    <MenuItem value="no_evaluado">No evaluado</MenuItem>
                                    <MenuItem value="bajo">Bajo</MenuItem>
                                    <MenuItem value="moderado">Moderado</MenuItem>
                                    <MenuItem value="alto">Alto</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Divider />

                        <TextField label="Conclusión médica" value={data.conclusion_medica} onChange={(e) => setData('conclusion_medica', e.target.value)} error={Boolean(errors.conclusion_medica)} fullWidth multiline rows={3} />
                        <TextField label="Recomendaciones médicas" value={data.recomendaciones_medicas} onChange={(e) => setData('recomendaciones_medicas', e.target.value)} error={Boolean(errors.recomendaciones_medicas)} fullWidth multiline rows={3} />
                    </Stack>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={handleCerrar} disabled={processing}>Cancelar</Button>
                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={processing}>
                        {processing ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Confirmar diagnóstico')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
