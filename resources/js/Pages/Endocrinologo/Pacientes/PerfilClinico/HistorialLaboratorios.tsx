import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Box, Button, Card, CardContent, Chip, Paper, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface RegistroBase { id: number; fecha_resultado: string; interpretacion?: string | null; created_at?: string | null; updated_at?: string | null }

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    historial: {
        perfil_androgenico: (RegistroBase & { testosterona_total?: number | null; testosterona_libre?: number | null; shbg?: number | null; indice_androgenico_libre?: number | null; dhea_s?: number | null; androstenediona?: number | null; hiperandrogenismo_bioquimico?: boolean })[];
        perfil_gonadotropo: (RegistroBase & { lh?: number | null; fsh?: number | null; relacion_lh_fsh?: number | null; estradiol?: number | null; progesterona?: number | null; progesterona_dia_ciclo?: number | null; progesterona_fase_ciclo?: string | null })[];
        diferencial_endocrino: (RegistroBase & { tsh?: number | null; t3_libre?: number | null; t4_libre?: number | null; prolactina?: number | null; diecisiete_oh_progesterona?: number | null; cortisol?: number | null; alteracion_tiroidea_descartada?: boolean; hiperprolactinemia_descartada?: boolean; hiperplasia_suprarrenal_descartada?: boolean; cushing_descartado?: boolean })[];
        glucosa_insulina: (RegistroBase & { glucosa_ayunas?: number | null; insulina_ayunas?: number | null; homa_ir?: number | null; hemoglobina_glicosilada?: number | null; glucosa_2h_ogtt?: number | null; insulina_2h_ogtt?: number | null; hiperinsulinemia?: boolean; resistencia_insulina_sugerida?: boolean })[];
        perfil_lipidico: (RegistroBase & { colesterol_total?: number | null; hdl?: number | null; ldl?: number | null; vldl?: number | null; trigliceridos?: number | null; colesterol_no_hdl?: number | null; dislipidemia_sugerida?: boolean })[];
    };
}

export default function HistorialLaboratorios({ paciente, historial }: Props) {
    const id = paciente.id_paciente;
    const [tab, setTab] = useState(0);

    const tabs = [
        { label: 'Andrógenos', count: historial.perfil_androgenico.length },
        { label: 'Gonadotropo', count: historial.perfil_gonadotropo.length },
        { label: 'Diferenciales', count: historial.diferencial_endocrino.length },
        { label: 'Glucosa/Insulina', count: historial.glucosa_insulina.length },
        { label: 'Lípidos', count: historial.perfil_lipidico.length },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Historial de laboratorios</h2>}>
            <Head title={`Historial laboratorios: ${paciente.nombre_completo}`} />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={3}>
                    <Button component={Link} href={`/endocrinologo/pacientes/${id}/perfil-clinico`} variant="text" startIcon={<ArrowBackIcon />} size="small" sx={{ alignSelf: 'flex-start' }}>
                        Volver al perfil clínico
                    </Button>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                            <Box>
                                <Typography variant="h5" fontWeight={700}>{paciente.nombre_completo}</Typography>
                                <Typography variant="body2" color="text.secondary">CI: {paciente.ci}</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Typography variant="h6" fontWeight={600}>Historial de laboratorios</Typography>

                    <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                        {tabs.map((t, i) => <Tab key={i} label={`${t.label} (${t.count})`} />)}
                    </Tabs>

                    {tab === 0 && <TablaAndrogenico registros={historial.perfil_androgenico} />}
                    {tab === 1 && <TablaGonadotropo registros={historial.perfil_gonadotropo} />}
                    {tab === 2 && <TablaDiferenciales registros={historial.diferencial_endocrino} />}
                    {tab === 3 && <TablaGlucosa registros={historial.glucosa_insulina} />}
                    {tab === 4 && <TablaLipidico registros={historial.perfil_lipidico} />}
                </Stack>
            </Box>
        </AuthenticatedLayout>
    );
}

function EstadoVacio({ mensaje }: { mensaje: string }) {
    return <Card variant="outlined"><CardContent><Typography color="text.secondary" textAlign="center" sx={{ py: 3 }}>{mensaje}</Typography></CardContent></Card>;
}

function V({ valor, unidad }: { valor?: number | null; unidad?: string }) {
    return valor != null ? `${valor}${unidad ? ` ${unidad}` : ''}` : '-';
}

