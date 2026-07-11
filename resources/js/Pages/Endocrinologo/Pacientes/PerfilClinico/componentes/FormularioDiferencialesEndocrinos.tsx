import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { DiferencialEndocrinoData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: DiferencialEndocrinoData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_resultado: string;
    tsh: string;
    t3_libre: string;
    t4_libre: string;
    prolactina: string;
    diecisiete_oh_progesterona: string;
    cortisol: string;
    alteracion_tiroidea_descartada: boolean;
    hiperprolactinemia_descartada: boolean;
    hiperplasia_suprarrenal_descartada: boolean;
    cushing_descartado: boolean;
    interpretacion: string;
}

export default function FormularioDiferencialesEndocrinos({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        tsh: existente?.tsh?.toString() ?? '',
        t3_libre: existente?.t3_libre?.toString() ?? '',
        t4_libre: existente?.t4_libre?.toString() ?? '',
        prolactina: existente?.prolactina?.toString() ?? '',
        diecisiete_oh_progesterona: existente?.diecisiete_oh_progesterona?.toString() ?? '',
        cortisol: existente?.cortisol?.toString() ?? '',
        alteracion_tiroidea_descartada: existente?.alteracion_tiroidea_descartada ?? false,
        hiperprolactinemia_descartada: existente?.hiperprolactinemia_descartada ?? false,
        hiperplasia_suprarrenal_descartada: existente?.hiperplasia_suprarrenal_descartada ?? false,
        cushing_descartado: existente?.cushing_descartado ?? false,
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/diferenciales/${existente!.id_diferencial_endocrino}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/laboratorios/diferenciales`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={existente?.id_diferencial_endocrino ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar diferenciales endocrinos' : 'Registrar diferenciales endocrinos'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <TextField label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={(e) => setData('fecha_resultado', e.target.value)} error={Boolean(errors.fecha_resultado)} helperText={errors.fecha_resultado} size="small" required fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 250 }} />

                        <Typography variant="subtitle2" color="text.secondary">Valores de laboratorio</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            <TextField label="TSH (mUI/L)" type="number" value={data.tsh} onChange={(e) => setData('tsh', e.target.value)} error={Boolean(errors.tsh)} helperText={errors.tsh} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="T3 libre (pg/mL)" type="number" value={data.t3_libre} onChange={(e) => setData('t3_libre', e.target.value)} error={Boolean(errors.t3_libre)} helperText={errors.t3_libre} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="T4 libre (ng/dL)" type="number" value={data.t4_libre} onChange={(e) => setData('t4_libre', e.target.value)} error={Boolean(errors.t4_libre)} helperText={errors.t4_libre} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Prolactina (ng/mL)" type="number" value={data.prolactina} onChange={(e) => setData('prolactina', e.target.value)} error={Boolean(errors.prolactina)} helperText={errors.prolactina} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="17-OH Progesterona (ng/mL)" type="number" value={data.diecisiete_oh_progesterona} onChange={(e) => setData('diecisiete_oh_progesterona', e.target.value)} error={Boolean(errors.diecisiete_oh_progesterona)} helperText={errors.diecisiete_oh_progesterona} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Cortisol (μg/dL)" type="number" value={data.cortisol} onChange={(e) => setData('cortisol', e.target.value)} error={Boolean(errors.cortisol)} helperText={errors.cortisol} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                        </Box>

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">
                            Diagnósticos diferenciales descartados
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Marcar los diagnósticos que fueron descartados por estos resultados.
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel control={<Checkbox checked={data.alteracion_tiroidea_descartada} onChange={(e) => setData('alteracion_tiroidea_descartada', e.target.checked)} />} label="Alteración tiroidea descartada" />
                            <FormControlLabel control={<Checkbox checked={data.hiperprolactinemia_descartada} onChange={(e) => setData('hiperprolactinemia_descartada', e.target.checked)} />} label="Hiperprolactinemia descartada" />
                            <FormControlLabel control={<Checkbox checked={data.hiperplasia_suprarrenal_descartada} onChange={(e) => setData('hiperplasia_suprarrenal_descartada', e.target.checked)} />} label="Hiperplasia suprarrenal descartada" />
                            <FormControlLabel control={<Checkbox checked={data.cushing_descartado} onChange={(e) => setData('cushing_descartado', e.target.checked)} />} label="Síndrome de Cushing descartado" />
                        </Box>

                        <Divider />

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
