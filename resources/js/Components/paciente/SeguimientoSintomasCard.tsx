import { router } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, HeartPulse, LoaderCircle, Save } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Boton } from '@/Components/ui/boton';

interface Registro { fecha_registro: string; nivel_energia: string | null; hambre_durante_dia: string | null; ansiedad_por_comida: string | null; antojos_dulces: string | null; hambre_nocturna: boolean; hinchazon_abdominal: string | null; fatiga_post_comida: string | null; mareos_o_debilidad: boolean; acne: string | null; dolor_menstrual: string | null; irregularidad_menstrual: boolean | null; cambios_estado_animo: string | null; calidad_sueno: string | null; horas_sueno: number | string | null; actividad_fisica: string | null; minutos_actividad: number | null; consumo_agua_litros: number | string | null; observaciones: string | null }
interface Indicadores { hambre_nocturna_frecuente: boolean; ansiedad_comida_frecuente: boolean; antojos_dulces_frecuentes: boolean; hinchazon_frecuente: boolean; baja_energia_frecuente: boolean; sueno_deficiente_frecuente: boolean; actividad_fisica_baja: boolean; recomendaciones_para_nutricionista: string[] }
export interface SeguimientoSintomas { registro_hoy: Registro | null; ultimos_registros: Registro[]; indicadores: Indicadores }
type Form = Omit<Registro, 'fecha_registro'>;

const vacio: Form = { nivel_energia: null, hambre_durante_dia: null, ansiedad_por_comida: null, antojos_dulces: null, hambre_nocturna: false, hinchazon_abdominal: null, fatiga_post_comida: null, mareos_o_debilidad: false, acne: null, dolor_menstrual: null, irregularidad_menstrual: null, cambios_estado_animo: null, calidad_sueno: null, horas_sueno: null, actividad_fisica: null, minutos_actividad: null, consumo_agua_litros: null, observaciones: null };
const titulo = (v: string | null) => v?.replaceAll('_', ' ') ?? 'Sin registro';
const selectClass = 'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark';
const labelClass = 'text-[11px] font-semibold text-ink dark:text-ink-dark mb-1.5 block';

