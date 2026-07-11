import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { Link } from '@inertiajs/react';
import type { EvaluacionFisicaData } from '../tipos';

interface Props {
    evaluacion: EvaluacionFisicaData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaEvaluacionFisica({ evaluacion, idPaciente, onRegistrar, onEditar }: Props) {
    if (!evaluacion) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FitnessCenterIcon color="disabled" />
                            <Typography variant="subtitle1" fontWeight={700}>Evaluación física endocrina</Typography>
                            <Chip label="Pendiente" size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            No se ha registrado la evaluación física endocrina. Estos datos son necesarios para evaluar riesgo metabólico.
                        </Typography>
                        <Box>
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                                Registrar evaluación física
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    // Evaluar hallazgos
    const alertas: string[] = [];
    if (evaluacion.imc != null && evaluacion.imc >= 25) alertas.push(`IMC elevado (${evaluacion.imc})`);
    if (evaluacion.circunferencia_cintura != null && evaluacion.circunferencia_cintura >= 80) alertas.push('Cintura elevada');
    if (evaluacion.indice_cintura_cadera != null && evaluacion.indice_cintura_cadera >= 0.85) alertas.push('ICC elevado');
    if (evaluacion.presion_sistolica != null && evaluacion.presion_sistolica >= 130) alertas.push('PA sistólica elevada');
    if (evaluacion.presion_diastolica != null && evaluacion.presion_diastolica >= 85) alertas.push('PA diastólica elevada');
    if (evaluacion.acantosis_nigricans) alertas.push('Acantosis nigricans');
    if (evaluacion.skin_tags) alertas.push('Acrocordones');
    if (evaluacion.galactorrea) alertas.push('Galactorrea');
    if (evaluacion.hirsutismo_visible) alertas.push('Hirsutismo visible');
    if (evaluacion.puntaje_ferriman_gallwey != null && evaluacion.puntaje_ferriman_gallwey >= 8) alertas.push(`FG elevado (${evaluacion.puntaje_ferriman_gallwey})`);
    if (evaluacion.acne_visible) alertas.push('Acné visible');
    if (evaluacion.alopecia_visible) alertas.push('Alopecia visible');

    const tieneHallazgos = alertas.length > 0;

    const badgeEstado = tieneHallazgos
        ? { label: 'Hallazgos relevantes', color: 'warning' as const }
        : { label: 'Sin hallazgos relevantes', color: 'success' as const };

    const interpretacion = tieneHallazgos
        ? 'Existen hallazgos físicos relevantes para riesgo metabólico.'
        : 'Sin hallazgos físicos relevantes registrados.';

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FitnessCenterIcon color={tieneHallazgos ? 'warning' : 'success'} />
                            <Typography variant="subtitle1" fontWeight={700}>Evaluación física endocrina</Typography>
                            <Chip label={badgeEstado.label} color={badgeEstado.color} size="small" variant="outlined" />
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Button
                                component={Link}
                                href={`/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica/historial`}
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

                    {/* Mediciones principales */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                        <Medicion etiqueta="Peso" valor={evaluacion.peso} unidad="kg" />
                        <Medicion etiqueta="Talla" valor={evaluacion.talla} unidad="m" />
                        <Medicion etiqueta="IMC" valor={evaluacion.imc} alerta={evaluacion.imc != null && evaluacion.imc >= 25} />
                        <Medicion etiqueta="ICC" valor={evaluacion.indice_cintura_cadera} alerta={evaluacion.indice_cintura_cadera != null && evaluacion.indice_cintura_cadera >= 0.85} />
                        <Medicion etiqueta="Cintura" valor={evaluacion.circunferencia_cintura} unidad="cm" alerta={evaluacion.circunferencia_cintura != null && evaluacion.circunferencia_cintura >= 80} />
                        <Medicion etiqueta="Cadera" valor={evaluacion.circunferencia_cadera} unidad="cm" />
                        <Medicion etiqueta="PA sistólica" valor={evaluacion.presion_sistolica} unidad="mmHg" alerta={evaluacion.presion_sistolica != null && evaluacion.presion_sistolica >= 130} />
                        <Medicion etiqueta="PA diastólica" valor={evaluacion.presion_diastolica} unidad="mmHg" alerta={evaluacion.presion_diastolica != null && evaluacion.presion_diastolica >= 85} />
                    </Box>

                    {/* Chips de alertas */}
                    {tieneHallazgos ? (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                            {alertas.map(a => <Chip key={a} label={a} color="warning" size="small" variant="filled" />)}
                        </Stack>
                    ) : null}

                    {/* Hallazgos al examen */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <ChipExamen label="Hirsutismo" activo={evaluacion.hirsutismo_visible} />
                        <ChipExamen label="Acné" activo={evaluacion.acne_visible} />
                        <ChipExamen label="Alopecia" activo={evaluacion.alopecia_visible} />
                    </Stack>

                    {/* Interpretación */}
                    <Typography variant="body2" color={tieneHallazgos ? 'warning.main' : 'text.secondary'} fontWeight={500}>
                        {interpretacion}
                    </Typography>

                    {evaluacion.observaciones ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Observaciones</Typography>
                            <Typography variant="body2">{evaluacion.observaciones}</Typography>
                        </Box>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}

function Medicion({ etiqueta, valor, unidad, alerta }: { etiqueta: string; valor?: number | null; unidad?: string; alerta?: boolean }) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>{etiqueta}</Typography>
            <Typography variant="body2" fontWeight={500} color={alerta ? 'warning.main' : 'text.primary'}>
                {valor != null ? `${valor}${unidad ? ` ${unidad}` : ''}` : '-'}
            </Typography>
        </Box>
    );
}

function ChipExamen({ label, activo }: { label: string; activo: boolean }) {
    if (!activo) return <Chip label={label} size="small" variant="outlined" />;
    return <Chip label={label} size="small" color="warning" variant="filled" />;
}
