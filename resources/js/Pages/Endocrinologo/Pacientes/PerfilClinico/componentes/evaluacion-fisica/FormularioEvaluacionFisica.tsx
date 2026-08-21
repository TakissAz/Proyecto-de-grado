import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    X, Save, Activity, Ruler, Heart, Eye, Plus, Trash2, FileText, AlertTriangle
} from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import type { EvaluacionFisicaData } from '../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    existente?: EvaluacionFisicaData | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    peso: string;
    talla: string;
    circunferencia_cintura: string;
    circunferencia_cadera: string;
    presion_sistolica: string;
    presion_diastolica: string;
    acantosis_nigricans: boolean;
    skin_tags: boolean;
    galactorrea: boolean;
    hirsutismo_visible: boolean;
    puntaje_ferriman_gallwey: string;
    acne_visible: boolean;
    alopecia_visible: boolean;
    observaciones: string;
}

/* ─── Hallazgos fijos del sistema ─── */
const HALLAZGOS = [
    { key: 'acantosis_nigricans',  label: 'Acantosis nigricans',         desc: 'Hiperpigmentación en pliegues' },
    { key: 'skin_tags',            label: 'Acrocordones (skin tags)',     desc: 'Fibromas blandos en cuello/axilas' },
    { key: 'hirsutismo_visible',   label: 'Hirsutismo visible',          desc: 'Exceso de vello' },
    { key: 'acne_visible',         label: 'Acné visible',                desc: 'Lesiones activas' },
    { key: 'alopecia_visible',     label: 'Alopecia visible',            desc: 'Pérdida de cabello' },
    { key: 'galactorrea',          label: 'Galactorrea',                  desc: 'Secreción mamaria' },
] as const;

/* ─── Clase base de input (igual que CrearHistoriaMenstrual) ─── */
const inputCls =
    'w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink ' +
    'placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 ' +
    'dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark ' +
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none';

