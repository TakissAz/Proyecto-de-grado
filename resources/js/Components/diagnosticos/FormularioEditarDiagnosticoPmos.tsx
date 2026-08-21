import axios, { AxiosError } from 'axios';
import { LoaderCircle, Save, X, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';
import type { DiagnosticoPmosData, EvaluacionPmosData } from '@/Pages/Endocrinologo/Pacientes/PerfilClinico/tipos';

interface Props { abierto: boolean; diagnostico: DiagnosticoPmosData; evaluacion: EvaluacionPmosData; onCerrar: () => void; onSuccess: () => void; }
type Errores = Record<string, string[]>;

export default function FormularioEditarDiagnosticoPmos({ abierto, diagnostico, evaluacion, onCerrar, onSuccess }: Props) {
    const [datos, setDatos] = useState(() => ({
        diagnostico_confirmado: diagnostico.diagnostico_confirmado,
        fenotipo_pmos: normalizarFenotipo(diagnostico.fenotipo_pmos),
        severidad_clinica: diagnostico.severidad_clinica ?? '',
        riesgo_metabolico: diagnostico.riesgo_metabolico ?? '',
        tipo_hiperandrogenismo: normalizarTipo(diagnostico.tipo_hiperandrogenismo),
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
            await axios.put(`/endocrinologo/diagnosticos/pmos/${diagnostico.id_diagnostico_pmos}`, {
                ...datos, fenotipo_pmos: datos.fenotipo_pmos || null, severidad_clinica: datos.severidad_clinica || null, riesgo_metabolico: datos.riesgo_metabolico || null,
            }, { headers: { Accept: 'application/json' } });
            setMensaje('Diagnóstico clínico PMOS actualizado correctamente.'); onSuccess();
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <Stethoscope size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Editar diagnóstico clínico PMOS</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">La trazabilidad experta es informativa y no se edita aquí</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <form onSubmit={guardar} className="p-6 space-y-5">

                    {/* Contexto clínico */}
                    <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.03] p-4 dark:bg-brand-green/[0.04] space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <Criterio label="Alteración ovulatoria" cumple={diagnostico.cumple_alteracion_ovulatoria} />
                            <Criterio label="Hiperandrogenismo clínico" cumple={diagnostico.cumple_hiperandrogenismo_clinico} />
                            <Criterio label="Hiperandrogenismo bioquímico" cumple={diagnostico.cumple_hiperandrogenismo_bioquimico} />
                            <Criterio label="Morfología ovárica" cumple={diagnostico.cumple_morfologia_ovarica} />
                            <Criterio label="Diferenciales descartados" cumple={diagnostico.diagnosticos_diferenciales_descartados} />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            <Badge color="green">Rotterdam: {diagnostico.total_criterios_rotterdam}/3</Badge>
                            <Badge color="gray">Fenotipo sugerido: {evaluacion.fenotipo_sugerido ?? 'N/D'}</Badge>
                            {diagnostico.confianza_experta != null && <Badge color="green">Confianza: {Math.round(Number(diagnostico.confianza_experta) * 100)}%</Badge>}
                        </div>
                    </div>

                    {/* Checkbox confirmación */}
                    <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-surface-border px-4 py-3 transition-all hover:border-brand-green/30 dark:border-surface-border-dark dark:hover:border-brand-green/30">
                        <input type="checkbox" checked={datos.diagnostico_confirmado} onChange={(e) => setDatos({ ...datos, diagnostico_confirmado: e.target.checked })}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border text-brand-green focus:ring-brand-green/30 dark:border-surface-border-dark" />
                        <div>
                            <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">Diagnóstico PMOS confirmado</p>
                            <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Marque si el diagnóstico es definitivo</p>
                        </div>
                    </label>

                    {/* Selects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CampoSelect label="Fenotipo" value={datos.fenotipo_pmos} onChange={(v) => setDatos({ ...datos, fenotipo_pmos: v })} opciones={['A', 'B', 'C', 'D', 'no_clasificado', 'no_aplica']} error={errores.fenotipo_pmos?.[0]} />
                        <CampoSelect label="Severidad clínica" value={datos.severidad_clinica} onChange={(v) => setDatos({ ...datos, severidad_clinica: v })} opciones={['no_clasificada', 'leve', 'moderada', 'severa']} nullable error={errores.severidad_clinica?.[0]} />
                        <CampoSelect label="Riesgo metabólico" value={datos.riesgo_metabolico} onChange={(v) => setDatos({ ...datos, riesgo_metabolico: v })} opciones={['no_evaluado', 'bajo', 'moderado', 'alto']} nullable error={errores.riesgo_metabolico?.[0]} />
                        <CampoSelect label="Tipo de hiperandrogenismo" value={datos.tipo_hiperandrogenismo} onChange={(v) => setDatos({ ...datos, tipo_hiperandrogenismo: v })} opciones={['clinico', 'bioquimico', 'mixto', 'ninguno']} error={errores.tipo_hiperandrogenismo?.[0]} />
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

function normalizarFenotipo(valor?: string | null): string { const mapa: Record<string, string> = { A_clasico_completo: 'A', B_hiperandrogenico_anovulatorio: 'B', C_ovulatorio: 'C', D_no_hiperandrogenico: 'D' }; return valor ? (mapa[valor] ?? valor) : 'no_clasificado'; }
function normalizarTipo(valor?: string | null): string { return valor === 'clinico_y_bioquimico' ? 'mixto' : (valor ?? 'ninguno'); }

function Criterio({ label, cumple }: { label: string; cumple: boolean }) {
    return (
        <div className="flex items-center gap-2 rounded-lg bg-black/[0.02] px-2.5 py-1.5 dark:bg-white/[0.03]">
            <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', cumple ? 'bg-brand-green/15 text-brand-green-dark dark:text-brand-green' : 'bg-black/[0.04] text-ink-muted dark:bg-white/[0.04] dark:text-ink-muted-dark')}>{cumple ? 'Sí' : 'No'}</span>
            <span className="text-[10.5px] text-ink dark:text-ink-dark">{label}</span>
        </div>
    );
}

function CampoSelect({ label, value, onChange, opciones, nullable, error }: { label: string; value: string; onChange: (v: string) => void; opciones: string[]; nullable?: boolean; error?: string }) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">{label}</p>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark">
                {nullable && <option value="">Sin clasificar</option>}
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
