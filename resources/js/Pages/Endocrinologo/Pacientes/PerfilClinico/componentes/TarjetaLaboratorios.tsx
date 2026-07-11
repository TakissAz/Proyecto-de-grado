import { Box, Button, Card, CardContent, Chip, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import type { LaboratoriosData } from '../tipos';

interface Props {
    laboratorios: LaboratoriosData;
    idPaciente: number;
    onRegistrarPerfilAndrogenico: () => void;
    onEditarPerfilAndrogenico: () => void;
    onRegistrarPerfilGonadotropo: () => void;
    onEditarPerfilGonadotropo: () => void;
    onRegistrarDiferenciales: () => void;
    onEditarDiferenciales: () => void;
    onRegistrarGlucosaInsulina: () => void;
    onEditarGlucosaInsulina: () => void;
    onRegistrarPerfilLipidico: () => void;
    onEditarPerfilLipidico: () => void;
}

export default function TarjetaLaboratorios({ laboratorios, idPaciente, onRegistrarPerfilAndrogenico, onEditarPerfilAndrogenico, onRegistrarPerfilGonadotropo, onEditarPerfilGonadotropo, onRegistrarDiferenciales, onEditarDiferenciales, onRegistrarGlucosaInsulina, onEditarGlucosaInsulina, onRegistrarPerfilLipidico, onEditarPerfilLipidico }: Props) {
    const [tabActiva, setTabActiva] = useState(0);

    const paneles = [
        { label: 'Andrógenos', datos: laboratorios.perfil_androgenico },
        { label: 'Gonadotropo', datos: laboratorios.perfil_gonadotropo },
        { label: 'Diferenciales', datos: laboratorios.diferencial_endocrino },
        { label: 'Glucosa/Insulina', datos: laboratorios.glucosa_insulina },
        { label: 'Lípidos', datos: laboratorios.perfil_lipidico },
    ];

    const completados = paneles.filter(p => p.datos != null).length;

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ScienceIcon color={completados > 0 ? 'primary' : 'disabled'} />
                            <Typography variant="subtitle1" fontWeight={700}>Laboratorios</Typography>
                            <Chip
                                label={`${completados}/5 paneles`}
                                size="small"
                                color={completados === 5 ? 'success' : completados > 0 ? 'primary' : 'default'}
                                variant="outlined"
                            />
                        </Stack>

                        <Button
                            component={Link}
                            href={`/endocrinologo/pacientes/${idPaciente}/laboratorios/historial`}
                            variant="text"
                            size="small"
                            startIcon={<HistoryIcon />}
                        >
                            Historial
                        </Button>
                    </Box>

                    <Tabs value={tabActiva} onChange={(_, v) => setTabActiva(v)} variant="scrollable" scrollButtons="auto">
                        {paneles.map((p, i) => (
                            <Tab key={i} label={p.label} icon={p.datos ? <Chip label="OK" size="small" color="success" sx={{ height: 16, fontSize: 10 }} /> : undefined} iconPosition="end" />
                        ))}
                    </Tabs>

                    <Divider />

                    {/* Tab 0: Perfil Androgénico */}
                    {tabActiva === 0 && (
                        <PanelPerfilAndrogenico
                            datos={laboratorios.perfil_androgenico}
                            onRegistrar={onRegistrarPerfilAndrogenico}
                            onEditar={onEditarPerfilAndrogenico}
                        />
                    )}

                    {/* Tabs 1-4: Pendientes de implementar con sus propios componentes */}
                    {tabActiva === 1 && (
                        <PanelPerfilGonadotropo
                            datos={laboratorios.perfil_gonadotropo}
                            onRegistrar={onRegistrarPerfilGonadotropo}
                            onEditar={onEditarPerfilGonadotropo}
                        />
                    )}
                    {tabActiva === 2 && (
                        <PanelDiferenciales
                            datos={laboratorios.diferencial_endocrino}
                            onRegistrar={onRegistrarDiferenciales}
                            onEditar={onEditarDiferenciales}
                        />
                    )}
                    {tabActiva === 3 && (
                        <PanelGlucosaInsulina
                            datos={laboratorios.glucosa_insulina}
                            onRegistrar={onRegistrarGlucosaInsulina}
                            onEditar={onEditarGlucosaInsulina}
                        />
                    )}
                    {tabActiva === 4 && (
                        <PanelPerfilLipidico
                            datos={laboratorios.perfil_lipidico}
                            onRegistrar={onRegistrarPerfilLipidico}
                            onEditar={onEditarPerfilLipidico}
                        />
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

/** Sub-panel del perfil androgénico */
function PanelPerfilAndrogenico({ datos, onRegistrar, onEditar }: { datos: LaboratoriosData['perfil_androgenico']; onRegistrar: () => void; onEditar: () => void }) {
    if (!datos) {
        return (
            <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                    No se han registrado resultados del perfil androgénico.
                </Typography>
                <Box>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                        Registrar perfil androgénico
                    </Button>
                </Box>
            </Stack>
        );
    }

    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Fecha: {datos.fecha_resultado}</Typography>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEditar}>Editar</Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <ValorLab etiqueta="Testosterona total" valor={datos.testosterona_total} unidad="ng/dL" />
                <ValorLab etiqueta="Testosterona libre" valor={datos.testosterona_libre} unidad="pg/mL" />
                <ValorLab etiqueta="SHBG" valor={datos.shbg} unidad="nmol/L" />
                <ValorLab etiqueta="Índice androgénico libre" valor={datos.indice_androgenico_libre} />
                <ValorLab etiqueta="DHEA-S" valor={datos.dhea_s} unidad="μg/dL" />
                <ValorLab etiqueta="Androstenediona" valor={datos.androstenediona} unidad="ng/mL" />
            </Box>

            <Stack direction="row" spacing={1}>
                <Chip
                    label={datos.hiperandrogenismo_bioquimico ? 'Hiperandrogenismo bioquímico positivo' : 'Sin hiperandrogenismo bioquímico'}
                    color={datos.hiperandrogenismo_bioquimico ? 'error' : 'default'}
                    size="small"
                    variant={datos.hiperandrogenismo_bioquimico ? 'filled' : 'outlined'}
                />
            </Stack>

            {datos.interpretacion ? (
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Interpretación</Typography>
                    <Typography variant="body2">{datos.interpretacion}</Typography>
                </Box>
            ) : null}
        </Stack>
    );
}

/** Sub-panel del perfil gonadotropo */
function PanelPerfilGonadotropo({ datos, onRegistrar, onEditar }: { datos: LaboratoriosData['perfil_gonadotropo']; onRegistrar: () => void; onEditar: () => void }) {
    if (!datos) {
        return (
            <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                    No se han registrado resultados del perfil gonadotropo.
                </Typography>
                <Box>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                        Registrar perfil gonadotropo
                    </Button>
                </Box>
            </Stack>
        );
    }

    const relacionElevada = datos.relacion_lh_fsh != null && datos.relacion_lh_fsh > 2;
    const progesteronaBaja = datos.progesterona != null && datos.progesterona < 3;

    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Fecha: {datos.fecha_resultado}</Typography>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEditar}>Editar</Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <ValorLab etiqueta="LH" valor={datos.lh} unidad="mUI/mL" />
                <ValorLab etiqueta="FSH" valor={datos.fsh} unidad="mUI/mL" />
                <ValorLab etiqueta="Relación LH/FSH" valor={datos.relacion_lh_fsh} />
                <ValorLab etiqueta="Estradiol" valor={datos.estradiol} unidad="pg/mL" />
                <ValorLab etiqueta="Progesterona" valor={datos.progesterona} unidad="ng/mL" />
                {datos.progesterona_dia_ciclo ? <ValorLab etiqueta="Día del ciclo" valor={datos.progesterona_dia_ciclo} /> : null}
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {relacionElevada ? <Chip label="Relación LH/FSH elevada (>2)" color="warning" size="small" variant="filled" /> : null}
                {progesteronaBaja ? <Chip label="Progesterona baja (posible anovulación)" color="warning" size="small" variant="filled" /> : null}
                {!relacionElevada && !progesteronaBaja ? <Chip label="Sin alteraciones relevantes" color="success" size="small" variant="outlined" /> : null}
            </Stack>

            {datos.interpretacion ? (
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Interpretación</Typography>
                    <Typography variant="body2">{datos.interpretacion}</Typography>
                </Box>
            ) : null}
        </Stack>
    );
}