export default function SeguimientoSintomasCard({ seguimiento }: { seguimiento: SeguimientoSintomas | null }) {
    if (!seguimiento) return null;

    const [form, setForm] = useState<Form>(seguimiento.registro_hoy ? Object.fromEntries(Object.keys(vacio).map(k => [k, seguimiento.registro_hoy?.[k as keyof Registro] ?? vacio[k as keyof Form]])) as Form : vacio);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState(false);

    const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(p => ({ ...p, [k]: v }));
    const guardar = async () => {
        setGuardando(true); setError(null); setExito(false);
        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const r = await fetch('/paciente/seguimiento-sintomas', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': token }, body: JSON.stringify(form) });
            if (!r.ok) { const data = await r.json(); throw new Error(r.status === 422 ? 'Revisa los datos ingresados.' : data.message ?? 'No se pudo guardar.'); }
            setExito(true); router.reload({ only: ['seguimientoSintomas'] });
        } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.'); } finally { setGuardando(false); }
    };

    const alertas = [seguimiento.indicadores.hambre_nocturna_frecuente && 'Hambre nocturna frecuente.', seguimiento.indicadores.antojos_dulces_frecuentes && 'Antojos dulces frecuentes.', seguimiento.indicadores.sueno_deficiente_frecuente && 'Sueño deficiente.', seguimiento.indicadores.ansiedad_comida_frecuente && 'Ansiedad por comida.', seguimiento.indicadores.hinchazon_frecuente && 'Hinchazón frecuente.'].filter(Boolean) as string[];

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-category-fruits/15 text-category-fruits">
                    <HeartPulse size={18} strokeWidth={1.8} />
                </div>
                <div>
                    <h2 className="text-[14px] font-bold text-ink dark:text-ink-dark">Seguimiento de síntomas</h2>
                    <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Tus registros ayudan a ajustar tu próximo plan.</p>
                </div>
            </div>

            {/* Alertas */}
            {alertas.length > 0 && (
                <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 dark:bg-brand-orange/[0.06]">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle size={14} className="text-brand-orange shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1.5">
                            {alertas.map(a => <span key={a} className="inline-flex items-center rounded-lg bg-brand-orange/10 px-2.5 py-1 text-[10.5px] font-semibold text-brand-orange">{a}</span>)}
                        </div>
                    </div>
                </div>
            )}

            {/* Formulario */}
            <div className="rounded-xl border border-surface-border p-5 dark:border-surface-border-dark">
                <h3 className="text-[13px] font-bold text-ink dark:text-ink-dark mb-4">¿Cómo te sientes hoy?</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Campo label="Energía" value={form.nivel_energia} options={['baja', 'media', 'alta']} onChange={v => set('nivel_energia', v)} />
                    <Campo label="Hambre durante el día" value={form.hambre_durante_dia} options={['baja', 'media', 'alta']} onChange={v => set('hambre_durante_dia', v)} />
                    <Campo label="Ansiedad por comida" value={form.ansiedad_por_comida} options={['ninguna', 'leve', 'moderada', 'alta']} onChange={v => set('ansiedad_por_comida', v)} />
                    <Campo label="Antojos dulces" value={form.antojos_dulces} options={['ninguno', 'leve', 'moderado', 'alto']} onChange={v => set('antojos_dulces', v)} />
                    <Campo label="Hinchazón" value={form.hinchazon_abdominal} options={['ninguna', 'leve', 'moderada', 'severa']} onChange={v => set('hinchazon_abdominal', v)} />
                    <Campo label="Fatiga post-comida" value={form.fatiga_post_comida} options={['ninguna', 'leve', 'moderada', 'severa']} onChange={v => set('fatiga_post_comida', v)} />
                    <Campo label="Estado de ánimo" value={form.cambios_estado_animo} options={['estable', 'irritable', 'bajo', 'ansioso']} onChange={v => set('cambios_estado_animo', v)} />
                    <Campo label="Calidad de sueño" value={form.calidad_sueno} options={['mala', 'regular', 'buena']} onChange={v => set('calidad_sueno', v)} />
                    <Campo label="Actividad física" value={form.actividad_fisica} options={['ninguna', 'ligera', 'moderada', 'intensa']} onChange={v => set('actividad_fisica', v)} />
                    <CampoNumero label="Horas de sueño" value={form.horas_sueno} max={24} step="0.5" onChange={v => set('horas_sueno', v)} />
                    <CampoNumero label="Minutos actividad" value={form.minutos_actividad} max={600} onChange={v => set('minutos_actividad', v)} />
                    <CampoNumero label="Agua (litros)" value={form.consumo_agua_litros} max={10} step="0.1" onChange={v => set('consumo_agua_litros', v)} />
                </div>

                {/* Checkboxes */}
                <div className="mt-4 flex flex-wrap gap-3">
                    <Checkbox label="Hambre nocturna" checked={form.hambre_nocturna} onChange={v => set('hambre_nocturna', v)} />
                    <Checkbox label="Mareos o debilidad" checked={form.mareos_o_debilidad} onChange={v => set('mareos_o_debilidad', v)} />
                    <Checkbox label="Irregularidad menstrual" checked={form.irregularidad_menstrual === true} onChange={v => set('irregularidad_menstrual', v)} />
                </div>

                {/* Observaciones */}
                <div className="mt-4">
                    <label className={labelClass}>Observaciones</label>
                    <textarea className={`${selectClass} resize-none min-h-[80px]`} maxLength={1000} placeholder="¿Algo importante sobre cómo te sentiste?" value={form.observaciones ?? ''} onChange={e => set('observaciones', e.target.value || null)} />
                </div>

                {error && <div className="mt-3 rounded-xl border border-category-fruits/20 bg-category-fruits/5 px-4 py-2.5 text-[11.5px] text-category-fruits">{error}</div>}
                {exito && <div className="mt-3 rounded-xl border border-brand-green/20 bg-brand-green/5 px-4 py-2.5 text-[11.5px] text-brand-green-dark dark:text-brand-green">✓ Registrado correctamente.</div>}

                <div className="mt-4">
                    <Boton variante="primary" tamano="sm" onClick={guardar} disabled={guardando}>
                        {guardando ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                        {guardando ? 'Guardando...' : 'Guardar seguimiento'}
                    </Boton>
                </div>
            </div>

            {/* Historial */}
            {seguimiento.ultimos_registros.length > 0 && (
                <div className="rounded-xl border border-surface-border dark:border-surface-border-dark overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-black/[0.015] dark:bg-white/[0.02] border-b border-surface-border dark:border-surface-border-dark">
                        <CalendarDays size={14} className="text-ink-muted dark:text-ink-muted-dark" />
                        <h4 className="text-[12px] font-bold text-ink dark:text-ink-dark">Últimos registros</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="bg-black/[0.02] dark:bg-white/[0.03]">
                                    {['Fecha', 'Energía', 'Ansiedad', 'Hambre noct.', 'Hinchazón', 'Sueño', 'Actividad'].map(h => (
                                        <th key={h} className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-ink-muted/70 dark:text-ink-muted-dark/70">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {seguimiento.ultimos_registros.map(r => (
                                    <tr key={r.fecha_registro} className="border-t border-surface-border/30 dark:border-surface-border-dark/30">
                                        <td className="px-3 py-2.5 font-medium text-ink dark:text-ink-dark">{r.fecha_registro}</td>
                                        <td className="px-3 py-2.5 text-ink dark:text-ink-dark capitalize">{titulo(r.nivel_energia)}</td>
                                        <td className="px-3 py-2.5 text-ink dark:text-ink-dark capitalize">{titulo(r.ansiedad_por_comida)}</td>
                                        <td className="px-3 py-2.5 text-ink dark:text-ink-dark">{r.hambre_nocturna ? 'Sí' : 'No'}</td>
                                        <td className="px-3 py-2.5 text-ink dark:text-ink-dark capitalize">{titulo(r.hinchazon_abdominal)}</td>
                                        <td className="px-3 py-2.5 text-ink dark:text-ink-dark capitalize">{titulo(r.calidad_sueno)}</td>
                                        <td className="px-3 py-2.5 text-ink dark:text-ink-dark capitalize">{titulo(r.actividad_fisica)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}

function Campo({ label, value, options, onChange }: { label: string; value: string | null; options: string[]; onChange: (v: string | null) => void }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <select className={selectClass} value={value ?? ''} onChange={e => onChange(e.target.value || null)}>
                <option value="">Seleccionar</option>
                {options.map(x => <option key={x} value={x} className="capitalize">{titulo(x)}</option>)}
            </select>
        </div>
    );
}

function CampoNumero({ label, value, max, step = '1', onChange }: { label: string; value: number | string | null; max: number; step?: string; onChange: (v: number | null) => void }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <input type="number" className={selectClass} min="0" max={max} step={step} value={value ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))} />
        </div>
    );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-surface-border accent-brand-green dark:border-surface-border-dark" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="text-[12px] text-ink dark:text-ink-dark">{label}</span>
        </label>
    );
}
