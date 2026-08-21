import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Save, ScanSearch, FileText, ImagePlus } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import type { EcografiaData } from '../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    ecografia: EcografiaData;
    onCerrar: () => void;
}

export default function EditarEcografia({ abierto, idPaciente, ecografia, onCerrar }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: ecografia.id_consulta_endocrinologica,
        fecha_ecografia: ecografia.fecha_ecografia ?? '',
        tipo_ecografia: ecografia.tipo_ecografia ?? '',
        volumen_ovario_derecho: ecografia.volumen_ovario_derecho?.toString() ?? '',
        volumen_ovario_izquierdo: ecografia.volumen_ovario_izquierdo?.toString() ?? '',
        foliculos_ovario_derecho: ecografia.foliculos_ovario_derecho?.toString() ?? '',
        foliculos_ovario_izquierdo: ecografia.foliculos_ovario_izquierdo?.toString() ?? '',
        morfologia_compatible_pmos: ecografia.morfologia_compatible_pmos,
        distribucion_periferica: ecografia.distribucion_periferica,
        imagen_ecografia: null as File | null,
        observaciones: ecografia.observaciones ?? '',
    });

    const [preview, setPreview] = useState<string | null>(ecografia.imagen_url ?? null);

    function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('imagen_ecografia', file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/endocrinologo/pacientes/${idPaciente}/ecografia/${ecografia.id_ecografia}?_method=PUT`, {
            preserveScroll: true,
            onSuccess: () => { reset(); setPreview(null); onCerrar(); },
        });
    }

    function handleCerrar() { reset(); setPreview(null); onCerrar(); }

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <ScanSearch size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Editar ecografía</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Modifica los datos del registro actual</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Datos básicos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Fecha de la ecografía</p>
                            <input type="date" value={data.fecha_ecografia} onChange={(e) => setData('fecha_ecografia', e.target.value)}
                                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" required />
                        </div>
                        <div>
                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Tipo</p>
                            <select value={data.tipo_ecografia} onChange={(e) => setData('tipo_ecografia', e.target.value)}
                                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark">
                                <option value="">Sin especificar</option>
                                <option value="transvaginal">Transvaginal</option>
                                <option value="abdominal">Abdominal</option>
                                <option value="otra">Otra</option>
                            </select>
                        </div>
                    </div>

                    {/* Medidas ováricas */}
                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Medidas ováricas</p>
                        <div className="grid grid-cols-2 gap-3">
                            <InputNum label="Vol. ovario derecho (mL)" value={data.volumen_ovario_derecho} onChange={(v) => setData('volumen_ovario_derecho', v)} />
                            <InputNum label="Vol. ovario izquierdo (mL)" value={data.volumen_ovario_izquierdo} onChange={(v) => setData('volumen_ovario_izquierdo', v)} />
                            <InputNum label="Folículos OD" value={data.foliculos_ovario_derecho} onChange={(v) => setData('foliculos_ovario_derecho', v)} step="1" />
                            <InputNum label="Folículos OI" value={data.foliculos_ovario_izquierdo} onChange={(v) => setData('foliculos_ovario_izquierdo', v)} step="1" />
                        </div>
                    </div>

                    {/* Hallazgos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <CheckboxItem label="Morfología compatible PMOS" descripcion="Criterio ovárico para diagnóstico PMOS" checked={data.morfologia_compatible_pmos} onChange={(v) => setData('morfologia_compatible_pmos', v)} />
                        <CheckboxItem label="Distribución periférica" descripcion="Folículos en collar de perlas periférico" checked={data.distribucion_periferica} onChange={(v) => setData('distribucion_periferica', v)} />
                    </div>

                    {/* Imagen */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <ImagePlus size={11} strokeWidth={2} className="text-category-dairy" /> Imagen de la ecografía
                        </label>
                        <div className="rounded-xl border border-dashed border-surface-border p-4 dark:border-surface-border-dark">
                            {preview ? (
                                <div className="space-y-2">
                                    <img src={preview} alt="Preview ecografía" className="w-full max-h-48 object-contain rounded-lg" />
                                    <div className="flex items-center gap-3">
                                        <label className="text-[11px] text-brand-green-dark hover:underline cursor-pointer dark:text-brand-green">
                                            Cambiar imagen
                                            <input type="file" accept="image/*" onChange={handleImagen} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                                    <ImagePlus size={28} strokeWidth={1.2} className="text-ink-muted/40 dark:text-ink-muted-dark/40" />
                                    <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">Haz clic para subir la imagen de la ecografía</p>
                                    <p className="text-[10px] text-ink-muted/50 dark:text-ink-muted-dark/50">JPG, PNG o WEBP · Máx. 5 MB</p>
                                    <input type="file" accept="image/*" onChange={handleImagen} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" /> Observaciones
                        </label>
                        <textarea rows={3} value={data.observaciones} onChange={(e) => setData('observaciones', e.target.value)}
                            placeholder="Notas del estudio ecográfico..."
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[70px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
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

function InputNum({ label, value, onChange, step = '0.1' }: { label: string; value: string; onChange: (v: string) => void; step?: string }) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1">{label}</p>
            <input type="number" step={step} value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-2.5 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
    );
}

function CheckboxItem({ label, descripcion, checked, onChange }: { label: string; descripcion: string; checked: boolean; onChange: (v: boolean) => void }) {
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
