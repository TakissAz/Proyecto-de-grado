import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { PerfilGonadotropoData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: PerfilGonadotropoData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_resultado: string;
    lh: string;
    fsh: string;
    estradiol: string;
    progesterona: string;
    progesterona_dia_ciclo: string;
    progesterona_fase_ciclo: string;
    interpretacion: string;
}

export default function FormularioPerfilGonadotropo({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        lh: existente?.lh?.toString() ?? '',
        fsh: existente?.fsh?.toString() ?? '',
        estradiol: existente?.estradiol?.toString() ?? '',
        progesterona: existente?.progesterona?.toString() ?? '',
        progesterona_dia_ciclo: existente?.progesterona_dia_ciclo?.toString() ?? '',
        progesterona_fase_ciclo: existente?.progesterona_fase_ciclo ?? '',
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-gonadotropo/${existente!.id_perfil_gonadotropo}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-gonadotropo`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    // Preview de relación LH/FSH
    const lhNum = parseFloat(data.lh) || 0;
    const fshNum = parseFloat(data.fsh) || 0;
    const relacionPreview = (lhNum > 0 && fshNum > 0) ? (lhNum / fshNum).toFixed(2) : '-';

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={existente?.id_perfil_gonadotropo ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar perfil gonadotropo' : 'Registrar perfil gonadotropo'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <TextField label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={(e) => setData('fecha_resultado', e.target.value)} error={Boolean(errors.fecha_resultado)} helperText={errors.fecha_resultado} size="small" required fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 250 }} />

                        <Typography variant="subtitle2" color="text.secondary">Gonadotropinas</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            <TextField label="LH (mUI/mL)" type="number" value={data.lh} onChange={(e) => setData('lh', e.target.value)} error={Boolean(errors.lh)} helperText={errors.lh} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="FSH (mUI/mL)" type="number" value={data.fsh} onChange={(e) => setData('fsh', e.target.value)} error={Boolean(errors.fsh)} helperText={errors.fsh} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Relación LH/FSH (calculada)" value={relacionPreview} size="small" fullWidth disabled helperText="Se calcula automáticamente en backend." />
                        </Box>

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">Esteroides ováricos</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="Estradiol (pg/mL)" type="number" value={data.estradiol} onChange={(e) => setData('estradiol', e.target.value)} error={Boolean(errors.estradiol)} helperText={errors.estradiol} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Progesterona (ng/mL)" type="number" value={data.progesterona} onChange={(e) => setData('progesterona', e.target.value)} error={Boolean(errors.progesterona)} helperText={errors.progesterona ?? 'Valor en fase lútea para evaluar ovulación.'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Día del ciclo (progesterona)" type="number" value={data.progesterona_dia_ciclo} onChange={(e) => setData('progesterona_dia_ciclo', e.target.value)} error={Boolean(errors.progesterona_dia_ciclo)} helperText={errors.progesterona_dia_ciclo ?? 'Ej: día 21-23 del ciclo'} size="small" fullWidth />
                            <TextField label="Fase del ciclo" value={data.progesterona_fase_ciclo} onChange={(e) => setData('progesterona_fase_ciclo', e.target.value)} error={Boolean(errors.progesterona_fase_ciclo)} helperText={errors.progesterona_fase_ciclo ?? 'Ej: folicular, lútea, ovulatoria'} size="small" fullWidth />
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
