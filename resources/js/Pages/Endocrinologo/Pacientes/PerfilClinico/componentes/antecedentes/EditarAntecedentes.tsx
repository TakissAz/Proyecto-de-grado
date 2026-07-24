import { useForm } from '@inertiajs/react';
import { X, Save, Stethoscope, User, Users, Pill, FileText } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';
import type { AntecedentesData } from '../../tipos';

interface Props {
    abierto: boolean;
    idPaciente: number;
    antecedentes: AntecedentesData;
    onCerrar: () => void;
}

export default function EditarAntecedentes({ abierto, idPaciente, antecedentes, onCerrar }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        id_consulta_endocrinologica: antecedentes.id_consulta_endocrinologica,
        diabetes_familiar: antecedentes.diabetes_familiar,
        diabetes_personal: antecedentes.diabetes_personal,
        hipertension_familiar: antecedentes.hipertension_familiar,
        hipertension_personal: antecedentes.hipertension_personal,
        dislipidemia_familiar: antecedentes.dislipidemia_familiar,
        dislipidemia_personal: antecedentes.dislipidemia_personal,
        enfermedad_tiroidea: antecedentes.enfermedad_tiroidea,
        hiperprolactinemia_previa: antecedentes.hiperprolactinemia_previa,
        uso_anticonceptivos: antecedentes.uso_anticonceptivos,
        uso_metformina: antecedentes.uso_metformina,
        uso_corticoides: antecedentes.uso_corticoides,
        otros_medicamentos: antecedentes.otros_medicamentos ?? '',
        observaciones: antecedentes.observaciones ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/endocrinologo/pacientes/${idPaciente}/antecedentes/${antecedentes.id_antecedente}?_method=PUT`, {
            preserveScroll: true,
            onSuccess: () => { reset(); onCerrar(); },
        });
    }

    function handleCerrar() { reset(); onCerrar(); }

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-[3px] p-4">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-surface-border bg-surface-card shadow-2xl dark:border-surface-border-dark dark:bg-surface-card-dark">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-surface-border bg-surface-card px-6 py-4 dark:border-surface-border-dark dark:bg-surface-card-dark">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                            <Stethoscope size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Editar antecedentes</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Modifica los datos del registro actual</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Personales */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <User size={11} strokeWidth={2} className="text-category-fruits" />
                            Antecedentes personales
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <CheckboxItem label="Diabetes" descripcion="Diabetes mellitus personal" checked={data.diabetes_personal} onChange={(v) => setData('diabetes_personal', v)} />
                            <CheckboxItem label="Hipertensión" descripcion="Hipertensión arterial personal" checked={data.hipertension_personal} onChange={(v) => setData('hipertension_personal', v)} />
                            <CheckboxItem label="Dislipidemia" descripcion="Alteración de lípidos personal" checked={data.dislipidemia_personal} onChange={(v) => setData('dislipidemia_personal', v)} />
                            <CheckboxItem label="Enfermedad tiroidea" descripcion="Hipo/hipertiroidismo" checked={data.enfermedad_tiroidea} onChange={(v) => setData('enfermedad_tiroidea', v)} />
                            <CheckboxItem label="Hiperprolactinemia" descripcion="Prolactina elevada previa" checked={data.hiperprolactinemia_previa} onChange={(v) => setData('hiperprolactinemia_previa', v)} />
                        </div>
                    </div>

                    {/* Familiares */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Users size={11} strokeWidth={2} className="text-category-dairy" />
                            Antecedentes familiares
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <CheckboxItem label="Diabetes familiar" descripcion="Padres o hermanos con diabetes" checked={data.diabetes_familiar} onChange={(v) => setData('diabetes_familiar', v)} />
                            <CheckboxItem label="Hipertensión familiar" descripcion="Padres o hermanos con HTA" checked={data.hipertension_familiar} onChange={(v) => setData('hipertension_familiar', v)} />
                            <CheckboxItem label="Dislipidemia familiar" descripcion="Padres o hermanos con dislipidemia" checked={data.dislipidemia_familiar} onChange={(v) => setData('dislipidemia_familiar', v)} />
                        </div>
                    </div>

                    {/* Medicamentos */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Pill size={11} strokeWidth={2} className="text-category-others" />
                            Medicamentos en uso
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            <CheckboxItem label="Metformina" descripcion="Sensibilizador de insulina" checked={data.uso_metformina} onChange={(v) => setData('uso_metformina', v)} />
                            <CheckboxItem label="Anticonceptivos" descripcion="Anticonceptivos orales" checked={data.uso_anticonceptivos} onChange={(v) => setData('uso_anticonceptivos', v)} />
                            <CheckboxItem label="Corticoides" descripcion="Corticosteroides sistémicos" checked={data.uso_corticoides} onChange={(v) => setData('uso_corticoides', v)} />
                        </div>
                        <div>
                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Otros medicamentos</p>
                            <input type="text" placeholder="Ej: Espironolactona, Levotiroxina..." value={data.otros_medicamentos} onChange={(e) => setData('otros_medicamentos', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" />
                            Observaciones
                        </label>
                        <textarea rows={3} value={data.observaciones} onChange={(e) => setData('observaciones', e.target.value)} placeholder="Notas adicionales..." className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[80px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                    </div>

                    {/* Footer */}
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
