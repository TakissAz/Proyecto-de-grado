import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { EcografiaData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: EcografiaData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_ecografia: string;
    tipo_ecografia: string;
    volumen_ovario_derecho: string;
    volumen_ovario_izquierdo: string;
    foliculos_ovario_derecho: string;
    foliculos_ovario_izquierdo: string;
    distribucion_periferica: boolean;
    observaciones: string;
}

export default function FormularioEcografia({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_ecografia: existente?.fecha_ecografia ?? hoy,
        tipo_ecografia: existente?.tipo_ecografia ?? '',
        volumen_ovario_derecho: existente?.volumen_ovario_derecho?.toString() ?? '',
        volumen_ovario_izquierdo: existente?.volumen_ovario_izquierdo?.toString() ?? '',
        foliculos_ovario_derecho: existente?.foliculos_ovario_derecho?.toString() ?? '',
        foliculos_ovario_izquierdo: existente?.foliculos_ovario_izquierdo?.toString() ?? '',
        distribucion_periferica: existente?.distribucion_periferica ?? false,
        observaciones: existente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/ecografia/${existente!.id_ecografia}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/ecografia`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar evaluación ecográfica' : 'Registrar evaluación ecográfica'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="Fecha de ecografía" type="date" value={data.fecha_ecografia} onChange={(e) => setData('fecha_ecografia', e.target.value)} error={Boolean(errors.fecha_ecografia)} helperText={errors.fecha_ecografia} size="small" required fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo de ecografía</InputLabel>
                                <Select value={data.tipo_ecografia} label="Tipo de ecografía" onChange={(e) => setData('tipo_ecografia', e.target.value)}>
                                    <MenuItem value="">Sin especificar</MenuItem>
                                    <MenuItem value="transvaginal">Transvaginal</MenuItem>
                                    <MenuItem value="abdominal">Abdominal</MenuItem>
                                    <MenuItem value="otra">Otra</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">Ovario derecho</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="Volumen ovario derecho (mL)" type="number" value={data.volumen_ovario_derecho} onChange={(e) => setData('volumen_ovario_derecho', e.target.value)} error={Boolean(errors.volumen_ovario_derecho)} helperText={errors.volumen_ovario_derecho ?? 'Compatible si >= 10 mL'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Conteo folicular OD" type="number" value={data.foliculos_ovario_derecho} onChange={(e) => setData('foliculos_ovario_derecho', e.target.value)} error={Boolean(errors.foliculos_ovario_derecho)} helperText={errors.foliculos_ovario_derecho ?? 'Compatible si >= 12'} size="small" fullWidth />
                        </Box>

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">Ovario izquierdo</Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="Volumen ovario izquierdo (mL)" type="number" value={data.volumen_ovario_izquierdo} onChange={(e) => setData('volumen_ovario_izquierdo', e.target.value)} error={Boolean(errors.volumen_ovario_izquierdo)} helperText={errors.volumen_ovario_izquierdo ?? 'Compatible si >= 10 mL'} size="small" fullWidth slotProps={{ htmlInput: { step: '0.01' } }} />
                            <TextField label="Conteo folicular OI" type="number" value={data.foliculos_ovario_izquierdo} onChange={(e) => setData('foliculos_ovario_izquierdo', e.target.value)} error={Boolean(errors.foliculos_ovario_izquierdo)} helperText={errors.foliculos_ovario_izquierdo ?? 'Compatible si >= 12'} size="small" fullWidth />
                        </Box>

                        <Divider />

                        <FormControlLabel
                            control={<Checkbox checked={data.distribucion_periferica} onChange={(e) => setData('distribucion_periferica', e.target.checked)} />}
                            label="Distribución periférica de folículos"
                        />

                        <Typography variant="caption" color="text.secondary">
                            La morfología compatible con PMOS se evalúa automáticamente en base al volumen y conteo folicular.
                        </Typography>

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
