import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { Link } from '@inertiajs/react';
import type { HiperandrogenismoData } from '../tipos';

interface Props {
    hiperandrogenismo: HiperandrogenismoData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

export default function TarjetaHiperandrogenismo({ hiperandrogenismo, idPaciente, onRegistrar, onEditar }: Props) {
    if (!hiperandrogenismo) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <WarningIcon color="disabled" />
                            <Typography variant="subtitle1" fontWeight={700}>Hiperandrogenismo</Typography>
                            <Chip label="Pendiente" size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            No se ha registrado la evaluación de hiperandrogenismo clínico.
                            Este dato es necesario para el criterio de hiperandrogenismo en el diagnóstico PMOS.
                        </Typography>
                        <Box>
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                                Registrar hiperandrogenismo
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    const tieneHallazgos = hiperandrogenismo.acne || hiperandrogenismo.hirsutismo || hiperandrogenismo.alopecia_androgenica || hiperandrogenismo.seborrea;
    const ferrimanAlto = (hiperandrogenismo.puntaje_ferriman_gallwey ?? 0) >= 8;
    const acneRelevante = hiperandrogenismo.acne && (hiperandrogenismo.acne_grado === 'moderado' || hiperandrogenismo.acne_grado === 'severo');

    // Interpretación clínica
    const tieneHiperandrogenismoClinico = hiperandrogenismo.hirsutismo || hiperandrogenismo.alopecia_androgenica || acneRelevante || ferrimanAlto;

    const badgeEstado = tieneHiperandrogenismoClinico
        ? { label: 'Hiperandrogenismo clínico', color: 'warning' as const }
        : tieneHallazgos
            ? { label: 'Hallazgos leves', color: 'default' as const }
            : { label: 'Sin signos relevantes', color: 'success' as const };

    const interpretacion = tieneHiperandrogenismoClinico
        ? 'Datos compatibles con hiperandrogenismo clínico.'
        : 'Sin signos clínicos relevantes de hiperandrogenismo registrados.';

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <WarningIcon color={tieneHiperandrogenismoClinico ? 'warning' : 'success'} />
                            <Typography variant="subtitle1" fontWeight={700}>Hiperandrogenismo</Typography>
                            <Chip label={badgeEstado.label} color={badgeEstado.color} size="small" variant="outlined" />
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Button
                                component={Link}
                                href={`/endocrinologo/pacientes/${idPaciente}/hiperandrogenismo/historial`}
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

                    {/* Datos principales */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        {hiperandrogenismo.acne ? (
                            <ItemDetalle etiqueta="Acné" valor={`Grado: ${formatGrado(hiperandrogenismo.acne_grado)}`} />
                        ) : null}
                        {hiperandrogenismo.hirsutismo ? (
                            <ItemDetalle etiqueta="Hirsutismo" valor={hiperandrogenismo.hirsutismo_zona ?? 'Presente'} />
                        ) : null}
                        {hiperandrogenismo.puntaje_ferriman_gallwey != null ? (
                            <ItemDetalle etiqueta="Ferriman-Gallwey" valor={`${hiperandrogenismo.puntaje_ferriman_gallwey} pts`} />
                        ) : null}
                        {hiperandrogenismo.inicio_sintomas ? (
                            <ItemDetalle etiqueta="Inicio síntomas" valor={hiperandrogenismo.inicio_sintomas} />
                        ) : null}
                        {hiperandrogenismo.progresion_sintomas ? (
                            <ItemDetalle etiqueta="Progresión" valor={formatProgresion(hiperandrogenismo.progresion_sintomas)} />
                        ) : null}
                    </Box>

                    {/* Chips de hallazgos */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {acneRelevante ? <Chip label={`Acné ${hiperandrogenismo.acne_grado}`} color="warning" size="small" /> : null}
                        {hiperandrogenismo.hirsutismo ? <Chip label="Hirsutismo" color="warning" size="small" /> : null}
                        {ferrimanAlto ? <Chip label={`FG >= 8 (${hiperandrogenismo.puntaje_ferriman_gallwey})`} color="error" size="small" /> : null}
                        {hiperandrogenismo.alopecia_androgenica ? <Chip label="Alopecia androgénica" color="warning" size="small" /> : null}
                        {hiperandrogenismo.seborrea ? <Chip label="Seborrea" size="small" variant="outlined" /> : null}
                        {hiperandrogenismo.progresion_sintomas === 'progresivo' ? <Chip label="Progresión activa" color="error" size="small" variant="outlined" /> : null}
                        {!tieneHallazgos ? <Chip label="Sin hallazgos" color="success" size="small" variant="outlined" /> : null}
                    </Stack>

                    {/* Interpretación */}
                    <Typography variant="body2" color={tieneHiperandrogenismoClinico ? 'warning.main' : 'text.secondary'} fontWeight={500}>
                        {interpretacion}
                    </Typography>

                    {hiperandrogenismo.observaciones ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Observaciones</Typography>
                            <Typography variant="body2">{hiperandrogenismo.observaciones}</Typography>
                        </Box>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}

function ItemDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>{etiqueta}</Typography>
            <Typography variant="body2" fontWeight={500}>{valor}</Typography>
        </Box>
    );
}

function formatGrado(grado: string): string {
    const map: Record<string, string> = { no_aplica: 'No aplica', leve: 'Leve', moderado: 'Moderado', severo: 'Severo' };
    return map[grado] ?? grado;
}

function formatProgresion(progresion: string): string {
    const map: Record<string, string> = { estable: 'Estable', progresivo: 'Progresivo', regresivo: 'Regresivo' };
    return map[progresion] ?? progresion;
}
