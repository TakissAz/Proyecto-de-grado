import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Download, Info, Utensils, ClipboardList, Target, BrainCircuit, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Desplegable } from '@/Components/ui/desplegable';
import EncabezadoPacienteNutricional from './Components/EncabezadoPacienteNutricional';
import TarjetaResumenNutricional from './Components/TarjetaResumenNutricional';
import TarjetaConsultaNutricional from './Components/TarjetaConsultaNutricional';
import { TarjetaEvaluacion, ModalEvaluacion } from './Components/evaluacion';
import { TarjetaHabitos, ModalHabitos } from './Components/habitos';
import { TarjetaPreferencias, ModalPreferencias } from './Components/preferencias';
import { TarjetaRestricciones, ModalRestricciones } from './Components/restricciones';
import { TarjetaObjetivos, ModalObjetivos } from './Components/objetivos';
import TarjetaRequerimientoNutricional from './Components/TarjetaRequerimientoNutricional';
import TarjetaRecomendacionExperta from './Components/TarjetaRecomendacionExperta';
import PlanAlimentarioCard from '@/Components/planes/PlanAlimentarioCard';
import SeguimientoPacientePanel from '@/Components/nutricionista/seguimiento/SeguimientoPacientePanel';
import RetroalimentacionPacientePanel from '@/Components/nutricionista/seguimiento/RetroalimentacionPacientePanel';
import ResumenAjustePlanCard from '@/Components/nutricionista/seguimiento/ResumenAjustePlanCard';
import AnaliticaEvolucionPanel from '@/Components/nutricionista/analitica/AnaliticaEvolucionPanel';
import HistorialPlanesNutricionista from '@/Components/nutricionista/planes/HistorialPlanesNutricionista';
import AlertasNutricionistaPanel from '@/Components/nutricionista/alertas/AlertasNutricionistaPanel';
import SugerenciasAjusteNutricionalPanel from '@/Components/nutricionista/ajustes/SugerenciasAjusteNutricionalPanel';
import PrediccionRiesgoAdherenciaCard from '@/Components/nutricionista/prediccion/PrediccionRiesgoAdherenciaCard';
import FormularioConsultaNutricional from './Components/FormularioConsultaNutricional';
import type { PerfilProps } from './tipos';
import type { PageProps } from '@/types';

type StepId = 'valoracion' | 'calculo' | 'planificacion' | 'adherencia';
type Seccion = 'consulta' | null;

const STEPS: { id: StepId; label: string; icono: typeof ClipboardList; desc: string }[] = [
    { id: 'valoracion', label: 'Valoración', icono: ClipboardList, desc: 'Evaluación, hábitos, preferencias y objetivos' },
    { id: 'calculo', label: 'Cálculo', icono: Target, desc: 'Requerimiento y orientación nutricional' },
    { id: 'planificacion', label: 'Planificación', icono: Utensils, desc: 'Plan alimentario semanal' },
    { id: 'adherencia', label: 'Seguimiento', icono: TrendingUp, desc: 'Adherencia, alertas y evolución' },
];

