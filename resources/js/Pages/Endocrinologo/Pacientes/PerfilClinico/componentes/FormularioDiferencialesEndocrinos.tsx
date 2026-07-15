import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { DiferencialEndocrinoData } from '../tipos';

interface Props { abierto: boolean; idPaciente: number; idConsulta: number | null; existente?: DiferencialEndocrinoData | null; onCerrar: () => void; }

export default function FormularioDiferencialesEndocrinos({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '' as number | string,
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        tsh: existente?.tsh?.toString() ?? '',
        t3_libre: existente?.t3_libre?.toString() ?? '',
        t4_libre: existente?.t4_libre?.toString() ?? '',
        prolactina: existente?.prolactina?.toString() ?? '',
        diecisiete_oh_progesterona: existente?.diecisiete_oh_progesterona?.toString() ?? '',
        cortisol: existente?.cortisol?.toString() ?? '',
        alteracion_tiroidea_descartada: existente?.alteracion_tiroidea_descartada ?? false,
        hiperprolactinemia_descartada: existente?.hiperprolactinemia_descartada ?? false,
        hiperplasia_suprarrenal_descartada: existente?.hiperplasia_suprarrenal_descartada ?? false,
        cushing_descartado: existente?.cushing_descartado ?? false,
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const url = esEdicion ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/diferenciales/${existente!.id_diferencial_endocrino}?_method=PUT` : `/endocrinologo/pacientes/${idPaciente}/laboratorios/diferenciales`; post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } }); };
    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_diferencial_endocrino ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">{esEdicion ? 'Editar diferenciales endocrinos' : 'Registrar diferenciales endocrinos'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Inp label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={v => setData('fecha_resultado', v)} required className="max-w-xs" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Valores</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Inp label="TSH (mUI/L)" value={data.tsh} onChange={v => setData('tsh', v)} step="0.01" />
                        <Inp label="T3 libre (pg/mL)" value={data.t3_libre} onChange={v => setData('t3_libre', v)} step="0.01" />
                        <Inp label="T4 libre (ng/dL)" value={data.t4_libre} onChange={v => setData('t4_libre', v)} step="0.01" />
                        <Inp label="Prolactina (ng/mL)" value={data.prolactina} onChange={v => setData('prolactina', v)} step="0.01" />
                        <Inp label="17-OH Progesterona (ng/mL)" value={data.diecisiete_oh_progesterona} onChange={v => setData('diecisiete_oh_progesterona', v)} step="0.01" />
                        <Inp label="Cortisol (μg/dL)" value={data.cortisol} onChange={v => setData('cortisol', v)} step="0.01" />
                    </div>
                    <div className="divider my-1" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Diagnósticos diferenciales descartados</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Chk label="Alteración tiroidea descartada" checked={data.alteracion_tiroidea_descartada} onChange={v => setData('alteracion_tiroidea_descartada', v)} />
                        <Chk label="Hiperprolactinemia descartada" checked={data.hiperprolactinemia_descartada} onChange={v => setData('hiperprolactinemia_descartada', v)} />
                        <Chk label="Hiperplasia suprarrenal descartada" checked={data.hiperplasia_suprarrenal_descartada} onChange={v => setData('hiperplasia_suprarrenal_descartada', v)} />
                        <Chk label="Síndrome de Cushing descartado" checked={data.cushing_descartado} onChange={v => setData('cushing_descartado', v)} />
                    </div>
                    <div className="divider my-1" />
                    <label className="form-control w-full"><div className="label"><span className="label-text text-xs">Interpretación</span></div><textarea className="textarea textarea-bordered text-sm" rows={3} value={data.interpretacion} onChange={e => setData('interpretacion', e.target.value)} /></label>
                    <div className="modal-action"><button type="button" className="btn btn-ghost btn-sm" onClick={() => { reset(); onCerrar(); }} disabled={processing}>Cancelar</button><button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={processing}><Save size={14} />{processing ? 'Guardando...' : esEdicion ? 'Guardar' : 'Registrar'}</button></div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop"><button onClick={() => { reset(); onCerrar(); }}>close</button></form>
        </dialog>
    );
}

function Inp({ label, value, onChange, type = 'number', step, hint, required, className }: { label: string; value: string; onChange: (v: string) => void; type?: string; step?: string; hint?: string; required?: boolean; className?: string }) {
    return (<label className={`form-control w-full ${className ?? ''}`}><div className="label"><span className="label-text text-xs">{label}</span></div><input type={type} step={step} required={required} className="input input-bordered input-sm w-full" value={value} onChange={e => onChange(e.target.value)} />{hint ? <div className="label"><span className="label-text-alt text-base-content/40">{hint}</span></div> : null}</label>);
}
function Chk({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (<label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={checked} onChange={e => onChange(e.target.checked)} /><span className="text-sm text-base-content/80">{label}</span></label>);
}
