import { useForm } from '@inertiajs/react';
import { X, Save, AlertTriangle, Scissors, TrendingUp, FileText } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    acne: boolean;
    acne_grado: string;
    hirsutismo: boolean;
    hirsutismo_zona: string;
    puntaje_ferriman_gallwey: string;
    alopecia_androgenica: boolean;
    seborrea: boolean;
    inicio_sintomas: string;
    progresion_sintomas: string;
    observaciones: string;
}

export default function CrearHiperandrogenismo({ abierto, idPaciente, idConsulta, onCerrar }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: idConsulta ?? '',
        acne: false,
        acne_grado: 'no_aplica',
        hirsutismo: false,
        hirsutismo_zona: '',
        puntaje_ferriman_gallwey: '',
        alopecia_androgenica: false,
        seborrea: false,
        inicio_sintomas: '',
        progresion_sintomas: '',
        observaciones: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/endocrinologo/pacientes/${idPaciente}/hiperandrogenismo`, {
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
                            <AlertTriangle size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Nuevo registro de hiperandrogenismo</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">El registro actual pasará al historial</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Sección: Signos clínicos principales */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <AlertTriangle size={11} strokeWidth={2} className="text-category-fruits" />
                            Signos clínicos principales
                        </label>

                        {/* Acné */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <CheckboxItem label="Presencia de acné" descripcion="Comedones, pápulas o nódulos" checked={data.acne} onChange={(v) => setData('acne', v)} />
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Grado de acné</p>
                                <select value={data.acne_grado} onChange={(e) => setData('acne_grado', e.target.value)} disabled={!data.acne} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 disabled:opacity-40 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark">
                                    <option value="no_aplica">No aplica</option>
                                    <option value="leve">Leve</option>
                                    <option value="moderado">Moderado</option>
                                    <option value="severo">Severo</option>
                                </select>
                            </div>
                        </div>

                        {/* Hirsutismo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <CheckboxItem label="Hirsutismo" descripcion="Exceso de vello en patrón masculino" checked={data.hirsutismo} onChange={(v) => setData('hirsutismo', v)} />
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Zonas afectadas</p>
                                <input type="text" placeholder="Ej: mentón, labio superior" value={data.hirsutismo_zona} onChange={(e) => setData('hirsutismo_zona', e.target.value)} disabled={!data.hirsutismo} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 disabled:opacity-40 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                            </div>
                        </div>

                        {/* Ferriman-Gallwey */}
                        <div>
                            <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Puntaje Ferriman-Gallwey</p>
                            <div className="rounded-xl border border-surface-border p-4 dark:border-surface-border-dark">
                                <div className="flex items-start gap-3 mb-3">
                                    <input type="number" min="0" max="36" placeholder="0" value={data.puntaje_ferriman_gallwey} onChange={(e) => setData('puntaje_ferriman_gallwey', e.target.value)} className="w-20 rounded-xl border border-surface-border bg-[#FAF9F6] px-3 py-2.5 text-[14px] font-bold text-center text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                                    <div className="flex-1">
                                        <p className="text-[11px] font-semibold text-ink dark:text-ink-dark">Escala de crecimiento del vello</p>
                                        <p className="text-[10px] text-ink-muted dark:text-ink-muted-dark mt-0.5 leading-relaxed">
                                            Se evalúan 9 zonas corporales (labio, mentón, pecho, espalda alta, espalda baja, abdomen superior, abdomen inferior, brazo y muslo). Cada zona se puntúa de 0 a 4.
                                        </p>
                                    </div>
                                </div>
                                {/* Mini escala visual */}
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between text-[9px]">
                                            <span className="text-brand-green-dark dark:text-brand-green font-medium">Normal (0-7)</span>
                                            <span className="text-brand-orange font-medium">Positivo (8-14)</span>
                                            <span className="text-category-fruits font-medium">Severo (15+)</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full overflow-hidden flex">
                                            <div className="h-full bg-brand-green/40" style={{ width: '22%' }} />
                                            <div className="h-full bg-brand-orange/40" style={{ width: '19%' }} />
                                            <div className="h-full bg-category-fruits/40" style={{ width: '59%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Otros signos */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Scissors size={11} strokeWidth={2} className="text-category-dairy" />
                            Otros signos
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <CheckboxItem label="Alopecia androgénica" descripcion="Pérdida de cabello patrón femenino" checked={data.alopecia_androgenica} onChange={(v) => setData('alopecia_androgenica', v)} />
                            <CheckboxItem label="Seborrea" descripcion="Exceso de grasa en cuero cabelludo" checked={data.seborrea} onChange={(v) => setData('seborrea', v)} />
                        </div>
                    </div>

                    {/* Sección: Evolución */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <TrendingUp size={11} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                            Evolución
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Inicio de síntomas</p>
                                <input type="text" placeholder="Ej: pubertad, hace 2 años" value={data.inicio_sintomas} onChange={(e) => setData('inicio_sintomas', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark" />
                            </div>
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Progresión</p>
                                <select value={data.progresion_sintomas} onChange={(e) => setData('progresion_sintomas', e.target.value)} className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark">
                                    <option value="">Sin especificar</option>
                                    <option value="estable">Estable</option>
                                    <option value="progresivo">Progresivo</option>
                                    <option value="regresivo">Regresivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Observaciones */}
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
                            <Save size={14} strokeWidth={1.8} /> {processing ? 'Guardando...' : 'Registrar'}
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
