import { useForm } from '@inertiajs/react';
import { X, Save, Heart, Clock, Calendar, AlertTriangle, FileText, Droplets } from 'lucide-react';
import { Boton } from '@/Components/ui/boton';

interface Props {
    abierto: boolean;
    idPaciente: number;
    idConsulta: number | null;
    onCerrar: () => void;
}

interface FormData {
    id_consulta_endocrinologica: number | string;
    fecha_ultima_menstruacion: string;
    edad_menarquia: string;
    regularidad_ciclo: string;
    duracion_ciclo_dias: string;
    intervalo_entre_ciclos_dias: string;
    amenorrea: boolean;
    oligomenorrea: boolean;
    sangrado_abundante: boolean;
    dolor_menstrual: boolean;
    sospecha_anovulacion: boolean;
    progesterona_lutea: string;
    confirma_anovulacion_por_progesterona: boolean;
    observaciones: string;
}

export default function CrearHistoriaMenstrual({ abierto, idPaciente, idConsulta, onCerrar }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        id_consulta_endocrinologica: idConsulta ?? '',
        fecha_ultima_menstruacion: '',
        edad_menarquia: '',
        regularidad_ciclo: '',
        duracion_ciclo_dias: '',
        intervalo_entre_ciclos_dias: '',
        amenorrea: false,
        oligomenorrea: false,
        sangrado_abundante: false,
        dolor_menstrual: false,
        sospecha_anovulacion: false,
        progesterona_lutea: '',
        confirma_anovulacion_por_progesterona: false,
        observaciones: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/endocrinologo/pacientes/${idPaciente}/historia-menstrual`, {
            preserveScroll: true,
            onSuccess: () => { reset(); onCerrar(); },
            onError: () => {},
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green-dark dark:text-brand-green">
                            <Heart size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-ink dark:text-ink-dark">Nuevo registro menstrual</h2>
                            <p className="text-[11px] text-ink-muted dark:text-ink-muted-dark">El registro actual pasara al historial</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleCerrar} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-black/[0.05] dark:text-ink-muted-dark dark:hover:bg-white/[0.06]">
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Seccion: Ciclo menstrual */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <Clock size={11} strokeWidth={2} className="text-brand-green-dark dark:text-brand-green" />
                            Datos del ciclo menstrual
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Regularidad del ciclo</p>
                                <select
                                    value={data.regularidad_ciclo}
                                    onChange={(e) => setData('regularidad_ciclo', e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                >
                                    <option value="">Sin especificar</option>
                                    <option value="regular">Regular</option>
                                    <option value="irregular">Irregular</option>
                                    <option value="ausente">Ausente</option>
                                </select>
                                {errors.regularidad_ciclo && <p className="mt-1 text-[10.5px] text-category-fruits">{errors.regularidad_ciclo}</p>}
                            </div>
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Duración del ciclo (días)</p>
                                <input
                                    type="number"
                                    placeholder="Ej: 5"
                                    value={data.duracion_ciclo_dias}
                                    onChange={(e) => setData('duracion_ciclo_dias', e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                {errors.duracion_ciclo_dias && <p className="mt-1 text-[10.5px] text-category-fruits">{errors.duracion_ciclo_dias}</p>}
                            </div>
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Intervalo entre ciclos (días)</p>
                                <input
                                    type="number"
                                    placeholder="Ej: 28"
                                    value={data.intervalo_entre_ciclos_dias}
                                    onChange={(e) => setData('intervalo_entre_ciclos_dias', e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Fecha última menstruación</p>
                                <input
                                    type="date"
                                    value={data.fecha_ultima_menstruacion}
                                    onChange={(e) => setData('fecha_ultima_menstruacion', e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                                />
                            </div>
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Edad menarquía (años)</p>
                                <input
                                    type="number"
                                    placeholder="Ej: 12"
                                    value={data.edad_menarquia}
                                    onChange={(e) => setData('edad_menarquia', e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div>
                                <p className="text-[10.5px] font-semibold text-ink-muted dark:text-ink-muted-dark mb-1.5">Progesterona lútea (ng/mL)</p>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Ej: 12.5"
                                    value={data.progesterona_lutea}
                                    onChange={(e) => setData('progesterona_lutea', e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seccion: Hallazgos clinicos */}
                    <div>
                        <label className="flex items-center gap-2 mb-3 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <AlertTriangle size={11} strokeWidth={2} className="text-brand-orange" />
                            Hallazgos clínicos
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <CheckboxItem label="Amenorrea" descripcion="Ausencia de menstruación" checked={data.amenorrea} onChange={(v) => setData('amenorrea', v)} />
                            <CheckboxItem label="Oligomenorrea" descripcion="Ciclos mayores a 35 días" checked={data.oligomenorrea} onChange={(v) => setData('oligomenorrea', v)} />
                            <CheckboxItem label="Sangrado abundante" descripcion="Menorragia" checked={data.sangrado_abundante} onChange={(v) => setData('sangrado_abundante', v)} />
                            <CheckboxItem label="Dolor menstrual" descripcion="Dismenorrea" checked={data.dolor_menstrual} onChange={(v) => setData('dolor_menstrual', v)} />
                            <CheckboxItem label="Sospecha de anovulación" descripcion="Ciclos irregulares sin ovulación" checked={data.sospecha_anovulacion} onChange={(v) => setData('sospecha_anovulacion', v)} />
                            <CheckboxItem label="Anovulación confirmada" descripcion="Confirmada por progesterona" checked={data.confirma_anovulacion_por_progesterona} onChange={(v) => setData('confirma_anovulacion_por_progesterona', v)} />
                        </div>
                    </div>

                    {/* Seccion: Observaciones */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-[11.5px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                            <FileText size={11} strokeWidth={2} className="text-category-others" />
                            Observaciones
                        </label>
                        <textarea
                            rows={3}
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            placeholder="Notas adicionales sobre el ciclo menstrual..."
                            className="w-full rounded-xl border border-surface-border bg-[#FAF9F6] px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/40 outline-none focus:border-brand-green/50 focus:ring-0 resize-y min-h-[80px] dark:border-surface-border-dark dark:bg-[#20232B] dark:text-ink-dark"
                        />
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