function TablaAndrogenico({ registros }: { registros: Props['historial']['perfil_androgenico'] }) {
    if (registros.length === 0) return <EstadoVacio mensaje="No existen registros de perfil androgénico." />;
    return (
        <Paper variant="outlined"><TableContainer sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>
            <TableCell>Fecha</TableCell><TableCell>T. Total</TableCell><TableCell>T. Libre</TableCell><TableCell>SHBG</TableCell><TableCell>IAL</TableCell><TableCell>DHEA-S</TableCell><TableCell>Androst.</TableCell><TableCell>HA Bioq.</TableCell>
        </TableRow></TableHead><TableBody>
            {registros.map(r => <TableRow key={r.id} hover>
                <TableCell><Typography variant="body2" fontWeight={500}>{r.fecha_resultado}</Typography><Typography variant="caption" color="text.secondary">{r.created_at}</Typography></TableCell>
                <TableCell>{V({ valor: r.testosterona_total, unidad: 'ng/dL' })}</TableCell><TableCell>{V({ valor: r.testosterona_libre })}</TableCell><TableCell>{V({ valor: r.shbg })}</TableCell>
                <TableCell>{V({ valor: r.indice_androgenico_libre })}</TableCell><TableCell>{V({ valor: r.dhea_s })}</TableCell><TableCell>{V({ valor: r.androstenediona })}</TableCell>
                <TableCell>{r.hiperandrogenismo_bioquimico ? <Chip label="Positivo" color="error" size="small" /> : <Chip label="Negativo" size="small" variant="outlined" />}</TableCell>
            </TableRow>)}
        </TableBody></Table></TableContainer></Paper>
    );
}

function TablaGonadotropo({ registros }: { registros: Props['historial']['perfil_gonadotropo'] }) {
    if (registros.length === 0) return <EstadoVacio mensaje="No existen registros de perfil gonadotropo." />;
    return (
        <Paper variant="outlined"><TableContainer sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>
            <TableCell>Fecha</TableCell><TableCell>LH</TableCell><TableCell>FSH</TableCell><TableCell>LH/FSH</TableCell><TableCell>Estradiol</TableCell><TableCell>Progesterona</TableCell><TableCell>Día ciclo</TableCell>
        </TableRow></TableHead><TableBody>
            {registros.map(r => <TableRow key={r.id} hover>
                <TableCell><Typography variant="body2" fontWeight={500}>{r.fecha_resultado}</Typography><Typography variant="caption" color="text.secondary">{r.created_at}</Typography></TableCell>
                <TableCell>{V({ valor: r.lh })}</TableCell><TableCell>{V({ valor: r.fsh })}</TableCell>
                <TableCell>{r.relacion_lh_fsh != null ? <Chip label={`${r.relacion_lh_fsh}`} size="small" color={r.relacion_lh_fsh > 2 ? 'warning' : 'default'} variant="outlined" /> : '-'}</TableCell>
                <TableCell>{V({ valor: r.estradiol })}</TableCell><TableCell>{V({ valor: r.progesterona })}</TableCell><TableCell>{r.progesterona_dia_ciclo ?? '-'}</TableCell>
            </TableRow>)}
        </TableBody></Table></TableContainer></Paper>
    );
}

function TablaDiferenciales({ registros }: { registros: Props['historial']['diferencial_endocrino'] }) {
    if (registros.length === 0) return <EstadoVacio mensaje="No existen registros de diferenciales endocrinos." />;
    return (
        <Paper variant="outlined"><TableContainer sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>
            <TableCell>Fecha</TableCell><TableCell>TSH</TableCell><TableCell>T3L</TableCell><TableCell>T4L</TableCell><TableCell>Prolactina</TableCell><TableCell>17-OHP</TableCell><TableCell>Cortisol</TableCell><TableCell>Descartes</TableCell>
        </TableRow></TableHead><TableBody>
            {registros.map(r => <TableRow key={r.id} hover>
                <TableCell><Typography variant="body2" fontWeight={500}>{r.fecha_resultado}</Typography><Typography variant="caption" color="text.secondary">{r.created_at}</Typography></TableCell>
                <TableCell>{V({ valor: r.tsh })}</TableCell><TableCell>{V({ valor: r.t3_libre })}</TableCell><TableCell>{V({ valor: r.t4_libre })}</TableCell>
                <TableCell>{V({ valor: r.prolactina })}</TableCell><TableCell>{V({ valor: r.diecisiete_oh_progesterona })}</TableCell><TableCell>{V({ valor: r.cortisol })}</TableCell>
                <TableCell><Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {r.alteracion_tiroidea_descartada ? <Chip label="Tir." color="success" size="small" /> : <Chip label="Tir." size="small" variant="outlined" />}
                    {r.hiperprolactinemia_descartada ? <Chip label="Prol." color="success" size="small" /> : <Chip label="Prol." size="small" variant="outlined" />}
                    {r.hiperplasia_suprarrenal_descartada ? <Chip label="HSR" color="success" size="small" /> : <Chip label="HSR" size="small" variant="outlined" />}
                    {r.cushing_descartado ? <Chip label="Cush." color="success" size="small" /> : <Chip label="Cush." size="small" variant="outlined" />}
                </Stack></TableCell>
            </TableRow>)}
        </TableBody></Table></TableContainer></Paper>
    );
}

