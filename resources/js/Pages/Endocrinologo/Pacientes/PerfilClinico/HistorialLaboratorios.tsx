import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
import { EstadoVacio } from '@/Components/ui/estado-vacio';
import type { PageProps } from '@/types';

interface Reg { id: number; fecha_resultado: string; interpretacion?: string | null; created_at?: string | null; updated_at?: string | null }

interface Props extends PageProps {
    paciente: { id_paciente: number; nombre_completo: string; ci: string };
    historial: {
        perfil_androgenico: (Reg & { testosterona_total?: number | null; testosterona_libre?: number | null; shbg?: number | null; indice_androgenico_libre?: number | null; dhea_s?: number | null; androstenediona?: number | null; hiperandrogenismo_bioquimico?: boolean })[];
        perfil_gonadotropo: (Reg & { lh?: number | null; fsh?: number | null; relacion_lh_fsh?: number | null; estradiol?: number | null; progesterona?: number | null; progesterona_dia_ciclo?: number | null; progesterona_fase_ciclo?: string | null })[];
        diferencial_endocrino: (Reg & { tsh?: number | null; t3_libre?: number | null; t4_libre?: number | null; prolactina?: number | null; diecisiete_oh_progesterona?: number | null; cortisol?: number | null; alteracion_tiroidea_descartada?: boolean; hiperprolactinemia_descartada?: boolean; hiperplasia_suprarrenal_descartada?: boolean; cushing_descartado?: boolean })[];
        glucosa_insulina: (Reg & { glucosa_ayunas?: number | null; insulina_ayunas?: number | null; homa_ir?: number | null; hemoglobina_glicosilada?: number | null; glucosa_2h_ogtt?: number | null; insulina_2h_ogtt?: number | null; hiperinsulinemia?: boolean; resistencia_insulina_sugerida?: boolean })[];
        perfil_lipidico: (Reg & { colesterol_total?: number | null; hdl?: number | null; ldl?: number | null; vldl?: number | null; trigliceridos?: number | null; colesterol_no_hdl?: number | null; dislipidemia_sugerida?: boolean })[];
    };
}

export default function HistorialLaboratorios({ paciente, historial }: Props) {
    const id = paciente.id_paciente;
    const [tab, setTab] = useState(0);
    const tabs = [
        { label: 'Andrógenos', count: historial.perfil_androgenico.length },
        { label: 'Gonadotropo', count: historial.perfil_gonadotropo.length },
        { label: 'Diferenciales', count: historial.diferencial_endocrino.length },
        { label: 'Glucosa/Ins.', count: historial.glucosa_insulina.length },
        { label: 'Lípidos', count: historial.perfil_lipidico.length },
    ];

    return (
        <AuthenticatedLayout header={<h2>Historial de laboratorios</h2>}>
            <Head title={`Historial laboratorios: ${paciente.nombre_completo}`} />
            <div className="space-y-5">
                <Link href={`/endocrinologo/pacientes/${id}/perfil-clinico`} className="btn btn-ghost btn-xs gap-1"><ArrowLeft size={14} /> Volver al perfil clínico</Link>

                <div className="bg-base-100 border border-base-300 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
                    <div><h2 className="text-lg font-extrabold text-base-content">{paciente.nombre_completo}</h2><p className="text-xs text-base-content/50">CI: {paciente.ci}</p></div>
                </div>

                <div role="tablist" className="tabs tabs-bordered tabs-sm">
                    {tabs.map((t, i) => (<button key={i} role="tab" className={clsx('tab', tab === i && 'tab-active')} onClick={() => setTab(i)}>{t.label} ({t.count})</button>))}
                </div>

                {tab === 0 && <TablaAndrogenico registros={historial.perfil_androgenico} />}
                {tab === 1 && <TablaGonadotropo registros={historial.perfil_gonadotropo} />}
                {tab === 2 && <TablaDiferenciales registros={historial.diferencial_endocrino} />}
                {tab === 3 && <TablaGlucosa registros={historial.glucosa_insulina} />}
                {tab === 4 && <TablaLipidico registros={historial.perfil_lipidico} />}
            </div>
        </AuthenticatedLayout>
    );
}

function V(valor?: number | null, u?: string) { return valor != null ? `${valor}${u ? ` ${u}` : ''}` : '-'; }

