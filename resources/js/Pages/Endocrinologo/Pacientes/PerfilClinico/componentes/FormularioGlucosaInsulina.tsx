import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { GlucosaInsulinaData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: GlucosaInsulinaData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_resultado: string;
    glucosa_ayunas: string;
    insulina_ayunas: string;
    hemoglobina_glicosilada: string;
    glucosa_2h_ogtt: string;
    insulina_2h_ogtt: string;
    hiperinsulinemia: boolean;
    resistencia_insulina_sugerida: boolean;
    interpretacion: string;
}

export default function FormularioGlucosaInsulina({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        glucosa_ayunas: existente?.glucosa_ayunas?.toString() ?? '',
        insulina_ayunas: existente?.insulina_ayunas?.toString() ?? '',
        hemoglobina_glicosilada: existente?.hemoglobina_glicosilada?.toString() ?? '',
        glucosa_2h_ogtt: existente?.glucosa_2h_ogtt?.toString() ?? '',
        insulina_2h_ogtt: existente?.insulina_2h_ogtt?.toString() ?? '',
        hiperinsulinemia: existente?.hiperinsulinemia ?? false,
        resistencia_insulina_sugerida: existente?.resistencia_insulina_sugerida ?? false,
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/glucosa-insulina/${existente!.id_glucosa_insulina}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/laboratorios/glucosa-insulina`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    // Preview HOMA-IR
    const glucNum = parseFloat(data.glucosa_ayunas) || 0;
    const insNum = parseFloat(data.insulina_ayunas) || 0;
    const homaPreview = (glucNum > 0 && insNum > 0) ? ((glucNum * insNum) / 405).toFixed(2) : '-';

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={existente?.id_glucosa_insulina ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar glucosa e insulina' : 'Registrar glucosa e insulina'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <TextField label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={(e) => setData('fecha_resultado', e.target.value)} error={Boolean(errors.fecha_resultado)} helperText={errors.fecha_resultado} size="small" required fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 250 }} />

                        <Typography variant="subtitle2" color="text.secondary">Glucosa e insulina en ayunas</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            <TextField label="Glucosa ayunas (mg/dL)" type="number" value={data.glucosa_ayunas} onChange={(e) => setData('glucosa_ayunas', e.target.value)} error={Boolean(errors.glucosa_ayunas)} helperText={errors.glucosa_ayunas} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Insulina ayunas (µU/mL)" type="number" value={data.insulina_ayunas} onChange={(e) => setData('insulina_ayunas', e.target.value)} error={Boolean(errors.insulina_ayunas)} helperText={errors.insulina_ayunas} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="HOMA-IR (calculado)" value={homaPreview} size="small" fullWidth disabled helperText="Se calcula: (glucosa x insulina) / 405" />
                        </Box>

                        <TextField label="Hemoglobina glicosilada - HbA1c (%)" type="number" value={data.hemoglobina_glicosilada} onChange={(e) => setData('hemoglobina_glicosilada', e.target.value)} error={Boolean(errors.hemoglobina_glicosilada)} helperText={errors.hemoglobina_glicosilada} size="small" sx={{ maxWidth: 300 }} slotProps={{ htmlInput: { step: '0.01' } }} />

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">Prueba de tolerancia oral a la glucosa (OGTT 2h)</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="Glucosa 2h OGTT (mg/dL)" type="number" value={data.glucosa_2h_ogtt} onChange={(e) => setData('glucosa_2h_ogtt', e.target.value)} error={Boolean(errors.glucosa_2h_ogtt)} helperText={errors.glucosa_2h_ogtt} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Insulina 2h OGTT (µU/mL)" type="number" value={data.insulina_2h_ogtt} onChange={(e) => setData('insulina_2h_ogtt', e.target.value)} error={Boolean(errors.insulina_2h_ogtt)} helperText={errors.insulina_2h_ogtt} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                        </Box>

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">Conclusiones clínicas</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel control={<Checkbox checked={data.hiperinsulinemia} onChange={(e) => setData('hiperinsulinemia', e.target.checked)} />} label="Hiperinsulinemia" />
                            <FormControlLabel control={<Checkbox checked={data.resistencia_insulina_sugerida} onChange={(e) => setData('resistencia_insulina_sugerida', e.target.checked)} />} label="Resistencia a la insulina sugerida" />
                        </Box>

                        <TextField label="Interpretación clínica" value={data.interpretacion} onChange={(e) => setData('interpretacion', e.target.value)} error={Boolean(errors.interpretacion)} helperText={errors.interpretacion} fullWidth multiline rows={3} />
                    </Stack>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={handleCerrar} disabled={processing}>Cancelar</Button>
                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={processing}>
                        {processing ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Registrar')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
