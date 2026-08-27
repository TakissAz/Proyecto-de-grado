import { router } from '@inertiajs/react';
import { MessageSquareText, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Boton } from '@/Components/ui/boton';
import { Badge } from '@/Components/ui/badge';

export interface RetroalimentacionHistorial { id_retroalimentacion_paciente: number; tipo_retroalimentacion: string; prioridad: string; mensaje: string; visible_para_paciente: boolean; leido_por_paciente: boolean; fecha_lectura_paciente: string | null; created_at: string | null; profesional: string | null; estado: string }

const inputClass = 'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';
const labelClass = 'text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5 block';

export default function RetroalimentacionPacientePanel({ pacienteId, planId, historial }: { pacienteId: number; planId?: number | null; historial: RetroalimentacionHistorial[] }) {
    const [tipo, setTipo] = useState('recomendacion_general');
    const [prioridad, setPrioridad] = useState('normal');
    const [mensaje, setMensaje] = useState('');
    const [visible, setVisible] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState<string | null>(null);

    const enviar = async (e: FormEvent) => {
        e.preventDefault(); setEnviando(true); setError(null); setExito(null);
        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const r = await fetch(`/nutricionista/pacientes/${pacienteId}/retroalimentaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': token },
                body: JSON.stringify({ tipo_retroalimentacion: tipo, prioridad, mensaje, visible_para_paciente: visible, id_plan_alimentario: planId ?? null }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(r.status === 422 ? 'Revisa los datos de la retroalimentación.' : data.message ?? 'No se pudo enviar.');
            setMensaje(''); setExito(data.message);
            router.reload({ only: ['retroalimentacionesPaciente'] });
        } catch (x) { setError(x instanceof Error ? x.message : 'No se pudo enviar la retroalimentación.'); }
        finally { setEnviando(false); }
    };

    return (
        <div className="rounded-xl border border-surface-border p-5 dark:border-surface-border-dark">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                    <MessageSquareText size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark">Enviar retroalimentación al paciente</h3>
                    <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">Orientación profesional basada en el seguimiento registrado.</p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={enviar} className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Tipo</label>
                        <select className={inputClass} value={tipo} onChange={ev => setTipo(ev.target.value)}>
                            {['comida', 'sintomas', 'adherencia', 'recomendacion_general', 'ajuste_plan', 'recordatorio'].map(x => (
                                <option key={x} value={x}>{x.replaceAll('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Prioridad</label>
                        <select className={inputClass} value={prioridad} onChange={ev => setPrioridad(ev.target.value)}>
                            {['baja', 'normal', 'alta'].map(x => <option key={x}>{x}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Mensaje</label>
                    <textarea
                        required maxLength={1500}
                        className={`${inputClass} resize-none min-h-[100px]`}
                        placeholder="Escribe una orientación clara y profesional..."
                        value={mensaje} onChange={ev => setMensaje(ev.target.value)}
                    />
                    <p className="mt-1 text-right text-[10px] text-ink-muted/60 dark:text-ink-muted-dark/60">{mensaje.length}/1500</p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <input type="checkbox" className="h-4 w-4 rounded border-surface-border accent-brand-green dark:border-surface-border-dark" checked={visible} onChange={ev => setVisible(ev.target.checked)} />
                    <span className="text-[12px] text-ink dark:text-ink-dark">Visible para el paciente</span>
                </label>

                {error && (
                    <div className="rounded-xl border border-category-fruits/20 bg-category-fruits/5 px-4 py-2.5 text-[11.5px] text-category-fruits">{error}</div>
                )}
                {exito && (
                    <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 px-4 py-2.5 text-[11.5px] text-brand-green-dark dark:text-brand-green">{exito}</div>
                )}

                <Boton type="submit" variante="primary" tamano="sm" disabled={enviando || !mensaje.trim()}>
                    <Send size={14} /> {enviando ? 'Enviando...' : 'Enviar retroalimentación'}
                </Boton>
            </form>

            {/* Historial */}
            <div className="mt-6 border-t border-surface-border/50 dark:border-surface-border-dark/50 pt-4">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70 mb-3">Historial reciente</p>
                {historial.length === 0 ? (
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark italic">Todavía no se enviaron retroalimentaciones.</p>
                ) : (
                    <div className="space-y-2">
                        {historial.map(x => (
                            <article key={x.id_retroalimentacion_paciente} className="rounded-xl border border-surface-border/60 p-3 dark:border-surface-border-dark/60">
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge color="gray">{x.tipo_retroalimentacion.replaceAll('_', ' ')}</Badge>
                                    <Badge color={x.prioridad === 'alta' ? 'red' : x.prioridad === 'baja' ? 'gray' : 'orange'}>{x.prioridad}</Badge>
                                    <Badge color={x.leido_por_paciente ? 'green' : 'gray'}>{x.leido_por_paciente ? 'Leído' : 'No leído'}</Badge>
                                </div>
                                <p className="mt-2 text-[11.5px] text-ink dark:text-ink-dark leading-relaxed">{x.mensaje}</p>
                                <p className="mt-2 text-[10px] text-ink-muted/60 dark:text-ink-muted-dark/60">
                                    {x.created_at ? new Date(x.created_at).toLocaleString('es-BO') : 'Sin fecha'} · {x.visible_para_paciente ? 'Visible' : 'Oculto'}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
