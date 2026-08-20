import axios, { AxiosError } from 'axios';
import { LoaderCircle, Save, X } from 'lucide-react';
import { useState } from 'react';
import type { DiagnosticoRiData, EvaluacionRiData } from '@/Pages/Endocrinologo/Pacientes/PerfilClinico/tipos';

interface Props { abierto: boolean; diagnostico: DiagnosticoRiData; evaluacion: EvaluacionRiData; onCerrar: () => void; onSuccess: () => void; }
type Errores = Record<string, string[]>;

export default function FormularioEditarDiagnosticoRi({ abierto, diagnostico, evaluacion, onCerrar, onSuccess }: Props) {
    const [datos, setDatos] = useState(() => ({
        resistencia_confirmada: diagnostico.resistencia_confirmada,
        grado_resistencia: diagnostico.grado_resistencia === 'no_aplica' ? 'no_confirmada' : diagnostico.grado_resistencia,
        riesgo_diabetes: diagnostico.riesgo_diabetes ?? 'no_evaluado',
        riesgo_cardiometabolico: diagnostico.riesgo_cardiometabolico ?? 'no_evaluado',
        conclusion_medica: diagnostico.conclusion_medica ?? '',
        recomendaciones_medicas: diagnostico.recomendaciones_medicas ?? '',
        estado: diagnostico.estado ?? 'en_estudio',
    }));
    const [procesando, setProcesando] = useState(false);
    const [errores, setErrores] = useState<Errores>({});
    const [mensaje, setMensaje] = useState<string | null>(null);
    if (!abierto) return null;

    const guardar = async (evento: React.FormEvent) => {
        evento.preventDefault(); setProcesando(true); setErrores({}); setMensaje(null);
        try {
            await axios.put(`/endocrinologo/diagnosticos/resistencia-insulina/${diagnostico.id_diagnostico_ri}`, datos, { headers: { Accept: 'application/json' } });
            setMensaje('Diagnóstico clínico de resistencia a la insulina actualizado correctamente.'); onSuccess();
        } catch (error) {
            const respuesta = (error as AxiosError<{ errors?: Errores }>).response; setErrores(respuesta?.data?.errors ?? {}); setMensaje('No se pudo actualizar el diagnóstico clínico de resistencia a la insulina.');
        } finally { setProcesando(false); }
    };

    return <dialog className="modal modal-open"><div className="modal-box max-w-3xl">
        <button type="button" onClick={onCerrar} className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3"><X size={16} /></button>
        <h3 className="text-lg font-bold">Editar diagnóstico clínico de resistencia a la insulina</h3>
        <p className="mb-4 text-xs text-base-content/60">La trazabilidad experta es solo informativa y no puede editarse aquí.</p>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Dato label="HOMA-IR" valor={diagnostico.homa_ir} /><Dato label="QUICKI" valor={diagnostico.quicki} /><Dato label="Glucosa ayunas" valor={diagnostico.glucosa_ayunas} /><Dato label="Insulina ayunas" valor={diagnostico.insulina_ayunas} /><Dato label="Triglicéridos" valor={diagnostico.trigliceridos} /><Dato label="HDL" valor={diagnostico.hdl} /><Dato label="Riesgo sugerido" valor={evaluacion.riesgo_sugerido} /></div>
            {diagnostico.confianza_experta != null && <span className="badge badge-primary badge-outline">Confianza: {Math.round(Number(diagnostico.confianza_experta) * 100)}%</span>}
            {(diagnostico.reglas_activadas?.length ?? 0) > 0 && <p><strong>Reglas:</strong> {diagnostico.reglas_activadas?.join(', ')}</p>}
            {diagnostico.explicacion_experta && <p><strong>Explicación:</strong> {normalizarExplicacion(diagnostico.explicacion_experta).join(' ')}</p>}
        </div>
        <form onSubmit={guardar} className="mt-4 space-y-4">
            <label className="flex items-center gap-3 rounded-lg border border-base-300 p-3"><input type="checkbox" className="checkbox checkbox-primary" checked={datos.resistencia_confirmada} onChange={(e) => setDatos({ ...datos, resistencia_confirmada: e.target.checked })} /><span className="text-sm font-semibold">Resistencia a la insulina confirmada</span></label>
            <div className="grid gap-3 sm:grid-cols-2">
                <Select label="Grado de resistencia" value={datos.grado_resistencia} onChange={(v) => setDatos({ ...datos, grado_resistencia: v })} opciones={['leve', 'moderada', 'severa', 'no_confirmada']} error={errores.grado_resistencia?.[0]} />
                <Select label="Riesgo de diabetes" value={datos.riesgo_diabetes} onChange={(v) => setDatos({ ...datos, riesgo_diabetes: v })} opciones={['no_evaluado', 'bajo', 'moderado', 'alto']} error={errores.riesgo_diabetes?.[0]} />
                <Select label="Riesgo cardiometabólico" value={datos.riesgo_cardiometabolico} onChange={(v) => setDatos({ ...datos, riesgo_cardiometabolico: v })} opciones={['no_evaluado', 'bajo', 'moderado', 'alto']} error={errores.riesgo_cardiometabolico?.[0]} />
                <Select label="Estado" value={datos.estado} onChange={(v) => setDatos({ ...datos, estado: v as 'en_estudio' | 'registrado' })} opciones={['en_estudio', 'registrado']} />
            </div>
            <TextArea label="Conclusión médica" value={datos.conclusion_medica} onChange={(v) => setDatos({ ...datos, conclusion_medica: v })} error={errores.conclusion_medica?.[0]} />
            <TextArea label="Recomendaciones médicas" value={datos.recomendaciones_medicas} onChange={(v) => setDatos({ ...datos, recomendaciones_medicas: v })} error={errores.recomendaciones_medicas?.[0]} />
            {mensaje && <div className={`alert py-2 text-xs ${Object.keys(errores).length ? 'alert-error' : 'alert-success'}`}>{mensaje}</div>}
            <div className="modal-action"><button type="button" className="btn btn-ghost" onClick={onCerrar}>Cancelar</button><button type="submit" className="btn btn-primary gap-2" disabled={procesando}>{procesando ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}{procesando ? 'Guardando...' : 'Guardar diagnóstico clínico'}</button></div>
        </form>
    </div></dialog>;
}

function normalizarExplicacion(valor: string | string[]): string[] { if (Array.isArray(valor)) return valor; try { const parsed: unknown = JSON.parse(valor); return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [valor]; } catch { return [valor]; } }
function Dato({ label, valor }: { label: string; valor: number | string | null | undefined }) { return <div className="rounded-lg bg-base-100 p-2"><span className="block text-[10px] uppercase text-base-content/50">{label}</span><strong>{valor ?? 'N/D'}</strong></div>; }
function Select({ label, value, onChange, opciones, error }: { label: string; value: string; onChange: (v: string) => void; opciones: string[]; error?: string }) { return <label className="form-control"><span className="label-text mb-1 text-xs font-semibold">{label}</span><select className="select select-bordered" value={value} onChange={(e) => onChange(e.target.value)}>{opciones.map((o) => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}</select>{error && <span className="mt-1 text-xs text-error">{error}</span>}</label>; }
function TextArea({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) { return <label className="form-control"><span className="label-text mb-1 text-xs font-semibold">{label}</span><textarea className="textarea textarea-bordered min-h-24" maxLength={3000} value={value} onChange={(e) => onChange(e.target.value)} />{error && <span className="mt-1 text-xs text-error">{error}</span>}</label>; }
