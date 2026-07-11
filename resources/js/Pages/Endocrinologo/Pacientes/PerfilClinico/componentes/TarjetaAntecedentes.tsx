import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { Link } from '@inertiajs/react';
import type { AntecedentesData } from '../tipos';

interface Props {
    antecedentes: AntecedentesData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaAntecedentes({ antecedentes, idPaciente, onRegistrar, onEditar }: Props) {
    if (!antecedentes) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <MedicalServicesIcon color="disabled" />
                            <Typography variant="subtitle1" fontWeight={700}>Antecedentes endocrino-metabólicos</Typography>
                            <Chip label="Pendiente" size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            No se han registrado los antecedentes endocrino-metabólicos de esta paciente.
                            Estos datos son necesarios para evaluar riesgo metabólico y cardiovascular.
                        </Typography>
                        <Box>
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                                Registrar antecedentes
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    const personales = [
        antecedentes.diabetes_personal && 'Diabetes',
        antecedentes.hipertension_personal && 'Hipertensión',
        antecedentes.dislipidemia_personal && 'Dislipidemia',
        antecedentes.enfermedad_tiroidea && 'Enfermedad tiroidea',
        antecedentes.hiperprolactinemia_previa && 'Hiperprolactinemia',
    ].filter(Boolean) as string[];

    const familiares = [
        antecedentes.diabetes_familiar && 'Diabetes familiar',
        antecedentes.hipertension_familiar && 'Hipertensión familiar',
        antecedentes.dislipidemia_familiar && 'Dislipidemia familiar',
    ].filter(Boolean) as string[];

    const medicamentos = [
        antecedentes.uso_metformina && 'Metformina',
        antecedentes.uso_anticonceptivos && 'Anticonceptivos',
        antecedentes.uso_corticoides && 'Corticoides',
    ].filter(Boolean) as string[];

    const tieneHallazgos = personales.length > 0 || familiares.length > 0;

    const badgeEstado = tieneHallazgos
        ? { label: 'Antecedentes relevantes', color: 'warning' as const }
        : { label: 'Sin antecedentes relevantes', color: 'success' as const };

    const interpretacion = tieneHallazgos
        ? 'Existen antecedentes endocrino-metabólicos relevantes.'
        : 'Sin antecedentes endocrino-metabólicos relevantes registrados.';

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <MedicalServicesIcon color={tieneHallazgos ? 'warning' : 'success'} />
                            <Typography variant="subtitle1" fontWeight={700}>Antecedentes endocrino-metabólicos</Typography>
                            <Chip label={badgeEstado.label} color={badgeEstado.color} size="small" variant="outlined" />
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Button
                                component={Link}
                                href={`/endocrinologo/pacientes/${idPaciente}/antecedentes/historial`}
                                variant="text"
                                size="small"
                                startIcon={<HistoryIcon />}
                            >
                                Historial
                            </Button>
                            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEditar}>
                                Editar
                            </Button>
                        </Stack>
                    </Box>

                    <Divider />

                    {personales.length > 0 ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Antecedentes personales</Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                                {personales.map((item) => <Chip key={item} label={item} color="warning" size="small" variant="filled" />)}
                            </Stack>
                        </Box>
                    ) : null}

                    {familiares.length > 0 ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Antecedentes familiares</Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                                {familiares.map((item) => <Chip key={item} label={item} size="small" variant="outlined" />)}
                            </Stack>
                        </Box>
                    ) : null}

                    {medicamentos.length > 0 ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Medicamentos en uso</Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                                {medicamentos.map((item) => <Chip key={item} label={item} color="primary" size="small" variant="outlined" />)}
                            </Stack>
                        </Box>
                    ) : null}

                    {/* Interpretación */}
                    <Typography variant="body2" color={tieneHallazgos ? 'warning.main' : 'text.secondary'} fontWeight={500}>
                        {interpretacion}
                    </Typography>

                    {antecedentes.otros_medicamentos ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Otros medicamentos</Typography>
                            <Typography variant="body2">{antecedentes.otros_medicamentos}</Typography>
                        </Box>
                    ) : null}

                    {antecedentes.observaciones ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Observaciones</Typography>
                            <Typography variant="body2">{antecedentes.observaciones}</Typography>
                        </Box>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}