/** Sub-panel de diferenciales endocrinos */
function PanelDiferenciales({ datos, onRegistrar, onEditar }: { datos: LaboratoriosData['diferencial_endocrino']; onRegistrar: () => void; onEditar: () => void }) {
    if (!datos) {
        return (
            <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                    No se han registrado resultados de diferenciales endocrinos. Estos son necesarios para descartar causas antes de confirmar PMOS.
                </Typography>
                <Box>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                        Registrar diferenciales endocrinos
                    </Button>
                </Box>
            </Stack>
        );
    }

    const descartes = [
        { label: 'Alteración tiroidea', descartada: datos.alteracion_tiroidea_descartada },
        { label: 'Hiperprolactinemia', descartada: datos.hiperprolactinemia_descartada },
        { label: 'Hiperplasia suprarrenal', descartada: datos.hiperplasia_suprarrenal_descartada },
        { label: 'Síndrome de Cushing', descartada: datos.cushing_descartado },
    ];
    const todosDescartados = descartes.every(d => d.descartada);

    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Fecha: {datos.fecha_resultado}</Typography>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEditar}>Editar</Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <ValorLab etiqueta="TSH" valor={datos.tsh} unidad="mUI/L" />
                <ValorLab etiqueta="T3 libre" valor={datos.t3_libre} unidad="pg/mL" />
                <ValorLab etiqueta="T4 libre" valor={datos.t4_libre} unidad="ng/dL" />
                <ValorLab etiqueta="Prolactina" valor={datos.prolactina} unidad="ng/mL" />
                <ValorLab etiqueta="17-OH Progesterona" valor={datos.diecisiete_oh_progesterona} unidad="ng/mL" />
                <ValorLab etiqueta="Cortisol" valor={datos.cortisol} unidad="μg/dL" />
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {todosDescartados ? (
                    <Chip label="Diferenciales principales descartados" color="success" size="small" variant="filled" />
                ) : (
                    descartes.map(d => (
                        <Chip
                            key={d.label}
                            label={d.descartada ? `${d.label} descartada` : `${d.label} pendiente`}
                            color={d.descartada ? 'success' : 'warning'}
                            size="small"
                            variant={d.descartada ? 'outlined' : 'filled'}
                        />
                    ))
                )}
            </Stack>

            {datos.interpretacion ? (
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Interpretación</Typography>
                    <Typography variant="body2">{datos.interpretacion}</Typography>
                </Box>
            ) : null}
        </Stack>
    );
}

