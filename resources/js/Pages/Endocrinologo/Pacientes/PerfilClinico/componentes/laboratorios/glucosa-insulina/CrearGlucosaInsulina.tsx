import { useForm } from '@inertiajs/react';
import { X, Save, FlaskConical, FileText } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    onCerrar: () => void;
}

export default function CrearGlucosaInsulina({ abierto, idPaciente, idConsulta, onCerrar }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: idConsulta ?? '',
        fecha_resultado: '',
        glucosa_ayunas: '', insulina_ayunas: '', homa_ir: '',
        hemoglobina_glicosilada: '',
        glucosa_2h_ogtt: '', insulina_2h_ogtt: '',
        hiperinsulinemia: false,
        resistencia_insulina_sugerida: false,
        interpretacion: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/endocrinologo/pacientes/${idPaciente}/laboratorios/glucosa-insulina`, {
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <FlaskConical size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Glucosa e insulina</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Evaluación de resistencia a la insulina</p>
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

                    {/* Valores basales */}
                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Valores en ayunas</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <InputLab label="Glucosa ayunas" unidad="mg/dL" placeholder="70-99" value={data.glucosa_ayunas} onChange={(v) => setData('glucosa_ayunas', v)} />
                            <InputLab label="Insulina ayunas" unidad="µU/mL" placeholder="2-10" value={data.insulina_ayunas} onChange={(v) => setData('insulina_ayunas', v)} />
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1">HOMA-IR</p>
                                <div className="relative">
                                    <input type="number" step="0.01" placeholder="<2.5" value={data.homa_ir} onChange={(e) => setData('homa_ir', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-2.5 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                                <p className="text-[8.5px] text-ink-muted/50 dark:text-ink-muted-dark/50 mt-0.5">≥2.5 sugiere RI · ≥3.8 severa</p>
                            </div>
                            <InputLab label="HbA1c" unidad="%" placeholder="4-5.6" value={data.hemoglobina_glicosilada} onChange={(v) => setData('hemoglobina_glicosilada', v)} />
                        </div>
                    </div>

                    {/* OGTT */}
                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Post carga (OGTT 2h) — opcional</p>
                        <div className="grid grid-cols-2 gap-3">
                            <InputLab label="Glucosa 2h" unidad="mg/dL" placeholder="<140" value={data.glucosa_2h_ogtt} onChange={(v) => setData('glucosa_2h_ogtt', v)} />
                            <InputLab label="Insulina 2h" unidad="µU/mL" placeholder="<60" value={data.insulina_2h_ogtt} onChange={(v) => setData('insulina_2h_ogtt', v)} />
                        </div>
                    </div>

                    {/* Conclusiones */}
                    <div>
                        <p className="text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">Conclusiones clínicas</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <CheckboxItem label="Resistencia a insulina sugerida" descripcion="Basada en HOMA-IR o clínica" checked={data.resistencia_insulina_sugerida} onChange={(v) => setData('resistencia_insulina_sugerida', v)} />
                            <CheckboxItem label="Hiperinsulinemia" descripcion="Insulina elevada en ayunas o poscarga" checked={data.hiperinsulinemia} onChange={(v) => setData('hiperinsulinemia', v)} />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" /> Interpretación
                        </label>
                        <textarea rows={3} value={data.interpretacion} onChange={(e) => setData('interpretacion', e.target.value)} placeholder="Interpretación clínica..." className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[70px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4 dark:border-surface-border-dark">
                        <Boton type="button" variante="ghost" tamano="sm" onClick={handleCerrar}>Cancelar</Boton>
                        <Boton type="submit" variante="primary" tamano="md" disabled={processing}>
                            <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Registrar'}
                        </Boton>
                    </div>
                </form>
            </div>
        </div>
    );
}

function InputLab({ label, unidad, placeholder, value, onChange }: { label: string; unidad: string; placeholder: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1">{label}</p>
            <div className="relative">
                <input type="number" step="0.01" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-2.5 pr-14 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-muted/50 dark:text-ink-muted-dark/50">{unidad}</span>
            </div>
            <p className="text-[8.5px] text-ink-muted/50 dark:text-ink-muted-dark/50 mt-0.5">Ref: {placeholder}</p>
        </div>
    );
}

function CheckboxItem({ label, descripcion, checked, onChange }: { label: string; descripcion: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-surface-border px-4 py-3 transition-all hover:border-brand-green/30 dark:border-surface-border-dark dark:hover:border-brand-green/30">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border text-brand-green focus:ring-brand-green/30 dark:border-surface-border-dark" />
            <div>
                <p className="text-[12.5px] font-semibold text-ink dark:text-ink-dark">{label}</p>
                <p className="text-[10.5px] text-ink-muted dark:text-ink-muted-dark">{descripcion}</p>
            </div>
        </label>
    );
}
