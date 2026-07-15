import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { DiagnosticoRiData, EvaluacionRiData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    evaluacion: EvaluacionRiData;
    existente?: DiagnosticoRiData | null;
    onCerrar: () => void;
}

export default function FormularioDiagnosticoRi({ abierto, idPaciente, idConsulta, evaluacion, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '' as number | string,
        fecha_diagnostico: existente?.fecha_diagnostico ?? hoy,
        homa_ir: existente?.homa_ir?.toString() ?? evaluacion.homa_ir?.toString() ?? '',
        glucosa_ayunas: existente?.glucosa_ayunas?.toString() ?? evaluacion.glucosa_ayunas?.toString() ?? '',
        insulina_ayunas: existente?.insulina_ayunas?.toString() ?? evaluacion.insulina_ayunas?.toString() ?? '',
        hemoglobina_glicosilada: existente?.hemoglobina_glicosilada?.toString() ?? evaluacion.hemoglobina_glicosilada?.toString() ?? '',
        resistencia_confirmada: existente?.resistencia_confirmada ?? (evaluacion.diagnostico_sugerido === 'compatible_resistencia_insulina'),
        grado_resistencia: existente?.grado_resistencia ?? 'no_aplica',
        riesgo_diabetes: existente?.riesgo_diabetes ?? 'no_evaluado',
        riesgo_cardiometabolico: existente?.riesgo_cardiometabolico ?? evaluacion.riesgo_sugerido ?? 'no_evaluado',
        conclusion_medica: existente?.conclusion_medica ?? '',
        recomendaciones_medicas: existente?.recomendaciones_medicas ?? '',
        id_glucosa_insulina: evaluacion.id_glucosa_insulina ?? '' as number | string,
        id_perfil_lipidico: evaluacion.id_perfil_lipidico ?? '' as number | string,
        id_evaluacion_fisica: evaluacion.id_evaluacion_fisica ?? '' as number | string,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/diagnostico-ri/${existente!.id_diagnostico_ri}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/diagnostico-ri`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_diagnostico_ri ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg">{esEdicion ? 'Editar diagnóstico RI' : 'Registrar diagnóstico de resistencia a la insulina'}</h3>
                <p className="text-xs text-base-content/50 mb-4">Valores pre-llenados desde laboratorios registrados. El especialista confirma.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Inp label="Fecha del diagnóstico" type="date" value={data.fecha_diagnostico} onChange={v => setData('fecha_diagnostico', v)} required className="max-w-xs" />

                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Valores metabólicos</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Inp label="HOMA-IR" value={data.homa_ir} onChange={v => setData('homa_ir', v)} step="0.01" hint="≥ 2.5 = RI" />
                        <Inp label="Glucosa ayunas" value={data.glucosa_ayunas} onChange={v => setData('glucosa_ayunas', v)} step="0.01" />
                        <Inp label="Insulina ayunas" value={data.insulina_ayunas} onChange={v => setData('insulina_ayunas', v)} step="0.01" />
                        <Inp label="HbA1c (%)" value={data.hemoglobina_glicosilada} onChange={v => setData('hemoglobina_glicosilada', v)} step="0.01" />
                    </div>

                    <div className="divider my-1" />

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="checkbox checkbox-sm checkbox-error" checked={data.resistencia_confirmada} onChange={e => setData('resistencia_confirmada', e.target.checked)} />
                        <span className="text-sm font-semibold text-base-content">Resistencia a la insulina confirmada</span>
                    </label>

                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Clasificación</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Grado de resistencia</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.grado_resistencia} onChange={e => setData('grado_resistencia', e.target.value)}>
                                <option value="no_aplica">No aplica</option>
                                <option value="leve">Leve</option>
                                <option value="moderada">Moderada</option>
                                <option value="severa">Severa</option>
                            </select>
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Riesgo diabetes</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.riesgo_diabetes} onChange={e => setData('riesgo_diabetes', e.target.value)}>
                                <option value="no_evaluado">No evaluado</option>
                                <option value="bajo">Bajo</option>
                                <option value="moderado">Moderado</option>
                                <option value="alto">Alto</option>
                            </select>
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Riesgo cardiometabólico</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.riesgo_cardiometabolico} onChange={e => setData('riesgo_cardiometabolico', e.target.value)}>
                                <option value="no_evaluado">No evaluado</option>
                                <option value="bajo">Bajo</option>
                                <option value="moderado">Moderado</option>
                                <option value="alto">Alto</option>
                            </select>
                        </label>
                    </div>

                    <div className="divider my-1" />

                    <label className="form-control w-full"><div className="label"><span className="label-text text-xs">Conclusión médica</span></div><textarea className="textarea textarea-bordered text-sm" rows={3} value={data.conclusion_medica} onChange={e => setData('conclusion_medica', e.target.value)} /></label>
                    <label className="form-control w-full"><div className="label"><span className="label-text text-xs">Recomendaciones médicas</span></div><textarea className="textarea textarea-bordered text-sm" rows={3} value={data.recomendaciones_medicas} onChange={e => setData('recomendaciones_medicas', e.target.value)} /></label>

                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { reset(); onCerrar(); }} disabled={processing}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-sm gap-1.5" disabled={processing}>
                            <Save size={14} /> {processing ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Confirmar diagnóstico'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop"><button onClick={() => { reset(); onCerrar(); }}>close</button></form>
        </dialog>
    );
}

function Inp({ label, value, onChange, type = 'number', step, hint, required, className }: { label: string; value: string; onChange: (v: string) => void; type?: string; step?: string; hint?: string; required?: boolean; className?: string }) {
    return (<label className={`form-control w-full ${className ?? ''}`}><div className="label"><span className="label-text text-xs">{label}</span></div><input type={type} step={step} required={required} className="input input-bordered input-sm w-full" value={value} onChange={e => onChange(e.target.value)} />{hint ? <div className="label"><span className="label-text-alt text-base-content/40">{hint}</span></div> : null}</label>);
}