/** Sub-panel de glucosa e insulina */
function PanelGlucosaInsulina({ datos, onRegistrar, onEditar }: { datos: LaboratoriosData['glucosa_insulina']; onRegistrar: () => void; onEditar: () => void }) {
    if (!datos) {
        return (
            <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                    No se han registrado resultados de glucosa e insulina. Estos datos son necesarios para evaluar resistencia a la insulina (HOMA-IR).
                </Typography>
                <Box>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                        Registrar glucosa e insulina
                    </Button>
                </Box>
            </Stack>
        );
    }

    const alertas: string[] = [];
    if (datos.homa_ir != null && datos.homa_ir >= 2.5) alertas.push(`HOMA-IR elevado (${datos.homa_ir})`);
    if (datos.resistencia_insulina_sugerida) alertas.push('Resistencia a la insulina sugerida');
    if (datos.hiperinsulinemia) alertas.push('Hiperinsulinemia');
    if (datos.hemoglobina_glicosilada != null && datos.hemoglobina_glicosilada >= 5.7) alertas.push(`HbA1c elevada (${datos.hemoglobina_glicosilada}%)`);
    if (datos.glucosa_2h_ogtt != null && datos.glucosa_2h_ogtt >= 140) alertas.push('Glucosa 2h OGTT elevada');

    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Fecha: {datos.fecha_resultado}</Typography>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEditar}>Editar</Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <ValorLab etiqueta="Glucosa ayunas" valor={datos.glucosa_ayunas} unidad="mg/dL" />
                <ValorLab etiqueta="Insulina ayunas" valor={datos.insulina_ayunas} unidad="µU/mL" />
                <ValorLab etiqueta="HOMA-IR" valor={datos.homa_ir} />
                <ValorLab etiqueta="HbA1c" valor={datos.hemoglobina_glicosilada} unidad="%" />
                <ValorLab etiqueta="Glucosa 2h OGTT" valor={datos.glucosa_2h_ogtt} unidad="mg/dL" />
                <ValorLab etiqueta="Insulina 2h OGTT" valor={datos.insulina_2h_ogtt} unidad="µU/mL" />
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {alertas.length > 0 ? (
                    alertas.map(a => <Chip key={a} label={a} color="error" size="small" variant="filled" />)
                ) : (
                    <Chip label="Sin alteraciones glucémicas relevantes" color="success" size="small" variant="outlined" />
                )}
            </Stack>

            {datos.interpretacion ? (
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Interpretación</Typography>
                    <Typography variant="body2">{datos.interpretacion}</Typography>
                </Box>
            ) : null}
        </Stack>
    );
}