function TablaAndrogenico({ registros }: { registros: Props['historial']['perfil_androgenico'] }) {
    if (!registros.length) return <Tarjeta><EstadoVacio mensaje="No existen registros de perfil androgénico." /></Tarjeta>;
    return (<div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table table-sm"><thead><tr className="text-base-content/50"><th>Fecha</th><th>T. Total</th><th>T. Libre</th><th>SHBG</th><th>IAL</th><th>DHEA-S</th><th>HA Bioq.</th></tr></thead><tbody>{registros.map(r => (<tr key={r.id} className="hover"><td className="text-xs font-medium">{r.fecha_resultado}<br/><span className="text-[10px] text-base-content/40">{r.created_at}</span></td><td className="text-xs">{V(r.testosterona_total, 'ng/dL')}</td><td className="text-xs">{V(r.testosterona_libre)}</td><td className="text-xs">{V(r.shbg)}</td><td className="text-xs">{V(r.indice_androgenico_libre)}</td><td className="text-xs">{V(r.dhea_s)}</td><td><Badge variante={r.hiperandrogenismo_bioquimico ? 'error' : 'ghost'}>{r.hiperandrogenismo_bioquimico ? 'Positivo' : 'Neg.'}</Badge></td></tr>))}</tbody></table></div></div>);
}

function TablaGonadotropo({ registros }: { registros: Props['historial']['perfil_gonadotropo'] }) {
    if (!registros.length) return <Tarjeta><EstadoVacio mensaje="No existen registros de perfil gonadotropo." /></Tarjeta>;
    return (<div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table table-sm"><thead><tr className="text-base-content/50"><th>Fecha</th><th>LH</th><th>FSH</th><th>LH/FSH</th><th>Estradiol</th><th>Progesterona</th></tr></thead><tbody>{registros.map(r => (<tr key={r.id} className="hover"><td className="text-xs font-medium">{r.fecha_resultado}</td><td className="text-xs">{V(r.lh)}</td><td className="text-xs">{V(r.fsh)}</td><td>{r.relacion_lh_fsh != null ? <Badge variante={r.relacion_lh_fsh > 2 ? 'warning' : 'ghost'}>{r.relacion_lh_fsh}</Badge> : '-'}</td><td className="text-xs">{V(r.estradiol)}</td><td className="text-xs">{V(r.progesterona)}</td></tr>))}</tbody></table></div></div>);
}

function TablaDiferenciales({ registros }: { registros: Props['historial']['diferencial_endocrino'] }) {
    if (!registros.length) return <Tarjeta><EstadoVacio mensaje="No existen registros de diferenciales endocrinos." /></Tarjeta>;
    return (<div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table table-sm"><thead><tr className="text-base-content/50"><th>Fecha</th><th>TSH</th><th>Prolactina</th><th>17-OHP</th><th>Cortisol</th><th>Descartes</th></tr></thead><tbody>{registros.map(r => (<tr key={r.id} className="hover"><td className="text-xs font-medium">{r.fecha_resultado}</td><td className="text-xs">{V(r.tsh)}</td><td className="text-xs">{V(r.prolactina)}</td><td className="text-xs">{V(r.diecisiete_oh_progesterona)}</td><td className="text-xs">{V(r.cortisol)}</td><td><div className="flex flex-wrap gap-1">{[{l:'Tir',v:r.alteracion_tiroidea_descartada},{l:'Prol',v:r.hiperprolactinemia_descartada},{l:'HSR',v:r.hiperplasia_suprarrenal_descartada},{l:'Cush',v:r.cushing_descartado}].map(d=>(<Badge key={d.l} variante={d.v?'success':'ghost'}>{d.l}</Badge>))}</div></td></tr>))}</tbody></table></div></div>);
}

function TablaGlucosa({ registros }: { registros: Props['historial']['glucosa_insulina'] }) {
    if (!registros.length) return <Tarjeta><EstadoVacio mensaje="No existen registros de glucosa e insulina." /></Tarjeta>;
    return (<div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table table-sm"><thead><tr className="text-base-content/50"><th>Fecha</th><th>Glucosa</th><th>Insulina</th><th>HOMA-IR</th><th>HbA1c</th><th>Estado</th></tr></thead><tbody>{registros.map(r => (<tr key={r.id} className="hover"><td className="text-xs font-medium">{r.fecha_resultado}</td><td className="text-xs">{V(r.glucosa_ayunas, 'mg/dL')}</td><td className="text-xs">{V(r.insulina_ayunas)}</td><td>{r.homa_ir != null ? <Badge variante={r.homa_ir >= 2.5 ? 'error' : 'ghost'}>{r.homa_ir}</Badge> : '-'}</td><td className="text-xs">{V(r.hemoglobina_glicosilada, '%')}</td><td><div className="flex gap-1">{r.resistencia_insulina_sugerida ? <Badge variante="error">RI</Badge> : null}{r.hiperinsulinemia ? <Badge variante="warning">HI</Badge> : null}{!r.resistencia_insulina_sugerida && !r.hiperinsulinemia ? <Badge variante="success">Normal</Badge> : null}</div></td></tr>))}</tbody></table></div></div>);
}

function TablaLipidico({ registros }: { registros: Props['historial']['perfil_lipidico'] }) {
    if (!registros.length) return <Tarjeta><EstadoVacio mensaje="No existen registros de perfil lipídico." /></Tarjeta>;
    return (<div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table table-sm"><thead><tr className="text-base-content/50"><th>Fecha</th><th>Col.</th><th>HDL</th><th>LDL</th><th>TG</th><th>Estado</th></tr></thead><tbody>{registros.map(r => (<tr key={r.id} className="hover"><td className="text-xs font-medium">{r.fecha_resultado}</td><td className="text-xs">{V(r.colesterol_total)}</td><td>{r.hdl != null ? <Badge variante={r.hdl < 50 ? 'warning' : 'ghost'}>{r.hdl}</Badge> : '-'}</td><td className="text-xs">{V(r.ldl)}</td><td className="text-xs">{V(r.trigliceridos)}</td><td>{r.dislipidemia_sugerida ? <Badge variante="warning">Dislipidemia</Badge> : <Badge variante="success">Normal</Badge>}</td></tr>))}</tbody></table></div></div>);
}
