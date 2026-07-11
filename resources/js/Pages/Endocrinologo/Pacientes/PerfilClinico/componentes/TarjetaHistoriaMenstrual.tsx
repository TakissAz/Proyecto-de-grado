import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { Link } from '@inertiajs/react';
import type { HistoriaMenstrualData } from '../tipos';

interface Props {
    historia: HistoriaMenstrualData | null;
    idPaciente: number;
    onRegistrar: () => void;
    onEditar: () => void;
}

/**
 * Tarjeta mejorada de Historia Menstrual.
 * Muestra interpretación clínica, chips de hallazgos y botón de historial.
 */
export default function TarjetaHistoriaMenstrual({ historia, idPaciente, onRegistrar, onEditar }: Props) {
    if (!historia) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FavoriteIcon color="disabled" />
                            <Typography variant="subtitle1" fontWeight={700}>Historia menstrual</Typography>
                            <Chip label="Pendiente" size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            No se ha registrado la historia menstrual de esta paciente.
                            Este dato es necesario para evaluar alteración ovulatoria en el diagnóstico PMOS.
                        </Typography>
                        <Box>
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                                Registrar historia menstrual
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    // Evaluación de alteración ovulatoria
    const tieneAlteracionOvulatoria = historia.amenorrea
        || historia.oligomenorrea
        || historia.sospecha_anovulacion
        || historia.confirma_anovulacion_por_progesterona
        || historia.regularidad_ciclo === 'irregular'
        || historia.regularidad_ciclo === 'ausente';

    const badgeEstado = tieneAlteracionOvulatoria
        ? { label: 'Alteración ovulatoria sugerida', color: 'warning' as const }
        : { label: 'Registrada', color: 'success' as const };

    const interpretacion = tieneAlteracionOvulatoria
        ? 'Datos compatibles con alteración ovulatoria.'
        : 'Sin alteración ovulatoria evidente registrada.';

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FavoriteIcon color={tieneAlteracionOvulatoria ? 'warning' : 'success'} />
                            <Typography variant="subtitle1" fontWeight={700}>Historia menstrual</Typography>
                            <Chip label={badgeEstado.label} color={badgeEstado.color} size="small" variant="outlined" />
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Button
                                component={Link}
                                href={`/endocrinologo/pacientes/${idPaciente}/historia-menstrual/historial`}
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
                        <ItemDetalle etiqueta="Regularidad" valor={formatRegularidad(historia.regularidad_ciclo)} />
                        <ItemDetalle etiqueta="Duración del ciclo" valor={historia.duracion_ciclo_dias ? `${historia.duracion_ciclo_dias} días` : '-'} />
                        <ItemDetalle etiqueta="Intervalo entre ciclos" valor={historia.intervalo_entre_ciclos_dias ? `${historia.intervalo_entre_ciclos_dias} días` : '-'} />
                        <ItemDetalle etiqueta="Edad menarquía" valor={historia.edad_menarquia ? `${historia.edad_menarquia} años` : '-'} />
                        <ItemDetalle etiqueta="Última menstruación" valor={historia.fecha_ultima_menstruacion ?? '-'} />
                        <ItemDetalle etiqueta="Progesterona lútea" valor={historia.progesterona_lutea ? `${historia.progesterona_lutea} ng/mL` : '-'} />
                    </Box>

                    {/* Hallazgos clínicos como chips */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <ChipHallazgo label="Amenorrea" activo={historia.amenorrea} />
                        <ChipHallazgo label="Oligomenorrea" activo={historia.oligomenorrea} />
                        <ChipHallazgo label="Sangrado abundante" activo={historia.sangrado_abundante} />
                        <ChipHallazgo label="Dolor menstrual" activo={historia.dolor_menstrual} />
                        <ChipHallazgo label="Sospecha anovulación" activo={historia.sospecha_anovulacion} />
                        <ChipHallazgo label="Anovulación confirmada" activo={historia.confirma_anovulacion_por_progesterona} />
                    </Stack>

                    {/* Interpretación clínica */}
                    <Typography variant="body2" color={tieneAlteracionOvulatoria ? 'warning.main' : 'text.secondary'} fontWeight={500}>
                        {interpretacion}
                    </Typography>

                    {historia.observaciones ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Observaciones</Typography>
                            <Typography variant="body2">{historia.observaciones}</Typography>
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

function ChipHallazgo({ label, activo }: { label: string; activo: boolean }) {
    return (
        <Chip
            label={label}
            size="small"
            color={activo ? 'warning' : 'default'}
            variant={activo ? 'filled' : 'outlined'}
        />
    );
}

function formatRegularidad(valor?: string | null): string {
    const map: Record<string, string> = { regular: 'Regular', irregular: 'Irregular', ausente: 'Ausente' };
    return map[valor ?? ''] ?? 'No registrada';
}
