import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { PerfilGonadotropoData } from '../tipos';

interface Props { abierto: boolean; idPaciente: number; idConsulta: number | null; existente?: PerfilGonadotropoData | null; onCerrar: () => void; }

export default function FormularioPerfilGonadotropo({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '' as number | string,
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        lh: existente?.lh?.toString() ?? '',
        fsh: existente?.fsh?.toString() ?? '',
        estradiol: existente?.estradiol?.toString() ?? '',
        progesterona: existente?.progesterona?.toString() ?? '',
        progesterona_dia_ciclo: existente?.progesterona_dia_ciclo?.toString() ?? '',
        progesterona_fase_ciclo: existente?.progesterona_fase_ciclo ?? '',
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const url = esEdicion ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-gonadotropo/${existente!.id_perfil_gonadotropo}?_method=PUT` : `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-gonadotropo`; post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } }); };
    const lhN = parseFloat(data.lh) || 0; const fshN = parseFloat(data.fsh) || 0;
    const relPreview = lhN > 0 && fshN > 0 ? (lhN / fshN).toFixed(2) : '-';
    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_perfil_gonadotropo ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">{esEdicion ? 'Editar perfil gonadotropo' : 'Registrar perfil gonadotropo'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Inp label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={v => setData('fecha_resultado', v)} required className="max-w-xs" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Gonadotropinas</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Inp label="LH (mUI/mL)" value={data.lh} onChange={v => setData('lh', v)} step="0.01" />
                        <Inp label="FSH (mUI/mL)" value={data.fsh} onChange={v => setData('fsh', v)} step="0.01" />
                        <div><div className="label"><span className="label-text text-xs">LH/FSH (calc.)</span></div><input className="input input-bordered input-sm w-full bg-base-200" value={relPreview} disabled /><div className="label"><span className="label-text-alt text-base-content/40">Backend calcula</span></div></div>
                    </div>
                    <div className="divider my-1" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Esteroides ováricos</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Inp label="Estradiol (pg/mL)" value={data.estradiol} onChange={v => setData('estradiol', v)} step="0.01" />
                        <Inp label="Progesterona (ng/mL)" value={data.progesterona} onChange={v => setData('progesterona', v)} step="0.01" hint="Fase lútea para ovulación" />
                        <Inp label="Día del ciclo" value={data.progesterona_dia_ciclo} onChange={v => setData('progesterona_dia_ciclo', v)} hint="Ej: 21-23" />
                        <Inp label="Fase del ciclo" type="text" value={data.progesterona_fase_ciclo} onChange={v => setData('progesterona_fase_ciclo', v)} hint="folicular, lútea, ovulatoria" />
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
