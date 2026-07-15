import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { PerfilLipidicoData } from '../tipos';

interface Props { abierto: boolean; idPaciente: number; idConsulta: number | null; existente?: PerfilLipidicoData | null; onCerrar: () => void; }

export default function FormularioPerfilLipidico({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '' as number | string,
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        colesterol_total: existente?.colesterol_total?.toString() ?? '',
        hdl: existente?.hdl?.toString() ?? '',
        ldl: existente?.ldl?.toString() ?? '',
        vldl: existente?.vldl?.toString() ?? '',
        trigliceridos: existente?.trigliceridos?.toString() ?? '',
        dislipidemia_sugerida: existente?.dislipidemia_sugerida ?? false,
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const url = esEdicion ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-lipidico/${existente!.id_perfil_lipidico}?_method=PUT` : `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-lipidico`; post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } }); };
    const colN = parseFloat(data.colesterol_total) || 0; const hdlN = parseFloat(data.hdl) || 0;
    const noHdlPreview = colN > 0 && hdlN > 0 ? (colN - hdlN).toFixed(2) : '-';
    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_perfil_lipidico ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">{esEdicion ? 'Editar perfil lipídico' : 'Registrar perfil lipídico'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Inp label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={v => setData('fecha_resultado', v)} required className="max-w-xs" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Valores lipídicos</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Inp label="Colesterol total (mg/dL)" value={data.colesterol_total} onChange={v => setData('colesterol_total', v)} step="0.01" hint="Riesgo ≥ 200" />
                        <Inp label="HDL (mg/dL)" value={data.hdl} onChange={v => setData('hdl', v)} step="0.01" hint="Riesgo < 50" />
                        <Inp label="LDL (mg/dL)" value={data.ldl} onChange={v => setData('ldl', v)} step="0.01" hint="Riesgo ≥ 130" />
                        <Inp label="VLDL (mg/dL)" value={data.vldl} onChange={v => setData('vldl', v)} step="0.01" hint="Si vacío: TG/5" />
                        <Inp label="Triglicéridos (mg/dL)" value={data.trigliceridos} onChange={v => setData('trigliceridos', v)} step="0.01" hint="Riesgo ≥ 150" />
                        <div><div className="label"><span className="label-text text-xs">Col. no-HDL (calc.)</span></div><input className="input input-bordered input-sm w-full bg-base-200" value={noHdlPreview} disabled /><div className="label"><span className="label-text-alt text-base-content/40">Col. total - HDL</span></div></div>
                    </div>
                    <div className="divider my-1" />
                    <Chk label="Dislipidemia sugerida (se marca auto si aplica)" checked={data.dislipidemia_sugerida} onChange={v => setData('dislipidemia_sugerida', v)} />
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
