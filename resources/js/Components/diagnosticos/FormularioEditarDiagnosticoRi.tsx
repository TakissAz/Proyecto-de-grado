import axios, { AxiosError } from 'axios';
import { LoaderCircle, Save, X, Activity } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
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
            setMensaje('Diagnóstico de resistencia a la insulina actualizado.'); onSuccess();
        } catch (error) {
            const r = (error as AxiosError<{ errors?: Errores }>).response; setErrores(r?.data?.errors ?? {}); setMensaje('No se pudo actualizar el diagnóstico.');
        } finally { setProcesando(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <Activity size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Editar diagnóstico de resistencia a la insulina</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">La trazabilidad experta es informativa y no se edita aquí</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <form onSubmit={guardar} className="p-6 space-y-5">

                    {/* Contexto clínico */}
                    <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/[0.03] p-4 dark:bg-brand-orange/[0.04] space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Dato label="HOMA-IR" valor={diagnostico.homa_ir} />
                            <Dato label="QUICKI" valor={diagnostico.quicki} />
                            <Dato label="Glucosa ayunas" valor={diagnostico.glucosa_ayunas} />
                            <Dato label="Insulina ayunas" valor={diagnostico.insulina_ayunas} />
                            <Dato label="Triglicéridos" valor={diagnostico.trigliceridos} />
                            <Dato label="HDL" valor={diagnostico.hdl} />
                            <Dato label="Riesgo sugerido" valor={evaluacion.riesgo_sugerido} />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {diagnostico.confianza_experta != null && <Badge color="orange">Confianza: {Math.round(Number(diagnostico.confianza_experta) * 100)}%</Badge>}
                        </div>
                    </div>

                    {/* Checkbox confirmación */}
                    <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-surface-border px-4 py-3 transition-all hover:border-brand-orange/30 dark:border-surface-border-dark dark:hover:border-brand-orange/30">
                        <input type="checkbox" checked={datos.resistencia_confirmada} onChange={(e) => setDatos({ ...datos, resistencia_confirmada: e.target.checked })}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border text-brand-orange focus:ring-brand-orange/30 dark:border-surface-border-dark" />
                        <div>
                            <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">Resistencia a la insulina confirmada</p>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Marque si el diagnóstico es definitivo</p>
                        </div>
                    </label>

                    {/* Selects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CampoSelect label="Grado de resistencia" value={datos.grado_resistencia} onChange={(v) => setDatos({ ...datos, grado_resistencia: v })} opciones={['leve', 'moderada', 'severa', 'no_confirmada']} error={errores.grado_resistencia?.[0]} />
                        <CampoSelect label="Riesgo de diabetes" value={datos.riesgo_diabetes} onChange={(v) => setDatos({ ...datos, riesgo_diabetes: v })} opciones={['no_evaluado', 'bajo', 'moderado', 'alto']} error={errores.riesgo_diabetes?.[0]} />
                        <CampoSelect label="Riesgo cardiometabólico" value={datos.riesgo_cardiometabolico} onChange={(v) => setDatos({ ...datos, riesgo_cardiometabolico: v })} opciones={['no_evaluado', 'bajo', 'moderado', 'alto']} error={errores.riesgo_cardiometabolico?.[0]} />
                        <CampoSelect label="Estado" value={datos.estado} onChange={(v) => setDatos({ ...datos, estado: v as 'en_estudio' | 'registrado' })} opciones={['en_estudio', 'registrado']} />
                    </div>

                    <CampoTexto label="Conclusión médica" value={datos.conclusion_medica} onChange={(v) => setDatos({ ...datos, conclusion_medica: v })} error={errores.conclusion_medica?.[0]} />
                    <CampoTexto label="Recomendaciones médicas" value={datos.recomendaciones_medicas} onChange={(v) => setDatos({ ...datos, recomendaciones_medicas: v })} error={errores.recomendaciones_medicas?.[0]} />

                    {mensaje && <div className={clsx('rounded-xl px-4 py-2.5 text-[11.5px]', Object.keys(errores).length ? 'border border-category-fruits/20 bg-category-fruits/5 text-category-fruits' : 'border border-brand-green/20 bg-brand-green/5 text-brand-green-dark dark:text-brand-green')}>{mensaje}</div>}

                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={onCerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={procesando}>
                            {procesando ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} strokeWidth={1.8} />}
                            {procesando ? 'Guardando...' : 'Guardar diagnóstico'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Dato({ label, valor }: { label: string; valor: number | string | null | undefined }) {
    return (
        <div className="rounded-lg bg-black/[0.02] px-2.5 py-1.5 dark:bg-white/[0.03]">
            <span className="block text-[9px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">{label}</span>
            <strong className="text-[12px] text-ink dark:text-ink-dark">{valor ?? 'N/D'}</strong>
        </div>
    );
}

function CampoSelect({ label, value, onChange, opciones, error }: { label: string; value: string; onChange: (v: string) => void; opciones: string[]; error?: string }) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">{label}</p>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark">
                {opciones.map((o) => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}
            </select>
            {error && <p className="mt-1 text-[10.5px] text-category-fruits">{error}</p>}
        </div>
    );
}

function CampoTexto({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">{label}</p>
            <textarea maxLength={3000} value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[80px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
            {error && <p className="mt-1 text-[10.5px] text-category-fruits">{error}</p>}
        </div>
    );
}
