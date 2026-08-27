import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Download, History, Info, Utensils, ClipboardList, Target, BrainCircuit, TrendingUp, CheckCircle2, Circle } from 'lucide-react';
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
    const [tabPrefRest, setTabPrefRest] = useState<'pref' | 'rest'>('pref');
    const [modalEvalEditar, setModalEvalEditar] = useState(false);
    const [modalEvalCrear, setModalEvalCrear] = useState(false);
    const [modalHabitosEditar, setModalHabitosEditar] = useState(false);
    const [modalHabitosCrear, setModalHabitosCrear] = useState(false);
    const [modalPref, setModalPref] = useState(false);
    const [modalPrefCrear, setModalPrefCrear] = useState(false);
    const [modalRest, setModalRest] = useState(false);
    const [modalRestCrear, setModalRestCrear] = useState(false);
    const [modalObjEditar, setModalObjEditar] = useState(false);
    const [modalObjCrear, setModalObjCrear] = useState(false);
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
                                        <TarjetaEvaluacion registro={props.evaluacion} onRegistrar={() => setModalEvalCrear(true)} onEditar={() => setModalEvalEditar(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                    </Desplegable>
                                    <Desplegable titulo="Hábitos alimentarios" tiene={!!props.habitos}>
                                        <TarjetaHabitos registro={props.habitos} onRegistrar={() => setModalHabitosCrear(true)} onEditar={() => setModalHabitosEditar(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                    </Desplegable>
                                    <Desplegable titulo="Preferencias y restricciones" tiene={!!props.preferencias || !!props.restricciones}>
                                        <div className="p-5 space-y-4">
                                            {/* Tabs internos */}
                                            <div className="flex gap-1 rounded-lg bg-black/[0.02] p-1 dark:bg-white/[0.03]">
                                                <TabInterno id="pref" activo={tabPrefRest === 'pref'} onClick={() => setTabPrefRest('pref')} label="Preferencias" tiene={!!props.preferencias} />
                                                <TabInterno id="rest" activo={tabPrefRest === 'rest'} onClick={() => setTabPrefRest('rest')} label="Restricciones" tiene={!!props.restricciones} />
                                            </div>
                                            {tabPrefRest === 'pref' && (
                                                <TarjetaPreferencias registro={props.preferencias} onRegistrar={() => setModalPrefCrear(true)} onEditar={() => setModalPref(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                            )}
                                            {tabPrefRest === 'rest' && (
                                                <TarjetaRestricciones registro={props.restricciones} onRegistrar={() => setModalRestCrear(true)} onEditar={() => setModalRest(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                                            )}
                                        </div>
                                    </Desplegable>
                                    <Desplegable titulo="Objetivos nutricionales" tiene={!!props.objetivo}>
                                        <TarjetaObjetivos registro={props.objetivo} onRegistrar={() => setModalObjCrear(true)} onEditar={() => setModalObjEditar(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
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
                                        <Link
                                            href={route('nutricionista.pacientes.planes-alimentarios.historial', props.paciente.id_paciente)}
                                            className="group flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-black/[0.015] p-4 transition-colors hover:border-brand-green/30 hover:bg-brand-green/[0.035] dark:border-surface-border-dark dark:bg-white/[0.02] dark:hover:bg-brand-green/[0.05]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/12 text-brand-green-dark dark:text-brand-green">
                                                    <History size={17} strokeWidth={1.8} />
                                                </div>
                                                <div>
                                                    <p className="text-[12.5px] font-bold text-ink dark:text-ink-dark">Historial de planes alimentarios</p>
                                                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">
                                                        {props.historialPlanes.total_planes} plan(es) registrados. Consulta planes anteriores, fundamentos y cambios.
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-brand-green-dark dark:text-brand-green">
                                                Ver historial <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </Link>
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
            <ModalEvaluacion abierto={modalEvalEditar} cerrar={() => setModalEvalEditar(false)} registro={props.evaluacion} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
            <ModalEvaluacion abierto={modalEvalCrear} cerrar={() => setModalEvalCrear(false)} registro={null} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
            <ModalHabitos abierto={modalHabitosEditar} cerrar={() => setModalHabitosEditar(false)} registro={props.habitos} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
            <ModalHabitos abierto={modalHabitosCrear} cerrar={() => setModalHabitosCrear(false)} registro={null} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
            <ModalPreferencias abierto={modalPref} cerrar={() => setModalPref(false)} registro={props.preferencias} pacienteId={props.paciente.id_paciente} />
            <ModalPreferencias abierto={modalPrefCrear} cerrar={() => setModalPrefCrear(false)} registro={null} pacienteId={props.paciente.id_paciente} />
            <ModalRestricciones abierto={modalRest} cerrar={() => setModalRest(false)} registro={props.restricciones} pacienteId={props.paciente.id_paciente} />
            <ModalRestricciones abierto={modalRestCrear} cerrar={() => setModalRestCrear(false)} registro={null} pacienteId={props.paciente.id_paciente} />
            <ModalObjetivos abierto={modalObjEditar} cerrar={() => setModalObjEditar(false)} registro={props.objetivo} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
            <ModalObjetivos abierto={modalObjCrear} cerrar={() => setModalObjCrear(false)} registro={null} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
        </AuthenticatedLayout>
    );
}


function TabInterno({ id, activo, onClick, label, tiene }: { id: string; activo: boolean; onClick: () => void; label: string; tiene: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11.5px] font-semibold transition-all',
                activo
                    ? 'bg-surface-card shadow-sm text-ink dark:bg-surface-card-dark dark:text-ink-dark'
                    : 'text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark',
            )}
        >
            {tiene
                ? <CheckCircle2 size={12} strokeWidth={1.8} className="text-brand-green-dark dark:text-brand-green" />
                : <Circle size={12} strokeWidth={1.8} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
            }
            {label}
        </button>
    );
}
