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
import AssignmentIcon from '@mui/icons-material/Assignment';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from '@inertiajs/react';

interface Props {
    /** Controla si el modal está abierto */
    abierto: boolean;
    /** ID del paciente al que pertenece la consulta */
    idPaciente: number;
    /** Nombre completo del paciente para mostrar en el título */
    nombrePaciente: string;
    /** URL de la ruta donde se envía el POST de la consulta */
    urlGuardar: string;
    /** Callback al cerrar/cancelar el modal */
    onCerrar: () => void;
}

interface FormConsulta {
    fecha_consulta: string;
    motivo_consulta: string;
    sospecha_pmos: boolean;
    sospecha_resistencia_insulina: boolean;
    observaciones_generales: string;
}

/**
 * Modal para iniciar una nueva consulta endocrinológica.
 * Se muestra automáticamente después de registrar un paciente nuevo.
 *
 * Campos según la tabla `consultas_endocrinologicas`:
 * - fecha_consulta
 * - motivo_consulta
 * - sospecha_pmos
 * - sospecha_resistencia_insulina
 * - observaciones_generales
 */
export default function ModalNuevaConsulta({
    abierto,
    idPaciente,
    nombrePaciente,
    urlGuardar,
    onCerrar,
}: Props) {
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm<FormConsulta>({
        fecha_consulta: hoy,
        motivo_consulta: '',
        sospecha_pmos: false,
        sospecha_resistencia_insulina: false,
        observaciones_generales: '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post(urlGuardar, {
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
            PaperProps={{ elevation: 3 }}
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <AssignmentIcon color="primary" />
                    <Box>
                        <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                            Iniciar consulta endocrinológica
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {nombrePaciente}
                        </Typography>
                    </Box>
                </Stack>
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
                            helperText={errors.motivo_consulta ?? 'Describe brevemente el motivo de la consulta.'}
                            fullWidth
                            required
                            multiline
                            rows={2}
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
                                label="Sospecha de PMOS (Síndrome de Ovario Poliquístico)"
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
                            label="Observaciones generales"
                            value={data.observaciones_generales}
                            onChange={(e) => setData('observaciones_generales', e.target.value)}
                            error={Boolean(errors.observaciones_generales)}
                            helperText={errors.observaciones_generales}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Notas adicionales sobre el estado general de la paciente..."
                        />
                    </Stack>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={handleCerrar}
                        disabled={processing}
                    >
                        Omitir por ahora
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={processing}
                    >
                        Iniciar consulta
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
