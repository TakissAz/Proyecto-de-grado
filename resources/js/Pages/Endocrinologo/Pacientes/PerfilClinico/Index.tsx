import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Box, Button, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScienceIcon from '@mui/icons-material/Science';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import WarningIcon from '@mui/icons-material/Warning';

import {
    AlertaDatosPendientes,
    EncabezadoPaciente,
    FormularioAntecedentes,
    FormularioConsultaInicial,
    FormularioEvaluacionFisica,
    FormularioHiperandrogenismo,
    FormularioHistoriaMenstrual,
    FormularioPerfilAndrogenico,
    FormularioPerfilGonadotropo,
    FormularioDiferencialesEndocrinos,
    FormularioGlucosaInsulina,
    FormularioPerfilLipidico,
    FormularioEcografia,
    FormularioDiagnosticoPmos,
    FormularioDiagnosticoRi,
    SeccionAuditoria,
    TarjetaAntecedentes,
    TarjetaConsultaInicial,
    TarjetaEstadoSeccion,
    TarjetaEvaluacionFisica,
    TarjetaEcografia,
    TarjetaDiagnosticoPmos,
    TarjetaDiagnosticoRi,
    TarjetaHiperandrogenismo,
    TarjetaHistoriaMenstrual,
    TarjetaLaboratorios,
    TarjetaResumenClinico,
} from './componentes';

import type { PerfilClinicoData } from './tipos';
import type { PageProps } from '@/types';
import { useState } from 'react';

interface Props extends PageProps {
    perfil: PerfilClinicoData;
}

