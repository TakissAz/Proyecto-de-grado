import { useForm } from '@inertiajs/react';
import { X, Save, FlaskConical, FileText } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import type { GlucosaInsulinaData } from '../../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    data: GlucosaInsulinaData;
    onCerrar: () => void;
}

export default function EditarGlucosaInsulina({ abierto, idPaciente, data: existente, onCerrar }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: existente.id_consulta_endocrinologica,
        fecha_resultado: existente.fecha_resultado ?? '',
        glucosa_ayunas: existente.glucosa_ayunas?.toString() ?? '',
        insulina_ayunas: existente.insulina_ayunas?.toString() ?? '',
        homa_ir: existente.homa_ir?.toString() ?? '',
        hemoglobina_glicosilada: existente.hemoglobina_glicosilada?.toString() ?? '',
        glucosa_2h_ogtt: existente.glucosa_2h_ogtt?.toString() ?? '',
        insulina_2h_ogtt: existente.insulina_2h_ogtt?.toString() ?? '',
        hiperinsulinemia: existente.hiperinsulinemia,
        resistencia_insulina_sugerida: existente.resistencia_insulina_sugerida,
        interpretacion: existente.interpretacion ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/endocrinologo/pacientes/${idPaciente}/laboratorios/glucosa-insulina/${existente.id_glucosa_insulina}?_method=PUT`, {
            preserveScroll: true, onSuccess: () => { reset(); onCerrar(); },
        });
    }

    function handleCerrar() { reset(); onCerrar(); }
    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <FlaskConical size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Editar glucosa e insulina</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Modifica los valores del registro actual</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="max-w-xs">
                        <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Fecha del resultado</p>
                        <input type="date" value={data.fecha_resultado} onChange={(e) => setData('fecha_resultado', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" required />
                    </div>

                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Valores en ayunas</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <InputLab label="Glucosa ayunas" unidad="mg/dL" value={data.glucosa_ayunas} onChange={(v) => setData('glucosa_ayunas', v)} />
                            <InputLab label="Insulina ayunas" unidad="µU/mL" value={data.insulina_ayunas} onChange={(v) => setData('insulina_ayunas', v)} />
                            <InputLab label="HOMA-IR" unidad="" value={data.homa_ir} onChange={(v) => setData('homa_ir', v)} />
                            <InputLab label="HbA1c" unidad="%" value={data.hemoglobina_glicosilada} onChange={(v) => setData('hemoglobina_glicosilada', v)} />
                        </div>
                    </div>

                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Post carga (OGTT 2h)</p>
                        <div className="grid grid-cols-2 gap-3">
                            <InputLab label="Glucosa 2h" unidad="mg/dL" value={data.glucosa_2h_ogtt} onChange={(v) => setData('glucosa_2h_ogtt', v)} />
                            <InputLab label="Insulina 2h" unidad="µU/mL" value={data.insulina_2h_ogtt} onChange={(v) => setData('insulina_2h_ogtt', v)} />
                        </div>
                    </div>

                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Conclusiones clínicas</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <CheckboxItem label="Resistencia a insulina" checked={data.resistencia_insulina_sugerida} onChange={(v) => setData('resistencia_insulina_sugerida', v)} />
                            <CheckboxItem label="Hiperinsulinemia" checked={data.hiperinsulinemia} onChange={(v) => setData('hiperinsulinemia', v)} />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" /> Interpretación
                        </label>
                        <textarea rows={3} value={data.interpretacion} onChange={(e) => setData('interpretacion', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[70px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
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

function InputLab({ label, unidad, value, onChange }: { label: string; unidad: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1">{label}</p>
            <div className="relative">
                <input type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-2.5 pr-14 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                {unidad && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-muted/50 dark:text-ink-muted-dark/50">{unidad}</span>}
            </div>
        </div>
    );
}

function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-surface-border px-4 py-3 transition-all hover:border-brand-green/30 dark:border-surface-border-dark dark:hover:border-brand-green/30">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-surface-border text-brand-green dark:border-surface-border-dark" />
            <span className="text-[12px] font-semibold text-ink dark:text-ink-dark">{label}</span>
        </label>
    );
}
