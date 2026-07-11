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
import type { ConsultaInicial } from '../tipos';

interface Props {
    /** Si está abierto */
    abierto: boolean;
    /** ID del paciente */
    idPaciente: number;
    /** Datos existentes para edición, null para creación */
    consultaExistente?: ConsultaInicial | null;
    /** Callback al cerrar */
    onCerrar: () => void;
}

interface FormData {
    fecha_consulta: string;
    motivo_consulta: string;
    sospecha_pmos: boolean;
    sospecha_resistencia_insulina: boolean;
    observaciones_generales: string;
}

/**
 * Formulario modal para registrar o editar la consulta inicial.
 * - Modo creación: POST a /endocrinologo/pacientes/{id}/consultas
 * - Modo edición: PUT a /endocrinologo/pacientes/{id}/consultas/{idConsulta}
 */
export default function FormularioConsultaInicial({
    abierto,
    idPaciente,
    consultaExistente,
    onCerrar,
}: Props) {
    const esEdicion = Boolean(consultaExistente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        fecha_consulta: consultaExistente?.fecha_consulta ?? hoy,
        motivo_consulta: consultaExistente?.motivo_consulta ?? '',
        sospecha_pmos: consultaExistente?.sospecha_pmos ?? false,
        sospecha_resistencia_insulina: consultaExistente?.sospecha_resistencia_insulina ?? false,
        observaciones_generales: consultaExistente?.observaciones_generales ?? '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/consultas/${consultaExistente!.id_consulta_endocrinologica}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/consultas`;

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
        <Dialog
            open={abierto}
            onClose={handleCerrar}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6" fontWeight={700}>
                    {esEdicion ? 'Editar consulta inicial' : 'Registrar consulta inicial'}
                </Typography>
            </DialogTitle>

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Fecha de consulta"
                            type="date"
                            value={data.fecha_consulta}
                            onChange={(e) => setData('fecha_consulta', e.target.value)}
                            error={Boolean(errors.fecha_consulta)}
                            helperText={errors.fecha_consulta}
                            fullWidth
                            required
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <TextField
                            label="Motivo de consulta"
                            value={data.motivo_consulta}
                            onChange={(e) => setData('motivo_consulta', e.target.value)}
                            error={Boolean(errors.motivo_consulta)}
                            helperText={errors.motivo_consulta ?? 'Describe el motivo principal de la atención.'}
                            fullWidth
                            required
                            multiline
                            rows={3}
                        />

                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Sospechas clínicas iniciales
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={data.sospecha_pmos}
                                        onChange={(e) => setData('sospecha_pmos', e.target.checked)}
                                    />
                                }
                                label="Sospecha de PMOS"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={data.sospecha_resistencia_insulina}
                                        onChange={(e) => setData('sospecha_resistencia_insulina', e.target.checked)}
                                    />
                                }
                                label="Sospecha de resistencia a la insulina"
                            />
                        </Box>

                        <TextField
                            label="Observaciones clínicas"
                            value={data.observaciones_generales}
                            onChange={(e) => setData('observaciones_generales', e.target.value)}
                            error={Boolean(errors.observaciones_generales)}
                            helperText={errors.observaciones_generales}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Notas relevantes sobre el estado clínico inicial de la paciente..."
                        />
                    </Stack>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={handleCerrar} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={processing}
                    >
                        {processing ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Registrar consulta')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
