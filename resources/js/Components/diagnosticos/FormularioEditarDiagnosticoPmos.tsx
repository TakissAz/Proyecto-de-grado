import axios, { AxiosError } from 'axios';
import { LoaderCircle, Save, X } from 'lucide-react';
import { useState } from 'react';
import type { DiagnosticoPmosData, EvaluacionPmosData } from '@/Pages/Endocrinologo/Pacientes/PerfilClinico/tipos';

interface Props {
    abierto: boolean;
    diagnostico: DiagnosticoPmosData;
    evaluacion: EvaluacionPmosData;
    onCerrar: () => void;
    onSuccess: () => void;
}

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
        evento.preventDefault();
        setProcesando(true);
        setErrores({});
        setMensaje(null);

        try {
            await axios.put(`/endocrinologo/diagnosticos/pmos/${diagnostico.id_diagnostico_pmos}`, {
                ...datos,
                fenotipo_pmos: datos.fenotipo_pmos || null,
                severidad_clinica: datos.severidad_clinica || null,
                riesgo_metabolico: datos.riesgo_metabolico || null,
            }, { headers: { Accept: 'application/json' } });
            setMensaje('Diagnóstico clínico PMOS actualizado correctamente.');
            onSuccess();
        } catch (error) {
            const respuesta = (error as AxiosError<{ errors?: Errores }>).response;
            setErrores(respuesta?.data?.errors ?? {});
            setMensaje('No se pudo actualizar el diagnóstico clínico PMOS.');
        } finally {
            setProcesando(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <button type="button" onClick={onCerrar} className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3"><X size={16} /></button>
                <h3 className="text-lg font-bold">Editar diagnóstico clínico PMOS</h3>
                <p className="mb-4 text-xs text-base-content/60">La trazabilidad experta es solo informativa y no puede editarse aquí.</p>

                <ApoyoPmos diagnostico={diagnostico} evaluacion={evaluacion} />

                <form onSubmit={guardar} className="mt-4 space-y-4">
                    <label className="flex items-center gap-3 rounded-lg border border-base-300 p-3">
                        <input type="checkbox" className="checkbox checkbox-primary" checked={datos.diagnostico_confirmado} onChange={(e) => setDatos({ ...datos, diagnostico_confirmado: e.target.checked })} />
                        <span className="text-sm font-semibold">Diagnóstico PMOS confirmado</span>
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Select label="Fenotipo" value={datos.fenotipo_pmos} onChange={(v) => setDatos({ ...datos, fenotipo_pmos: v })} opciones={['A', 'B', 'C', 'D', 'no_clasificado', 'no_aplica']} error={errores.fenotipo_pmos?.[0]} />
                        <Select label="Severidad clínica" value={datos.severidad_clinica} onChange={(v) => setDatos({ ...datos, severidad_clinica: v })} opciones={['no_clasificada', 'leve', 'moderada', 'severa']} nullable error={errores.severidad_clinica?.[0]} />
                        <Select label="Riesgo metabólico" value={datos.riesgo_metabolico} onChange={(v) => setDatos({ ...datos, riesgo_metabolico: v })} opciones={['no_evaluado', 'bajo', 'moderado', 'alto']} nullable error={errores.riesgo_metabolico?.[0]} />
                        <Select label="Tipo de hiperandrogenismo" value={datos.tipo_hiperandrogenismo} onChange={(v) => setDatos({ ...datos, tipo_hiperandrogenismo: v })} opciones={['clinico', 'bioquimico', 'mixto', 'ninguno']} error={errores.tipo_hiperandrogenismo?.[0]} />
                        <Select label="Estado" value={datos.estado} onChange={(v) => setDatos({ ...datos, estado: v as 'en_estudio' | 'registrado' })} opciones={['en_estudio', 'registrado']} />
                    </div>

                    <TextArea label="Conclusión médica" value={datos.conclusion_medica} onChange={(v) => setDatos({ ...datos, conclusion_medica: v })} error={errores.conclusion_medica?.[0]} />
                    <TextArea label="Recomendaciones médicas" value={datos.recomendaciones_medicas} onChange={(v) => setDatos({ ...datos, recomendaciones_medicas: v })} error={errores.recomendaciones_medicas?.[0]} />

                    {mensaje && <div className={`alert py-2 text-xs ${Object.keys(errores).length ? 'alert-error' : 'alert-success'}`}>{mensaje}</div>}
                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
                        <button type="submit" className="btn btn-primary gap-2" disabled={procesando}>
                            {procesando ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                            {procesando ? 'Guardando...' : 'Guardar diagnóstico clínico'}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}

function ApoyoPmos({ diagnostico, evaluacion }: { diagnostico: DiagnosticoPmosData; evaluacion: EvaluacionPmosData }) {
    return <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Criterio label="Alteración ovulatoria" cumple={diagnostico.cumple_alteracion_ovulatoria} />
            <Criterio label="Hiperandrogenismo clínico" cumple={diagnostico.cumple_hiperandrogenismo_clinico} />
            <Criterio label="Hiperandrogenismo bioquímico" cumple={diagnostico.cumple_hiperandrogenismo_bioquimico} />
            <Criterio label="Morfología ovárica" cumple={diagnostico.cumple_morfologia_ovarica} />
            <Criterio label="Diferenciales descartados" cumple={diagnostico.diagnosticos_diferenciales_descartados} />
        </div>
        <div className="flex flex-wrap gap-2"><span className="badge badge-outline">Rotterdam: {diagnostico.total_criterios_rotterdam}/3</span><span className="badge badge-outline">Fenotipo sugerido: {evaluacion.fenotipo_sugerido ?? 'N/D'}</span>{diagnostico.confianza_experta != null && <span className="badge badge-primary badge-outline">Confianza: {Math.round(Number(diagnostico.confianza_experta) * 100)}%</span>}</div>
        {(diagnostico.criterios_rotterdam_cumplidos?.length ?? 0) > 0 && <p><strong>Criterios:</strong> {diagnostico.criterios_rotterdam_cumplidos?.join(', ')}</p>}
        {(diagnostico.reglas_activadas?.length ?? 0) > 0 && <p><strong>Reglas:</strong> {diagnostico.reglas_activadas?.join(', ')}</p>}
        {diagnostico.explicacion_experta && <p><strong>Explicación:</strong> {normalizarExplicacion(diagnostico.explicacion_experta).join(' ')}</p>}
    </div>;
}

function normalizarFenotipo(valor?: string | null): string { const mapa: Record<string, string> = { A_clasico_completo: 'A', B_hiperandrogenico_anovulatorio: 'B', C_ovulatorio: 'C', D_no_hiperandrogenico: 'D' }; return valor ? (mapa[valor] ?? valor) : 'no_clasificado'; }
function normalizarTipo(valor?: string | null): string { return valor === 'clinico_y_bioquimico' ? 'mixto' : (valor ?? 'ninguno'); }
function Criterio({ label, cumple }: { label: string; cumple: boolean }) { return <div className="rounded-lg bg-base-100 p-2"><span className={`badge badge-sm mr-1 ${cumple ? 'badge-success' : 'badge-ghost'}`}>{cumple ? 'Sí' : 'No'}</span>{label}</div>; }
function normalizarExplicacion(valor: string | string[]): string[] { if (Array.isArray(valor)) return valor; try { const parsed: unknown = JSON.parse(valor); return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [valor]; } catch { return [valor]; } }
function Select({ label, value, onChange, opciones, nullable, error }: { label: string; value: string; onChange: (v: string) => void; opciones: string[]; nullable?: boolean; error?: string }) { return <label className="form-control"><span className="label-text mb-1 text-xs font-semibold">{label}</span><select className="select select-bordered" value={value} onChange={(e) => onChange(e.target.value)}>{nullable && <option value="">Sin clasificar</option>}{opciones.map((o) => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}</select>{error && <span className="mt-1 text-xs text-error">{error}</span>}</label>; }
function TextArea({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) { return <label className="form-control"><span className="label-text mb-1 text-xs font-semibold">{label}</span><textarea className="textarea textarea-bordered min-h-24" maxLength={3000} value={value} onChange={(e) => onChange(e.target.value)} />{error && <span className="mt-1 text-xs text-error">{error}</span>}</label>; }