export default function PerfilClinico({ perfil }: Props) {
    const { paciente, resumen_clinico, estado_flujo, secciones, alertas, auditoria, consulta_inicial, historia_menstrual, hiperandrogenismo, antecedentes, evaluacion_fisica, laboratorios, ecografia, evaluacion_pmos, diagnostico_pmos, evaluacion_ri, diagnostico_ri } = perfil;
    const id = paciente.id_paciente;
    const [formularioConsultaAbierto, setFormularioConsultaAbierto] = useState(false);
    const [formularioHistoriaAbierto, setFormularioHistoriaAbierto] = useState(false);
    const [formularioHiperandrogenismoAbierto, setFormularioHiperandrogenismoAbierto] = useState(false);
    const [formularioAntecedentesAbierto, setFormularioAntecedentesAbierto] = useState(false);
    const [formularioEvaluacionFisicaAbierto, setFormularioEvaluacionFisicaAbierto] = useState(false);
    const [formularioPerfilAndrogenicoAbierto, setFormularioPerfilAndrogenicoAbierto] = useState(false);
    const [formularioPerfilGonadotropoAbierto, setFormularioPerfilGonadotropoAbierto] = useState(false);
    const [formularioDiferencialesAbierto, setFormularioDiferencialesAbierto] = useState(false);
    const [formularioGlucosaInsulinaAbierto, setFormularioGlucosaInsulinaAbierto] = useState(false);
    const [formularioPerfilLipidicoAbierto, setFormularioPerfilLipidicoAbierto] = useState(false);
    const [formularioEcografiaAbierto, setFormularioEcografiaAbierto] = useState(false);
    const [formularioDiagnosticoPmosAbierto, setFormularioDiagnosticoPmosAbierto] = useState(false);
    const [formularioDiagnosticoRiAbierto, setFormularioDiagnosticoRiAbierto] = useState(false);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Perfil clínico
                </h2>
            }
        >
            <Head title={`Perfil: ${paciente.nombre_completo}`} />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={3}>
                    {/* Navegación */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            component={Link}
                            href={`/endocrinologo/pacientes/${id}`}
                            variant="text"
                            startIcon={<ArrowBackIcon />}
                            size="small"
                        >
                            Volver al perfil
                        </Button>
                        <Button
                            component={Link}
                            href="/endocrinologo/pacientes"
                            variant="text"
                            size="small"
                        >
                            Listado
                        </Button>
                    </Box>

                    {/* Encabezado principal */}
                    <EncabezadoPaciente paciente={paciente} estadoFlujo={estado_flujo} />

                    {/* Alertas de datos pendientes */}
                    <AlertaDatosPendientes alertas={alertas} />

                    {/* Resumen clínico */}
                    <TarjetaResumenClinico resumen={resumen_clinico} />

                    {/* Consulta inicial */}
                    <TarjetaConsultaInicial
                        consulta={consulta_inicial}
                        idPaciente={id}
                        onRegistrar={() => setFormularioConsultaAbierto(true)}
                        onEditar={() => setFormularioConsultaAbierto(true)}
                    />

                    {/* Historia menstrual */}
                    <TarjetaHistoriaMenstrual
                        historia={historia_menstrual}
                        idPaciente={id}
                        onRegistrar={() => setFormularioHistoriaAbierto(true)}
                        onEditar={() => setFormularioHistoriaAbierto(true)}
                    />

                    {/* Hiperandrogenismo */}
                    <TarjetaHiperandrogenismo
                        hiperandrogenismo={hiperandrogenismo}
                        idPaciente={id}
                        onRegistrar={() => setFormularioHiperandrogenismoAbierto(true)}
                        onEditar={() => setFormularioHiperandrogenismoAbierto(true)}
                    />

                    {/* Antecedentes endocrino-metabólicos */}
                    <TarjetaAntecedentes
                        antecedentes={antecedentes}
                        idPaciente={id}
                        onRegistrar={() => setFormularioAntecedentesAbierto(true)}
                        onEditar={() => setFormularioAntecedentesAbierto(true)}
                    />

                    {/* Evaluación física endocrina */}
                    <TarjetaEvaluacionFisica
                        evaluacion={evaluacion_fisica}
                        idPaciente={id}
                        onRegistrar={() => setFormularioEvaluacionFisicaAbierto(true)}
                        onEditar={() => setFormularioEvaluacionFisicaAbierto(true)}
                    />

                    {/* Laboratorios */}
                    <TarjetaLaboratorios
                        laboratorios={laboratorios}
                        idPaciente={id}
                        onRegistrarPerfilAndrogenico={() => setFormularioPerfilAndrogenicoAbierto(true)}
                        onEditarPerfilAndrogenico={() => setFormularioPerfilAndrogenicoAbierto(true)}
                        onRegistrarPerfilGonadotropo={() => setFormularioPerfilGonadotropoAbierto(true)}
                        onEditarPerfilGonadotropo={() => setFormularioPerfilGonadotropoAbierto(true)}
                        onRegistrarDiferenciales={() => setFormularioDiferencialesAbierto(true)}
                        onEditarDiferenciales={() => setFormularioDiferencialesAbierto(true)}
                        onRegistrarGlucosaInsulina={() => setFormularioGlucosaInsulinaAbierto(true)}
                        onEditarGlucosaInsulina={() => setFormularioGlucosaInsulinaAbierto(true)}
                        onRegistrarPerfilLipidico={() => setFormularioPerfilLipidicoAbierto(true)}
                        onEditarPerfilLipidico={() => setFormularioPerfilLipidicoAbierto(true)}
                    />

                    {/* Ecografía */}
                    <TarjetaEcografia
                        ecografia={ecografia}
                        onRegistrar={() => setFormularioEcografiaAbierto(true)}
                        onEditar={() => setFormularioEcografiaAbierto(true)}
                    />

                    {/* Diagnóstico PMOS */}
                    <TarjetaDiagnosticoPmos
                        evaluacion={evaluacion_pmos}
                        diagnostico={diagnostico_pmos}
                        onRegistrar={() => setFormularioDiagnosticoPmosAbierto(true)}
                        onEditar={() => setFormularioDiagnosticoPmosAbierto(true)}
                    />

                    {/* Diagnóstico Resistencia a la Insulina */}
                    <TarjetaDiagnosticoRi
                        evaluacion={evaluacion_ri}
                        diagnostico={diagnostico_ri}
                        onRegistrar={() => setFormularioDiagnosticoRiAbierto(true)}
                        onEditar={() => setFormularioDiagnosticoRiAbierto(true)}
                    />

                    {/* Secciones del perfil clínico */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                            gap: 2,
                        }}
                    >
                        <TarjetaEstadoSeccion
                            titulo="Consulta endocrinológica"
                            icono={<AssignmentIcon />}
                            seccion={secciones.consulta_endocrinologica}
                            descripcionPendiente="No se ha registrado una consulta endocrinológica."
                            descripcionCompleta={`${secciones.consulta_endocrinologica.total_registros} consulta(s). Última: ${secciones.consulta_endocrinologica.ultima_fecha ?? '-'}`}
                        />

                        <TarjetaEstadoSeccion
                            titulo="Historia menstrual"
                            icono={<FavoriteIcon />}
                            seccion={secciones.historia_menstrual}
                            descripcionPendiente="Pendiente de registro."
                        />

                        <TarjetaEstadoSeccion
                            titulo="Hiperandrogenismo"
                            icono={<WarningIcon />}
                            seccion={secciones.hiperandrogenismo}
                            descripcionPendiente="Evaluación de hiperandrogenismo pendiente."
                        />

                        <TarjetaEstadoSeccion
                            titulo="Antecedentes metabólicos"
                            icono={<MedicalServicesIcon />}
                            seccion={secciones.antecedentes_endocrino_metabolicos}
                            descripcionPendiente="Antecedentes endocrino-metabólicos pendientes."
                        />

                        <TarjetaEstadoSeccion
                            titulo="Evaluación física"
                            icono={<FitnessCenterIcon />}
                            seccion={secciones.evaluacion_fisica_endocrina}
                            descripcionPendiente="Evaluación física endocrina pendiente."
                        />

                        <TarjetaEstadoSeccion
                            titulo="Laboratorios"
                            icono={<ScienceIcon />}
                            seccion={secciones.laboratorios}
                            descripcionPendiente="Sin resultados de laboratorio registrados."
                            descripcionCompleta="Existen resultados registrados."
                        />

                        <TarjetaEstadoSeccion
                            titulo="Ecografía"
                            icono={<ImageSearchIcon />}
                            seccion={secciones.ecografia}
                            descripcionPendiente="Evaluación ecográfica pendiente."
                        />

                        <TarjetaEstadoSeccion
                            titulo="Diagnóstico PMOS"
                            icono={<LocalHospitalIcon />}
                            seccion={secciones.diagnostico_pmos}
                            descripcionPendiente="Diagnóstico PMOS pendiente de evaluación."
                            descripcionCompleta={
                                secciones.diagnostico_pmos.confirmado
                                    ? `Confirmado. Fenotipo: ${secciones.diagnostico_pmos.fenotipo?.replace(/_/g, ' ') ?? '-'}`
                                    : 'En evaluación, no confirmado.'
                            }
                        />

                        <TarjetaEstadoSeccion
                            titulo="Resistencia a la insulina"
                            icono={<MonitorHeartIcon />}
                            seccion={secciones.diagnostico_resistencia_insulina}
                            descripcionPendiente="Diagnóstico de resistencia a la insulina pendiente."
                        />
                    </Box>

                    {/* Auditoría */}
                    <SeccionAuditoria auditoria={auditoria} />
                </Stack>
            </Box>

            {/* Formulario modal de consulta inicial */}
            <FormularioConsultaInicial
                abierto={formularioConsultaAbierto}
                idPaciente={id}
                consultaExistente={consulta_inicial}
                onCerrar={() => setFormularioConsultaAbierto(false)}
            />

            {/* Formulario modal de historia menstrual */}
            <FormularioHistoriaMenstrual
                abierto={formularioHistoriaAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                historiaExistente={historia_menstrual}
                onCerrar={() => setFormularioHistoriaAbierto(false)}
            />

            {/* Formulario modal de hiperandrogenismo */}
            <FormularioHiperandrogenismo
                abierto={formularioHiperandrogenismoAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={hiperandrogenismo}
                onCerrar={() => setFormularioHiperandrogenismoAbierto(false)}
            />

            {/* Formulario modal de antecedentes */}
            <FormularioAntecedentes
                abierto={formularioAntecedentesAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={antecedentes}
                onCerrar={() => setFormularioAntecedentesAbierto(false)}
            />

            {/* Formulario modal de evaluación física */}
            <FormularioEvaluacionFisica
                abierto={formularioEvaluacionFisicaAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={evaluacion_fisica}
                onCerrar={() => setFormularioEvaluacionFisicaAbierto(false)}
            />

            {/* Formulario modal de perfil androgénico */}
            <FormularioPerfilAndrogenico
                abierto={formularioPerfilAndrogenicoAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={laboratorios.perfil_androgenico}
                onCerrar={() => setFormularioPerfilAndrogenicoAbierto(false)}
            />

            {/* Formulario modal de perfil gonadotropo */}
            <FormularioPerfilGonadotropo
                abierto={formularioPerfilGonadotropoAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={laboratorios.perfil_gonadotropo}
                onCerrar={() => setFormularioPerfilGonadotropoAbierto(false)}
            />

            {/* Formulario modal de diferenciales endocrinos */}
            <FormularioDiferencialesEndocrinos
                abierto={formularioDiferencialesAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={laboratorios.diferencial_endocrino}
                onCerrar={() => setFormularioDiferencialesAbierto(false)}
            />

            {/* Formulario modal de glucosa e insulina */}
            <FormularioGlucosaInsulina
                abierto={formularioGlucosaInsulinaAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={laboratorios.glucosa_insulina}
                onCerrar={() => setFormularioGlucosaInsulinaAbierto(false)}
            />

            {/* Formulario modal de perfil lipídico */}
            <FormularioPerfilLipidico
                abierto={formularioPerfilLipidicoAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={laboratorios.perfil_lipidico}
                onCerrar={() => setFormularioPerfilLipidicoAbierto(false)}
            />

            {/* Formulario modal de ecografía */}
            <FormularioEcografia
                abierto={formularioEcografiaAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                existente={ecografia}
                onCerrar={() => setFormularioEcografiaAbierto(false)}
            />

            {/* Formulario modal de diagnóstico PMOS */}
            <FormularioDiagnosticoPmos
                abierto={formularioDiagnosticoPmosAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                evaluacion={evaluacion_pmos}
                existente={diagnostico_pmos}
                onCerrar={() => setFormularioDiagnosticoPmosAbierto(false)}
            />

            {/* Formulario modal de diagnóstico RI */}
            <FormularioDiagnosticoRi
                abierto={formularioDiagnosticoRiAbierto}
                idPaciente={id}
                idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null}
                evaluacion={evaluacion_ri}
                existente={diagnostico_ri}
                onCerrar={() => setFormularioDiagnosticoRiAbierto(false)}
            />
        </AuthenticatedLayout>
    );
}
