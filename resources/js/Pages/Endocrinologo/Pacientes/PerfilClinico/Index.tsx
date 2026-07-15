import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, ChevronRight, Phone, Mail, MapPin, Briefcase, Heart, Calendar, Stethoscope, FlaskConical, Brain, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import AvatarIniciales from '@/Components/ui/avatar-iniciales';
import EstadoPill from '@/Components/ui/estado-pill';

import AlertaDatosPendientes from './componentes/AlertaDatosPendientes';
import TarjetaResumenClinico from './componentes/TarjetaResumenClinico';
import TarjetaConsultaInicial from './componentes/TarjetaConsultaInicial';
import FormularioConsultaInicial from './componentes/FormularioConsultaInicial';
import TarjetaHistoriaMenstrual from './componentes/TarjetaHistoriaMenstrual';
import FormularioHistoriaMenstrual from './componentes/FormularioHistoriaMenstrual';
import TarjetaHiperandrogenismo from './componentes/TarjetaHiperandrogenismo';
import FormularioHiperandrogenismo from './componentes/FormularioHiperandrogenismo';
import TarjetaAntecedentes from './componentes/TarjetaAntecedentes';
import FormularioAntecedentes from './componentes/FormularioAntecedentes';
import TarjetaEvaluacionFisica from './componentes/TarjetaEvaluacionFisica';
import FormularioEvaluacionFisica from './componentes/FormularioEvaluacionFisica';
import TarjetaLaboratorios from './componentes/TarjetaLaboratorios';
import FormularioPerfilAndrogenico from './componentes/FormularioPerfilAndrogenico';
import FormularioPerfilGonadotropo from './componentes/FormularioPerfilGonadotropo';
import FormularioDiferencialesEndocrinos from './componentes/FormularioDiferencialesEndocrinos';
import FormularioGlucosaInsulina from './componentes/FormularioGlucosaInsulina';
import FormularioPerfilLipidico from './componentes/FormularioPerfilLipidico';
import TarjetaEcografia from './componentes/TarjetaEcografia';
import FormularioEcografia from './componentes/FormularioEcografia';
import TarjetaDiagnosticoPmos from './componentes/TarjetaDiagnosticoPmos';
import FormularioDiagnosticoPmos from './componentes/FormularioDiagnosticoPmos';
import TarjetaDiagnosticoRi from './componentes/TarjetaDiagnosticoRi';
import FormularioDiagnosticoRi from './componentes/FormularioDiagnosticoRi';
import SeccionAuditoria from './componentes/SeccionAuditoria';

import type { PerfilClinicoData } from './tipos';
import type { PageProps } from '@/types';

