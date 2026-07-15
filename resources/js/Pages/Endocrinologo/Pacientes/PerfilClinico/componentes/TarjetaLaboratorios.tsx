import { useState } from 'react';
import clsx from 'clsx';
import { Link } from '@inertiajs/react';
import { FlaskConical, Plus, Edit, History, Check } from 'lucide-react';
import { Tarjeta } from '@/Components/ui/tarjeta';
import { Badge } from '@/Components/ui/badge';
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

export default function TarjetaLaboratorios({ laboratorios, idPaciente, ...acciones }: Props) {
    const [tab, setTab] = useState(0);

    const paneles = [
        { label: 'Andrógenos', datos: laboratorios.perfil_androgenico, onReg: acciones.onRegistrarPerfilAndrogenico, onEdit: acciones.onEditarPerfilAndrogenico },
        { label: 'Gonadotropo', datos: laboratorios.perfil_gonadotropo, onReg: acciones.onRegistrarPerfilGonadotropo, onEdit: acciones.onEditarPerfilGonadotropo },
        { label: 'Diferenciales', datos: laboratorios.diferencial_endocrino, onReg: acciones.onRegistrarDiferenciales, onEdit: acciones.onEditarDiferenciales },
        { label: 'Glucosa/Insulina', datos: laboratorios.glucosa_insulina, onReg: acciones.onRegistrarGlucosaInsulina, onEdit: acciones.onEditarGlucosaInsulina },
        { label: 'Lípidos', datos: laboratorios.perfil_lipidico, onReg: acciones.onRegistrarPerfilLipidico, onEdit: acciones.onEditarPerfilLipidico },
    ];

    const completados = paneles.filter(p => p.datos != null).length;

    return (
        <Tarjeta>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <FlaskConical size={18} className={completados > 0 ? 'text-primary' : 'text-base-content/30'} />
                    <h3 className="font-bold text-base-content text-sm">Laboratorios</h3>
                    <Badge variante={completados === 5 ? 'success' : completados > 0 ? 'primary' : 'ghost'}>
                        {completados}/5 paneles
                    </Badge>
                </div>
                <Link href={`/endocrinologo/pacientes/${idPaciente}/laboratorios/historial`} className="btn btn-ghost btn-xs gap-1 text-base-content/60">
                    <History size={13} /> Historial
                </Link>
            </div>

            {/* Tabs */}
            <div role="tablist" className="tabs tabs-bordered tabs-sm mb-4">
                {paneles.map((p, i) => (
                    <button
                        key={i}
                        role="tab"
                        className={clsx('tab gap-1.5', tab === i && 'tab-active')}
                        onClick={() => setTab(i)}
                    >
                        {p.label}
                        {p.datos ? <Check size={12} className="text-success" /> : null}
                    </button>
                ))}
            </div>

            {/* Panel activo */}
            {paneles[tab].datos ? (
                <PanelConDatos panel={paneles[tab]} laboratorios={laboratorios} tabIndex={tab} />
            ) : (
                <div className="py-4">
                    <p className="text-xs text-base-content/60 mb-3">No se han registrado resultados de {paneles[tab].label.toLowerCase()}.</p>
                    <button onClick={paneles[tab].onReg} className="btn btn-primary btn-sm gap-1.5">
                        <Plus size={14} /> Registrar {paneles[tab].label.toLowerCase()}
                    </button>
                </div>
            )}
        </Tarjeta>
    );
}

