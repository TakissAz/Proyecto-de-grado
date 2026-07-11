import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { PerfilAndrogenicoData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: PerfilAndrogenicoData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_resultado: string;
    testosterona_total: string;
    testosterona_libre: string;
    shbg: string;
    indice_androgenico_libre: string;
    dhea_s: string;
    androstenediona: string;
    hiperandrogenismo_bioquimico: boolean;
    interpretacion: string;
}

export default function FormularioPerfilAndrogenico({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        testosterona_total: existente?.testosterona_total?.toString() ?? '',
        testosterona_libre: existente?.testosterona_libre?.toString() ?? '',
        shbg: existente?.shbg?.toString() ?? '',
        indice_androgenico_libre: existente?.indice_androgenico_libre?.toString() ?? '',
        dhea_s: existente?.dhea_s?.toString() ?? '',
        androstenediona: existente?.androstenediona?.toString() ?? '',
        hiperandrogenismo_bioquimico: existente?.hiperandrogenismo_bioquimico ?? false,
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-androgenico/${existente!.id_perfil_androgenico}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-androgenico`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={existente?.id_perfil_androgenico ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar perfil androgénico' : 'Registrar perfil androgénico'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <TextField label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={(e) => setData('fecha_resultado', e.target.value)} error={Boolean(errors.fecha_resultado)} helperText={errors.fecha_resultado} size="small" required fullWidth slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 250 }} />

                        <Typography variant="subtitle2" color="text.secondary">Valores de laboratorio</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                            <TextField label="Testosterona total (ng/dL)" type="number" value={data.testosterona_total} onChange={(e) => setData('testosterona_total', e.target.value)} error={Boolean(errors.testosterona_total)} helperText={errors.testosterona_total} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Testosterona libre (pg/mL)" type="number" value={data.testosterona_libre} onChange={(e) => setData('testosterona_libre', e.target.value)} error={Boolean(errors.testosterona_libre)} helperText={errors.testosterona_libre} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="SHBG (nmol/L)" type="number" value={data.shbg} onChange={(e) => setData('shbg', e.target.value)} error={Boolean(errors.shbg)} helperText={errors.shbg} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Índice androgénico libre" type="number" value={data.indice_androgenico_libre} onChange={(e) => setData('indice_androgenico_libre', e.target.value)} error={Boolean(errors.indice_androgenico_libre)} helperText={errors.indice_androgenico_libre ?? 'FAI = (T total / SHBG) x 100'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="DHEA-S (μg/dL)" type="number" value={data.dhea_s} onChange={(e) => setData('dhea_s', e.target.value)} error={Boolean(errors.dhea_s)} helperText={errors.dhea_s} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Androstenediona (ng/mL)" type="number" value={data.androstenediona} onChange={(e) => setData('androstenediona', e.target.value)} error={Boolean(errors.androstenediona)} helperText={errors.androstenediona} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                        </Box>

                        <Divider />

                        <FormControlLabel
                            control={<Checkbox checked={data.hiperandrogenismo_bioquimico} onChange={(e) => setData('hiperandrogenismo_bioquimico', e.target.checked)} />}
                            label="Hiperandrogenismo bioquímico confirmado"
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
