import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { DiagnosticoPmosData, EvaluacionPmosData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    evaluacion: EvaluacionPmosData;
    existente?: DiagnosticoPmosData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_diagnostico: string;
    cumple_alteracion_ovulatoria: boolean;
    cumple_hiperandrogenismo_clinico: boolean;
    cumple_hiperandrogenismo_bioquimico: boolean;
    cumple_hiperandrogenismo: boolean;
    tipo_hiperandrogenismo: string;
    cumple_morfologia_ovarica: boolean;
    total_criterios_rotterdam: number | string;
    fenotipo_pmos: string;
    diagnostico_confirmado: boolean;
    diagnosticos_diferenciales_descartados: boolean;
    severidad_clinica: string;
    riesgo_metabolico: string;
    conclusion_medica: string;
    recomendaciones_medicas: string;
    id_historia_menstrual: number | string;
    id_historia_hiperandrogenica: number | string;
    id_perfil_androgenico: number | string;
    id_perfil_gonadotropo: number | string;
    id_diferencial_endocrino: number | string;
    id_ecografia: number | string;
}

export default function FormularioDiagnosticoPmos({ abierto, idPaciente, idConsulta, evaluacion, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_diagnostico: existente?.fecha_diagnostico ?? hoy,
        cumple_alteracion_ovulatoria: existente?.cumple_alteracion_ovulatoria ?? evaluacion.cumple_alteracion_ovulatoria,
        cumple_hiperandrogenismo_clinico: existente?.cumple_hiperandrogenismo_clinico ?? evaluacion.cumple_hiperandrogenismo_clinico,
        cumple_hiperandrogenismo_bioquimico: existente?.cumple_hiperandrogenismo_bioquimico ?? evaluacion.cumple_hiperandrogenismo_bioquimico,
        cumple_hiperandrogenismo: existente?.cumple_hiperandrogenismo ?? evaluacion.cumple_hiperandrogenismo,
        tipo_hiperandrogenismo: existente?.tipo_hiperandrogenismo ?? evaluacion.tipo_hiperandrogenismo,
        cumple_morfologia_ovarica: existente?.cumple_morfologia_ovarica ?? evaluacion.cumple_morfologia_ovarica,
        total_criterios_rotterdam: existente?.total_criterios_rotterdam ?? evaluacion.total_criterios_rotterdam,
        fenotipo_pmos: existente?.fenotipo_pmos ?? evaluacion.fenotipo_sugerido ?? '',
        diagnostico_confirmado: existente?.diagnostico_confirmado ?? false,
        diagnosticos_diferenciales_descartados: existente?.diagnosticos_diferenciales_descartados ?? evaluacion.diagnosticos_diferenciales_descartados,
        severidad_clinica: existente?.severidad_clinica ?? '',
        riesgo_metabolico: existente?.riesgo_metabolico ?? '',
        conclusion_medica: existente?.conclusion_medica ?? '',
        recomendaciones_medicas: existente?.recomendaciones_medicas ?? '',
        id_historia_menstrual: evaluacion.id_historia_menstrual ?? '',
        id_historia_hiperandrogenica: evaluacion.id_historia_hiperandrogenica ?? '',
        id_perfil_androgenico: evaluacion.id_perfil_androgenico ?? '',
        id_perfil_gonadotropo: '',
        id_diferencial_endocrino: evaluacion.id_diferencial_endocrino ?? '',
        id_ecografia: evaluacion.id_ecografia ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/diagnostico-pmos/${existente!.id_diagnostico_pmos}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/diagnostico-pmos`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar diagnóstico PMOS' : 'Registrar diagnóstico PMOS'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Los criterios se pre-llenan con la evaluación del sistema. El especialista confirma o ajusta.
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <TextField label="Fecha del diagnóstico" type="date" value={data.fecha_diagnostico} onChange={(e) => setData('fecha_diagnostico', e.target.value)} error={Boolean(errors.fecha_diagnostico)} helperText={errors.fecha_diagnostico} size="small" required fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 250 }} />

                        <Typography variant="subtitle2" color="text.secondary">Criterios Rotterdam (revisión del especialista)</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel control={<Checkbox checked={data.cumple_alteracion_ovulatoria} onChange={(e) => setData('cumple_alteracion_ovulatoria', e.target.checked)} />} label="Cumple alteración ovulatoria" />
                            <FormControlLabel control={<Checkbox checked={data.cumple_hiperandrogenismo_clinico} onChange={(e) => setData('cumple_hiperandrogenismo_clinico', e.target.checked)} />} label="Hiperandrogenismo clínico" />
                            <FormControlLabel control={<Checkbox checked={data.cumple_hiperandrogenismo_bioquimico} onChange={(e) => setData('cumple_hiperandrogenismo_bioquimico', e.target.checked)} />} label="Hiperandrogenismo bioquímico" />
                            <FormControlLabel control={<Checkbox checked={data.cumple_morfologia_ovarica} onChange={(e) => setData('cumple_morfologia_ovarica', e.target.checked)} />} label="Morfología ovárica compatible" />
                            <FormControlLabel control={<Checkbox checked={data.diagnosticos_diferenciales_descartados} onChange={(e) => setData('diagnosticos_diferenciales_descartados', e.target.checked)} />} label="Diagnósticos diferenciales descartados" />
                            <FormControlLabel control={<Checkbox checked={data.diagnostico_confirmado} onChange={(e) => setData('diagnostico_confirmado', e.target.checked)} />} label="Diagnóstico PMOS confirmado" />
                        </Box>

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">Clasificación</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Fenotipo PMOS</InputLabel>
                                <Select value={data.fenotipo_pmos} label="Fenotipo PMOS" onChange={(e) => setData('fenotipo_pmos', e.target.value)}>
                                    <MenuItem value="">Sin clasificar</MenuItem>
                                    <MenuItem value="A_clasico_completo">A - Clásico completo</MenuItem>
                                    <MenuItem value="B_hiperandrogenico_anovulatorio">B - Hiperandrogénico anovulatorio</MenuItem>
                                    <MenuItem value="C_ovulatorio">C - Ovulatorio</MenuItem>
                                    <MenuItem value="D_no_hiperandrogenico">D - No hiperandrogénico</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Severidad clínica</InputLabel>
                                <Select value={data.severidad_clinica} label="Severidad clínica" onChange={(e) => setData('severidad_clinica', e.target.value)}>
                                    <MenuItem value="">Sin clasificar</MenuItem>
                                    <MenuItem value="leve">Leve</MenuItem>
                                    <MenuItem value="moderada">Moderada</MenuItem>
                                    <MenuItem value="severa">Severa</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Riesgo metabólico</InputLabel>
                                <Select value={data.riesgo_metabolico} label="Riesgo metabólico" onChange={(e) => setData('riesgo_metabolico', e.target.value)}>
                                    <MenuItem value="">Sin clasificar</MenuItem>
                                    <MenuItem value="bajo">Bajo</MenuItem>
                                    <MenuItem value="moderado">Moderado</MenuItem>
                                    <MenuItem value="alto">Alto</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Divider />

                        <TextField label="Conclusión médica" value={data.conclusion_medica} onChange={(e) => setData('conclusion_medica', e.target.value)} error={Boolean(errors.conclusion_medica)} helperText={errors.conclusion_medica} fullWidth multiline rows={3} />

                        <TextField label="Recomendaciones médicas" value={data.recomendaciones_medicas} onChange={(e) => setData('recomendaciones_medicas', e.target.value)} error={Boolean(errors.recomendaciones_medicas)} helperText={errors.recomendaciones_medicas} fullWidth multiline rows={3} />
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