function PanelConDatos({ panel, laboratorios, tabIndex }: { panel: { label: string; datos: unknown; onEdit: () => void }; laboratorios: LaboratoriosData; tabIndex: number }) {
    return (
        <div>
            <div className="flex justify-end mb-3">
                <button onClick={panel.onEdit} className="btn btn-outline btn-primary btn-xs gap-1">
                    <Edit size={13} /> Editar
                </button>
            </div>

            {tabIndex === 0 && laboratorios.perfil_androgenico ? <PanelAndrogenico data={laboratorios.perfil_androgenico} /> : null}
            {tabIndex === 1 && laboratorios.perfil_gonadotropo ? <PanelGonadotropo data={laboratorios.perfil_gonadotropo} /> : null}
            {tabIndex === 2 && laboratorios.diferencial_endocrino ? <PanelDiferenciales data={laboratorios.diferencial_endocrino} /> : null}
            {tabIndex === 3 && laboratorios.glucosa_insulina ? <PanelGlucosa data={laboratorios.glucosa_insulina} /> : null}
            {tabIndex === 4 && laboratorios.perfil_lipidico ? <PanelLipidico data={laboratorios.perfil_lipidico} /> : null}
        </div>
    );
}

function Val({ label, valor, unidad }: { label: string; valor?: number | null; unidad?: string }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-base-content/40">{label}</p>
            <p className="text-sm font-medium text-base-content">{valor != null ? `${valor}${unidad ? ` ${unidad}` : ''}` : '-'}</p>
        </div>
    );
}

function PanelAndrogenico({ data }: { data: NonNullable<LaboratoriosData['perfil_androgenico']> }) {
    return (
        <>
            <p className="text-[10px] text-base-content/40 mb-2">Fecha: {data.fecha_resultado}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <Val label="Testosterona total" valor={data.testosterona_total} unidad="ng/dL" />
                <Val label="Testosterona libre" valor={data.testosterona_libre} unidad="pg/mL" />
                <Val label="SHBG" valor={data.shbg} unidad="nmol/L" />
                <Val label="Índice androgénico" valor={data.indice_androgenico_libre} />
                <Val label="DHEA-S" valor={data.dhea_s} unidad="μg/dL" />
                <Val label="Androstenediona" valor={data.androstenediona} unidad="ng/mL" />
            </div>
            <Badge variante={data.hiperandrogenismo_bioquimico ? 'error' : 'ghost'}>
                {data.hiperandrogenismo_bioquimico ? 'Hiperandrogenismo bioquímico positivo' : 'Sin hiperandrogenismo bioquímico'}
            </Badge>
        </>
    );
}

function PanelGonadotropo({ data }: { data: NonNullable<LaboratoriosData['perfil_gonadotropo']> }) {
    const lhFshAlta = data.relacion_lh_fsh != null && data.relacion_lh_fsh > 2;
    return (
        <>
            <p className="text-[10px] text-base-content/40 mb-2">Fecha: {data.fecha_resultado}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <Val label="LH" valor={data.lh} unidad="mUI/mL" />
                <Val label="FSH" valor={data.fsh} unidad="mUI/mL" />
                <Val label="Relación LH/FSH" valor={data.relacion_lh_fsh} />
                <Val label="Estradiol" valor={data.estradiol} unidad="pg/mL" />
                <Val label="Progesterona" valor={data.progesterona} unidad="ng/mL" />
                {data.progesterona_dia_ciclo ? <Val label="Día ciclo" valor={data.progesterona_dia_ciclo} /> : null}
            </div>
            <div className="flex gap-1.5">
                {lhFshAlta ? <Badge variante="warning">LH/FSH elevada (&gt;2)</Badge> : null}
                {data.progesterona != null && data.progesterona < 3 ? <Badge variante="warning">Progesterona baja</Badge> : null}
                {!lhFshAlta && !(data.progesterona != null && data.progesterona < 3) ? <Badge variante="success">Sin alteraciones</Badge> : null}
            </div>
        </>
    );
}