function TablaGlucosa({ registros }: { registros: Props['historial']['glucosa_insulina'] }) {
    if (registros.length === 0) return <EstadoVacio mensaje="No existen registros de glucosa e insulina." />;
    return (
        <Paper variant="outlined"><TableContainer sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>
            <TableCell>Fecha</TableCell><TableCell>Glucosa</TableCell><TableCell>Insulina</TableCell><TableCell>HOMA-IR</TableCell><TableCell>HbA1c</TableCell><TableCell>OGTT 2h</TableCell><TableCell>Estado</TableCell>
        </TableRow></TableHead><TableBody>
            {registros.map(r => <TableRow key={r.id} hover>
                <TableCell><Typography variant="body2" fontWeight={500}>{r.fecha_resultado}</Typography><Typography variant="caption" color="text.secondary">{r.created_at}</Typography></TableCell>
                <TableCell>{V({ valor: r.glucosa_ayunas, unidad: 'mg/dL' })}</TableCell><TableCell>{V({ valor: r.insulina_ayunas })}</TableCell>
                <TableCell>{r.homa_ir != null ? <Chip label={`${r.homa_ir}`} size="small" color={r.homa_ir >= 2.5 ? 'error' : 'default'} variant="outlined" /> : '-'}</TableCell>
                <TableCell>{V({ valor: r.hemoglobina_glicosilada, unidad: '%' })}</TableCell><TableCell>{V({ valor: r.glucosa_2h_ogtt })}</TableCell>
                <TableCell><Stack direction="row" spacing={0.5}>
                    {r.hiperinsulinemia ? <Chip label="Hiperinsulinemia" color="warning" size="small" /> : null}
                    {r.resistencia_insulina_sugerida ? <Chip label="RI" color="error" size="small" /> : null}
                    {!r.hiperinsulinemia && !r.resistencia_insulina_sugerida ? <Chip label="Normal" size="small" variant="outlined" /> : null}
                </Stack></TableCell>
            </TableRow>)}
        </TableBody></Table></TableContainer></Paper>
    );
}

function TablaLipidico({ registros }: { registros: Props['historial']['perfil_lipidico'] }) {
    if (registros.length === 0) return <EstadoVacio mensaje="No existen registros de perfil lipídico." />;
    return (
        <Paper variant="outlined"><TableContainer sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>
            <TableCell>Fecha</TableCell><TableCell>Col. Total</TableCell><TableCell>HDL</TableCell><TableCell>LDL</TableCell><TableCell>TG</TableCell><TableCell>No-HDL</TableCell><TableCell>Estado</TableCell>
        </TableRow></TableHead><TableBody>
            {registros.map(r => <TableRow key={r.id} hover>
                <TableCell><Typography variant="body2" fontWeight={500}>{r.fecha_resultado}</Typography><Typography variant="caption" color="text.secondary">{r.created_at}</Typography></TableCell>
                <TableCell>{V({ valor: r.colesterol_total })}</TableCell>
                <TableCell>{r.hdl != null ? <Chip label={`${r.hdl}`} size="small" color={r.hdl < 50 ? 'warning' : 'default'} variant="outlined" /> : '-'}</TableCell>
                <TableCell>{V({ valor: r.ldl })}</TableCell><TableCell>{V({ valor: r.trigliceridos })}</TableCell><TableCell>{V({ valor: r.colesterol_no_hdl })}</TableCell>
                <TableCell>{r.dislipidemia_sugerida ? <Chip label="Dislipidemia" color="warning" size="small" /> : <Chip label="Normal" size="small" variant="outlined" />}</TableCell>
            </TableRow>)}
        </TableBody></Table></TableContainer></Paper>
    );
}
