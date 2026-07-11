import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { EvaluacionFisicaData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: EvaluacionFisicaData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    peso: string;
    talla: string;
    circunferencia_cintura: string;
    circunferencia_cadera: string;
    presion_sistolica: string;
    presion_diastolica: string;
    acantosis_nigricans: boolean;
    skin_tags: boolean;
    galactorrea: boolean;
    hirsutismo_visible: boolean;
    puntaje_ferriman_gallwey: string;
    acne_visible: boolean;
    alopecia_visible: boolean;
    observaciones: string;
}

export default function FormularioEvaluacionFisica({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        peso: existente?.peso?.toString() ?? '',
        talla: existente?.talla?.toString() ?? '',
        circunferencia_cintura: existente?.circunferencia_cintura?.toString() ?? '',
        circunferencia_cadera: existente?.circunferencia_cadera?.toString() ?? '',
        presion_sistolica: existente?.presion_sistolica?.toString() ?? '',
        presion_diastolica: existente?.presion_diastolica?.toString() ?? '',
        acantosis_nigricans: existente?.acantosis_nigricans ?? false,
        skin_tags: existente?.skin_tags ?? false,
        galactorrea: existente?.galactorrea ?? false,
        hirsutismo_visible: existente?.hirsutismo_visible ?? false,
        puntaje_ferriman_gallwey: existente?.puntaje_ferriman_gallwey?.toString() ?? '',
        acne_visible: existente?.acne_visible ?? false,
        alopecia_visible: existente?.alopecia_visible ?? false,
        observaciones: existente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica/${existente!.id_evaluacion_fisica}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    // Cálculo visual del IMC (solo para mostrar, el real se calcula en backend)
    const pesoNum = parseFloat(data.peso) || 0;
    const tallaNum = parseFloat(data.talla) || 0;
    const imcPreview = (pesoNum > 0 && tallaNum > 0) ? (pesoNum / (tallaNum * tallaNum)).toFixed(2) : '-';

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={existente?.id_evaluacion_fisica ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar evaluación física' : 'Registrar evaluación física'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <Typography variant="subtitle2" color="text.secondary">Antropometría</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            <TextField label="Peso (kg)" type="number" value={data.peso} onChange={(e) => setData('peso', e.target.value)} error={Boolean(errors.peso)} helperText={errors.peso} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Talla (m)" type="number" value={data.talla} onChange={(e) => setData('talla', e.target.value)} error={Boolean(errors.talla)} helperText={errors.talla ?? 'Ej: 1.65'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="IMC (calculado)" value={imcPreview} size="small" fullWidth disabled helperText="Se calcula automáticamente." />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="Circunferencia cintura (cm)" type="number" value={data.circunferencia_cintura} onChange={(e) => setData('circunferencia_cintura', e.target.value)} error={Boolean(errors.circunferencia_cintura)} helperText={errors.circunferencia_cintura ?? 'Riesgo >= 80 cm en mujeres'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.1' } }} />
                            <TextField label="Circunferencia cadera (cm)" type="number" value={data.circunferencia_cadera} onChange={(e) => setData('circunferencia_cadera', e.target.value)} error={Boolean(errors.circunferencia_cadera)} helperText={errors.circunferencia_cadera} size="small" fullWidth slotProps={{ htmlInput: { step: '0.1' } }} />
                        </Box>

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">Presión arterial</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="PA sistólica (mmHg)" type="number" value={data.presion_sistolica} onChange={(e) => setData('presion_sistolica', e.target.value)} error={Boolean(errors.presion_sistolica)} helperText={errors.presion_sistolica} size="small" fullWidth />
                            <TextField label="PA diastólica (mmHg)" type="number" value={data.presion_diastolica} onChange={(e) => setData('presion_diastolica', e.target.value)} error={Boolean(errors.presion_diastolica)} helperText={errors.presion_diastolica} size="small" fullWidth />
                        </Box>

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">Hallazgos al examen físico</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel control={<Checkbox checked={data.acantosis_nigricans} onChange={(e) => setData('acantosis_nigricans', e.target.checked)} />} label="Acantosis nigricans" />
                            <FormControlLabel control={<Checkbox checked={data.skin_tags} onChange={(e) => setData('skin_tags', e.target.checked)} />} label="Acrocordones (skin tags)" />
                            <FormControlLabel control={<Checkbox checked={data.galactorrea} onChange={(e) => setData('galactorrea', e.target.checked)} />} label="Galactorrea" />
                            <FormControlLabel control={<Checkbox checked={data.hirsutismo_visible} onChange={(e) => setData('hirsutismo_visible', e.target.checked)} />} label="Hirsutismo visible" />
                            <FormControlLabel control={<Checkbox checked={data.acne_visible} onChange={(e) => setData('acne_visible', e.target.checked)} />} label="Acné visible" />
                            <FormControlLabel control={<Checkbox checked={data.alopecia_visible} onChange={(e) => setData('alopecia_visible', e.target.checked)} />} label="Alopecia visible" />
                        </Box>

                        <TextField label="Puntaje Ferriman-Gallwey (0-36)" type="number" value={data.puntaje_ferriman_gallwey} onChange={(e) => setData('puntaje_ferriman_gallwey', e.target.value)} error={Boolean(errors.puntaje_ferriman_gallwey)} helperText={errors.puntaje_ferriman_gallwey} size="small" sx={{ maxWidth: 300 }} />

                        <Divider />

                        <TextField label="Observaciones" value={data.observaciones} onChange={(e) => setData('observaciones', e.target.value)} error={Boolean(errors.observaciones)} helperText={errors.observaciones} fullWidth multiline rows={3} />
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