function PanelDiferenciales({ data }: { data: NonNullable<LaboratoriosData['diferencial_endocrino']> }) {
    const descartes = [
        { label: 'Tiroides', ok: data.alteracion_tiroidea_descartada },
        { label: 'Prolactina', ok: data.hiperprolactinemia_descartada },
        { label: 'HSR', ok: data.hiperplasia_suprarrenal_descartada },
        { label: 'Cushing', ok: data.cushing_descartado },
    ];
    const todos = descartes.every(d => d.ok);
    return (
        <>
            <p className="text-[10px] text-base-content/40 mb-2">Fecha: {data.fecha_resultado}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <Val label="TSH" valor={data.tsh} unidad="mUI/L" />
                <Val label="T3 libre" valor={data.t3_libre} unidad="pg/mL" />
                <Val label="T4 libre" valor={data.t4_libre} unidad="ng/dL" />
                <Val label="Prolactina" valor={data.prolactina} unidad="ng/mL" />
                <Val label="17-OH Prog." valor={data.diecisiete_oh_progesterona} unidad="ng/mL" />
                <Val label="Cortisol" valor={data.cortisol} unidad="μg/dL" />
            </div>
            <div className="flex flex-wrap gap-1.5">
                {todos ? <Badge variante="success">Diferenciales descartados</Badge> : descartes.map(d => (
                    <Badge key={d.label} variante={d.ok ? 'success' : 'warning'}>{d.label} {d.ok ? '✓' : 'pendiente'}</Badge>
                ))}
            </div>
        </>
    );
}

function PanelGlucosa({ data }: { data: NonNullable<LaboratoriosData['glucosa_insulina']> }) {
    const alertas: string[] = [];
    if (data.homa_ir != null && data.homa_ir >= 2.5) alertas.push(`HOMA-IR elevado (${data.homa_ir})`);
    if (data.resistencia_insulina_sugerida) alertas.push('RI sugerida');
    if (data.hiperinsulinemia) alertas.push('Hiperinsulinemia');
    return (
        <>
            <p className="text-[10px] text-base-content/40 mb-2">Fecha: {data.fecha_resultado}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <Val label="Glucosa ayunas" valor={data.glucosa_ayunas} unidad="mg/dL" />
                <Val label="Insulina ayunas" valor={data.insulina_ayunas} unidad="µU/mL" />
                <Val label="HOMA-IR" valor={data.homa_ir} />
                <Val label="HbA1c" valor={data.hemoglobina_glicosilada} unidad="%" />
                <Val label="Glucosa 2h OGTT" valor={data.glucosa_2h_ogtt} unidad="mg/dL" />
                <Val label="Insulina 2h OGTT" valor={data.insulina_2h_ogtt} unidad="µU/mL" />
            </div>
            <div className="flex flex-wrap gap-1.5">
                {alertas.length > 0 ? alertas.map(a => <Badge key={a} variante="error">{a}</Badge>) : <Badge variante="success">Sin alteraciones glucémicas</Badge>}
            </div>
        </>
    );
}

function PanelLipidico({ data }: { data: NonNullable<LaboratoriosData['perfil_lipidico']> }) {
    const alertas: string[] = [];
    if (data.colesterol_total != null && data.colesterol_total >= 200) alertas.push('Col. elevado');
    if (data.ldl != null && data.ldl >= 130) alertas.push('LDL elevado');
    if (data.hdl != null && data.hdl < 50) alertas.push('HDL bajo');
    if (data.trigliceridos != null && data.trigliceridos >= 150) alertas.push('TG elevados');
    if (data.dislipidemia_sugerida) alertas.push('Dislipidemia');
    return (
        <>
            <p className="text-[10px] text-base-content/40 mb-2">Fecha: {data.fecha_resultado}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <Val label="Colesterol total" valor={data.colesterol_total} unidad="mg/dL" />
                <Val label="HDL" valor={data.hdl} unidad="mg/dL" />
                <Val label="LDL" valor={data.ldl} unidad="mg/dL" />
                <Val label="VLDL" valor={data.vldl} unidad="mg/dL" />
                <Val label="Triglicéridos" valor={data.trigliceridos} unidad="mg/dL" />
                <Val label="Col. no-HDL" valor={data.colesterol_no_hdl} unidad="mg/dL" />
            </div>
            <div className="flex flex-wrap gap-1.5">
                {alertas.length > 0 ? alertas.map(a => <Badge key={a} variante="warning">{a}</Badge>) : <Badge variante="success">Sin alteraciones lipídicas</Badge>}
            </div>
        </>
    );
}