/** Sub-panel de perfil lipídico */
function PanelPerfilLipidico({ datos, onRegistrar, onEditar }: { datos: LaboratoriosData['perfil_lipidico']; onRegistrar: () => void; onEditar: () => void }) {
    if (!datos) {
        return (
            <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                    No se han registrado resultados del perfil lipídico. Estos datos son necesarios para evaluar riesgo cardiovascular y metabólico.
                </Typography>
                <Box>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onRegistrar}>
                        Registrar perfil lipídico
                    </Button>
                </Box>
            </Stack>
        );
    }

    const alertas: string[] = [];
    if (datos.colesterol_total != null && datos.colesterol_total >= 200) alertas.push(`Col. total elevado (${datos.colesterol_total})`);
    if (datos.ldl != null && datos.ldl >= 130) alertas.push(`LDL elevado (${datos.ldl})`);
    if (datos.hdl != null && datos.hdl < 50) alertas.push(`HDL bajo (${datos.hdl})`);
    if (datos.trigliceridos != null && datos.trigliceridos >= 150) alertas.push(`TG elevados (${datos.trigliceridos})`);
    if (datos.colesterol_no_hdl != null && datos.colesterol_no_hdl >= 130) alertas.push(`Col. no-HDL elevado (${datos.colesterol_no_hdl})`);
    if (datos.dislipidemia_sugerida) alertas.push('Dislipidemia sugerida');

    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Fecha: {datos.fecha_resultado}</Typography>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEditar}>Editar</Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <ValorLab etiqueta="Colesterol total" valor={datos.colesterol_total} unidad="mg/dL" />
                <ValorLab etiqueta="HDL" valor={datos.hdl} unidad="mg/dL" />
                <ValorLab etiqueta="LDL" valor={datos.ldl} unidad="mg/dL" />
                <ValorLab etiqueta="VLDL" valor={datos.vldl} unidad="mg/dL" />
                <ValorLab etiqueta="Triglicéridos" valor={datos.trigliceridos} unidad="mg/dL" />
                <ValorLab etiqueta="Col. no-HDL" valor={datos.colesterol_no_hdl} unidad="mg/dL" />
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {alertas.length > 0 ? (
                    alertas.map(a => <Chip key={a} label={a} color="warning" size="small" variant="filled" />)
                ) : (
                    <Chip label="Sin alteraciones lipídicas relevantes" color="success" size="small" variant="outlined" />
                )}
            </Stack>

            {datos.interpretacion ? (
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>Interpretación</Typography>
                    <Typography variant="body2">{datos.interpretacion}</Typography>
                </Box>
            ) : null}
        </Stack>
    );
}

/** Panel temporal para sub-paneles no implementados aún */
function PanelPendiente({ nombre, datos }: { nombre: string; datos: unknown }) {
    return (
        <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
                {datos ? `${nombre}: datos registrados. Formulario de edición próximamente.` : `${nombre}: pendiente de registro. Formulario próximamente.`}
            </Typography>
            {datos ? <Chip label="Datos registrados" color="success" size="small" variant="outlined" /> : <Chip label="Pendiente" size="small" variant="outlined" />}
        </Stack>
    );
}

function ValorLab({ etiqueta, valor, unidad }: { etiqueta: string; valor?: number | null; unidad?: string }) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>{etiqueta}</Typography>
            <Typography variant="body2" fontWeight={500}>
                {valor != null ? `${valor}${unidad ? ` ${unidad}` : ''}` : '-'}
            </Typography>
        </Box>
    );
}
