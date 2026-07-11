import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';
import type { AntecedentesData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: AntecedentesData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    diabetes_familiar: boolean;
    diabetes_personal: boolean;
    hipertension_familiar: boolean;
    hipertension_personal: boolean;
    dislipidemia_familiar: boolean;
    dislipidemia_personal: boolean;
    enfermedad_tiroidea: boolean;
    hiperprolactinemia_previa: boolean;
    uso_anticonceptivos: boolean;
    uso_metformina: boolean;
    uso_corticoides: boolean;
    otros_medicamentos: string;
    observaciones: string;
}

export default function FormularioAntecedentes({
    abierto,
    idPaciente,
    idConsulta,
    existente,
    onCerrar,
}: Props) {
    const esEdicion = Boolean(existente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        diabetes_familiar: existente?.diabetes_familiar ?? false,
        diabetes_personal: existente?.diabetes_personal ?? false,
        hipertension_familiar: existente?.hipertension_familiar ?? false,
        hipertension_personal: existente?.hipertension_personal ?? false,
        dislipidemia_familiar: existente?.dislipidemia_familiar ?? false,
        dislipidemia_personal: existente?.dislipidemia_personal ?? false,
        enfermedad_tiroidea: existente?.enfermedad_tiroidea ?? false,
        hiperprolactinemia_previa: existente?.hiperprolactinemia_previa ?? false,
        uso_anticonceptivos: existente?.uso_anticonceptivos ?? false,
        uso_metformina: existente?.uso_metformina ?? false,
        uso_corticoides: existente?.uso_corticoides ?? false,
        otros_medicamentos: existente?.otros_medicamentos ?? '',
        observaciones: existente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/antecedentes/${existente!.id_antecedente}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/antecedentes`;

        post(url, {
            preserveScroll: true,
            onSuccess: () => { reset(); onCerrar(); },
        });
    };

    const handleCerrar = () => { reset(); onCerrar(); };

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={existente?.id_antecedente ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar antecedentes endocrino-metabólicos' : 'Registrar antecedentes endocrino-metabólicos'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        {/* Antecedentes personales */}
                        <Typography variant="subtitle2" color="text.secondary">
                            Antecedentes personales
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel
                                control={<Checkbox checked={data.diabetes_personal} onChange={(e) => setData('diabetes_personal', e.target.checked)} />}
                                label="Diabetes personal"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.hipertension_personal} onChange={(e) => setData('hipertension_personal', e.target.checked)} />}
                                label="Hipertensión personal"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.dislipidemia_personal} onChange={(e) => setData('dislipidemia_personal', e.target.checked)} />}
                                label="Dislipidemia personal"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.enfermedad_tiroidea} onChange={(e) => setData('enfermedad_tiroidea', e.target.checked)} />}
                                label="Enfermedad tiroidea"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.hiperprolactinemia_previa} onChange={(e) => setData('hiperprolactinemia_previa', e.target.checked)} />}
                                label="Hiperprolactinemia previa"
                            />
                        </Box>

                        <Divider />

                        {/* Antecedentes familiares */}
                        <Typography variant="subtitle2" color="text.secondary">
                            Antecedentes familiares
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel
                                control={<Checkbox checked={data.diabetes_familiar} onChange={(e) => setData('diabetes_familiar', e.target.checked)} />}
                                label="Diabetes familiar"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.hipertension_familiar} onChange={(e) => setData('hipertension_familiar', e.target.checked)} />}
                                label="Hipertensión familiar"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.dislipidemia_familiar} onChange={(e) => setData('dislipidemia_familiar', e.target.checked)} />}
                                label="Dislipidemia familiar"
                            />
                        </Box>

                        <Divider />

                        {/* Medicamentos */}
                        <Typography variant="subtitle2" color="text.secondary">
                            Medicamentos en uso actual
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel
                                control={<Checkbox checked={data.uso_metformina} onChange={(e) => setData('uso_metformina', e.target.checked)} />}
                                label="Metformina"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.uso_anticonceptivos} onChange={(e) => setData('uso_anticonceptivos', e.target.checked)} />}
                                label="Anticonceptivos"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.uso_corticoides} onChange={(e) => setData('uso_corticoides', e.target.checked)} />}
                                label="Corticoides"
                            />
                        </Box>

                        <TextField
                            label="Otros medicamentos"
                            value={data.otros_medicamentos}
                            onChange={(e) => setData('otros_medicamentos', e.target.value)}
                            error={Boolean(errors.otros_medicamentos)}
                            helperText={errors.otros_medicamentos ?? 'Listar otros medicamentos en uso si aplica.'}
                            fullWidth
                            multiline
                            rows={2}
                        />

                        <Divider />

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
