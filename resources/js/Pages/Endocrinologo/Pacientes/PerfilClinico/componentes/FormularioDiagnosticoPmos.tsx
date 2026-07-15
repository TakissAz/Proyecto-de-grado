import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { DiagnosticoPmosData, EvaluacionPmosData } from '../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    evaluacion: EvaluacionPmosData;
    existente?: DiagnosticoPmosData | null;
    onCerrar: () => void;
}

export default function FormularioDiagnosticoPmos({ abierto, idPaciente, idConsulta, evaluacion, existente, onCerrar }: Props) {
    const esEdicion = Boolean(existente);
    const hoy = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '' as number | string,
        fecha_diagnostico: existente?.fecha_diagnostico ?? hoy,
        cumple_alteracion_ovulatoria: existente?.cumple_alteracion_ovulatoria ?? evaluacion.cumple_alteracion_ovulatoria,
        cumple_hiperandrogenismo_clinico: existente?.cumple_hiperandrogenismo_clinico ?? evaluacion.cumple_hiperandrogenismo_clinico,
        cumple_hiperandrogenismo_bioquimico: existente?.cumple_hiperandrogenismo_bioquimico ?? evaluacion.cumple_hiperandrogenismo_bioquimico,
        cumple_hiperandrogenismo: existente?.cumple_hiperandrogenismo ?? evaluacion.cumple_hiperandrogenismo,
        tipo_hiperandrogenismo: existente?.tipo_hiperandrogenismo ?? evaluacion.tipo_hiperandrogenismo,
        cumple_morfologia_ovarica: existente?.cumple_morfologia_ovarica ?? evaluacion.cumple_morfologia_ovarica,
        total_criterios_rotterdam: existente?.total_criterios_rotterdam ?? evaluacion.total_criterios_rotterdam,
        fenotipo_pmos: existente?.fenotipo_pmos ?? evaluacion.fenotipo_sugerido ?? '',
        diagnostico_confirmado: existente?.diagnostico_confirmado ?? false,
        diagnosticos_diferenciales_descartados: existente?.diagnosticos_diferenciales_descartados ?? evaluacion.diagnosticos_diferenciales_descartados,
        severidad_clinica: existente?.severidad_clinica ?? '',
        riesgo_metabolico: existente?.riesgo_metabolico ?? '',
        conclusion_medica: existente?.conclusion_medica ?? '',
        recomendaciones_medicas: existente?.recomendaciones_medicas ?? '',
        id_historia_menstrual: evaluacion.id_historia_menstrual ?? '' as number | string,
        id_historia_hiperandrogenica: evaluacion.id_historia_hiperandrogenica ?? '' as number | string,
        id_perfil_androgenico: evaluacion.id_perfil_androgenico ?? '' as number | string,
        id_perfil_gonadotropo: '' as number | string,
        id_diferencial_endocrino: evaluacion.id_diferencial_endocrino ?? '' as number | string,
        id_ecografia: evaluacion.id_ecografia ?? '' as number | string,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/diagnostico-pmos/${existente!.id_diagnostico_pmos}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/diagnostico-pmos`;
        post(url, { preserveScroll: true, onSuccess: () => { reset(); onCerrar(); } });
    };

    if (!abierto) return null;

    return (
        <dialog className="modal modal-open" key={existente?.id_diagnostico_pmos ?? 'new'}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg">{esEdicion ? 'Editar diagnóstico PMOS' : 'Registrar diagnóstico PMOS'}</h3>
                <p className="text-xs text-base-content/50 mb-4">Los criterios se pre-llenan con la evaluación del sistema. El especialista confirma o ajusta.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="form-control w-full max-w-xs">
                        <div className="label"><span className="label-text text-xs">Fecha del diagnóstico</span></div>
                        <input type="date" className="input input-bordered input-sm w-full" value={data.fecha_diagnostico} onChange={e => setData('fecha_diagnostico', e.target.value)} required />
                    </label>

                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Criterios Rotterdam</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Chk label="Cumple alteración ovulatoria" checked={data.cumple_alteracion_ovulatoria} onChange={v => setData('cumple_alteracion_ovulatoria', v)} />
                        <Chk label="Hiperandrogenismo clínico" checked={data.cumple_hiperandrogenismo_clinico} onChange={v => setData('cumple_hiperandrogenismo_clinico', v)} />
                        <Chk label="Hiperandrogenismo bioquímico" checked={data.cumple_hiperandrogenismo_bioquimico} onChange={v => setData('cumple_hiperandrogenismo_bioquimico', v)} />
                        <Chk label="Morfología ovárica compatible" checked={data.cumple_morfologia_ovarica} onChange={v => setData('cumple_morfologia_ovarica', v)} />
                        <Chk label="Diagnósticos diferenciales descartados" checked={data.diagnosticos_diferenciales_descartados} onChange={v => setData('diagnosticos_diferenciales_descartados', v)} />
                        <Chk label="Diagnóstico PMOS confirmado" checked={data.diagnostico_confirmado} onChange={v => setData('diagnostico_confirmado', v)} />
                    </div>

                    <div className="divider my-1" />
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50">Clasificación</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Fenotipo PMOS</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.fenotipo_pmos} onChange={e => setData('fenotipo_pmos', e.target.value)}>
                                <option value="">Sin clasificar</option>
                                <option value="A_clasico_completo">A - Clásico completo</option>
                                <option value="B_hiperandrogenico_anovulatorio">B - Hiperandrogénico anovulatorio</option>
                                <option value="C_ovulatorio">C - Ovulatorio</option>
                                <option value="D_no_hiperandrogenico">D - No hiperandrogénico</option>
                            </select>
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Severidad</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.severidad_clinica} onChange={e => setData('severidad_clinica', e.target.value)}>
                                <option value="">Sin clasificar</option>
                                <option value="leve">Leve</option>
                                <option value="moderada">Moderada</option>
                                <option value="severa">Severa</option>
                            </select>
                        </label>
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text text-xs">Riesgo metabólico</span></div>
                            <select className="select select-bordered select-sm w-full" value={data.riesgo_metabolico} onChange={e => setData('riesgo_metabolico', e.target.value)}>
                                <option value="">Sin clasificar</option>
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

function Chk({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (<label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={checked} onChange={e => onChange(e.target.checked)} /><span className="text-sm text-base-content/80">{label}</span></label>);
}
