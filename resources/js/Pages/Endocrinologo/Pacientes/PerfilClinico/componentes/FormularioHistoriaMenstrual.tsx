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
import type { HistoriaMenstrualData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    /** ID de la consulta endocrinológica asociada (requerido para creación) */
    idConsulta: number | null;
    /** Datos existentes para edición */
    historiaExistente?: HistoriaMenstrualData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_ultima_menstruacion: string;
    edad_menarquia: string;
    regularidad_ciclo: string;
    duracion_ciclo_dias: string;
    intervalo_entre_ciclos_dias: string;
    amenorrea: boolean;
    oligomenorrea: boolean;
    sangrado_abundante: boolean;
    dolor_menstrual: boolean;
    sospecha_anovulacion: boolean;
    progesterona_lutea: string;
    confirma_anovulacion_por_progesterona: boolean;
    observaciones: string;
}

export default function FormularioHistoriaMenstrual({
    abierto,
    idPaciente,
    idConsulta,
    historiaExistente,
    onCerrar,
}: Props) {
    const esEdicion = Boolean(historiaExistente);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: historiaExistente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        fecha_ultima_menstruacion: historiaExistente?.fecha_ultima_menstruacion ?? '',
        edad_menarquia: historiaExistente?.edad_menarquia?.toString() ?? '',
        regularidad_ciclo: historiaExistente?.regularidad_ciclo ?? '',
        duracion_ciclo_dias: historiaExistente?.duracion_ciclo_dias?.toString() ?? '',
        intervalo_entre_ciclos_dias: historiaExistente?.intervalo_entre_ciclos_dias?.toString() ?? '',
        amenorrea: historiaExistente?.amenorrea ?? false,
        oligomenorrea: historiaExistente?.oligomenorrea ?? false,
        sangrado_abundante: historiaExistente?.sangrado_abundante ?? false,
        dolor_menstrual: historiaExistente?.dolor_menstrual ?? false,
        sospecha_anovulacion: historiaExistente?.sospecha_anovulacion ?? false,
        progesterona_lutea: historiaExistente?.progesterona_lutea?.toString() ?? '',
        confirma_anovulacion_por_progesterona: historiaExistente?.confirma_anovulacion_por_progesterona ?? false,
        observaciones: historiaExistente?.observaciones ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/historia-menstrual/${historiaExistente!.id_historia_menstrual}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/historia-menstrual`;

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onCerrar();
            },
        });
    };

    const handleCerrar = () => {
        reset();
        onCerrar();
    };

    return (
        <Dialog open={abierto} onClose={handleCerrar} maxWidth="md" fullWidth key={historiaExistente?.id_historia_menstrual ?? 'new'}>
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar historia menstrual' : 'Registrar historia menstrual'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={3}>
                        {/* Ciclo menstrual */}
                        <Typography variant="subtitle2" color="text.secondary">
                            Datos del ciclo menstrual
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Regularidad del ciclo</InputLabel>
                                <Select
                                    value={data.regularidad_ciclo}
                                    label="Regularidad del ciclo"
                                    onChange={(e) => setData('regularidad_ciclo', e.target.value)}
                                    error={Boolean(errors.regularidad_ciclo)}
                                >
                                    <MenuItem value="">Sin especificar</MenuItem>
                                    <MenuItem value="regular">Regular</MenuItem>
                                    <MenuItem value="irregular">Irregular</MenuItem>
                                    <MenuItem value="ausente">Ausente</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Duración del ciclo (días)"
                                type="number"
                                value={data.duracion_ciclo_dias}
                                onChange={(e) => setData('duracion_ciclo_dias', e.target.value)}
                                error={Boolean(errors.duracion_ciclo_dias)}
                                helperText={errors.duracion_ciclo_dias}
                                size="small"
                                fullWidth
                            />

                            <TextField
                                label="Intervalo entre ciclos (días)"
                                type="number"
                                value={data.intervalo_entre_ciclos_dias}
                                onChange={(e) => setData('intervalo_entre_ciclos_dias', e.target.value)}
                                error={Boolean(errors.intervalo_entre_ciclos_dias)}
                                helperText={errors.intervalo_entre_ciclos_dias}
                                size="small"
                                fullWidth
                            />

                            <TextField
                                label="Fecha última menstruación"
                                type="date"
                                value={data.fecha_ultima_menstruacion}
                                onChange={(e) => setData('fecha_ultima_menstruacion', e.target.value)}
                                error={Boolean(errors.fecha_ultima_menstruacion)}
                                helperText={errors.fecha_ultima_menstruacion}
                                size="small"
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                            />

                            <TextField
                                label="Edad menarquía (años)"
                                type="number"
                                value={data.edad_menarquia}
                                onChange={(e) => setData('edad_menarquia', e.target.value)}
                                error={Boolean(errors.edad_menarquia)}
                                helperText={errors.edad_menarquia}
                                size="small"
                                fullWidth
                            />

                            <TextField
                                label="Progesterona lútea (ng/mL)"
                                type="number"
                                value={data.progesterona_lutea}
                                onChange={(e) => setData('progesterona_lutea', e.target.value)}
                                error={Boolean(errors.progesterona_lutea)}
                                helperText={errors.progesterona_lutea ?? 'Valor en fase lútea para confirmar ovulación.'}
                                size="small"
                                fullWidth
                                slotProps={{ htmlInput: { step: '0.01' } }}
                            />
                        </Box>

                        <Divider />

                        {/* Síntomas / hallazgos */}
                        <Typography variant="subtitle2" color="text.secondary">
                            Hallazgos clínicos
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                            <FormControlLabel
                                control={<Checkbox checked={data.amenorrea} onChange={(e) => setData('amenorrea', e.target.checked)} />}
                                label="Amenorrea"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.oligomenorrea} onChange={(e) => setData('oligomenorrea', e.target.checked)} />}
                                label="Oligomenorrea"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.sangrado_abundante} onChange={(e) => setData('sangrado_abundante', e.target.checked)} />}
                                label="Sangrado abundante"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.dolor_menstrual} onChange={(e) => setData('dolor_menstrual', e.target.checked)} />}
                                label="Dolor menstrual (dismenorrea)"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.sospecha_anovulacion} onChange={(e) => setData('sospecha_anovulacion', e.target.checked)} />}
                                label="Sospecha de anovulación"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={data.confirma_anovulacion_por_progesterona} onChange={(e) => setData('confirma_anovulacion_por_progesterona', e.target.checked)} />}
                                label="Anovulación confirmada por progesterona"
                            />
                        </Box>

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