export default function Index(props: PerfilProps) {
    const [modal, setModal] = useState<Seccion>(null);
    const [stepActivo, setStepActivo] = useState<StepId>('valoracion');
    const [modalEval, setModalEval] = useState(false);
    const [modalHabitos, setModalHabitos] = useState(false);
    const [modalPref, setModalPref] = useState(false);
    const [modalRest, setModalRest] = useState(false);
    const [modalObj, setModalObj] = useState(false);
    const flash = usePage<PageProps & { flash?: { success?: string; error?: string } }>().props.flash;
    const registros = [props.consulta, props.evaluacion, props.habitos, props.preferencias, props.restricciones, props.objetivo];
    const bloqueada = !props.consulta;
    const comunes = { cerrar: () => setModal(null), pacienteId: props.paciente.id_paciente };

    return (
        <AuthenticatedLayout title="Perfil nutricional">
            <Head title={`Perfil nutricional - ${props.paciente.nombres}`} />
            <main className="space-y-4">

                {/* Encabezado */}
                <EncabezadoPacienteNutricional paciente={props.paciente} />

                {/* Alertas flash */}
                {flash?.success && <div className="rounded-xl bg-brand-green/10 border border-brand-green/20 px-4 py-2.5 text-[12px] font-medium text-brand-green-dark dark:bg-brand-green/[0.06] dark:text-brand-green">{flash.success}</div>}
                {flash?.error && <div className="rounded-xl bg-category-fruits/10 border border-category-fruits/20 px-4 py-2.5 text-[12px] font-medium text-category-fruits">{flash.error}</div>}
                {bloqueada && <div className="rounded-xl bg-category-others/10 border border-category-others/20 px-4 py-2.5 text-[12px] font-medium text-category-others flex items-center gap-2"><Info size={15} /><span>Registra primero la consulta nutricional para habilitar las demás secciones.</span></div>}

                {/* Resumen nutricional a lo ancho */}
                <TarjetaResumenNutricional evaluacion={props.evaluacion} completadas={registros.filter(Boolean).length} />

                {/* ═══ LAYOUT PRINCIPAL: Steps + Contenido + Panel derecho ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

                    {/* ── Columna principal ── */}
                    <div className="space-y-4">

                        {/* Steps navigation */}
                        <div className="card-elevated p-1.5 flex gap-1 overflow-x-auto">
                            {STEPS.map(({ id, label, icono: Icon, desc }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setStepActivo(id)}
                                    className={clsx(
                                        'flex-1 min-w-[120px] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left transition-all',
                                        stepActivo === id
                                            ? 'bg-brand-green/10 shadow-sm dark:bg-brand-green/[0.08]'
                                            : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]',
                                    )}
                                >
                                    <Icon
                                        size={16}
                                        strokeWidth={1.8}
                                        className={clsx(stepActivo === id ? 'text-brand-green-dark dark:text-brand-green' : 'text-ink-muted dark:text-ink-muted-dark')}
                                    />
                                    <div>
                                        <p className={clsx('text-[12px] font-semibold leading-tight', stepActivo === id ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-muted-dark')}>
                                            {label}
                                        </p>
                                        <p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark leading-tight hidden sm:block">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Step content */}
                        <div className="space-y-2">

                            {stepActivo === 'valoracion' && (
                                <>
                                    <Desplegable titulo="Evaluación nutricional" tiene={!!props.evaluacion}>
                                        <TarjetaEvaluacion registro={props.evaluacion} onRegistrar={() => setModalEval(true)} onEditar={() => setModalEval(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                    </Desplegable>
                                    <Desplegable titulo="Hábitos alimentarios" tiene={!!props.habitos}>
                                        <TarjetaHabitos registro={props.habitos} onRegistrar={() => setModalHabitos(true)} onEditar={() => setModalHabitos(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                    </Desplegable>
                                    <Desplegable titulo="Preferencias alimentarias" tiene={!!props.preferencias}>
                                        <TarjetaPreferencias registro={props.preferencias} onRegistrar={() => setModalPref(true)} onEditar={() => setModalPref(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                    </Desplegable>
                                    <Desplegable titulo="Restricciones alimentarias" tiene={!!props.restricciones}>
                                        <TarjetaRestricciones registro={props.restricciones} onRegistrar={() => setModalRest(true)} onEditar={() => setModalRest(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                    </Desplegable>
                                    <Desplegable titulo="Objetivos nutricionales" tiene={!!props.objetivo}>
                                        <TarjetaObjetivos registro={props.objetivo} onRegistrar={() => setModalObj(true)} onEditar={() => setModalObj(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                    </Desplegable>
                                </>
                            )}

                            {stepActivo === 'calculo' && (
                                <>
                                    <Desplegable titulo="Requerimiento nutricional" tiene={!!props.requerimientoNutricional} defaultAbierto>
                                        <div className="p-4">
                                            <TarjetaRequerimientoNutricional pacienteId={props.paciente.id_paciente} requerimiento={props.requerimientoNutricional} evaluacion={props.evaluacion} objetivo={props.objetivo} />
                                        </div>
                                    </Desplegable>
                                    <Desplegable titulo="Orientación nutricional asistida" tiene={!!props.recomendacionExperta} defaultAbierto>
                                        <div className="p-4">
                                            <TarjetaRecomendacionExperta pacienteId={props.paciente.id_paciente} recomendacion={props.recomendacionExperta} />
                                        </div>
                                    </Desplegable>
                                </>
                            )}

                            {stepActivo === 'planificacion' && (
                                <Desplegable titulo="Plan alimentario" tiene={!!props.planAlimentarioPrincipal} defaultAbierto>
                                    <div className="p-4 space-y-3">
                                        <PlanAlimentarioCard plan={props.planAlimentarioPrincipal} recomendacion={props.recomendacionExpertaAprobada} puedeGenerar={props.puedeGenerarPlanSemanal} alimentos={props.alimentosPlan} recetas={props.recetasPlan} />
                                        <HistorialPlanesNutricionista historial={props.historialPlanes} />
                                    </div>
                                </Desplegable>
                            )}

                            {stepActivo === 'adherencia' && (
                                <>
                                    <Desplegable titulo="Alertas nutricionales" tiene={!!props.alertasNutricionista}>
                                        <div className="p-4"><AlertasNutricionistaPanel alertasNutricionista={props.alertasNutricionista} /></div>
                                    </Desplegable>
                                    <Desplegable titulo="Predicción riesgo adherencia" tiene={!!props.prediccionRiesgoAdherencia}>
                                        <div className="p-4"><PrediccionRiesgoAdherenciaCard prediccionRiesgoAdherencia={props.prediccionRiesgoAdherencia} /></div>
                                    </Desplegable>
                                    <Desplegable titulo="Sugerencias de ajuste" tiene={!!props.sugerenciasAjusteNutricional}>
                                        <div className="p-4"><SugerenciasAjusteNutricionalPanel datos={props.sugerenciasAjusteNutricional} /></div>
                                    </Desplegable>
                                    <Desplegable titulo="Seguimiento del paciente" tiene={!!props.seguimientoPaciente?.plan}>
                                        <div className="p-4"><SeguimientoPacientePanel seguimiento={props.seguimientoPaciente} /></div>
                                    </Desplegable>
                                    <Desplegable titulo="Analítica de evolución" tiene={!!props.analiticaEvolucion}>
                                        <div className="p-4"><AnaliticaEvolucionPanel analitica={props.analiticaEvolucion} /></div>
                                    </Desplegable>
                                    <Desplegable titulo="Retroalimentación" tiene={(props.retroalimentacionesPaciente?.length ?? 0) > 0}>
                                        <div className="p-4"><RetroalimentacionPacientePanel pacienteId={props.paciente.id_paciente} planId={props.seguimientoPaciente.plan?.id_plan_alimentario} historial={props.retroalimentacionesPaciente} /></div>
                                    </Desplegable>
                                    <Desplegable titulo="Resumen ajuste del plan" tiene={!!props.contextoAjustePlan}>
                                        <div className="p-4"><ResumenAjustePlanCard contexto={props.contextoAjustePlan} /></div>
                                    </Desplegable>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Panel lateral derecho: Consulta ── */}
                    <aside className="lg:sticky lg:top-20 lg:self-start space-y-3">
                        {/* Consulta nutricional */}
                        <div className="card-elevated overflow-hidden">
                            <TarjetaConsultaNutricional registro={props.consulta} abrir={() => setModal('consulta')} />
                        </div>

                        {/* Descargar reporte */}
                        {props.seguimientoPaciente?.plan && (
                            <a
                                className="card-elevated flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
                                href={route('nutricionista.pacientes.reporte-seguimiento-evolucion-pdf', props.paciente.id_paciente)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Download size={14} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                                <div>
                                    <p className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">Reporte de seguimiento</p>
                                    <p className="text-[9.5px] text-ink-muted dark:text-ink-muted-dark">Descargar PDF de evolución</p>
                                </div>
                            </a>
                        )}
                    </aside>
                </div>
            </main>

            {/* Modales */}
            <FormularioConsultaNutricional {...comunes} abierto={modal === 'consulta'} registro={props.consulta} opciones={props.opciones} />
            <ModalEvaluacion abierto={modalEval} cerrar={() => setModalEval(false)} registro={props.evaluacion} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
            <ModalHabitos abierto={modalHabitos} cerrar={() => setModalHabitos(false)} registro={props.habitos} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
            <ModalPreferencias abierto={modalPref} cerrar={() => setModalPref(false)} registro={props.preferencias} pacienteId={props.paciente.id_paciente} />
            <ModalRestricciones abierto={modalRest} cerrar={() => setModalRest(false)} registro={props.restricciones} pacienteId={props.paciente.id_paciente} />
            <ModalObjetivos abierto={modalObj} cerrar={() => setModalObj(false)} registro={props.objetivo} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
        </AuthenticatedLayout>
    );
}