/* ═══ Steps config ═══ */
const STEPS = [
    { id: 'evaluacion', label: 'Evaluación clínica', icon: Stethoscope, descripcion: 'Historia menstrual, hiperandrogenismo, antecedentes y evaluación física' },
    { id: 'estudios', label: 'Estudios complementarios', icon: FlaskConical, descripcion: 'Laboratorios y ecografía' },
    { id: 'diagnostico', label: 'Diagnóstico clínico', icon: Brain, descripcion: 'Criterios PMOS y resistencia a la insulina' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

/* ═══ Page ═══ */
interface Props extends PageProps {
    perfil: PerfilClinicoData;
}

export default function PerfilClinico({ perfil }: Props) {
    const { paciente, resumen_clinico, estado_flujo, alertas, auditoria, consulta_inicial, historia_menstrual, hiperandrogenismo, antecedentes, evaluacion_fisica, laboratorios, ecografia, evaluacion_pmos, diagnostico_pmos, evaluacion_ri, diagnostico_ri } = perfil;
    const id = paciente.id_paciente;
    const nombre = paciente.nombre_completo ?? 'Paciente';

    const [stepActivo, setStepActivo] = useState<StepId>('evaluacion');

    // Formularios
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

    // Progreso por step
    const stepProgreso: Record<StepId, { completados: number; total: number }> = {
        evaluacion: {
            completados: [historia_menstrual, hiperandrogenismo, antecedentes, evaluacion_fisica].filter(Boolean).length,
            total: 4,
        },
        estudios: {
            completados: [laboratorios.perfil_androgenico || laboratorios.perfil_gonadotropo || laboratorios.glucosa_insulina, ecografia].filter(Boolean).length,
            total: 2,
        },
        diagnostico: {
            completados: [diagnostico_pmos, diagnostico_ri].filter(Boolean).length,
            total: 2,
        },
    };

    return (
        <AuthenticatedLayout title="Perfil clínico">
            <Head title={`Perfil: ${nombre}`} />

            <div className="space-y-4">
                {/* ═══ ENCABEZADO ═══ */}
                <div className="card-elevated p-5">
                    <div className="flex items-center justify-between mb-4">
                        <Link href={`/endocrinologo/pacientes/${id}`} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-ink transition-colors dark:text-ink-muted-dark dark:hover:text-ink-dark">
                            <ArrowLeft size={13} strokeWidth={1.8} /> Volver al perfil
                        </Link>
                        <Link href="/endocrinologo/pacientes" className="text-[11px] font-semibold text-ink-muted hover:text-ink transition-colors dark:text-ink-muted-dark dark:hover:text-ink-dark">
                            Listado →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
                        <div className="flex items-start gap-3.5">
                            <AvatarIniciales nombre={nombre} size={52} />
                            <div>
                                <h1 className="text-[18px] font-bold text-ink dark:text-ink-dark">{nombre}</h1>
                                <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark mt-0.5">CI: {paciente.ci} · {paciente.sexo} · {paciente.edad ?? '—'} años</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <EstadoPill activo={paciente.estado === 'activo'} textoActivo="Activa" textoInactivo="Inactiva" />
                                </div>
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-[10px] mb-1">
                                        <span className="font-semibold text-ink-muted dark:text-ink-muted-dark">Expediente</span>
                                        <span className="font-bold text-brand-green-dark dark:text-brand-green">{estado_flujo.porcentaje}%</span>
                                    </div>
                                    <div className="h-1.5 w-full max-w-[180px] rounded-full bg-black/[0.05] dark:bg-white/[0.08] overflow-hidden">
                                        <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${estado_flujo.porcentaje}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-l border-surface-border dark:border-surface-border-dark pl-5">
                            <DatoMini icon={<Phone size={11} />} label="Teléfono" valor={paciente.telefono} />
                            <DatoMini icon={<Mail size={11} />} label="Correo" valor={paciente.user?.email} />
                            <DatoMini icon={<MapPin size={11} />} label="Dirección" valor={paciente.direccion} />
                            <DatoMini icon={<Briefcase size={11} />} label="Ocupación" valor={paciente.ocupacion} />
                            <DatoMini icon={<Heart size={11} />} label="Estado civil" valor={paciente.estado_civil} />
                            <DatoMini icon={<Calendar size={11} />} label="Fecha nac." valor={paciente.fecha_nacimiento} />
                        </div>
                    </div>
                </div>

                <AlertaDatosPendientes alertas={alertas} />

                {/* ═══ STEPPER + CONTENIDO ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                    <div className="space-y-4">
                        {/* Steps navigation */}
                        <div className="card-elevated p-2">
                            <div className="flex gap-1">
                                {STEPS.map((step, idx) => {
                                    const Icon = step.icon;
                                    const activo = stepActivo === step.id;
                                    const prog = stepProgreso[step.id];
                                    const completo = prog.completados === prog.total;
                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            onClick={() => setStepActivo(step.id)}
                                            className={clsx(
                                                'group relative flex flex-1 items-center gap-2.5 rounded-xl px-4 py-3 transition-all',
                                                activo
                                                    ? 'bg-brand-green-soft dark:bg-brand-green-dark/20'
                                                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                                            )}
                                        >
                                            {/* Número del paso */}
                                            <div className={clsx(
                                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-colors',
                                                activo ? 'bg-brand-green text-white' :
                                                completo ? 'bg-brand-green/20 text-brand-green-dark dark:bg-brand-green-dark/30 dark:text-brand-green' :
                                                'bg-black/[0.05] text-ink-muted dark:bg-white/[0.06] dark:text-ink-muted-dark'
                                            )}>
                                                {completo ? <CheckCircle2 size={14} strokeWidth={2} /> : idx + 1}
                                            </div>
                                            <div className="text-left hidden sm:block">
                                                <p className={clsx('text-[12px] font-semibold leading-tight', activo ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink dark:text-ink-dark')}>
                                                    {step.label}
                                                </p>
                                                <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                                                    {prog.completados}/{prog.total} completados
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step content — desplegables */}
                        <div className="space-y-2">
                            {stepActivo === 'evaluacion' && (
                                <>
                                    <Desplegable titulo="Historia menstrual" tiene={!!historia_menstrual}>
                                        <TarjetaHistoriaMenstrual historia={historia_menstrual} idPaciente={id} onRegistrar={() => setFormularioHistoriaAbierto(true)} onEditar={() => setFormularioHistoriaAbierto(true)} />
                                    </Desplegable>
                                    <Desplegable titulo="Hiperandrogenismo" tiene={!!hiperandrogenismo}>
                                        <TarjetaHiperandrogenismo hiperandrogenismo={hiperandrogenismo} idPaciente={id} onRegistrar={() => setFormularioHiperandrogenismoAbierto(true)} onEditar={() => setFormularioHiperandrogenismoAbierto(true)} />
                                    </Desplegable>
                                    <Desplegable titulo="Antecedentes endocrino-metabólicos" tiene={!!antecedentes}>
                                        <TarjetaAntecedentes antecedentes={antecedentes} idPaciente={id} onRegistrar={() => setFormularioAntecedentesAbierto(true)} onEditar={() => setFormularioAntecedentesAbierto(true)} />
                                    </Desplegable>
                                    <Desplegable titulo="Evaluación física" tiene={!!evaluacion_fisica}>
                                        <TarjetaEvaluacionFisica evaluacion={evaluacion_fisica} idPaciente={id} onRegistrar={() => setFormularioEvaluacionFisicaAbierto(true)} onEditar={() => setFormularioEvaluacionFisicaAbierto(true)} />
                                    </Desplegable>
                                </>
                            )}

                            {stepActivo === 'estudios' && (
                                <>
                                    <Desplegable titulo="Laboratorios" tiene={!!(laboratorios.perfil_androgenico || laboratorios.perfil_gonadotropo || laboratorios.glucosa_insulina)}>
                                        <TarjetaLaboratorios
                                            laboratorios={laboratorios} idPaciente={id}
                                            onRegistrarPerfilAndrogenico={() => setFormularioPerfilAndrogenicoAbierto(true)} onEditarPerfilAndrogenico={() => setFormularioPerfilAndrogenicoAbierto(true)}
                                            onRegistrarPerfilGonadotropo={() => setFormularioPerfilGonadotropoAbierto(true)} onEditarPerfilGonadotropo={() => setFormularioPerfilGonadotropoAbierto(true)}
                                            onRegistrarDiferenciales={() => setFormularioDiferencialesAbierto(true)} onEditarDiferenciales={() => setFormularioDiferencialesAbierto(true)}
                                            onRegistrarGlucosaInsulina={() => setFormularioGlucosaInsulinaAbierto(true)} onEditarGlucosaInsulina={() => setFormularioGlucosaInsulinaAbierto(true)}
                                            onRegistrarPerfilLipidico={() => setFormularioPerfilLipidicoAbierto(true)} onEditarPerfilLipidico={() => setFormularioPerfilLipidicoAbierto(true)}
                                        />
                                    </Desplegable>
                                    <Desplegable titulo="Ecografía" tiene={!!ecografia}>
                                        <TarjetaEcografia ecografia={ecografia} idPaciente={id} onRegistrar={() => setFormularioEcografiaAbierto(true)} onEditar={() => setFormularioEcografiaAbierto(true)} />
                                    </Desplegable>
                                </>
                            )}

                            {stepActivo === 'diagnostico' && (
                                <>
                                    <Desplegable titulo="Diagnóstico PMOS" tiene={!!diagnostico_pmos}>
                                        <TarjetaDiagnosticoPmos evaluacion={evaluacion_pmos} diagnostico={diagnostico_pmos} onRegistrar={() => setFormularioDiagnosticoPmosAbierto(true)} onEditar={() => setFormularioDiagnosticoPmosAbierto(true)} />
                                    </Desplegable>
                                    <Desplegable titulo="Diagnóstico Resistencia a la Insulina" tiene={!!diagnostico_ri}>
                                        <TarjetaDiagnosticoRi evaluacion={evaluacion_ri} diagnostico={diagnostico_ri} onRegistrar={() => setFormularioDiagnosticoRiAbierto(true)} onEditar={() => setFormularioDiagnosticoRiAbierto(true)} />
                                    </Desplegable>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Panel lateral sticky */}
                    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
                        <TarjetaResumenClinico resumen={resumen_clinico} />
                        <TarjetaConsultaInicial consulta={consulta_inicial} idPaciente={id} onRegistrar={() => setFormularioConsultaAbierto(true)} onEditar={() => setFormularioConsultaAbierto(true)} />
                        <SeccionAuditoria auditoria={auditoria} />
                    </aside>
                </div>
            </div>

            {/* ═══ MODALES ═══ */}
            <FormularioConsultaInicial abierto={formularioConsultaAbierto} idPaciente={id} consultaExistente={consulta_inicial} onCerrar={() => setFormularioConsultaAbierto(false)} />
            <FormularioHistoriaMenstrual abierto={formularioHistoriaAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} historiaExistente={historia_menstrual} onCerrar={() => setFormularioHistoriaAbierto(false)} />
            <FormularioHiperandrogenismo abierto={formularioHiperandrogenismoAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={hiperandrogenismo} onCerrar={() => setFormularioHiperandrogenismoAbierto(false)} />
            <FormularioAntecedentes abierto={formularioAntecedentesAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={antecedentes} onCerrar={() => setFormularioAntecedentesAbierto(false)} />
            <FormularioEvaluacionFisica abierto={formularioEvaluacionFisicaAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={evaluacion_fisica} onCerrar={() => setFormularioEvaluacionFisicaAbierto(false)} />
            <FormularioPerfilAndrogenico abierto={formularioPerfilAndrogenicoAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={laboratorios.perfil_androgenico} onCerrar={() => setFormularioPerfilAndrogenicoAbierto(false)} />
            <FormularioPerfilGonadotropo abierto={formularioPerfilGonadotropoAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={laboratorios.perfil_gonadotropo} onCerrar={() => setFormularioPerfilGonadotropoAbierto(false)} />
            <FormularioDiferencialesEndocrinos abierto={formularioDiferencialesAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={laboratorios.diferencial_endocrino} onCerrar={() => setFormularioDiferencialesAbierto(false)} />
            <FormularioGlucosaInsulina abierto={formularioGlucosaInsulinaAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={laboratorios.glucosa_insulina} onCerrar={() => setFormularioGlucosaInsulinaAbierto(false)} />
            <FormularioPerfilLipidico abierto={formularioPerfilLipidicoAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={laboratorios.perfil_lipidico} onCerrar={() => setFormularioPerfilLipidicoAbierto(false)} />
            <FormularioEcografia abierto={formularioEcografiaAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} existente={ecografia} onCerrar={() => setFormularioEcografiaAbierto(false)} />
            <FormularioDiagnosticoPmos abierto={formularioDiagnosticoPmosAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} evaluacion={evaluacion_pmos} existente={diagnostico_pmos} onCerrar={() => setFormularioDiagnosticoPmosAbierto(false)} />
            <FormularioDiagnosticoRi abierto={formularioDiagnosticoRiAbierto} idPaciente={id} idConsulta={consulta_inicial?.id_consulta_endocrinologica ?? null} evaluacion={evaluacion_ri} existente={diagnostico_ri} onCerrar={() => setFormularioDiagnosticoRiAbierto(false)} />
        </AuthenticatedLayout>
    );
}

/* ═══ Componentes auxiliares ═══ */

function DatoMini({ icon, label, valor }: { icon: React.ReactNode; label: string; valor?: string | null }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-ink-muted/60 dark:text-ink-muted-dark/60">{icon}</span>
            <div>
                <p className="text-[9.5px] uppercase tracking-wide font-semibold text-ink-muted dark:text-ink-muted-dark">{label}</p>
                <p className="text-[12px] text-ink dark:text-ink-dark">{valor || '—'}</p>
            </div>
        </div>
    );
}

function Desplegable({ titulo, tiene, children }: { titulo: string; tiene: boolean; children: React.ReactNode }) {
    const [abierto, setAbierto] = useState(false);

    return (
        <div className={clsx('card-elevated overflow-hidden transition-shadow', abierto && 'shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]')}>
            <button
                type="button"
                onClick={() => setAbierto(!abierto)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
            >
                {/* Indicador */}
                {tiene ? (
                    <CheckCircle2 size={16} strokeWidth={1.8} className="shrink-0 text-brand-green-dark dark:text-brand-green" />
                ) : (
                    <Circle size={16} strokeWidth={1.8} className="shrink-0 text-ink-muted/40 dark:text-ink-muted-dark/40" />
                )}

                {/* Título + estado */}
                <div className="flex-1">
                    <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">{titulo}</span>
                    {tiene ? (
                        <span className="ml-2 text-[10.5px] font-medium text-brand-green-dark dark:text-brand-green">✓ Registrado</span>
                    ) : (
                        <span className="ml-2 text-[10.5px] font-medium text-ink-muted/70 dark:text-ink-muted-dark/70">Pendiente</span>
                    )}
                </div>

                {/* Flecha */}
                <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    className={clsx('shrink-0 text-ink-muted transition-transform duration-200 dark:text-ink-muted-dark', abierto && 'rotate-180')}
                />
            </button>

            {/* Contenido desplegable */}
            <div className={clsx('transition-all duration-200 overflow-hidden', abierto ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0')}>
                <div className="border-t border-surface-border dark:border-surface-border-dark">
                    {children}
                </div>
            </div>
        </div>
    );
}
