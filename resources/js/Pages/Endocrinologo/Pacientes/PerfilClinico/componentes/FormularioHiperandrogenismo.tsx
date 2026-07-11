import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { HiperandrogenismoData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: HiperandrogenismoData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    acne: boolean;
    acne_grado: string;
    hirsutismo: boolean;
    hirsutismo_zona: string;
    puntaje_ferriman_gallwey: string;
    alopecia_androgenica: boolean;
    seborrea: boolean;
    inicio_sintomas: string;
    progresion_sintomas: string;
    observaciones: string;
}

export default function FormularioHiperandrogenismo({
    abierto,
    idPaciente,
    idConsulta,
    existente,
    onCerrar,
}: Props) {
    const esEdicion = Boolean(existente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        acne: existente?.acne ?? false,
        acne_grado: existente?.acne_grado ?? 'no_aplica',
        hirsutismo: existente?.hirsutismo ?? false,
        hirsutismo_zona: existente?.hirsutismo_zona ?? '',
        puntaje_ferriman_gallwey: existente?.puntaje_ferriman_gallwey?.toString() ?? '',
        alopecia_androgenica: existente?.alopecia_androgenica ?? false,
        seborrea: existente?.seborrea ?? false,
        inicio_sintomas: existente?.inicio_sintomas ?? '',
        progresion_sintomas: existente?.progresion_sintomas ?? '',
        observaciones: existente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/hiperandrogenismo/${existente!.id_historia_hiperandrogenica}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/hiperandrogenismo`;

        post(url, {
            preserveScroll: true,
            onSuccess: () => { reset(); onCerrar(); },
        });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={existente?.id_historia_hiperandrogenica ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar hiperandrogenismo' : 'Registrar hiperandrogenismo'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Signos clínicos de hiperandrogenismo
                        </Typography>

                        {/* Acné */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                            <FormControlLabel
                                control={<Checkbox checked={data.acne} onChange={(e) => setData('acne', e.target.checked)} />}
                                label="Presencia de acné"
                            />
                            <FormControl fullWidth size="small" disabled={!data.acne}>
                                <InputLabel>Grado de acné</InputLabel>
                                <Select
                                    value={data.acne_grado}
                                    label="Grado de acné"
                                    onChange={(e) => setData('acne_grado', e.target.value)}
                                >
                                    <MenuItem value="no_aplica">No aplica</MenuItem>
                                    <MenuItem value="leve">Leve</MenuItem>
                                    <MenuItem value="moderado">Moderado</MenuItem>
                                    <MenuItem value="severo">Severo</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Hirsutismo */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                            <FormControlLabel
                                control={<Checkbox checked={data.hirsutismo} onChange={(e) => setData('hirsutismo', e.target.checked)} />}
                                label="Presencia de hirsutismo"
                            />
                            <TextField
                                label="Zonas afectadas"
                                value={data.hirsutismo_zona}
                                onChange={(e) => setData('hirsutismo_zona', e.target.value)}
                                error={Boolean(errors.hirsutismo_zona)}
                                helperText={errors.hirsutismo_zona ?? 'Ej: mentón, labio superior, abdomen'}
                                size="small"
                                fullWidth
                                disabled={!data.hirsutismo}
                            />
                        </Box>

                        <TextField
                            label="Puntaje Ferriman-Gallwey (0-36)"
                            type="number"
                            value={data.puntaje_ferriman_gallwey}
                            onChange={(e) => setData('puntaje_ferriman_gallwey', e.target.value)}
                            error={Boolean(errors.puntaje_ferriman_gallwey)}
                            helperText={errors.puntaje_ferriman_gallwey ?? 'Puntaje >= 8 se considera positivo para hirsutismo.'}
                            size="small"
                            sx={{ maxWidth: 300 }}
                        />

                        <Divider />

                        {/* Otros signos */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel
                                control={<Checkbox checked={data.alopecia_androgenica} onChange={(e) => setData('alopecia_androgenica', e.target.checked)} />}
                                label="Alopecia androgénica"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.seborrea} onChange={(e) => setData('seborrea', e.target.checked)} />}
                                label="Seborrea"
                            />
                        </Box>

                        <Divider />

                        {/* Evolución */}
                        <Typography variant="subtitle2" color="text.secondary">
                            Evolución de los síntomas
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                label="Inicio de los síntomas"
                                value={data.inicio_sintomas}
                                onChange={(e) => setData('inicio_sintomas', e.target.value)}
                                error={Boolean(errors.inicio_sintomas)}
                                helperText={errors.inicio_sintomas ?? 'Ej: pubertad, hace 2 años, post-embarazo'}
                                size="small"
                                fullWidth
                            />
                            <FormControl fullWidth size="small">
                                <InputLabel>Progresión</InputLabel>
                                <Select
                                    value={data.progresion_sintomas}
                                    label="Progresión"
                                    onChange={(e) => setData('progresion_sintomas', e.target.value)}
                                >
                                    <MenuItem value="">Sin especificar</MenuItem>
                                    <MenuItem value="estable">Estable</MenuItem>
                                    <MenuItem value="progresivo">Progresivo</MenuItem>
                                    <MenuItem value="regresivo">Regresivo</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <TextField
                            label="Observaciones"
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            error={Boolean(errors.observaciones)}
                            helperText={errors.observaciones}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Stack>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={handleCerrar} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={processing}>
                        {processing ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Registrar')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
