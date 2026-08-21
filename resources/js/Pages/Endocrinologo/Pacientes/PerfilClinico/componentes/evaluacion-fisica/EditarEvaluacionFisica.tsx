import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Save, Activity, Scale, Heart, Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import type { EvaluacionFisicaData } from '../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    evaluacion: EvaluacionFisicaData;
    onCerrar: () => void;
}

/* Parsea observaciones guardadas: separa los "Otros hallazgos" del texto libre */
function parsearObservaciones(obs: string | null | undefined): { otrosHallazgos: string[]; textoLibre: string } {
    if (!obs) return { otrosHallazgos: [], textoLibre: '' };
    const bloqueRegex = /\[Otros hallazgos\]\n((?:• .+\n?)*)/;
    const match = obs.match(bloqueRegex);
    if (!match) return { otrosHallazgos: [], textoLibre: obs.trim() };
    const otrosHallazgos = match[1]
        .split('\n')
        .map(l => l.replace(/^• /, '').trim())
        .filter(Boolean);
    const textoLibre = obs.replace(bloqueRegex, '').trim();
    return { otrosHallazgos, textoLibre };
}

export default function EditarEvaluacionFisica({ abierto, idPaciente, evaluacion, onCerrar }: Props) {
    const { otrosHallazgos: otrosIniciales, textoLibre } = parsearObservaciones(evaluacion.observaciones);

    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: evaluacion.id_consulta_endocrinologica,
        peso: evaluacion.peso?.toString() ?? '',
        talla: evaluacion.talla?.toString() ?? '',
        imc: evaluacion.imc?.toString() ?? '',
        circunferencia_cintura: evaluacion.circunferencia_cintura?.toString() ?? '',
        circunferencia_cadera: evaluacion.circunferencia_cadera?.toString() ?? '',
        indice_cintura_cadera: evaluacion.indice_cintura_cadera?.toString() ?? '',
        presion_sistolica: evaluacion.presion_sistolica?.toString() ?? '',
        presion_diastolica: evaluacion.presion_diastolica?.toString() ?? '',
        acantosis_nigricans: evaluacion.acantosis_nigricans,
        skin_tags: evaluacion.skin_tags,
        galactorrea: evaluacion.galactorrea,
        hirsutismo_visible: evaluacion.hirsutismo_visible,
        puntaje_ferriman_gallwey: evaluacion.puntaje_ferriman_gallwey?.toString() ?? '',
        acne_visible: evaluacion.acne_visible,
        alopecia_visible: evaluacion.alopecia_visible,
        observaciones: textoLibre,
    });

    const [otrosHallazgos, setOtrosHallazgos] = useState<string[]>(otrosIniciales);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const hallazgosExtra = otrosHallazgos.map(h => h.trim()).filter(Boolean);
        const parteHallazgos = hallazgosExtra.length > 0
            ? `[Otros hallazgos]\n${hallazgosExtra.map(h => `• ${h}`).join('\n')}`
            : '';
        const obsFinal = [parteHallazgos, data.observaciones.trim()].filter(Boolean).join('\n\n');
        setData('observaciones', obsFinal);
        setTimeout(() => {
            post(`/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica/${evaluacion.id_evaluacion_fisica}?_method=PUT`, {
                preserveScroll: true,
                onSuccess: () => { reset(); onCerrar(); },
            });
        }, 0);
    }

    function handleCerrar() { reset(); onCerrar(); }

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <Activity size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Editar evaluación física</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Modifica los datos del registro actual</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Antropometría */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Scale size={11} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                            Antropometría
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <InputNum label="Peso (kg)" placeholder="65" value={data.peso} onChange={(v) => setData('peso', v)} />
                            <InputNum label="Talla (m)" placeholder="1.60" value={data.talla} onChange={(v) => setData('talla', v)} step="0.01" />
                            <InputNum label="IMC" placeholder="Auto" value={data.imc} onChange={(v) => setData('imc', v)} />
                            <InputNum label="Cintura (cm)" placeholder="82" value={data.circunferencia_cintura} onChange={(v) => setData('circunferencia_cintura', v)} />
                            <InputNum label="Cadera (cm)" placeholder="96" value={data.circunferencia_cadera} onChange={(v) => setData('circunferencia_cadera', v)} />
                            <InputNum label="Índice C/C" placeholder="0.85" value={data.indice_cintura_cadera} onChange={(v) => setData('indice_cintura_cadera', v)} step="0.01" />
                        </div>
                    </div>

                    {/* Presión arterial */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Heart size={11} strokeWidth={2} className="text-category-fruits" />
                            Presión arterial
                        </label>
                        <div className="grid grid-cols-2 gap-3 max-w-xs">
                            <InputNum label="Sistólica (mmHg)" placeholder="120" value={data.presion_sistolica} onChange={(v) => setData('presion_sistolica', v)} />
                            <InputNum label="Diastólica (mmHg)" placeholder="80" value={data.presion_diastolica} onChange={(v) => setData('presion_diastolica', v)} />
                        </div>
                    </div>

                    {/* ── Hallazgos al examen físico (fijos + otros a mano) ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                <Eye size={11} strokeWidth={2} className="text-brand-orange" />
                                Hallazgos al examen físico
                            </label>
                            <button type="button"
                                onClick={() => setOtrosHallazgos(p => [...p, ''])}
                                className="flex items-center gap-1.5 rounded-lg border border-brand-orange/30 px-3 py-1.5 text-[11.5px] font-semibold text-brand-orange transition-colors hover:bg-brand-orange/8">
                                <Plus size={13} strokeWidth={2} /> Agregar otro
                            </button>
                        </div>

                        {/* Hallazgos fijos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <CheckboxItem label="Acantosis nigricans" descripcion="Hiperpigmentación en pliegues" checked={data.acantosis_nigricans} onChange={(v) => setData('acantosis_nigricans', v)} />
                            <CheckboxItem label="Acrocordones (skin tags)" descripcion="Fibromas blandos en cuello/axilas" checked={data.skin_tags} onChange={(v) => setData('skin_tags', v)} />
                            <CheckboxItem label="Hirsutismo visible" descripcion="Exceso de vello" checked={data.hirsutismo_visible} onChange={(v) => setData('hirsutismo_visible', v)} />
                            <CheckboxItem label="Acné visible" descripcion="Lesiones activas" checked={data.acne_visible} onChange={(v) => setData('acne_visible', v)} />
                            <CheckboxItem label="Alopecia visible" descripcion="Pérdida de cabello" checked={data.alopecia_visible} onChange={(v) => setData('alopecia_visible', v)} />
                            <CheckboxItem label="Galactorrea" descripcion="Secreción mamaria" checked={data.galactorrea} onChange={(v) => setData('galactorrea', v)} />
                        </div>

                        {/* Ferriman si hirsutismo activo */}
                        {data.hirsutismo_visible && (
                            <div className="mt-3 max-w-[220px]">
                                <InputNum label="Puntaje Ferriman-Gallwey (0–36)" placeholder="Ej: 12" step="1"
                                    value={data.puntaje_ferriman_gallwey} onChange={(v) => setData('puntaje_ferriman_gallwey', v)}
                                    hint="≥ 8 pts = hirsutismo clínico" />
                            </div>
                        )}

                        {/* Otros hallazgos a mano — pre-poblados desde observaciones guardadas */}
                        {otrosHallazgos.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                                    Otros hallazgos registrados a mano
                                </p>
                                {otrosHallazgos.map((val, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Ej: Estrías, xantomas, vitíligo..."
                                            value={val}
                                            onChange={(e) => setOtrosHallazgos(p => p.map((x, idx) => idx === i ? e.target.value : x))}
                                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-2.5 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-orange/40 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                        />
                                        <button type="button"
                                            onClick={() => setOtrosHallazgos(p => p.filter((_, idx) => idx !== i))}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted/50 transition-colors hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark/50">
                                            <Trash2 size={14} strokeWidth={1.8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Observaciones (texto libre) */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" />
                            Observaciones
                        </label>
                        <textarea rows={3} value={data.observaciones} onChange={(e) => setData('observaciones', e.target.value)}
                            placeholder="Notas del examen físico..."
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[80px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={handleCerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                            <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Guardar cambios'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
}

function InputNum({ label, placeholder, value, onChange, step, hint }: {
    label: string; placeholder: string; value: string; onChange: (v: string) => void; step?: string; hint?: string;
}) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">{label}</p>
            <input type="number" step={step ?? '0.01'} placeholder={placeholder} value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
            {hint && <p className="mt-1 text-[10px] text-ink-muted dark:text-ink-muted-dark">{hint}</p>}
        </div>
    );
}

function CheckboxItem({ label, descripcion, checked, onChange }: {
    label: string; descripcion: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-surface-border px-4 py-3 transition-all hover:border-brand-green/30 dark:border-surface-border-dark dark:hover:border-brand-green/30">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border text-brand-green focus:ring-brand-green/30 dark:border-surface-border-dark" />
            <div>
                <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">{label}</p>
                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{descripcion}</p>
            </div>
        </label>
    );
}
