import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import type { ConsultaInicial } from '../tipos';

interface Props {
    /** Datos de la consulta inicial, null si no existe */
    consulta: ConsultaInicial | null;
    /** ID del paciente para construir URLs */
    idPaciente: number;
    /** Callback para abrir formulario de registro */
    onRegistrar: () => void;
    /** Callback para abrir formulario de edición */
    onEditar: () => void;
}

/**
 * Tarjeta que muestra la consulta inicial del perfil clínico.
 * - Si no tiene datos: estado "Pendiente" + botón registrar.
 * - Si tiene datos: resumen + botón editar.
 */
export default function TarjetaConsultaInicial({
    consulta,
    idPaciente,
    onRegistrar,
    onEditar,
}: Props) {
    if (!consulta) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AssignmentIcon color="disabled" />
                            <Typography variant="subtitle1" fontWeight={700}>
                                Consulta inicial
                            </Typography>
                            <Chip label="Pendiente" size="small" variant="outlined" />
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            No se ha registrado la consulta inicial de esta paciente.
                            Registra el motivo de consulta y las sospechas clínicas iniciales.
                        </Typography>

                        <Box>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={onRegistrar}
                            >
                                Registrar consulta inicial
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AssignmentIcon color="success" />
                            <Typography variant="subtitle1" fontWeight={700}>
                                Consulta inicial
                            </Typography>
                            <Chip label="Registrada" color="success" size="small" variant="outlined" />
                        </Stack>

                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={onEditar}
                        >
                            Editar
                        </Button>
                    </Box>

                    <Divider />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                            gap: 2,
                        }}
                    >
                        <ItemDetalle etiqueta="Fecha de consulta" valor={consulta.fecha_consulta} />
                        <ItemDetalle
                            etiqueta="Profesional responsable"
                            valor={consulta.profesional?.nombre ?? 'No registrado'}
                        />
                        <Box sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}>
                            <ItemDetalle etiqueta="Motivo de consulta" valor={consulta.motivo_consulta} />
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Chip
                            label={consulta.sospecha_pmos ? 'Sospecha PMOS' : 'Sin sospecha PMOS'}
                            color={consulta.sospecha_pmos ? 'warning' : 'default'}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            label={consulta.sospecha_resistencia_insulina ? 'Sospecha RI' : 'Sin sospecha RI'}
                            color={consulta.sospecha_resistencia_insulina ? 'warning' : 'default'}
                            size="small"
                            variant="outlined"
                        />
                    </Stack>

                    {consulta.observaciones_generales ? (
                        <Box>
                            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                Observaciones clínicas
                            </Typography>
                            <Typography variant="body2">
                                {consulta.observaciones_generales}
                            </Typography>
                        </Box>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
}

function ItemDetalle({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {etiqueta}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
                {valor ?? '-'}
            </Typography>
        </Box>
    );
}
