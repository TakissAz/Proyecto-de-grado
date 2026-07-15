import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { GlucosaInsulinaData } from '../tipos';

interface Props { abierto: boolean; idPaciente: number; idConsulta: number | null; existente?: GlucosaInsulinaData | null; onCerrar: () => void; }

export default function FormularioGlucosaInsulina({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '' as number | string,
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        glucosa_ayunas: existente?.glucosa_ayunas?.toString() ?? '',
        insulina_ayunas: existente?.insulina_ayunas?.toString() ?? '',
        hemoglobina_glicosilada: existente?.hemoglobina_glicosilada?.toString() ?? '',
        glucosa_2h_ogtt: existente?.glucosa_2h_ogtt?.toString() ?? '',
        insulina_2h_ogtt: existente?.insulina_2h_ogtt?.toString() ?? '',
        hiperinsulinemia: existente?.hiperinsulinemia ?? false,
        resistencia_insulina_sugerida: existente?.resistencia_insulina_sugerida ?? false,
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const url = esEdicion ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/glucosa-insulina/${existente!.id_glucosa_insulina}?_method=PUT` : `/endocrinologo/pacientes/${idPaciente}/laboratorios/glucosa-insulina`; post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } }); };
    const gN = parseFloat(data.glucosa_ayunas) || 0; const iN = parseFloat(data.insulina_ayunas) || 0;
    const homaPreview = gN > 0 && iN > 0 ? ((gN * iN) / 405).toFixed(2) : '-';
    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_glucosa_insulina ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">{esEdicion ? 'Editar glucosa e insulina' : 'Registrar glucosa e insulina'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Inp label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={v => setData('fecha_resultado', v)} required className="max-w-xs" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Glucosa e insulina en ayunas</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Inp label="Glucosa ayunas (mg/dL)" value={data.glucosa_ayunas} onChange={v => setData('glucosa_ayunas', v)} step="0.01" />
                        <Inp label="Insulina ayunas (µU/mL)" value={data.insulina_ayunas} onChange={v => setData('insulina_ayunas', v)} step="0.01" />
                        <div><div className="label"><span className="label-text text-xs">HOMA-IR (calc.)</span></div><input className="input input-bordered input-sm w-full bg-base-200" value={homaPreview} disabled /><div className="label"><span className="label-text-alt text-base-content/40">(glucosa × insulina) / 405</span></div></div>
                    </div>
                    <Inp label="HbA1c (%)" value={data.hemoglobina_glicosilada} onChange={v => setData('hemoglobina_glicosilada', v)} step="0.01" className="max-w-xs" />
                    <div className="divider my-1" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">OGTT 2h</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Inp label="Glucosa 2h OGTT (mg/dL)" value={data.glucosa_2h_ogtt} onChange={v => setData('glucosa_2h_ogtt', v)} step="0.01" />
                        <Inp label="Insulina 2h OGTT (µU/mL)" value={data.insulina_2h_ogtt} onChange={v => setData('insulina_2h_ogtt', v)} step="0.01" />
                    </div>
                    <div className="divider my-1" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Chk label="Hiperinsulinemia" checked={data.hiperinsulinemia} onChange={v => setData('hiperinsulinemia', v)} />
                        <Chk label="Resistencia a la insulina sugerida" checked={data.resistencia_insulina_sugerida} onChange={v => setData('resistencia_insulina_sugerida', v)} />
                    </div>
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
