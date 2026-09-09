import axios, { AxiosError } from 'axios';
import { ClipboardList, HeartPulse, LoaderCircle, MessageSquareText, UtensilsCrossed, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';

export interface SeguimientoComida {
    estado_cumplimiento: string; porcentaje_consumido: number | null; nivel_agrado: string | null; desea_repetir: boolean | null; nivel_saciedad: string | null; nivel_hambre_posterior: string | null; ansiedad_posterior: boolean | null; presento_molestia: boolean | null; tipo_molestia: string | null; intensidad_molestia: string | null; dificultad_preparacion: string | null; consiguio_ingredientes: boolean | null; motivo_no_cumplimiento: string | null; comida_reemplazo: string | null; motivo_reemplazo: string | null; comentario_paciente: string | null; sugerencia_paciente: string | null; observacion_para_siguiente_plan: string | null; updated_at: string | null
}

interface Props { abierto: boolean; cerrar: () => void; comidaId: number; nombre: string; seguimiento: SeguimientoComida; onSuccess: (seguimiento: SeguimientoComida) => void }
const errorDe = (e: unknown) => { const d = (e as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response?.data; return Object.values(d?.errors ?? {})[0]?.[0] ?? d?.message ?? 'No se pudo guardar el seguimiento.'; };

const selectClass = 'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none transition focus:border-brand-green/50 focus:bg-white focus:ring-2 focus:ring-brand-green/10 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark dark:focus:bg-[#242832] appearance-none';
const textareaClass = 'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none transition focus:border-brand-green/50 focus:bg-white focus:ring-2 focus:ring-brand-green/10 resize-none min-h-[80px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark dark:focus:bg-[#242832]';
const labelClass = 'text-[11px] font-semibold text-ink dark:text-ink-dark mb-1.5 block';
const prepararFormulario = (seguimiento: SeguimientoComida): SeguimientoComida => ({
    ...seguimiento,
    // Un registro pendiente no es una elección de la paciente. Al abrir el modal,
    // la opción visible y el valor que se enviará deben coincidir.
    estado_cumplimiento: seguimiento.estado_cumplimiento === 'pendiente' ? 'completada' : seguimiento.estado_cumplimiento,
});

export default function ModalSeguimientoComida({ abierto, cerrar, comidaId, nombre, seguimiento, onSuccess }: Props) {
    const [form, setForm] = useState<SeguimientoComida>(() => prepararFormulario(seguimiento));
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { setForm(prepararFormulario(seguimiento)); setError(''); }, [seguimiento, abierto]);
    if (!abierto) return null;

    const set = <K extends keyof SeguimientoComida>(k: K, v: SeguimientoComida[K]) => setForm(f => ({ ...f, [k]: v }));
    const guardar = async (e: FormEvent) => {
        e.preventDefault(); setGuardando(true); setError('');
        try {
            const respuesta = await axios.post<{ data: SeguimientoComida }>(`/paciente/comidas-plan/${comidaId}/seguimiento`, { ...form, ansiedad_posterior: !!form.ansiedad_posterior, presento_molestia: !!form.presento_molestia }, { headers: { Accept: 'application/json' } });
            onSuccess(respuesta.data.data);
            cerrar();
        } catch (x) { setError(errorDe(x)); } finally { setGuardando(false); }
    };
    const noCumple = ['no_realizada', 'reemplazada'].includes(form.estado_cumplimiento);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark animate-scale-in">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-surface-border/60 bg-gradient-to-r from-brand-green/[0.09] via-brand-green/[0.035] to-transparent px-6 py-5 dark:border-surface-border-dark dark:from-brand-green/[0.12]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <ClipboardList size={17} strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-green-dark dark:text-brand-green">Seguimiento diario</p>
                            <h3 className="mt-0.5 text-[15px] font-bold text-ink dark:text-ink-dark">Registrar comida</h3>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">{nombre} · toma menos de un minuto</p>
                        </div>
                    </div>
                    <button type="button" onClick={cerrar}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/[0.05] hover:text-ink dark:text-ink-muted-dark dark:hover:bg-white/[0.05] dark:hover:text-ink-dark">
                        <X size={18} />
                    </button>
                </div>

                {/* Formulario scrollable */}
                <form className="flex-1 space-y-5 overflow-y-auto bg-black/[0.012] px-6 py-5 dark:bg-white/[0.012]" onSubmit={guardar}>
                    {/* Estado principal — destacado */}
                    <div className="rounded-2xl border border-brand-green/25 bg-gradient-to-r from-brand-green/[0.10] to-brand-green/[0.025] p-4 dark:from-brand-green/[0.13]">
                        <div className="mb-3 flex items-center gap-2"><div className="rounded-lg bg-brand-green/15 p-1.5 text-brand-green-dark dark:text-brand-green"><ClipboardList size={14}/></div><label className="text-[11px] font-bold text-brand-green-dark dark:text-brand-green">¿Cómo te fue con esta comida?</label></div>
                        <select className={selectClass} value={form.estado_cumplimiento} onChange={e => set('estado_cumplimiento', e.target.value)}>
                            <option value="completada">Completada</option>
                            <option value="parcial">Parcial</option>
                            <option value="no_realizada">No realizada</option>
                            <option value="reemplazada">Reemplazada</option>
                        </select>
                    </div>

                    {/* Porcentaje consumido */}
                    {['parcial', 'reemplazada'].includes(form.estado_cumplimiento) && (
                        <div>
                            <label className={labelClass}>¿Cuánto consumiste?</label>
                            <div className="flex items-center gap-3">
                                <input type="range" min="0" max="100" value={form.porcentaje_consumido ?? 50} onChange={e => set('porcentaje_consumido', Number(e.target.value))}
                                    className="flex-1 h-2 rounded-full appearance-none bg-black/[0.08] dark:bg-white/[0.08] accent-brand-green" />
                                <span className="text-[14px] font-bold text-brand-green-dark dark:text-brand-green w-12 text-right">{form.porcentaje_consumido ?? 50}%</span>
                            </div>
                        </div>
                    )}

                    {/* Experiencia */}
                    <div className="rounded-2xl border border-surface-border/70 bg-surface-card p-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70"><HeartPulse size={13} className="text-category-fruits" /> Tu experiencia</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Campo label="¿Te gustó?">
                                <select className={selectClass} value={form.nivel_agrado ?? ''} onChange={e => set('nivel_agrado', e.target.value || null)}>
                                    <option value="">Seleccionar</option>
                                    <option value="me_gusto">Me gustó</option>
                                    <option value="neutral">Normal</option>
                                    <option value="no_me_gusto">No me gustó</option>
                                </select>
                            </Campo>
                            <Campo label="¿La repetirías?">
                                <select className={selectClass} value={form.desea_repetir === null ? '' : form.desea_repetir ? '1' : '0'} onChange={e => set('desea_repetir', e.target.value === '' ? null : e.target.value === '1')}>
                                    <option value="">Seleccionar</option>
                                    <option value="1">Sí</option>
                                    <option value="0">No</option>
                                </select>
                            </Campo>
                            <Campo label="Saciedad después de comer">
                                <select className={selectClass} value={form.nivel_saciedad ?? ''} onChange={e => set('nivel_saciedad', e.target.value || null)}>
                                    <option value="">Seleccionar</option>
                                    <option value="baja">Baja — quedé con hambre</option>
                                    <option value="media">Media — bien</option>
                                    <option value="alta">Alta — muy llena</option>
                                </select>
                            </Campo>
                            <Campo label="Hambre después">
                                <select className={selectClass} value={form.nivel_hambre_posterior ?? ''} onChange={e => set('nivel_hambre_posterior', e.target.value || null)}>
                                    <option value="">Seleccionar</option>
                                    <option value="baja">Baja</option>
                                    <option value="media">Media</option>
                                    <option value="alta">Alta</option>
                                </select>
                            </Campo>
                        </div>
                    </div>

                    {/* Bienestar */}
                    <div className="rounded-2xl border border-surface-border/70 bg-surface-card p-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70"><HeartPulse size={13} className="text-brand-green-dark dark:text-brand-green" /> Bienestar</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Campo label="¿Sentiste ansiedad después?">
                                <select className={selectClass} value={form.ansiedad_posterior === null ? '' : form.ansiedad_posterior ? '1' : '0'} onChange={e => set('ansiedad_posterior', e.target.value === '' ? null : e.target.value === '1')}>
                                    <option value="">Seleccionar</option>
                                    <option value="0">No</option>
                                    <option value="1">Sí</option>
                                </select>
                            </Campo>
                            <Campo label="¿Presentaste alguna molestia?">
                                <select className={selectClass} value={form.presento_molestia === null ? '' : form.presento_molestia ? '1' : '0'} onChange={e => set('presento_molestia', e.target.value === '' ? null : e.target.value === '1')}>
                                    <option value="">Seleccionar</option>
                                    <option value="0">No</option>
                                    <option value="1">Sí</option>
                                </select>
                            </Campo>
                        </div>
                    </div>

                    {/* Detalle molestia */}
                    {form.presento_molestia && (
                        <div className="rounded-xl border border-category-fruits/20 bg-category-fruits/[0.03] p-4 dark:bg-category-fruits/[0.05]">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-category-fruits/70 mb-3">Detalle de la molestia</p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Campo label="Tipo">
                                    <select className={selectClass} value={form.tipo_molestia ?? ''} onChange={e => set('tipo_molestia', e.target.value || null)}>
                                        <option value="">Seleccionar</option>
                                        <option value="hinchazon">Hinchazón</option>
                                        <option value="nausea">Náusea</option>
                                        <option value="dolor_estomacal">Dolor estomacal</option>
                                        <option value="acidez">Acidez</option>
                                        <option value="diarrea">Diarrea</option>
                                        <option value="estreñimiento">Estreñimiento</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </Campo>
                                <Campo label="Intensidad">
                                    <select className={selectClass} value={form.intensidad_molestia ?? ''} onChange={e => set('intensidad_molestia', e.target.value || null)}>
                                        <option value="">Seleccionar</option>
                                        <option value="leve">Leve</option>
                                        <option value="moderada">Moderada</option>
                                        <option value="severa">Severa</option>
                                    </select>
                                </Campo>
                            </div>
                        </div>
                    )}

                    {/* Preparación */}
                    <div className="rounded-2xl border border-surface-border/70 bg-surface-card p-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70"><UtensilsCrossed size={13} className="text-brand-orange" /> Preparación</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Campo label="Dificultad de preparación">
                                <select className={selectClass} value={form.dificultad_preparacion ?? ''} onChange={e => set('dificultad_preparacion', e.target.value || null)}>
                                    <option value="">Seleccionar</option>
                                    <option value="facil">Fácil</option>
                                    <option value="media">Media</option>
                                    <option value="dificil">Difícil</option>
                                </select>
                            </Campo>
                            <Campo label="¿Conseguiste los ingredientes?">
                                <select className={selectClass} value={form.consiguio_ingredientes === null ? '' : form.consiguio_ingredientes ? '1' : '0'} onChange={e => set('consiguio_ingredientes', e.target.value === '' ? null : e.target.value === '1')}>
                                    <option value="">Seleccionar</option>
                                    <option value="1">Sí, todos</option>
                                    <option value="0">No, algunos faltaron</option>
                                </select>
                            </Campo>
                        </div>
                    </div>

                    {/* No cumplimiento */}
                    {noCumple && (
                        <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/[0.03] p-4 dark:bg-brand-orange/[0.05]">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-orange/70 mb-3">¿Qué pasó?</p>
                            <Campo label="Motivo">
                                <select className={selectClass} value={form.motivo_no_cumplimiento ?? ''} onChange={e => set('motivo_no_cumplimiento', e.target.value || null)}>
                                    <option value="">Seleccionar</option>
                                    <option value="falta_tiempo">Falta de tiempo</option>
                                    <option value="no_tenia_ingredientes">No tenía ingredientes</option>
                                    <option value="no_me_gusto">No me gustó</option>
                                    <option value="me_cayo_mal">Me cayó mal</option>
                                    <option value="no_tenia_hambre">No tenía hambre</option>
                                    <option value="comi_fuera">Comí fuera</option>
                                    <option value="olvido">Lo olvidé</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </Campo>
                            {form.estado_cumplimiento === 'reemplazada' && (
                                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                                    <Campo label="¿Qué comiste en su lugar?">
                                        <textarea className={textareaClass} maxLength={500} value={form.comida_reemplazo ?? ''} onChange={e => set('comida_reemplazo', e.target.value)} />
                                    </Campo>
                                    <Campo label="¿Por qué la reemplazaste?">
                                        <textarea className={textareaClass} maxLength={500} value={form.motivo_reemplazo ?? ''} onChange={e => set('motivo_reemplazo', e.target.value)} />
                                    </Campo>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Comentarios */}
                    <div className="rounded-2xl border border-info/20 bg-info/[0.025] p-4 dark:bg-info/[0.045]">
                        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-info"><MessageSquareText size={13} /> Comunicación con tu nutricionista</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Campo label="Comentario para tu nutricionista">
                                <textarea className={textareaClass} maxLength={1000} placeholder="¿Cómo te sentiste? ¿Algo que quieras comentar?" value={form.comentario_paciente ?? ''} onChange={e => set('comentario_paciente', e.target.value)} />
                            </Campo>
                            <Campo label="Sugerencia para el siguiente plan">
                                <textarea className={textareaClass} maxLength={1000} placeholder="¿Algo que te gustaría cambiar?" value={form.sugerencia_paciente ?? ''} onChange={e => set('sugerencia_paciente', e.target.value)} />
                            </Campo>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl border border-category-fruits/20 bg-category-fruits/5 px-4 py-2.5 text-[11.5px] text-category-fruits">{error}</div>
                    )}
                </form>

                {/* Footer con acciones */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-surface-border/60 px-6 py-4 dark:border-surface-border-dark">
                    <p className="hidden text-[10px] text-ink-muted sm:block">Tu registro ayuda a personalizar el siguiente plan.</p>
                    <div className="flex items-center gap-3">
                    <Boton type="button" variante="ghost" tamano="sm" onClick={cerrar}>Cancelar</Boton>
                    <Boton type="submit" variante="primary" tamano="sm" disabled={guardando} onClick={guardar}>
                        {guardando && <LoaderCircle className="animate-spin" size={14} />}
                        Guardar seguimiento
                    </Boton>
                    </div>
                </div>
            </div>
            {/* Backdrop */}
            <div className="absolute inset-0 -z-10" onClick={cerrar} />
        </div>
    );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            {children}
        </div>
    );
}
