import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useState } from 'react';
import EncabezadoPacienteNutricional from './Components/EncabezadoPacienteNutricional';
import TarjetaResumenNutricional from './Components/TarjetaResumenNutricional';
import TarjetaConsultaNutricional from './Components/TarjetaConsultaNutricional';
import { TarjetaEvaluacion, ModalEvaluacion } from './Components/evaluacion';
import { TarjetaHabitos, ModalHabitos } from './Components/habitos';
import { TarjetaPreferencias, ModalPreferencias } from './Components/preferencias';
import { TarjetaRestricciones, ModalRestricciones } from './Components/restricciones';
import { TarjetaObjetivos, ModalObjetivos } from './Components/objetivos';
import TarjetaRequerimientoNutricional from './Components/TarjetaRequerimientoNutricional';
import FormularioConsultaNutricional from './Components/FormularioConsultaNutricional';
import type { PerfilProps } from './tipos';
import type { PageProps } from '@/types';

type Seccion = 'consulta'|'evaluacion'|'habitos'|'preferencias'|'restricciones'|'objetivo'|null;
export default function Index(props: PerfilProps) {
    const [modal, setModal] = useState<Seccion>(null);
    const [modalEval, setModalEval] = useState(false);
    const [modalHabitos, setModalHabitos] = useState(false);
    const [modalPref, setModalPref] = useState(false);
    const [modalRest, setModalRest] = useState(false);
    const [modalObj, setModalObj] = useState(false);
    const flash = usePage<PageProps & {flash?:{success?:string;error?:string}}>().props.flash;
    const registros = [props.consulta, props.evaluacion, props.habitos, props.preferencias, props.restricciones, props.objetivo];
    const bloqueada = !props.consulta;
    const comunes = { cerrar:()=>setModal(null), pacienteId:props.paciente.id_paciente };
    return <AuthenticatedLayout title="Perfil nutricional">
        <Head title={`Perfil nutricional - ${props.paciente.nombres}`}/>
        <main className="mx-auto max-w-7xl space-y-5">
            <EncabezadoPacienteNutricional paciente={props.paciente}/>
            {flash?.success && <div className="rounded-xl bg-brand-green/10 border border-brand-green/20 px-4 py-2.5 text-[12px] font-medium text-brand-green-dark dark:bg-brand-green/[0.06] dark:text-brand-green">{flash.success}</div>}
            {flash?.error && <div className="rounded-xl bg-category-fruits/10 border border-category-fruits/20 px-4 py-2.5 text-[12px] font-medium text-category-fruits">{flash.error}</div>}
            {bloqueada && <div className="rounded-xl bg-category-others/10 border border-category-others/20 px-4 py-2.5 text-[12px] font-medium text-category-others flex items-center gap-2"><Info size={15}/><span>Registra primero la consulta nutricional para habilitar las demás secciones.</span></div>}
            <TarjetaResumenNutricional evaluacion={props.evaluacion} completadas={registros.filter(Boolean).length}/>
            <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                <TarjetaConsultaNutricional registro={props.consulta} abrir={()=>setModal('consulta')}/>
                <div className="card-elevated overflow-hidden">
                    <TarjetaEvaluacion registro={props.evaluacion} onRegistrar={() => setModalEval(true)} onEditar={() => setModalEval(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                </div>
                <div className="card-elevated overflow-hidden">
                    <TarjetaHabitos registro={props.habitos} onRegistrar={() => setModalHabitos(true)} onEditar={() => setModalHabitos(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                </div>
                <div className="card-elevated overflow-hidden">
                    <TarjetaPreferencias registro={props.preferencias} onRegistrar={() => setModalPref(true)} onEditar={() => setModalPref(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                </div>
                <div className="card-elevated overflow-hidden">
                    <TarjetaRestricciones registro={props.restricciones} onRegistrar={() => setModalRest(true)} onEditar={() => setModalRest(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                </div>
                <div className="card-elevated overflow-hidden">
                    <TarjetaObjetivos registro={props.objetivo} onRegistrar={() => setModalObj(true)} onEditar={() => setModalObj(true)} bloqueada={bloqueada} idPaciente={props.paciente.id_paciente} />
                </div>
            </div>
            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-bold">Cálculo nutricional</h2>
                    <p className="text-sm text-base-content/60">Estimación basada en la evaluación y el objetivo nutricional activos.</p>
                </div>
                <TarjetaRequerimientoNutricional
                    pacienteId={props.paciente.id_paciente}
                    requerimiento={props.requerimientoNutricional}
                    evaluacion={props.evaluacion}
                    objetivo={props.objetivo}
                />
            </section>
        </main>
        <FormularioConsultaNutricional {...comunes} abierto={modal==='consulta'} registro={props.consulta} opciones={props.opciones}/>
        <ModalEvaluacion abierto={modalEval} cerrar={() => setModalEval(false)} registro={props.evaluacion} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
        <ModalHabitos abierto={modalHabitos} cerrar={() => setModalHabitos(false)} registro={props.habitos} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
        <ModalPreferencias abierto={modalPref} cerrar={() => setModalPref(false)} registro={props.preferencias} pacienteId={props.paciente.id_paciente} />
        <ModalRestricciones abierto={modalRest} cerrar={() => setModalRest(false)} registro={props.restricciones} pacienteId={props.paciente.id_paciente} />
        <ModalObjetivos abierto={modalObj} cerrar={() => setModalObj(false)} registro={props.objetivo} pacienteId={props.paciente.id_paciente} opciones={props.opciones} />
    </AuthenticatedLayout>;
}
