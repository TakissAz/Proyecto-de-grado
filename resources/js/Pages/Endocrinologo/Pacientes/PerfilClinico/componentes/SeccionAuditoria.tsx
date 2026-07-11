import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import type { Auditoria } from '../tipos';

interface Props {
    auditoria: Auditoria;
}

export default function SeccionAuditoria({ auditoria }: Props) {
    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <HistoryIcon color="action" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight={700}>
                            Auditoría
                        </Typography>
                    </Stack>

                    <Divider />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                            gap: 2,
                        }}
                    >
                        <AuditoriaItem etiqueta="Creado" valor={auditoria.creado_en} />
                        <AuditoriaItem etiqueta="Última actualización" valor={auditoria.actualizado_en} />
                        <AuditoriaItem etiqueta="Fecha de registro clínico" valor={auditoria.fecha_registro} />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function AuditoriaItem({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
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