export default function FormularioEvaluacionFisica({
    abierto, idPaciente, idConsulta, existente, onCerrar,
}: Props) {
    const esEdicion = Boolean(existente);

    const { data, setData, post, transform, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: existente?.id_consulta_endocrinologica ?? idConsulta ?? '',
        peso:                    existente?.peso?.toString() ?? '',
        talla:                   existente?.talla?.toString() ?? '',
        circunferencia_cintura:  existente?.circunferencia_cintura?.toString() ?? '',
        circunferencia_cadera:   existente?.circunferencia_cadera?.toString() ?? '',
        presion_sistolica:       existente?.presion_sistolica?.toString() ?? '',
        presion_diastolica:      existente?.presion_diastolica?.toString() ?? '',
        acantosis_nigricans:     existente?.acantosis_nigricans ?? false,
        skin_tags:               existente?.skin_tags ?? false,
        galactorrea:             existente?.galactorrea ?? false,
        hirsutismo_visible:      existente?.hirsutismo_visible ?? false,
        puntaje_ferriman_gallwey: existente?.puntaje_ferriman_gallwey?.toString() ?? '',
        acne_visible:            existente?.acne_visible ?? false,
        alopecia_visible:        existente?.alopecia_visible ?? false,
        observaciones:           existente?.observaciones ?? '',
    });

    /* ─── Hallazgos adicionales (sumador dinámico) ─── */
    const [otrosHallazgos, setOtrosHallazgos] = useState<string[]>(['']);

    function agregarHallazgo() {
        setOtrosHallazgos((prev) => [...prev, '']);
    }
    function quitarHallazgo(i: number) {
        setOtrosHallazgos((prev) => prev.filter((_, idx) => idx !== i));
    }
    function cambiarHallazgo(i: number, val: string) {
        setOtrosHallazgos((prev) => prev.map((v, idx) => (idx === i ? val : v)));
    }

    /* ─── Previews calculados ─── */
    const pesoNum   = parseFloat(data.peso) || 0;
    const tallaNum  = parseFloat(data.talla) || 0;
    const imcPreview = pesoNum > 0 && tallaNum > 0
        ? (pesoNum / (tallaNum * tallaNum)).toFixed(1)
        : '—';

    const cinturaNum = parseFloat(data.circunferencia_cintura) || 0;
    const caderaNum  = parseFloat(data.circunferencia_cadera) || 0;
    const iccPreview = cinturaNum > 0 && caderaNum > 0
        ? (cinturaNum / caderaNum).toFixed(2)
        : '—';

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const extras = otrosHallazgos.map((h) => h.trim()).filter(Boolean);
        // Inyecta los hallazgos adicionales en observaciones via transform
        transform((d) => ({
            ...d,
            observaciones: [d.observaciones.trim(), ...extras.map((h) => `• ${h}`)]
                .filter(Boolean)
                .join('\n'),
        }));
        const url = esEdicion
            ? `/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica/${existente!.id_evaluacion_fisica}?_method=PUT`
            : `/endocrinologo/pacientes/${idPaciente}/evaluacion-fisica`;
        post(url, {
            preserveScroll: true,
            onSuccess: () => { reset(); setOtrosHallazgos(['']); onCerrar(); },
        });
    }

    function handleCerrar() { reset(); setOtrosHallazgos(['']); onCerrar(); }

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">

                {/* ── Header ── */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <Activity size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">
                                {esEdicion ? 'Editar evaluación física' : 'Nueva evaluación física'}
                            </h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                                El registro actual pasará al historial
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-7">

                    {/* ── Sección: Antropometría ── */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Ruler size={11} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                            Antropometría
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <CampoNum label="Peso (kg)" placeholder="Ej. 65.5" step="0.01"
                                value={data.peso} onChange={(v) => setData('peso', v)} error={errors.peso} />
                            <CampoNum label="Talla (m)" placeholder="Ej. 1.65" step="0.01"
                                value={data.talla} onChange={(v) => setData('talla', v)} error={errors.talla} />
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">IMC (calculado)</p>
                                <div className={`${inputCls} opacity-60 cursor-not-allowed`}>{imcPreview}</div>
                                <p className="mt-1 text-[10px] text-ink-muted dark:text-ink-muted-dark">Se calcula automáticamente</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                            <CampoNum label="Cintura (cm)" placeholder="Ej. 82" step="0.1" hint="Riesgo ≥ 80 cm"
                                value={data.circunferencia_cintura} onChange={(v) => setData('circunferencia_cintura', v)} error={errors.circunferencia_cintura} />
                            <CampoNum label="Cadera (cm)" placeholder="Ej. 96" step="0.1"
                                value={data.circunferencia_cadera} onChange={(v) => setData('circunferencia_cadera', v)} error={errors.circunferencia_cadera} />
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">ICC (calculado)</p>
                                <div className={`${inputCls} opacity-60 cursor-not-allowed`}>{iccPreview}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Sección: Presión arterial ── */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Heart size={11} strokeWidth={2} className="text-category-fruits" />
                            Presión arterial
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <CampoNum label="PA sistólica (mmHg)" placeholder="Ej. 120"
                                value={data.presion_sistolica} onChange={(v) => setData('presion_sistolica', v)} error={errors.presion_sistolica} />
                            <CampoNum label="PA diastólica (mmHg)" placeholder="Ej. 80"
                                value={data.presion_diastolica} onChange={(v) => setData('presion_diastolica', v)} error={errors.presion_diastolica} />
                        </div>
                    </div>

                    {/* ── Sección: Hallazgos fijos ── */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Eye size={11} strokeWidth={2} className="text-brand-orange" />
                            Hallazgos al examen físico
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {HALLAZGOS.map(({ key, label, desc }) => (
                                <CheckboxItem
                                    key={key}
                                    label={label}
                                    descripcion={desc}
                                    checked={data[key] as boolean}
                                    onChange={(v) => setData(key, v)}
                                />
                            ))}
                        </div>

                        {/* Ferriman inline si hirsutismo activo */}
                        {data.hirsutismo_visible && (
                            <div className="mt-3 max-w-xs">
                                <CampoNum
                                    label="Puntaje Ferriman-Gallwey (0–36)"
                                    placeholder="Ej. 12"
                                    step="1"
                                    hint="≥ 8 pts = hirsutismo clínico"
                                    value={data.puntaje_ferriman_gallwey}
                                    onChange={(v) => setData('puntaje_ferriman_gallwey', v)}
                                    error={errors.puntaje_ferriman_gallwey}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Sección: Otros hallazgos (sumador dinámico) ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                                <AlertTriangle size={11} strokeWidth={2} className="text-category-dairy" />
                                Otros hallazgos
                            </label>
                            <button type="button" onClick={agregarHallazgo}
                                className="flex items-center gap-1.5 rounded-lg border border-category-dairy/30 px-3 py-1.5 text-[11.5px] font-semibold text-category-dairy transition-colors hover:bg-category-dairy/8">
                                <Plus size={13} strokeWidth={2} /> Agregar
                            </button>
                        </div>

                        {otrosHallazgos.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-surface-border py-5 text-center text-[12px] text-ink-muted dark:border-surface-border-dark dark:text-ink-muted-dark">
                                Sin hallazgos adicionales. Haz clic en <span className="font-semibold">Agregar</span> para añadir uno.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {otrosHallazgos.map((val, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder={`Ej. Estrías, xantomas, vitíligo...`}
                                            value={val}
                                            onChange={(e) => cambiarHallazgo(i, e.target.value)}
                                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                        />
                                        <button type="button" onClick={() => quitarHallazgo(i)}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted/50 transition-colors hover:bg-category-fruits/10 hover:text-category-fruits dark:text-ink-muted-dark/50">
                                            <Trash2 size={14} strokeWidth={1.8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Sección: Observaciones ── */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" />
                            Observaciones
                        </label>
                        <textarea
                            rows={3}
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            placeholder="Notas clínicas adicionales..."
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[80px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                        />
                    </div>

                    {/* ── Error global ── */}
                    {Object.keys(errors).length > 0 && (
                        <p className="rounded-xl border border-category-fruits/25 bg-category-fruits/8 px-4 py-3 text-[12.5px] text-category-fruits">
                            Revise los campos marcados.
                        </p>
                    )}

                    {/* ── Footer ── */}
                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={handleCerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                            <Save size={14} strokeWidth={1.8} />
                            {processing ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Campo numérico ── */
function CampoNum({ label, value, onChange, error, step, placeholder, hint }: {
    label: string; value: string; onChange: (v: string) => void;
    error?: string; step?: string; placeholder?: string; hint?: string;
}) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">{label}</p>
            <input
                type="number"
                step={step}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            {error  && <p className="mt-1 text-[10.5px] text-category-fruits">{error}</p>}
            {hint && !error && <p className="mt-1 text-[10px] text-ink-muted dark:text-ink-muted-dark">{hint}</p>}
        </div>
    );
}

/* ── Checkbox con descripción (igual que CrearHistoriaMenstrual) ── */
function CheckboxItem({ label, descripcion, checked, onChange }: {
    label: string; descripcion: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-surface-border px-4 py-3 transition-all hover:border-brand-green/30 dark:border-surface-border-dark dark:hover:border-brand-green/30">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border text-brand-green focus:ring-brand-green/30 dark:border-surface-border-dark"
            />
            <div>
                <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">{label}</p>
                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{descripcion}</p>
            </div>
        </label>
    );
}
