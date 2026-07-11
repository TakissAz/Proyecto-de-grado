import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { PerfilLipidicoData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: PerfilLipidicoData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_resultado: string;
    colesterol_total: string;
    hdl: string;
    ldl: string;
    vldl: string;
    trigliceridos: string;
    dislipidemia_sugerida: boolean;
    interpretacion: string;
}

export default function FormularioPerfilLipidico({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        colesterol_total: existente?.colesterol_total?.toString() ?? '',
        hdl: existente?.hdl?.toString() ?? '',
        ldl: existente?.ldl?.toString() ?? '',
        vldl: existente?.vldl?.toString() ?? '',
        trigliceridos: existente?.trigliceridos?.toString() ?? '',
        dislipidemia_sugerida: existente?.dislipidemia_sugerida ?? false,
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-lipidico/${existente!.id_perfil_lipidico}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-lipidico`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    // Preview colesterol no-HDL
    const colNum = parseFloat(data.colesterol_total) || 0;
    const hdlNum = parseFloat(data.hdl) || 0;
    const noHdlPreview = (colNum > 0 && hdlNum > 0) ? (colNum - hdlNum).toFixed(2) : '-';

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={existente?.id_perfil_lipidico ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar perfil lipídico' : 'Registrar perfil lipídico'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <TextField label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={(e) => setData('fecha_resultado', e.target.value)} error={Boolean(errors.fecha_resultado)} helperText={errors.fecha_resultado} size="small" required fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 250 }} />

                        <Typography variant="subtitle2" color="text.secondary">Valores lipídicos</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            <TextField label="Colesterol total (mg/dL)" type="number" value={data.colesterol_total} onChange={(e) => setData('colesterol_total', e.target.value)} error={Boolean(errors.colesterol_total)} helperText={errors.colesterol_total ?? 'Riesgo >= 200'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="HDL (mg/dL)" type="number" value={data.hdl} onChange={(e) => setData('hdl', e.target.value)} error={Boolean(errors.hdl)} helperText={errors.hdl ?? 'Riesgo < 50 en mujeres'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="LDL (mg/dL)" type="number" value={data.ldl} onChange={(e) => setData('ldl', e.target.value)} error={Boolean(errors.ldl)} helperText={errors.ldl ?? 'Riesgo >= 130'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="VLDL (mg/dL)" type="number" value={data.vldl} onChange={(e) => setData('vldl', e.target.value)} error={Boolean(errors.vldl)} helperText={errors.vldl ?? 'Si vacío, se calcula: TG/5'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Triglicéridos (mg/dL)" type="number" value={data.trigliceridos} onChange={(e) => setData('trigliceridos', e.target.value)} error={Boolean(errors.trigliceridos)} helperText={errors.trigliceridos ?? 'Riesgo >= 150'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Col. no-HDL (calculado)" value={noHdlPreview} size="small" fullWidth disabled helperText="Col. total - HDL (se calcula en backend)" />
                        </Box>

                        <Divider />

                        <FormControlLabel
                            control={<Checkbox checked={data.dislipidemia_sugerida} onChange={(e) => setData('dislipidemia_sugerida', e.target.checked)} />}
                            label="Dislipidemia sugerida (se marca automáticamente si aplica)"
                        />

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
