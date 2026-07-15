import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { PerfilAndrogenicoData } from '../tipos';

interface Props { abierto: boolean; idPaciente: number; idConsulta: number | null; existente?: PerfilAndrogenicoData | null; onCerrar: () => void; }

export default function FormularioPerfilAndrogenico({ abierto, idPaciente, idConsulta, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, errors, reset } = useForm({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '' as number | string,
        fecha_resultado: existente?.fecha_resultado ?? hoy,
        testosterona_total: existente?.testosterona_total?.toString() ?? '',
        testosterona_libre: existente?.testosterona_libre?.toString() ?? '',
        shbg: existente?.shbg?.toString() ?? '',
        indice_androgenico_libre: existente?.indice_androgenico_libre?.toString() ?? '',
        dhea_s: existente?.dhea_s?.toString() ?? '',
        androstenediona: existente?.androstenediona?.toString() ?? '',
        hiperandrogenismo_bioquimico: existente?.hiperandrogenismo_bioquimico ?? false,
        interpretacion: existente?.interpretacion ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const url = esEdicion ? `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-androgenico/${existente!.id_perfil_androgenico}?_method=PUT` : `/endocrinologo/pacientes/${idPaciente}/laboratorios/perfil-androgenico`; post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } }); };
    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_perfil_androgenico ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">{esEdicion ? 'Editar perfil androgénico' : 'Registrar perfil androgénico'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Inp label="Fecha del resultado" type="date" value={data.fecha_resultado} onChange={v => setData('fecha_resultado', v)} required className="max-w-xs" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Valores de laboratorio</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Inp label="Testosterona total (ng/dL)" value={data.testosterona_total} onChange={v => setData('testosterona_total', v)} step="0.01" />
                        <Inp label="Testosterona libre (pg/mL)" value={data.testosterona_libre} onChange={v => setData('testosterona_libre', v)} step="0.01" />
                        <Inp label="SHBG (nmol/L)" value={data.shbg} onChange={v => setData('shbg', v)} step="0.01" />
                        <Inp label="Índice androgénico libre" value={data.indice_androgenico_libre} onChange={v => setData('indice_androgenico_libre', v)} step="0.01" hint="FAI = (T total / SHBG) × 100" />
                        <Inp label="DHEA-S (μg/dL)" value={data.dhea_s} onChange={v => setData('dhea_s', v)} step="0.01" />
                        <Inp label="Androstenediona (ng/mL)" value={data.androstenediona} onChange={v => setData('androstenediona', v)} step="0.01" />
                    </div>
                    <div className="divider my-1" />
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={data.hiperandrogenismo_bioquimico} onChange={e => setData('hiperandrogenismo_bioquimico', e.target.checked)} /><span className="text-sm">Hiperandrogenismo bioquímico confirmado</span></label>
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
